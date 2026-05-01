import { render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { App } from "@/App";

vi.mock("@/features/login/useAuth", () => ({
  AuthProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
}));
vi.mock("@/features/login/ProtectedRoute", () => ({
  ProtectedRoute: () => <div>protected</div>,
}));
vi.mock("@shared/components/AshokaCakraLoader", () => ({
  PageLoader: () => <div>loading</div>,
}));
vi.mock("@shared/components/OfflineBanner", () => ({
  OfflineBanner: () => <div>offline-banner</div>,
}));
vi.mock("@shared/components/RouteTransitionLoader", () => ({
  RouteTransitionLoader: () => <div>route-loader</div>,
}));
vi.mock("@features/login/LoginPage", () => ({
  LoginPage: () => <div>login-page</div>,
}));
vi.mock("@features/home/HomePage", () => ({
  HomePage: () => <div>home-page</div>,
}));
vi.mock("@features/login/PersonalizationPage", () => ({
  PersonalizationPage: () => <div>personalization-page</div>,
}));
vi.mock("@features/process/ProcessPage", () => ({
  ProcessPage: () => <div>process-page</div>,
}));
vi.mock("@features/ward/WardPage", () => ({
  WardPage: () => <div>ward-page</div>,
}));
vi.mock("@features/map/MapPage", () => ({
  MapPage: () => <div>map-page</div>,
}));
vi.mock("@features/support/SupportPage", () => ({
  SupportPage: () => <div>support-page</div>,
}));

describe("App", () => {
  it("shows shared overlays on protected routes", async () => {
    window.history.pushState({}, "", "/home");
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText("offline-banner")).toBeInTheDocument();
      expect(screen.getByText("route-loader")).toBeInTheDocument();
    });
  });

  it("renders login route", () => {
    window.history.pushState({}, "", "/login");
    render(<App />);
    expect(screen.getByText("login-page")).toBeInTheDocument();
    expect(screen.queryByText("offline-banner")).not.toBeInTheDocument();
    expect(screen.queryByText("route-loader")).not.toBeInTheDocument();
  });

  it("redirects unknown routes to login", () => {
    window.history.pushState({}, "", "/unknown-route");
    render(<App />);
    expect(screen.getByText("login-page")).toBeInTheDocument();
  });
});
