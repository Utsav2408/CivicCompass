export const mockGeminiResponses = {
  electionProcess: {
    text: 'Nomination filing begins after the election schedule announcement.',
    source: 'eci.gov.in/files/file/14761-schedule',
  },
  candidateSummary: {
    text: 'Assets declared as per affidavit filed with Election Commission.',
    source: 'affidavitarchive.nic.in',
  },
  unknownQuery: {
    text: 'I cannot find this in trusted ECI sources. Please verify at eci.gov.in.',
  },
  networkError: Promise.reject(new Error('GEMINI_UNAVAILABLE')),
} as const