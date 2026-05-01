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
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import { AuthProvider } from "@/features/login/useAuth";
import { LoginPage } from "@features/login/LoginPage";
import { PageLoader } from "@shared/components/AshokaCakraLoader";
import { OfflineBanner } from "@shared/components/OfflineBanner";
import { RouteTransitionLoader } from "@shared/components/RouteTransitionLoader";

// Lazy-loaded route chunks — each authenticated screen is a separate JS bundle.
// LoginPage is imported eagerly because it is the first paint target.

const HomePage = lazy(() =>
  import("@features/home/HomePage").then((m) => ({ default: m.HomePage })),
);

const PersonalizationPage = lazy(() =>
  import("@features/login/PersonalizationPage").then((m) => ({
    default: m.PersonalizationPage,
  })),
);

const ProcessPage = lazy(() =>
  import("@features/process/ProcessPage").then((m) => ({
    default: m.ProcessPage,
  })),
);

const WardPage = lazy(() =>
  import("@features/ward/WardPage").then((m) => ({
    default: m.WardPage,
  })),
);

const MapPage = lazy(() =>
  import("@features/map/MapPage").then((m) => ({
    default: m.MapPage,
  })),
);

const SupportPage = lazy(() =>
  import("@features/support/SupportPage").then((m) => ({
    default: m.SupportPage,
  })),
);

const ProtectedRoute = lazy(() =>
  import("@features/login/ProtectedRoute").then((m) => ({
    default: m.ProtectedRoute,
  })),
);

function AuthWrappedLoginPage() {
  return (
    <AuthProvider>
      <LoginPage />
    </AuthProvider>
  );
}

function AuthWrappedProtectedRoute() {
  return (
    <AuthProvider>
      <ProtectedRoute />
    </AuthProvider>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

function AppRoutes() {
  const location = useLocation();
  const isLoginRoute = location.pathname === "/login";

  return (
    <Suspense fallback={<PageLoader />}>
      {!isLoginRoute && <OfflineBanner />}
      {!isLoginRoute && <RouteTransitionLoader />}
      <Routes>
        {/* Root — redirect to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Public route */}
        <Route path="/login" element={<AuthWrappedLoginPage />} />

        {/* Protected routes — auth checked once in ProtectedRoute */}
        <Route element={<AuthWrappedProtectedRoute />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/personalization" element={<PersonalizationPage />} />
          <Route path="/process" element={<ProcessPage />} />
          <Route path="/ward" element={<WardPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/support" element={<SupportPage />} />
          {/* Screen 6 added here as each sprint completes */}
        </Route>

        {/* Catch-all — redirect unknown paths to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
}
