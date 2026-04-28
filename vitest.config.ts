import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  plugins: [react() as any],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      thresholds: {
        branches: 90,
        lines: 90,
        functions: 90,
        statements: 90,
      },
      exclude: [
        '**/*.d.ts',
        'src/i18n/**',
        'src/types/**',
        'src/test/**',
        'src/main.tsx',
        'vite.config.ts',
        'vitest.config.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@': '/src',
      '@shared': '/src/shared',
      '@features': '/src/features',
    },
  },
})