import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],

    // Default run includes only unit + component tests.
    // Emulator tests are excluded here and run separately via test:emulator.
    // Playwright e2e tests are excluded entirely — run via test:e2e.
    include: ["src/**/*.{test,spec}.?(c|m)[jt]s?(x)"],
    exclude: [
      "**/node_modules/**",
      "**/*.emulator.test.ts",
      "e2e/**",
    ],

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
        "src/scripts/**",
        "src/features/home/**",
        "*.config.ts",
      ],
    },
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@shared": path.resolve(__dirname, "./src/shared"),
      "@features": path.resolve(__dirname, "./src/features"),
    },
  },
});