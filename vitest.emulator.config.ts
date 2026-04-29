import path from "path";

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom", // emulator tests need DOM for React integration
    setupFiles: [], // no MSW server needed for emulator tests
    include: ["**/*.emulator.test.ts", "**/*.emulator.test.tsx"],
    testTimeout: 15000, // emulator calls are slower than mocked tests
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@shared": path.resolve(__dirname, "./src/shared"),
      "@features": path.resolve(__dirname, "./src/features"),
    },
  },
});
