import {
  type User,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  createElement,
  createContext,
  useState,
  useEffect,
  useCallback,
  useContext,
  type ReactNode,
} from "react";

import { auth } from "@/lib/firebase";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

interface UseAuthReturn extends AuthState {
  signIn: () => Promise<void>;
  signInDemo: () => Promise<void>;
  signOut: () => Promise<void>;
  canUseDemoLogin: boolean;
}

const provider = new GoogleAuthProvider();
const isEmulator = import.meta.env["VITE_USE_EMULATORS"] === "true";
const DEMO_EMAIL = "demo.user@civiccompass.local";
const DEMO_PASSWORD = "DemoUser@12345";

const AuthContext = createContext<UseAuthReturn | null>(null);

function useAuthController(): UseAuthReturn {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true, // true on mount — auth state not yet resolved
    error: null,
  });

  // Listen to Firebase auth state changes.
  // onAuthStateChanged fires once immediately with the current user (or null),
  // then on every subsequent sign-in / sign-out. The returned unsubscribe
  // function is called on unmount — no listener leak.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setState({ user, isLoading: false, error: null });
      },
      (error) => {
        setState({ user: null, isLoading: false, error: error.message });
      },
    );

    return unsubscribe; // cleanup on unmount
  }, []);

  const signIn = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      await signInWithPopup(auth, provider);
      // onAuthStateChanged above will update user — no setState needed here
    } catch (error) {
      const message = error instanceof Error ? error.message : "Sign-in failed";
      setState((prev) => ({ ...prev, isLoading: false, error: message }));
    }
  }, []);

  const signOut = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      await firebaseSignOut(auth);
      // onAuthStateChanged fires with null — state updates automatically
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Sign-out failed";
      setState((prev) => ({ ...prev, isLoading: false, error: message }));
    }
  }, []);

  const signInDemo = useCallback(async () => {
    if (!isEmulator) return;

    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      await signInWithEmailAndPassword(auth, DEMO_EMAIL, DEMO_PASSWORD);
    } catch (error) {
      const authCode =
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        typeof error.code === "string"
          ? error.code
          : "";

      if (authCode === "auth/user-not-found") {
        await createUserWithEmailAndPassword(auth, DEMO_EMAIL, DEMO_PASSWORD);
      } else {
        const message =
          error instanceof Error ? error.message : "Demo sign-in failed";
        setState((prev) => ({ ...prev, isLoading: false, error: message }));
      }
    }
  }, []);

  return { ...state, signIn, signInDemo, signOut, canUseDemoLogin: isEmulator };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const authState = useAuthController();
  return createElement(AuthContext.Provider, { value: authState }, children);
}

export function useAuth(): UseAuthReturn {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
