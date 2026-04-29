import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",        // emulator tests are pure Node — no DOM needed
    setupFiles: [],             // no MSW server needed for emulator tests
    include: ["**/*.emulator.test.ts"],
    testTimeout: 15000,         // emulator calls are slower than mocked tests
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@shared": path.resolve(__dirname, "./src/shared"),
      "@features": path.resolve(__dirname, "./src/features"),
    },
  },
});