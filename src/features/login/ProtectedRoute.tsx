import { APIProvider } from "@vis.gl/react-google-maps";
import { getToken } from "firebase/app-check";
import { doc, getDoc } from "firebase/firestore";
import { useCallback, useEffect, useRef, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { EmergencyButton } from "@/features/support/components/EmergencyButton";
import { EmergencyOverlay } from "@/features/support/components/EmergencyOverlay";
import { appCheck, db } from "@/lib/firebase";
import { useAuth } from "@features/login/useAuth";
import { PageLoader } from "@shared/components/AshokaCakraLoader";

import { ProfileRouteContext } from "./ProfileRouteContext";

const MAPS_API_KEY = import.meta.env.VITE_MAPS_API_KEY as string;
const ENABLE_MAPS_APPCHECK =
  import.meta.env.VITE_MAPS_ENABLE_APPCHECK !== "false";

// "needs_personalization" = missing doc or isComplete !== true
// "ready" = doc exists and isComplete === true
type ProfileStatus = "loading" | "needs_personalization" | "ready";

export function ProtectedRoute() {
  const appCheckInstance = appCheck;
  const { user, isLoading: isAuthLoading } = useAuth();
  const [profileStatus, setProfileStatus] = useState<ProfileStatus>("loading");
  const [isMapsReady, setIsMapsReady] = useState(false);
  const [mapsLoadError, setMapsLoadError] = useState<string | null>(null);
  const [checkGeneration, setCheckGeneration] = useState(0);
  const [sessionSkipUid, setSessionSkipUid] = useState<string | null>(null);
  const location = useLocation();
  const inflightRef = useRef<string | null>(null);

  const refreshProfile = useCallback(() => {
    // Set loading immediately (synchronous state update) so the redirect
    // condition cannot fire during the window between navigate() and the
    // new getDoc resolving. Then increment generation to trigger the effect.
    setProfileStatus("loading");
    setCheckGeneration((g) => g + 1);
  }, []);

  const allowIncompleteForSession = useCallback(() => {
    if (!user) return;
    setSessionSkipUid(user.uid);
  }, [user]);

  useEffect(() => {
    void (async () => {
      try {
        if (appCheck) {
          // Required before Google Maps JS API load when Maps App Check is enabled.
          await getToken(appCheck);
        }

        // Maps loader is already handled by APIProvider, so we only gate on App Check.
      } catch {
        // Keep app usable; map components can still surface explicit errors.
      } finally {
        setIsMapsReady(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (isAuthLoading) return;

    if (!user) {
      inflightRef.current = null;
      return;
    }

    const key = `${user.uid}:${String(checkGeneration)}`;
    if (inflightRef.current === key) return; // deduplicate concurrent renders
    inflightRef.current = key;

    setProfileStatus("loading");

    void (async () => {
      try {
        const docSnap = await getDoc(doc(db, "users", user.uid));
        if (!docSnap.exists()) {
          setProfileStatus("needs_personalization");
          return;
        }

        const data = docSnap.data() as { isComplete?: boolean } | undefined;
        setProfileStatus(
          data?.isComplete === true ? "ready" : "needs_personalization",
        );
      } catch {
        // On error, fall through to onboarding — safer than a blank screen.
        setProfileStatus("needs_personalization");
      }
    })();
  }, [user, isAuthLoading, checkGeneration]);

  // ── Rendering ───────────────────────────────────────────────────────────────

  // Auth state resolving
  if (isAuthLoading) {
    return <PageLoader />;
  }

  // No Firebase user — send to login.
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Profile check still in flight
  if (profileStatus === "loading") {
    return <PageLoader />;
  }

  if (!isMapsReady) {
    return <PageLoader />;
  }

  if (!MAPS_API_KEY) {
    return (
      <div role="alert" style={{ padding: 20, textAlign: "center" }}>
        Missing `VITE_MAPS_API_KEY` in environment.
      </div>
    );
  }

  if (mapsLoadError) {
    return (
      <div role="alert" style={{ padding: 20, textAlign: "center" }}>
        Failed to load Google Maps: {mapsLoadError}
      </div>
    );
  }

  // Setup incomplete and not already on onboarding page.
  const canBypassForThisSession = sessionSkipUid === user.uid;
  if (
    profileStatus === "needs_personalization" &&
    !canBypassForThisSession &&
    location.pathname !== "/personalization"
  ) {
    return <Navigate to="/personalization" replace />;
  }

  return (
    <APIProvider
      apiKey={MAPS_API_KEY}
      onError={(error) => {
        console.error("Google Maps failed to load", error);
        setMapsLoadError(error.message || "Unknown Maps loader error");
      }}
      {...(ENABLE_MAPS_APPCHECK && appCheckInstance
        ? {
            fetchAppCheckToken: async () => {
              const tokenResult = await getToken(appCheckInstance);
              return {
                token: tokenResult.token,
              };
            },
          }
        : {})}
    >
      <ProfileRouteContext.Provider
        value={{ refreshProfile, allowIncompleteForSession }}
      >
        <Outlet />
        <EmergencyButton />
        <EmergencyOverlay />
      </ProfileRouteContext.Provider>
    </APIProvider>
  );
}
