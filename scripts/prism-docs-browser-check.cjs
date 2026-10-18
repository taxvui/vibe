/* Test existing MDX routes against a production Storybook build. */
const { chromium, expect } = require("@playwright/test");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
async function main() {
  const origin = process.env.PRISM_STORYBOOK_URL || "http://127.0.0.1:7008";
  const output = process.env.PRISM_SCREENSHOT_DIR || "/tmp/vibe-docs-screenshots";
  await fs.mkdir(output, { recursive: true });
  const browser = await chromium.launch();
  try {
    const routes = ["welcome", "getting-started", "catalog", "mcp", "changelog", "migration-guide", "contributing"];
    for (const route of routes) {
      for (const width of [320, 390, 768, 1440]) {
        const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: "reduce" });
        await page.route("**/*", r => (r.request().url().startsWith(origin) ? r.continue() : r.abort()));
        const errors = [];
        page.on("pageerror", e => errors.push(e.message));
        await page.goto(`${origin}/iframe.html?id=${route}--docs&viewMode=docs`, { waitUntil: "networkidle" });
        const main = page.getByRole("main");
        await expect(main.locator("h1").first()).toBeVisible();
        assert.equal(
          await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
          true,
          `${route}/${width}: page overflow`
        );
        assert.deepEqual(errors, [], `${route}/${width}: runtime errors`);
        for (const source of await main.locator(".docblock-source pre.prismjs").all()) {
          assert.equal(
            await source.evaluate(el => el.scrollWidth <= el.clientWidth + 1),
            true,
            `${route}/${width}: clipped code`
          );
        }
        if (width === 390 && ["welcome", "getting-started"].includes(route)) {
          await page.screenshot({ path: `${output}/${route}-mobile.png` });
        }
        if (route === "welcome" && width === 320) {
          await page.getByText("On this page", { exact: true }).click();
          await page
            .getByRole("navigation", { name: "On this page", exact: true })
            .getByRole("link", { name: "Clarity before decoration", exact: true })
            .click();
          await expect(page).toHaveURL(/#clarity-before-decoration/);
          await page.getByText("On this page", { exact: true }).click();
        }
        if (["welcome", "getting-started"].includes(route)) {
          for (const mode of ["light", "dark"]) {
            if (mode === "dark") await page.getByRole("button", { name: "Dark mode", exact: true }).click();
            await expect(page.locator("[data-vibe-prism]")).toHaveAttribute("data-vibe-prism", mode);
            await page.addScriptTag({ path: require.resolve("axe-core/axe.min.js") });
            const violations = await page.evaluate(async () =>
              (
                await window.axe.run(document.querySelector(".prism-documentation"), {
                  runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"] }
                })
              ).violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) }))
            );
            assert.deepEqual(violations, [], `${route}/${width}/${mode}: ${JSON.stringify(violations)}`);
            if (width === 390 && mode === "dark") await page.screenshot({ path: `${output}/${route}-dark-mobile.png` });
          }
        }
        await page.close();
        console.log(
          `PASS ${route} ${width}px: layout and runtime${["welcome", "getting-started"].includes(route) ? ", light/dark axe" : ""}`
        );
      }
    }
    // Follow the actual card link inside the manager, not just standalone iframe URLs.
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    await page.route("**/*", r => (r.request().url().startsWith(origin) ? r.continue() : r.abort()));
    await page.goto(`${origin}/?path=/docs/welcome--docs`);
    const canvas = page.frameLocator("#storybook-preview-iframe");
    await canvas.getByRole("link", { name: /Start building/ }).click();
    await expect(page).toHaveURL(/path=\/docs\/getting-started--docs/);
    await expect(canvas.getByRole("heading", { name: "Make it yours.", exact: true })).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Dark mode", exact: true })).toBeVisible();
    await page.close();
    console.log(`PASS mobile manager Welcome → Getting Started navigation. Screenshots: ${output}`);
  } finally {
    await browser.close();
  }
}
main().catch(e => {
  console.error(e);
  process.exitCode = 1;
});
