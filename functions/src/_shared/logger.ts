import * as logger from "firebase-functions/logger";

/**
 * Structured logger for all Cloud Functions.
 * Never logs PII — only identifiers and metadata.
 */
export const log = {
  info: (event: string, data: Record<string, unknown>) =>
    logger.info(event, { structuredData: true, ...data }),

  error: (event: string, data: Record<string, unknown>) =>
    logger.error(event, { structuredData: true, ...data }),

  warn: (event: string, data: Record<string, unknown>) =>
    logger.warn(event, { structuredData: true, ...data }),
};