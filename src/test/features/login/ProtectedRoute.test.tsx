import { render, screen, waitFor } from "@testing-library/react";
import { type User } from "firebase/auth";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { ProtectedRoute } from "@features/login/ProtectedRoute";
import { useAuth } from "@features/login/useAuth";

vi.mock("@features/login/useAuth", () => ({
  useAuth: vi.fn(),
}));

const mockGetDoc = vi.fn();
const mockDoc = vi.fn();

vi.mock("firebase/firestore", () => ({
  getDoc: (...args: unknown[]) => mockGetDoc(...args) as unknown,
  doc: (...args: unknown[]) => mockDoc(...args) as unknown,
}));

vi.mock("@/lib/firebase", () => ({
  db: {},
}));

vi.mock("@shared/components/AshokaCakraLoader", () => ({
  PageLoader: () => <div data-testid="page-loader">loading</div>,
}));

describe("ProtectedRoute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDoc.mockReturnValue("users/test-uid");
  });

  function renderApp(initialPath: string) {
    return render(
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/home" element={<div>Home Page</div>} />
            <Route path="/personalization" element={<div>Personalization Page</div>} />
          </Route>
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );
  }

  it("redirects to /login when user is unauthenticated", async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isLoading: false,
      error: null,
      signIn: vi.fn(),
      signOut: vi.fn(),
    });

    renderApp("/home");

    expect(await screen.findByText("Login Page")).toBeInTheDocument();
  });

  it("redirects new users without profile doc to /personalization", async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { uid: "test-uid" } as User,
      isLoading: false,
      error: null,
      signIn: vi.fn(),
      signOut: vi.fn(),
    });
    mockGetDoc.mockResolvedValue({ exists: () => false });

    renderApp("/home");

    await waitFor(() => {
      expect(mockGetDoc).toHaveBeenCalled();
    });
    expect(await screen.findByText("Personalization Page")).toBeInTheDocument();
  });

  it("allows users with existing profile doc to access /home", async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { uid: "test-uid" } as User,
      isLoading: false,
      error: null,
      signIn: vi.fn(),
      signOut: vi.fn(),
    });
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ isComplete: true }),
    });

    renderApp("/home");

    expect(await screen.findByText("Home Page")).toBeInTheDocument();
  });

  it("redirects users with incomplete profile to /personalization", async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { uid: "test-uid" } as User,
      isLoading: false,
      error: null,
      signIn: vi.fn(),
      signOut: vi.fn(),
    });
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ isComplete: false }),
    });

    renderApp("/home");

    expect(await screen.findByText("Personalization Page")).toBeInTheDocument();
  });
});
