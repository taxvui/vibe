import path from "path";
import { defineConfig } from "vitest/config";
import config from "../core/vitest.config";

export default defineConfig({
  ...config,
  resolve: {
    ...config.resolve,
    alias: {
      ...(config.resolve?.alias as Record<string, string>),
      "@vibe/core": path.resolve(process.cwd(), "../core/src/index.ts"),
      "@vibe/shared": path.resolve(process.cwd(), "../shared/src/index.ts"),
      "@vibe/hooks": path.resolve(process.cwd(), "../hooks/src/index.ts"),
      "@vibe/icons": path.resolve(process.cwd(), "../icons/src/react/index.ts")
    }
  },
  test: {
    ...config.test,
    setupFiles: ["../core/vitest.setup.ts"],
    include: ["src/prism/__tests__/**/*.test.tsx"]
  }
});
