import { initializeApp } from "firebase/app";
import {
  type AppCheck,
  initializeAppCheck,
  ReCaptchaV3Provider,
} from "firebase/app-check";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  connectFirestoreEmulator,
} from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env["VITE_FIREBASE_API_KEY"] as string,
  authDomain: import.meta.env["VITE_FIREBASE_AUTH_DOMAIN"] as string,
  projectId: import.meta.env["VITE_FIREBASE_PROJECT_ID"] as string,
  storageBucket: import.meta.env["VITE_FIREBASE_STORAGE_BUCKET"] as string,
  messagingSenderId: import.meta.env[
    "VITE_FIREBASE_MESSAGING_SENDER_ID"
  ] as string,
  appId: import.meta.env["VITE_FIREBASE_APP_ID"] as string,
};

const isEmulator = import.meta.env["VITE_USE_EMULATORS"] === "true";

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Inject the App Check debug token BEFORE initializeAppCheck.
// When this global is set, the ReCaptchaV3Provider automatically uses it
// instead of running the real reCAPTCHA challenge — no CustomProvider needed.
// The token is only present in .env.local and is never committed or shipped.
const debugToken = import.meta.env["VITE_APPCHECK_DEBUG_TOKEN"] as
  | string
  | undefined;

interface FirebaseGlobal extends Window {
  FIREBASE_APPCHECK_DEBUG_TOKEN?: string;
  FIREBASE_APPCHECK_DEBUG_TOKEN_FOR_DEV_PROVIDER?: string;
}

if (debugToken) {
  if (typeof self !== "undefined") {
    (self as unknown as FirebaseGlobal).FIREBASE_APPCHECK_DEBUG_TOKEN =
      debugToken;
    (self as unknown as FirebaseGlobal).FIREBASE_APPCHECK_DEBUG_TOKEN_FOR_DEV_PROVIDER =
      debugToken;
  } else if (typeof global !== "undefined") {
    (global as unknown as FirebaseGlobal).FIREBASE_APPCHECK_DEBUG_TOKEN =
      debugToken;
    (global as unknown as FirebaseGlobal).FIREBASE_APPCHECK_DEBUG_TOKEN_FOR_DEV_PROVIDER =
      debugToken;
  }
}

// Single App Check initialisation path for both dev and prod.
// Debug token injection above handles localhost transparently.
export const appCheck: AppCheck | null =
  typeof document !== "undefined"
    ? initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(
      import.meta.env["VITE_APPCHECK_SITE_KEY"] as string,
    ),
    isTokenAutoRefreshEnabled: true,
      })
    : null;

// Initialize Firebase services in the required order
export const auth = getAuth(app);

export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});

export const storage = getStorage(app);

// Connect to local Firebase Emulators when VITE_USE_EMULATORS=true
if (isEmulator) {
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
  connectStorageEmulator(storage, "127.0.0.1", 9199);
}

export default app;
