/* Local-only browser QA against the existing Storybook application. */
const { chromium, expect } = require("@playwright/test");
const fs = require("node:fs/promises");
const path = require("node:path");
const assert = require("node:assert/strict");

async function main() {
  const origin = process.env.PRISM_STORYBOOK_URL || "http://127.0.0.1:7008";
  const output = process.env.PRISM_SCREENSHOT_DIR || "/tmp/vibe-prism-screenshots";
  await fs.mkdir(output, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  try {
    for (const mode of ["light", "dark"]) {
      for (const width of [320, 390, 430, 768, 1440]) {
        const page = await browser.newPage({ viewport: { width, height: 1000 }, reducedMotion: "reduce" });
        await page.route("**/*", route =>
          route.request().url().startsWith(origin) ? route.continue() : route.abort()
        );
        const errors = [];
        page.on("pageerror", error => errors.push(error.message));
        await page.goto(`${origin}/iframe.html?id=prism-design-system--${mode}&viewMode=story`, {
          waitUntil: "networkidle"
        });
        await page.getByRole("heading", { name: "Less surface. More possibility." }).waitFor();
        assert.equal(await page.locator("[data-vibe-prism]").getAttribute("data-vibe-prism"), mode);
        await page.screenshot({ path: path.join(output, `${mode}-${width}.png`), fullPage: true });
        if (width === 1440) await page.screenshot({ path: path.join(output, `${mode}-hero.png`) });
        assert.equal(
          await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
          true,
          `Horizontal overflow at ${mode}/${width}`
        );
        await page.addScriptTag({ path: require.resolve("axe-core/axe.min.js") });
        const violations = await page.evaluate(async () =>
          (
            await window.axe.run(document.querySelector("[data-vibe-prism]"), {
              runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"] }
            })
          ).violations.map(item => ({ id: item.id, nodes: item.nodes.map(node => node.target) }))
        );
        assert.deepEqual(violations, [], `Accessibility at ${mode}/${width}: ${JSON.stringify(violations)}`);
        assert.deepEqual(errors, [], `Runtime errors at ${mode}/${width}`);
        await page.getByRole("button", { name: "Open dialog", exact: true }).click();
        const dialog = page.getByRole("dialog", { name: "Your space to create" });
        await expect(dialog).toBeVisible();
        const box = await dialog.boundingBox();
        assert.ok(box && box.x >= 0 && box.x + box.width <= width, `Dialog outside viewport at ${width}`);
        await page.keyboard.press("Escape");
        await expect(dialog).not.toBeAttached();
        await expect(page.getByRole("button", { name: "Open dialog", exact: true })).toBeFocused();
        await page.close();
        console.log(`PASS ${mode} ${width}px: no overflow, axe violations or runtime errors`);
      }
    }
    // Exercise the full manager as well as the iframe: its chrome must not crowd phones.
    for (const width of [320, 390, 430]) {
      const page = await browser.newPage({ viewport: { width, height: 844 }, isMobile: true, hasTouch: true });
      await page.route("**/*", route => (route.request().url().startsWith(origin) ? route.continue() : route.abort()));
      await page.goto(`${origin}/?path=/story/prism-design-system--light`);
      const canvas = page.frameLocator("#storybook-preview-iframe");
      await canvas.getByRole("heading", { name: "Less surface. More possibility." }).waitFor();
      // Storybook translates the hidden toolbar offscreen; it remains mounted.
      await expect(page.getByRole("button", { name: "Zoom in", exact: true })).not.toBeInViewport();
      const explore = canvas.getByRole("button", { name: "Explore", exact: true });
      const theme = canvas.getByRole("button", { name: "Dark mode", exact: true });
      assert.ok((await explore.boundingBox()).height >= 44);
      const themeBounds = await theme.boundingBox();
      assert.ok(themeBounds.width >= 44 && themeBounds.height >= 44);
      const logo = await canvas.locator(".prism-wordmark").boundingBox();
      assert.ok(logo.x + logo.width <= (await explore.boundingBox()).x, "Header controls overlap");
      await page.screenshot({ path: path.join(output, `mobile-manager-${width}.png`) });
      await explore.click();
      await expect(explore).toHaveAttribute("aria-expanded", "true");
      await page.keyboard.press("Escape");
      await expect(explore).toHaveAttribute("aria-expanded", "false");
      await expect(explore).toBeFocused();
      await explore.click();
      await canvas
        .getByRole("navigation", { name: "Prism documentation" })
        .getByRole("link", { name: "Materials", exact: true })
        .click();
      await expect(explore).toHaveAttribute("aria-expanded", "false");
      await expect.poll(async () => (await canvas.locator("#materials").boundingBox()).y).toBeGreaterThanOrEqual(69);
      const material = canvas.getByRole("combobox", { name: /^Material/ });
      await expect(material).toHaveCSS("font-size", "16px");
      assert.ok((await material.boundingBox()).height >= 48);
      await material.selectOption("liquid");
      await expect(canvas.getByText("liquid material", { exact: true })).toBeVisible();
      await theme.click();
      await expect(canvas.locator("[data-vibe-prism]")).toHaveAttribute("data-vibe-prism", "dark");
      await canvas.getByRole("link", { name: "vibe prism", exact: true }).click();
      await expect.poll(async () => (await canvas.locator("#overview").boundingBox()).y).toBeGreaterThanOrEqual(69);
      await page.screenshot({ path: path.join(output, `mobile-manager-dark-${width}.png`) });
      await page.close();
      console.log(`PASS mobile manager ${width}px: navigation, touch targets, anchors and theme/material controls`);
    }
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: "reduce" });
    await page.route("**/*", route => (route.request().url().startsWith(origin) ? route.continue() : route.abort()));
    await page.goto(`${origin}/iframe.html?id=prism-design-system--light&viewMode=story`, { waitUntil: "networkidle" });
    await page.getByRole("heading", { name: "Less surface. More possibility." }).waitFor();
    await page.getByRole("combobox", { name: /^Material/ }).selectOption("liquid");
    // Vibe hides the native checkbox and exposes its visible label as the hit target.
    await page.getByText("Opaque surfaces", { exact: true }).click();
    assert.equal(await page.getByRole("checkbox", { name: "Opaque surfaces" }).isChecked(), true);
    await expect(page.locator("[data-vibe-prism]")).toHaveAttribute("data-transparency", "reduced");
    await expect(page.locator(".prism-feature-card")).toHaveCSS("backdrop-filter", "none");
    await page.getByRole("button", { name: "Open dialog", exact: true }).click();
    await page.getByRole("dialog", { name: "Your space to create" }).waitFor();
    await page.keyboard.press("Escape");
    await page.getByRole("dialog").waitFor({ state: "detached" });
    await expect(page.getByRole("button", { name: "Open dialog", exact: true })).toBeFocused();
    await page.close();
    console.log(`PASS opaque fallback and modal Escape/focus restoration. Screenshots: ${output}`);
  } finally {
    await browser.close();
  }
}
main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
