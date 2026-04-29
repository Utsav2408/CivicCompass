import {
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { doc, setDoc, getDocs, collection } from "firebase/firestore";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

// Set emulator flag BEFORE any firebase imports
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

  // Seed emulator data
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();

    // Seed Lok Sabha data
    await setDoc(doc(db, "elections", "loksabha_2024", "results", "BJP"), {
      party: "BJP",
      voteShare2024: 45,
    });
    await setDoc(doc(db, "elections", "loksabha_2024", "winners", "1"), {
      winnerName: "John Doe",
    });

    // Seed Vidhan Sabha data
    await setDoc(doc(db, "elections", "vidhansabha_2024", "results", "AAP"), {
      party: "AAP",
      voteShare2024: 50,
    });
    await setDoc(doc(db, "elections", "vidhansabha_2024", "winners", "2"), {
      winnerName: "Jane Doe",
    });
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

describe("WardPage Data Integration — Emulator", () => {
  it("allows reading constituency results and winners for Lok Sabha", async () => {
    const alice = testEnv.authenticatedContext("alice");
    const db = alice.firestore();

    const resultsRef = collection(db, "elections", "loksabha_2024", "results");
    const resultsSnap = await getDocs(resultsRef);
    expect(resultsSnap.empty).toBe(false);
    expect(resultsSnap.docs[0]?.data().party).toBe("BJP");

    const winnersRef = collection(db, "elections", "loksabha_2024", "winners");
    const winnersSnap = await getDocs(winnersRef);
    expect(winnersSnap.empty).toBe(false);
    expect(winnersSnap.docs[0]?.data().winnerName).toBe("John Doe");
  });

  it("allows toggling election type and fetching Vidhan Sabha data", async () => {
    const alice = testEnv.authenticatedContext("alice");
    const db = alice.firestore();

    const resultsRef = collection(
      db,
      "elections",
      "vidhansabha_2024",
      "results",
    );
    const resultsSnap = await getDocs(resultsRef);
    expect(resultsSnap.empty).toBe(false);
    expect(resultsSnap.docs[0]?.data().party).toBe("AAP");

    const winnersRef = collection(
      db,
      "elections",
      "vidhansabha_2024",
      "winners",
    );
    const winnersSnap = await getDocs(winnersRef);
    expect(winnersSnap.empty).toBe(false);
    expect(winnersSnap.docs[0]?.data().winnerName).toBe("Jane Doe");
  });

  it("denies writes to results and winners collections (cross-user/admin data not accessible)", async () => {
    const bob = testEnv.authenticatedContext("bob");
    const db = bob.firestore();

    const resultsRef = doc(db, "elections", "loksabha_2024", "results", "HACK");
    await expect(setDoc(resultsRef, { hack: true })).rejects.toThrow();

    const winnersRef = doc(
      db,
      "elections",
      "vidhansabha_2024",
      "winners",
      "HACK",
    );
    await expect(setDoc(winnersRef, { hack: true })).rejects.toThrow();
  });
});
