import { initializeApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import { getAuth } from "firebase/auth";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";

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

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize App Check FIRST — before any other Firebase service
initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider(
    import.meta.env["VITE_APPCHECK_SITE_KEY"] as string,
  ),
  isTokenAutoRefreshEnabled: true,
});

// Initialize Firebase services
export const auth = getAuth(app);

// Firestore with persistent cache — replaces deprecated enableIndexedDbPersistence
// persistentMultipleTabManager allows offline persistence across multiple tabs
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});

export const storage = getStorage(app);

export default app;
