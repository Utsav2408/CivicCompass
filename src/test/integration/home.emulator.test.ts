import {
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

vi.stubEnv("VITE_USE_EMULATORS", "true");
vi.stubEnv("VITE_FIREBASE_PROJECT_ID", "civiccompass-494517");

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: "civiccompass-494517",
    firestore: {
      host: "127.0.0.1",
      port: 8080,
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

describe("Home Integration — Emulator", () => {
  it("allows unauthenticated public read on elections collection", async () => {
    const unauth = testEnv.unauthenticatedContext();
    const db = unauth.firestore();

    const electionRef = doc(db, "elections", "loksabha_2024");

    // Seed the doc (as admin/privileged)
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), "elections", "loksabha_2024"), {
        electionId: "loksabha_2024",
        type: "General Election",
        pollingDate: "2024-05-20",
        announcementDate: "2024-03-01",
        sourceUrl: "https://eci.gov.in",
        phases: [],
      });
    });

    const docSnap = await getDoc(electionRef);
    expect(docSnap.exists()).toBe(true);
    expect(docSnap.data()).toMatchObject({
      electionId: "loksabha_2024",
      type: "General Election",
    });
  });

  it("denies writes to elections collection for normal users", async () => {
    const alice = testEnv.authenticatedContext("alice");
    const db = alice.firestore();

    const electionRef = doc(db, "elections", "loksabha_2024");
    await expect(
      setDoc(electionRef, { hack: true }, { merge: true }),
    ).rejects.toThrow();
  });
});
