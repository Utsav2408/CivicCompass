/**
 * Login flow — Firebase Auth Emulator integration test
 *
 * Requires the Auth emulator running on 127.0.0.1:9099.
 * Run with: firebase emulators:start --only auth
 *
 * Note on error codes:
 * The Firebase Auth emulator returns auth/wrong-password for bad credentials.
 * The production SDK (v10+) normalises this to auth/invalid-credential to
 * prevent username enumeration attacks. The emulator hasn't adopted this
 * behaviour yet — so we assert against the emulator's actual code here.
 */

import { initializeApp, deleteApp, type FirebaseApp } from "firebase/app";
import {
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

let app: FirebaseApp;

const TEST_EMAIL = "priya.sharma.emulator@test.com";
const TEST_PASSWORD = "emulator-test-password-123";

beforeAll(async () => {
  app = initializeApp(
    {
      apiKey: "emulator-fake-api-key",
      authDomain: "civiccompass-494517.firebaseapp.com",
      projectId: "civiccompass-494517",
    },
    "emulator-test-app",
  );

  const auth = getAuth(app);
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });

  try {
    await createUserWithEmailAndPassword(auth, TEST_EMAIL, TEST_PASSWORD);
  } catch (e: unknown) {
    const code = (e as { code?: string }).code;
    if (code !== "auth/email-already-in-use") throw e;
  }
});

afterAll(async () => {
  await deleteApp(app);
});

describe("Firebase Auth Emulator — sign-in flow", () => {
  it("signs in with email/password and returns a user with correct fields", async () => {
    const auth = getAuth(app);
    const credential = await signInWithEmailAndPassword(
      auth,
      TEST_EMAIL,
      TEST_PASSWORD,
    );
    expect(credential.user).toBeDefined();
    expect(credential.user.email).toBe(TEST_EMAIL);
    expect(credential.user.uid).toBeTruthy();
  });

  it("currentUser is set after sign-in", async () => {
    const auth = getAuth(app);
    await signInWithEmailAndPassword(auth, TEST_EMAIL, TEST_PASSWORD);
    expect(auth.currentUser).not.toBeNull();
    expect(auth.currentUser?.email).toBe(TEST_EMAIL);
  });

  it("signs out and clears currentUser", async () => {
    const auth = getAuth(app);
    await signInWithEmailAndPassword(auth, TEST_EMAIL, TEST_PASSWORD);
    await signOut(auth);
    expect(auth.currentUser).toBeNull();
  });

  it("rejects sign-in with wrong password", async () => {
    const auth = getAuth(app);

    // The emulator returns auth/wrong-password rather than the production
    // SDK's auth/invalid-credential — both signal a bad credential.
    await expect(
      signInWithEmailAndPassword(auth, TEST_EMAIL, "wrong-password"),
    ).rejects.toMatchObject({
      code: "auth/wrong-password",
    });
  });

  it("onAuthStateChanged fires with user after sign-in", async () => {
    const auth = getAuth(app);
    const observedUser = await new Promise((resolve) => {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        if (user) {
          unsubscribe();
          resolve(user);
        }
      });
      void signInWithEmailAndPassword(auth, TEST_EMAIL, TEST_PASSWORD);
    });
    expect((observedUser as { email: string }).email).toBe(TEST_EMAIL);
  });

  it("onAuthStateChanged fires with null after sign-out", async () => {
    const auth = getAuth(app);
    await signInWithEmailAndPassword(auth, TEST_EMAIL, TEST_PASSWORD);
    const observedNull = await new Promise((resolve) => {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        if (!user) {
          unsubscribe();
          resolve(null);
        }
      });
      void signOut(auth);
    });
    expect(observedNull).toBeNull();
  });
});