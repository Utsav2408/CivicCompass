import { onRequest } from "firebase-functions/https";
import { getFirestore } from "firebase-admin/firestore";
import { VoterIdSchema } from "./_shared/schemas";
import { checkRateLimit } from "./_shared/rateLimiter";
import { log } from "./_shared/logger";
import { verifyAppCheckToken } from "./_shared/appCheck";

const db = getFirestore();

/**
 * Looks up voter constituency and booth from ECI Voter Portal.
 * Rate limited to 5 calls per user per day.
 * Result cached in Firestore permanently.
 */
export const eciVoterLookup = onRequest(
  { cors: true, region: "us-east1" },
  async (req, res) => {
    // App Check verified by Firebase automatically

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

    // Rate limit — 5 calls per user per day
    const rateLimit = await checkRateLimit({
      uid,
      functionName: "eci-voter-lookup",
      maxCalls: 5,
      windowMs: 24 * 60 * 60 * 1000,
    });

    if (!rateLimit.allowed) {
      res.status(429).json({
        error: "Rate limit exceeded",
        retryAfter: rateLimit.retryAfter,
      });
      return;
    }

    // Validate voter ID
    const parsed = VoterIdSchema.safeParse(req.body.voterId);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }

    const voterId = parsed.data;

    try {
      // Check Firestore cache first
      const cacheRef = db.collection("voterCache").doc(voterId);
      const cached = await cacheRef.get();

      if (cached.exists) {
        log.info("voter_lookup_cache_hit", { uid, electionId: voterId });
        res.status(200).json(cached.data());
        return;
      }

      // TODO: Replace with real ECI API call when credentials available
      // For now returns structured mock data matching real ECI response shape
      const mockResult = {
        constituency: "New Delhi PC-01",
        pollingBooth: {
          name: "Govt. Model School, Connaught Place",
          address: "Connaught Place, New Delhi - 110001",
          coordinates: { lat: 28.6315, lng: 77.2167 },
        },
        wardCode: "WARD-001",
      };

      // Cache permanently in Firestore
      await cacheRef.set(mockResult);

      log.info("voter_lookup_success", { uid });
      res.status(200).json(mockResult);
    } catch (error) {
      log.error("voter_lookup_error", {
        uid,
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      });
      res.status(500).json({ error: "ECI lookup failed" });
    }
  }
);