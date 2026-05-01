import {
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
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

describe("Map Integration — Emulator", () => {
  it("successfully reads polling booth assigned to user profile", async () => {
    const alice = testEnv.authenticatedContext("alice");
    const db = alice.firestore();
    const userRef = doc(db, "users", "alice");

    const mockBooth = {
      id: "booth-1",
      name: "Alice's Booth",
      address: "123 Street",
      coordinates: { lat: 28.6, lng: 77.2 },
      city: "Delhi",
    };

    // Seed the user profile with a booth
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), "users", "alice"), {
        uid: "alice",
        pollingBooth: mockBooth,
      });
    });

    const docSnap = await getDoc(userRef);
    expect(docSnap.exists()).toBe(true);
    expect(docSnap.data()?.pollingBooth).toMatchObject(mockBooth);
  });

  it("filters police stations correctly by city", async () => {
    const alice = testEnv.authenticatedContext("alice");
    const db = alice.firestore();
    const stationsColl = collection(db, "policeStations");

    // Seed stations from different cities
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await setDoc(doc(adminDb, "policeStations", "station-delhi"), {
        name: "Delhi Station",
        city: "Delhi",
        latitude: 28.6,
        longitude: 77.2,
      });
      await setDoc(doc(adminDb, "policeStations", "station-mumbai"), {
        name: "Mumbai Station",
        city: "Mumbai",
        latitude: 19.0,
        longitude: 72.8,
      });
    });

    // Query for Delhi stations
    const q = query(stationsColl, where("city", "==", "Delhi"));
    const querySnapshot = await getDocs(q);

    expect(querySnapshot.size).toBe(1);
    expect(querySnapshot.docs[0]).toBeDefined();
    expect(querySnapshot.docs[0]?.data().name).toBe("Delhi Station");
  });
});
