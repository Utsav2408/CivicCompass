/**
 * ProtectedRoute
 *
 * Wraps any route that requires authentication.
 * Three states handled:
 *   1. isLoading — auth state not yet resolved → show PageLoader (never flash login)
 *   2. no user   — unauthenticated → redirect to /login
 *   3. user      — authenticated → render children
 */

import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "@features/login/useAuth";
import { PageLoader } from "@shared/components/AshokaCakraLoader";

export function ProtectedRoute() {
  const { user, isLoading } = useAuth();

  // Auth state is still resolving — Firebase needs one round-trip on first load.
  // Show the Ashoka Chakra page loader to prevent a flash of the login page
  // for users who are already authenticated.
  if (isLoading) return <PageLoader />;

  // No authenticated user — redirect to login, preserving the intended path
  // in `state` so we can redirect back after successful sign-in.
  if (!user) return <Navigate to="/login" replace />;

  // Authenticated — render the child route
  return <Outlet />;
}