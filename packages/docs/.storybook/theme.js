import { create } from "@storybook/theming/create";

export default create({
  base: "light",
  brandTitle: "Vibe Prism",
  brandImage: "./prism-mark.svg",
  brandUrl: "https://github.com/taxvui/vibe",
  colorPrimary: "#285e50",
  colorSecondary: "#285e50",
  appBg: "#f5f4f0",
  appContentBg: "#fffefa",
  appBorderColor: "#cbd3cc",
  appBorderRadius: 12,
  fontBase: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  fontCode: "ui-monospace, SFMono-Regular, Consolas, monospace",
  textColor: "#202724",
  barTextColor: "#56635d",
  barSelectedColor: "#285e50",
  barBg: "#fffefa"
});
