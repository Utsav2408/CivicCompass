import { createContext, useContext } from "react";

interface ProfileRouteCtx {
  /**
   * Call this after successfully writing the user profile so ProtectedRoute
   * immediately re-checks before the navigation to /home fires.
   */
  refreshProfile: () => void;
  /**
   * Allows access to /home for the current auth session even when
   * personalization is incomplete (used by "Skip for now").
   * Cleared automatically on sign-out.
   */
  allowIncompleteForSession: () => void;
}

export const ProfileRouteContext = createContext<ProfileRouteCtx>({
  refreshProfile: () => undefined,
  allowIncompleteForSession: () => undefined,
});

export function useProfileRoute() {
  return useContext(ProfileRouteContext);
}
