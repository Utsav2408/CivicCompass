import { test as base } from '@playwright/test'

// Extend base test with pre-authenticated state
export const test = base.extend({
  page: async ({ page }, use) => {
    // Set emulator environment
    await page.addInitScript(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
      (window as any).__FIREBASE_EMULATOR__ = true
    })
    await use(page)
  },
})

export { expect } from '@playwright/test'