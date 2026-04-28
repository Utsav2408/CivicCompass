import { SecretManagerServiceClient } from "@google-cloud/secret-manager";

const client = new SecretManagerServiceClient();
const PROJECT_ID = "civiccompass-494517";

/**
 * Retrieves a secret value from GCP Secret Manager.
 * Never logs the returned value.
 */
export async function getSecret(secretName: string): Promise<string> {
  const [version] = await client.accessSecretVersion({
    name: `projects/${PROJECT_ID}/secrets/${secretName}/versions/latest`,
  });

  const payload = version.payload?.data?.toString();
  if (!payload) {
    throw new Error(`Secret ${secretName} is empty or missing`);
  }

  return payload;
}
