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
    exclude: ["**/node_modules/**", "**/*.emulator.test.ts", "e2e/**"],

    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "html"],
      include: ["src/**/*.{ts,tsx}"],
      thresholds: {
        branches: 80,
        lines: 80,
        functions: 80,
        statements: 80,
      },
      exclude: [
        "**/*.d.ts",
        "src/i18n/**",
        "src/types/**",
        "src/shared/types/**",
        "src/test/**",
        "src/scripts/**",
        "src/features/home/**",
        // Google Maps wrappers are validated via integration tests; unit coverage
        // is noisy due heavy SDK/browser-side branching.
        "src/features/map/components/MapView.tsx",
        "src/features/map/components/PollingBoothMap.tsx",
        "src/mocks/**",
        "src/**/__mocks__/**",
        "dist/**",
        "artifacts/**",
        "functions/**",
        "e2e/**",
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
