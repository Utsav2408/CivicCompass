import react from "@vitejs/plugin-react";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  plugins: [react() as any],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    exclude: [...configDefaults.exclude, "e2e/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "html"],
      thresholds: {
        branches: 90,
        lines: 90,
        functions: 90,
        statements: 90,
      },
      exclude: [
        "**/*.d.ts",
        "src/i18n/**",
        "src/types/**",
        "src/test/**",
        "src/main.tsx",
        "vite.config.ts",
        "vitest.config.ts",
        "e2e/**",
        "src/scripts/**",
      ],
    },
  },
  resolve: {
    alias: {
      "@": "/src",
      "@shared": "/src/shared",
      "@features": "/src/features",
    },
  },
});
