import { createHmac } from "crypto";
import { getSecret } from "./secrets.js";

/**
 * Hashes a phone number with HMAC-SHA256 using the Secret Manager key.
 * Never logs the input or output. Safe against rainbow table attacks.
 */
export async function hashPhone(rawPhone: string): Promise<string> {
  const secret = await getSecret("phone-hmac-key");
  return createHmac("sha256", secret)
    .update(rawPhone.replace(/\D/g, "")) // normalise to digits only
    .digest("hex");
}
