import { readFileSync } from "fs";
import { resolve } from "path";

import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  // Initialize test environment
  testEnv = await initializeTestEnvironment({
    projectId: "demo-civiccompass-rules",
    firestore: {
      rules: readFileSync(
        resolve(__dirname, "../../../firestore.rules"),
        "utf8",
      ),
      host: "127.0.0.1",
      port: 8080,
    },
  });
});

beforeEach(async () => {
  // Clear the database between tests
  await testEnv.clearFirestore();
});

afterAll(async () => {
  await testEnv.cleanup();
});

describe("Firestore Security Rules", () => {
  describe("policeStations collection", () => {
    it("should allow unauthenticated read", async () => {
      const unauthedDb = testEnv.unauthenticatedContext().firestore();
      const docRef = unauthedDb
        .collection("policeStations")
        .doc("test-station");
      await assertSucceeds(docRef.get());
    });

    it("should deny unauthenticated write", async () => {
      const unauthedDb = testEnv.unauthenticatedContext().firestore();
      const docRef = unauthedDb
        .collection("policeStations")
        .doc("test-station");
      await assertFails(docRef.set({ name: "Hacked Station" }));
    });

    it("should deny authenticated write", async () => {
      const authedDb = testEnv.authenticatedContext("user-123").firestore();
      const docRef = authedDb.collection("policeStations").doc("test-station");
      await assertFails(docRef.set({ name: "Hacked Station" }));
    });
  });

  describe("pollingBooths collection", () => {
    it("should allow unauthenticated read", async () => {
      const unauthedDb = testEnv.unauthenticatedContext().firestore();
      const docRef = unauthedDb.collection("pollingBooths").doc("test-booth");
      await assertSucceeds(docRef.get());
    });

    it("should deny unauthenticated write", async () => {
      const unauthedDb = testEnv.unauthenticatedContext().firestore();
      const docRef = unauthedDb.collection("pollingBooths").doc("test-booth");
      await assertFails(docRef.set({ name: "Hacked Booth" }));
    });

    it("should deny authenticated write", async () => {
      const authedDb = testEnv.authenticatedContext("user-123").firestore();
      const docRef = authedDb.collection("pollingBooths").doc("test-booth");
      await assertFails(docRef.set({ name: "Hacked Booth" }));
    });
  });
});
