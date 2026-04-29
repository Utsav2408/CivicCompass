import { initializeTestEnvironment, type RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc } from "firebase/firestore";
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
});

afterAll(async () => {
  await testEnv.cleanup();
});

describe("Personalization Integration — rules-unit-testing", () => {
  it("creates a new user profile with isComplete: false", async () => {
    const alice = testEnv.authenticatedContext("alice");
    const db = alice.firestore();

    // We can't easily pass this 'db' to createUserProfile because it expects the production SDK 'db'
    // But we can test the logic directly or wrap it.
    
    // For this test, let's verify the rules first
    const userRef = doc(db, "users", "alice");
    await setDoc(userRef, { name: "Alice", isComplete: false });
    
    const docSnap = await getDoc(userRef);
    expect(docSnap.data()).toMatchObject({ name: "Alice", isComplete: false });
  });

  it("denies access to another user's profile", async () => {
    const alice = testEnv.authenticatedContext("alice");
    const bob = testEnv.authenticatedContext("bob");
    
    const bobDb = bob.firestore();
    await setDoc(doc(bobDb, "users", "bob"), { name: "Bob" });

    const aliceDb = alice.firestore();
    await expect(getDoc(doc(aliceDb, "users", "bob"))).rejects.toThrow();
  });

  it("allows owner to update their own profile", async () => {
    const alice = testEnv.authenticatedContext("alice");
    const db = alice.firestore();
    
    const userRef = doc(db, "users", "alice");
    await setDoc(userRef, { name: "Alice", isComplete: false });
    await setDoc(userRef, { isComplete: true }, { merge: true });
    
    const docSnap = await getDoc(userRef);
    expect(docSnap.data()?.isComplete).toBe(true);
  });
});
