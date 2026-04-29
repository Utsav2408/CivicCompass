import { http, HttpResponse } from "msw";

// Gemini proxy mock responses
const geminiFixtures: Record<string, string> = {
  election_process:
    "Nomination filing begins after the announcement of the election schedule by the Election Commission of India.",
  candidate_summary:
    "Assets declared as per affidavit filed with Election Commission.",
  unknown_query:
    "I cannot find this in trusted ECI sources. Please verify at eci.gov.in.",
};

function matchGeminiFixture(prompt: string): string {
  if (prompt.includes("election process"))
    return geminiFixtures["election_process"] ?? "";
  if (prompt.includes("candidate"))
    return geminiFixtures["candidate_summary"] ?? "";
  return geminiFixtures["unknown_query"] ?? "";
}

export const handlers = [
  // Gemini proxy Cloud Function
  http.post("*/gemini-proxy", async ({ request }) => {
    const body = (await request.json()) as { prompt: string };
    const response = matchGeminiFixture(body.prompt);
    return HttpResponse.json({
      response,
      source: "eci.gov.in",
      fromCache: false,
    });
  }),

  // ECI voter lookup Cloud Function
  http.post("*/eci-voter-lookup", async ({ request }) => {
    const body = (await request.json()) as { voterId: string };
    if (body.voterId === "ABC1234567") {
      return HttpResponse.json({
        constituency: "New Delhi PC-01",
        pollingBooth: {
          name: "Govt. Model School, Connaught Place",
          address: "Connaught Place, New Delhi - 110001",
          coordinates: { lat: 28.6315, lng: 77.2167 },
        },
      });
    }
    return HttpResponse.json({ error: "Voter ID not found" }, { status: 404 });
  }),

  // Candidate fetch Cloud Function
  http.get("*/candidateFetch", ({ request }) => {
    const url = new URL(request.url);
    const constituency = url.searchParams.get("constituency");
    const electionType = url.searchParams.get("electionType");

    if (constituency === "New Delhi PC-01" && electionType === "lok_sabha") {
      return HttpResponse.json({
        candidates: [
          { name: "Pravesh Verma", party: "BJP", assetsTotal: "2.4 Cr" },
          { name: "Sandeep Dikshit", party: "INC", assetsTotal: "1.1 Cr" },
        ],
        source: "affidavitarchive.nic.in",
        fromCache: true,
      });
    }
    return HttpResponse.json({ candidates: [] });
  }),

  // Gemini network error simulation
  http.post("*/gemini-proxy/error", () => {
    return HttpResponse.error();
  }),
];
