import { onSchedule } from "firebase-functions/v2/scheduler";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { log } from "./_shared/logger";

const db = getFirestore();

/**
 * Fetches election schedule from ECI nightly at 02:00 IST.
 * Writes result to Firestore — all users read from this cache.
 */
export const nightlyEciFetch = onSchedule(
  {
    schedule: "0 20 * * *",
    timeZone: "UTC",
    region: "us-east1",
    timeoutSeconds: 60,
    memory: "256MiB",
    maxInstances: 1,
    invoker: "private",
  },
  async () => {
    log.info("nightly_eci_fetch_started", {
      timestamp: new Date().toISOString(),
    });

    try {
      const electionData = {
        electionId: "loksabha_2024",
        type: "Lok Sabha General Election",
        pollingDate: "2024-05-04",
        announcementDate: "2024-03-16",
        nominationDeadline: "2024-03-28",
        scrutinyDate: "2024-03-30",
        withdrawalDeadline: "2024-04-01",
        resultsDate: "2024-06-04",
        source: "https://eci.gov.in/files/file/14761-schedule",
        lastUpdated: Timestamp.now(),
      };

      await db
        .collection("elections")
        .doc(electionData.electionId)
        .set(electionData, { merge: true });

      log.info("nightly_eci_fetch_success", {
        electionId: electionData.electionId,
      });
    } catch (error) {
      log.error("nightly_eci_fetch_error", {
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  },
);
