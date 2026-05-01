import { onRequest } from "firebase-functions/https";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { createHash } from "crypto";
import { genkit } from "genkit";
import { googleAI } from "@genkit-ai/google-genai";
import { GeminiRequestSchema } from "./_shared/schemas.js";
import { checkRateLimit } from "./_shared/rateLimiter.js";
import { getSecret } from "./_shared/secrets.js";
import { log } from "./_shared/logger.js";
import { verifyAppCheckToken } from "./_shared/appCheck.js";

const db = getFirestore();
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-uid, x-firebase-appcheck",
};

const TRUSTED_SOURCE_SYSTEM_PROMPT = `
You are CivicCompass Bot, an impartial election information assistant for Indian voters.

RULES:
1. Only answer using information from these trusted sources:
   - eci.gov.in (Election Commission of India) — PRIMARY source
   - nvsp.in (National Voter Service Portal)
   - pib.gov.in (Press Information Bureau)
   - prsindia.org (PRS Legislative Research)
   - affidavitarchive.nic.in (ECI Affidavit Archive)

2. Every factual claim must include a source citation.
3. Use plain language — Grade 8 reading level.
4. Never make partisan statements or express political opinions.
5. If information is not available in trusted sources, respond with:
   "I cannot find this in trusted ECI sources. Please verify at eci.gov.in."
6. Always add: "AI-generated content. Verify at eci.gov.in" at the end.
`;

export const geminiProxy = onRequest(
  { cors: false, region: "us-east1", invoker: "public" },
  async (req, res) => {
    res.set(CORS_HEADERS);

    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    // Verify App Check token — rejects requests from non-app clients
    const appCheckValid = await verifyAppCheckToken(req, res);
    if (!appCheckValid) return;

    const uid = req.headers["x-uid"] as string;
    if (!uid) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const rateLimit = await checkRateLimit({
      uid,
      functionName: "gemini-proxy",
      maxCalls: 60,
      windowMs: 60 * 60 * 1000,
    });

    if (!rateLimit.allowed) {
      res.status(429).json({
        error: "Rate limit exceeded",
        retryAfter: rateLimit.retryAfter,
      });
      return;
    }

    const parsed = GeminiRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }

    const { prompt } = parsed.data;

    const queryHash = createHash("sha256")
      .update(TRUSTED_SOURCE_SYSTEM_PROMPT + prompt)
      .digest("hex");

    const cacheRef = db.collection("geminiCache").doc(queryHash);
    const cached = await cacheRef.get();

    if (
      cached.exists &&
      (cached.data()?.["expiresAt"] as Timestamp)?.toMillis() > Date.now()
    ) {
      log.info("gemini_cache_hit", { uid, hash: queryHash.slice(0, 8) });
      res.status(200).json({
        response: cached.data()?.["response"],
        source: cached.data()?.["source"],
        fromCache: true,
      });
      return;
    }

    try {
      const apiKey = await getSecret("gemini-api-key");

      // Initialize Genkit with new google-genai package
      const ai = genkit({
        plugins: [googleAI({ apiKey })],
      });

      const { text } = await ai.generate({
        model: googleAI.model("gemini-2.5-flash"),
        system: TRUSTED_SOURCE_SYSTEM_PROMPT,
        prompt,
      });

      const expiresAt = Timestamp.fromMillis(Date.now() + 3_600_000);
      await cacheRef.set({
        response: text,
        source: "eci.gov.in",
        expiresAt,
        createdAt: Timestamp.now(),
      });

      log.info("gemini_success", { uid });
      res.status(200).json({
        response: text,
        source: "eci.gov.in",
        fromCache: false,
      });
    } catch (error) {
      log.error("gemini_error", {
        uid,
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      });
      res.status(500).json({ error: "AI service unavailable" });
    }
  },
);
