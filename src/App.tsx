/**
 * App — root router
 *
 * Route layout:
 *   /           → redirect to /login
 *   /login      → LoginPage (public)
 *   /home       → HomePage (protected — requires auth)
 *
 * All screen routes are lazy-loaded so the initial bundle stays small.
 * Suspense fallback uses PageLoader (Ashoka Chakra) while chunks load.
 *
 * ProtectedRoute wraps all authenticated routes — a single auth check
 * point that scales cleanly as we add Screens 2–6.
 */

import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { ProtectedRoute } from "@/features/login/ProtectedRoute";
import { AuthProvider } from "@/features/login/useAuth";
import { PageLoader } from "@shared/components/AshokaCakraLoader";

// Lazy-loaded route chunks — each screen is a separate JS bundle.
// Only the LoginPage loads eagerly since it's the entry point.
const LoginPage = lazy(() =>
  import("@features/login/LoginPage").then((m) => ({ default: m.LoginPage })),
);

const HomePage = lazy(() =>
  import("@features/home/HomePage").then((m) => ({ default: m.HomePage })),
);

const PersonalizationPage = lazy(() =>
  import("@features/login/PersonalizationPage").then((m) => ({
    default: m.PersonalizationPage,
  })),
);

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Root — redirect to login */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Public route */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected routes — auth checked once in ProtectedRoute */}
            <Route element={<ProtectedRoute />}>
              <Route path="/home" element={<HomePage />} />
              <Route path="/personalization" element={<PersonalizationPage />} />
              {/* Screens 3–6 added here as each sprint completes */}
            </Route>

            {/* Catch-all — redirect unknown paths to login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}