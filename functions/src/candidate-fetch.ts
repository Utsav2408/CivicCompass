import { onRequest } from "firebase-functions/https";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { CandidateFetchSchema } from "./_shared/schemas";
import { checkRateLimit } from "./_shared/rateLimiter";
import { log } from "./_shared/logger";
import { verifyAppCheckToken } from "./_shared/appCheck";

const db = getFirestore();
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Fetches candidate data from ECI Affidavit Archive.
 * Caches results in Firestore for 24 hours.
 * Rate limited to 30 calls per user per hour.
 */
export const candidateFetch = onRequest(
  { cors: true, region: "us-east1" },
  async (req, res) => {
    if (req.method !== "GET") {
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

    // Rate limit — 30 calls per user per hour
    const rateLimit = await checkRateLimit({
      uid,
      functionName: "candidate-fetch",
      maxCalls: 30,
      windowMs: 60 * 60 * 1000,
    });

    if (!rateLimit.allowed) {
      res.status(429).json({
        error: "Rate limit exceeded",
        retryAfter: rateLimit.retryAfter,
      });
      return;
    }

    // Validate query params
    const parsed = CandidateFetchSchema.safeParse({
      constituency: req.query["constituency"],
      electionType: req.query["electionType"],
    });

    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }

    const { constituency, electionType } = parsed.data;
    const cacheKey = `${electionType}_${constituency.replace(/\s/g, "_")}`;
    const cacheRef = db.collection("candidateCache").doc(cacheKey);

    try {
      // Check cache — valid for 24 hours
      const cached = await cacheRef.get();
      if (
        cached.exists &&
        cached.data()?.["expiresAt"]?.toMillis() > Date.now()
      ) {
        log.info("candidate_cache_hit", { uid, constituency });
        res.status(200).json({
          ...cached.data(),
          fromCache: true,
        });
        return;
      }

      // TODO: Replace with real affidavitarchive.nic.in API call
      // Mock data matching real affidavit archive response shape
      const mockCandidates = [
        {
          name: "Pravesh Verma",
          party: "BJP",
          symbol: "Lotus",
          assetsTotal: "2.4 Cr",
          liabilitiesTotal: "0.2 Cr",
          criminalCases: 0,
          education: "Graduate",
          source: "affidavitarchive.nic.in",
        },
        {
          name: "Sandeep Dikshit",
          party: "INC",
          symbol: "Hand",
          assetsTotal: "1.1 Cr",
          liabilitiesTotal: "0.1 Cr",
          criminalCases: 0,
          education: "Post Graduate",
          source: "affidavitarchive.nic.in",
        },
      ];

      const result = {
        candidates: mockCandidates,
        constituency,
        electionType,
        source: "affidavitarchive.nic.in",
        expiresAt: Timestamp.fromMillis(Date.now() + CACHE_DURATION_MS),
        fetchedAt: Timestamp.now(),
      };

      // Write to cache
      await cacheRef.set(result);

      log.info("candidate_fetch_success", { uid, constituency });
      res.status(200).json({ ...result, fromCache: false });
    } catch (error) {
      log.error("candidate_fetch_error", {
        uid,
        constituency,
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      });
      res.status(500).json({ error: "Candidate fetch failed" });
    }
  }
);