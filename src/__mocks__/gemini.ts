/**
 * Gemini API mock fixtures used across all three test layers:
 * L1 — Vitest unit tests (vi.mock)
 * L2 — MSW integration tests (HTTP intercept)
 * L3 — Playwright E2E tests (page.route)
 */

export const mockGeminiResponses = {
  electionProcess: {
    text: "Nomination filing begins after the Election Commission of India announces the election schedule. Candidates must file nomination papers with the Returning Officer along with a security deposit.",
    source: "eci.gov.in/files/file/14761-schedule",
    fromCache: false,
  },

  candidateSummary: {
    text: "Assets declared as per affidavit filed with the Election Commission. Total movable and immovable assets are listed along with any pending criminal cases.",
    source: "affidavitarchive.nic.in",
    fromCache: false,
  },

  unknownQuery: {
    text: "I cannot find this in trusted ECI sources. Please verify at eci.gov.in.",
    source: "eci.gov.in",
    fromCache: false,
  },

  cachedResponse: {
    text: "This response was served from the Gemini cache.",
    source: "eci.gov.in",
    fromCache: true,
  },

  // Used to test network error handling
  networkError: Promise.reject(new Error("GEMINI_UNAVAILABLE")),
} as const;

type GeminiMockResponse = {
  readonly text: string;
  readonly source: string;
  readonly fromCache: boolean;
};

/**
 * Matches a prompt to the appropriate fixture response.
 * Used in MSW handlers and Playwright intercepts.
 */
export function matchGeminiFixture(prompt: string): GeminiMockResponse {
  if (
    prompt.toLowerCase().includes("election process") ||
    prompt.toLowerCase().includes("nomination") ||
    prompt.toLowerCase().includes("schedule")
  ) {
    return mockGeminiResponses.electionProcess;
  }

  if (
    prompt.toLowerCase().includes("candidate") ||
    prompt.toLowerCase().includes("affidavit") ||
    prompt.toLowerCase().includes("assets")
  ) {
    return mockGeminiResponses.candidateSummary;
  }

  return mockGeminiResponses.unknownQuery;
}
