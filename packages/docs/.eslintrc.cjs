module.exports = {
  extends: ["../core/.eslintrc.cjs"],
  overrides: [
    {
      files: ["src/prism/**/*.{ts,tsx}", "vitest.prism.config.ts"],
      rules: {
        // Documentation is private development tooling, including its story tests.
        "import/no-extraneous-dependencies": ["error", { devDependencies: true }],
        // Named scroll regions must be reachable to scroll code with a keyboard.
        "jsx-a11y/no-noninteractive-tabindex": ["error", { roles: ["tabpanel", "region"] }]
      }
    }
  ]
};
