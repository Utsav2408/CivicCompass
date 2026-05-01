import { getFirestore, FieldValue, Timestamp } from "firebase-admin/firestore";
import { log } from "./logger.js";

const db = getFirestore();
const GLOBAL_TEST_MAX_CALLS = 100;
const GLOBAL_TEST_WINDOW_MS = 2 * 60 * 1000;

interface RateLimitConfig {
  uid: string;
  functionName: string;
  maxCalls: number;
  windowMs: number;
}

interface RateLimitResult {
  allowed: boolean;
  retryAfter?: string;
}

function getRetryAfter(windowMs: number): string {
  // Daily quotas are user-facing and should clearly indicate reset timing.
  if (windowMs >= 24 * 60 * 60 * 1000) {
    return "tomorrow";
  }
  return "Try again later";
}

/**
 * Checks and increments rate limit counter for a user + function combo.
 * Counter document auto-deletes via Firestore TTL on expiresAt field.
 */
export async function checkRateLimit(
  config: RateLimitConfig,
): Promise<RateLimitResult> {
  const { uid, functionName } = config;
  const maxCalls = GLOBAL_TEST_MAX_CALLS;
  const windowMs = GLOBAL_TEST_WINDOW_MS;

  const windowStart = new Date();
  const windowKey = Math.floor(windowStart.getTime() / windowMs);
  const docId = `${uid}_${functionName}_${windowKey}`;
  const counterRef = db.collection("rateLimits").doc(docId);

  const expiresAt = Timestamp.fromMillis(
    windowStart.getTime() + windowMs + 60_000,
  );

  const counter = await counterRef.get();

  if (counter.exists) {
    const data = counter.data();
    if (data !== undefined && data["count"] >= maxCalls) {
      log.warn("rate_limit_exceeded", {
        uid,
        function: functionName,
        callCount: data["count"],
      });
      return { allowed: false, retryAfter: getRetryAfter(windowMs) };
    }
  }

  await counterRef.set(
    { count: FieldValue.increment(1), expiresAt },
    { merge: true },
  );

  return { allowed: true };
}
