const { chromium } = require("@playwright/test");
const fs = require("node:fs");
const origin = process.env.STORYBOOK_URL || "http://127.0.0.1:7008";
const axeSource = process.env.AXE_SOURCE;
if (!axeSource)
  throw new Error("Set AXE_SOURCE to axe-core 4.10.x/axe.min.js (matching the reviewed Chromatic build).");
(async () => {
  const entries = Object.values(
    JSON.parse(fs.readFileSync("packages/docs/static_storybook/index.json")).entries
  ).filter(s => s.type === "story" && (!process.env.A11Y_STORIES || new RegExp(process.env.A11Y_STORIES).test(s.id)));
  const modes = (process.env.A11Y_MODES || "Light").split(",");
  const jobs = entries.flatMap(s => modes.map(mode => ({ s, mode })));
  const output = process.env.A11Y_REPORT || "chromatic-a11y-report.jsonl";
  fs.writeFileSync(output, "");
  const b = await chromium.launch();
  let completed = 0;
  try {
    await Promise.all(
      Array.from({ length: 4 }, async () => {
        while (jobs.length) {
          const { s, mode } = jobs.shift();
          const p = await b.newPage({ viewport: { width: 1200, height: 900 }, reducedMotion: "reduce" });
          await p.route("**/*", r => (r.request().url().startsWith(origin) ? r.continue() : r.abort()));
          const errors = [];
          p.on("pageerror", e => errors.push(e.message));
          let result = { id: s.id, mode };
          try {
            await p.goto(`${origin}/iframe.html?id=${s.id}&viewMode=story&globals=theme:${mode};a11y.manual:true`, {
              waitUntil: "networkidle",
              timeout: 30000
            });
            await p.locator("body.sb-show-main").waitFor({ timeout: 15000 });
            await p.waitForFunction(
              id =>
                window.__STORYBOOK_PREVIEW__?.storyRenders?.some(
                  r => r.id === id && ["completed", "finished"].includes(r.phase)
                ),
              s.id,
              { timeout: 30000 }
            );
            const skip = await p.evaluate(
              id =>
                window.__STORYBOOK_PREVIEW__.storyRenders.find(r => r.id === id)?.story?.parameters?.chromatic
                  ?.disableSnapshot,
              s.id
            );
            if (skip) {
              result.skipped = "Existing chromatic.disableSnapshot";
            } else {
              await p.addScriptTag({
                content: fs.readFileSync(axeSource, "utf8") + "\nwindow.prismAuditEngine=window.axe;"
              });
              const report = await p.evaluate(async () => {
                const axe = window.prismAuditEngine;
                const r = await axe.run(document.body, {
                  runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"] },
                  rules: { region: { enabled: false } }
                });
                return {
                  version: axe.version,
                  violations: r.violations.map(v => ({
                    id: v.id,
                    impact: v.impact,
                    nodes: v.nodes.map(n => ({ target: n.target, html: n.html, summary: n.failureSummary }))
                  }))
                };
              });
              Object.assign(result, report, { errors });
            }
          } catch (e) {
            result.error = e.message;
            result.errors = errors;
          }
          fs.appendFileSync(output, JSON.stringify(result) + "\n");
          await p.close();
          completed++;
          if (completed % 20 === 0 || s.id === "catalog--catalog")
            console.log(
              completed,
              s.id,
              result.violations?.map(v => `${v.id}:${v.nodes.length}`).join(",") || result.error || "clean"
            );
        }
      })
    );
  } finally {
    await b.close();
  }
  const results = fs
    .readFileSync(output, "utf8")
    .trim()
    .split("\n")
    .filter(Boolean)
    .map(line => JSON.parse(line));
  const failed = results.filter(result => result.error || result.errors?.length || result.violations?.length);
  console.log("DONE", completed, output, "failing stories:", failed.length);
  if (failed.length) process.exitCode = 1;
})().catch(e => {
  console.error(e);
  process.exitCode = 1;
});
