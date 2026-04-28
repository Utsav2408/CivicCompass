import { connectAuthEmulator } from "firebase/auth";
import { connectFirestoreEmulator } from "firebase/firestore";
import { connectStorageEmulator } from "firebase/storage";

import { auth, db, storage } from "./firebase";

/**
 * Connects all Firebase services to local emulators.
 * Only called when VITE_USE_EMULATORS=true.
 */
export function connectToEmulators() {
  connectAuthEmulator(auth, "http://127.0.0.1:9099", {
    disableWarnings: false,
  });
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
  connectStorageEmulator(storage, "127.0.0.1", 9199);
}
