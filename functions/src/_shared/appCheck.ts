import { getAppCheck } from "firebase-admin/app-check";
import type { Request, Response } from "express";
import { log } from "./logger.js";

/**
 * Verifies the App Check token on incoming HTTP function requests.
 * Returns false and sends a 403 if the token is missing or invalid.
 */
export async function verifyAppCheckToken(
  req: Request,
  res: Response,
): Promise<boolean> {
  // Local emulator requests do not include App Check tokens by default.
  // Keep strict validation in deployed environments.
  if (process.env["FUNCTIONS_EMULATOR"] === "true") {
    return true;
  }

  const appCheckToken = req.headers["x-firebase-appcheck"] as string;

  if (!appCheckToken) {
    log.warn("app_check_missing", { path: req.path });
    res.status(403).json({ error: "Unauthorized — App Check token missing" });
    return false;
  }

  try {
    await getAppCheck().verifyToken(appCheckToken);
    return true;
  } catch {
    log.warn("app_check_invalid", { path: req.path });
    res.status(403).json({ error: "Unauthorized — App Check token invalid" });
    return false;
  }
}
