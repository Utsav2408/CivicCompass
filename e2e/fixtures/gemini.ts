import type { Page } from '@playwright/test'

export async function mockGeminiProxy(page: Page, response: string) {
  await page.route('**/gemini-proxy', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        response,
        source: 'eci.gov.in',
        fromCache: false,
      }),
    })
  })
}

export const geminiFixtures = {
  electionProcess:
    'Nomination filing begins after the election schedule announcement by ECI.',
  candidateSummary:
    'Assets declared as per affidavit filed with Election Commission.',
  unknownQuery:
    'I cannot find this in trusted ECI sources. Please verify at eci.gov.in.',
}