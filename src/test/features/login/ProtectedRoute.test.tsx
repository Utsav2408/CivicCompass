import { render, screen, waitFor } from "@testing-library/react";
import { type User } from "firebase/auth";
import type { ReactNode } from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { ProtectedRoute } from "@features/login/ProtectedRoute";
import { useAuth } from "@features/login/useAuth";

vi.mock("@features/login/useAuth", () => ({
  useAuth: vi.fn(),
}));

const mockGetDoc = vi.fn();
const mockDoc = vi.fn();
const mockGetToken = vi.fn();
const mockApiProvider = vi.fn();
let mockAppCheckInstance: object | null = null;

vi.mock("firebase/firestore", () => ({
  getDoc: (...args: unknown[]) => mockGetDoc(...args) as unknown,
  doc: (...args: unknown[]) => mockDoc(...args) as unknown,
}));

vi.mock("@/lib/firebase", () => ({
  db: {},
  get appCheck() {
    return mockAppCheckInstance;
  },
}));

vi.mock("@shared/components/AshokaCakraLoader", () => ({
  PageLoader: () => <div data-testid="page-loader">loading</div>,
}));

vi.mock("firebase/app-check", () => ({
  getToken: (...args: unknown[]) => mockGetToken(...args) as unknown,
}));

vi.mock("@vis.gl/react-google-maps", () => ({
  APIProvider: ({
    children,
    ...props
  }: {
    children: ReactNode;
    fetchAppCheckToken?: () => Promise<{ token: string }>;
  }) => {
    mockApiProvider(props);
    return <>{children}</>;
  },
}));

describe("ProtectedRoute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDoc.mockReturnValue("users/test-uid");
    mockGetToken.mockResolvedValue({ token: "token-123" });
    mockAppCheckInstance = null;
  });

  function renderApp(initialPath: string) {
    return render(
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/home" element={<div>Home Page</div>} />
            <Route
              path="/personalization"
              element={<div>Personalization Page</div>}
            />
          </Route>
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>,
    );
  }

  it("redirects to /login when user is unauthenticated", async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isLoading: false,
      error: null,
      signIn: vi.fn(),
      signInDemo: vi.fn(),
      signOut: vi.fn(),
      canUseDemoLogin: false,
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
      signInDemo: vi.fn(),
      signOut: vi.fn(),
      canUseDemoLogin: false,
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
      signInDemo: vi.fn(),
      signOut: vi.fn(),
      canUseDemoLogin: false,
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
      signInDemo: vi.fn(),
      signOut: vi.fn(),
      canUseDemoLogin: false,
    });
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ isComplete: false }),
    });

    renderApp("/home");

    expect(await screen.findByText("Personalization Page")).toBeInTheDocument();
  });

  it("passes fetchAppCheckToken to APIProvider when appCheck exists", async () => {
    mockAppCheckInstance = {};
    vi.mocked(useAuth).mockReturnValue({
      user: { uid: "test-uid" } as User,
      isLoading: false,
      error: null,
      signIn: vi.fn(),
      signInDemo: vi.fn(),
      signOut: vi.fn(),
      canUseDemoLogin: false,
    });
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ isComplete: true }),
    });

    renderApp("/home");
    expect(await screen.findByText("Home Page")).toBeInTheDocument();

    const providerProps = mockApiProvider.mock.calls.at(-1)?.[0] as
      | { fetchAppCheckToken?: () => Promise<{ token: string }> }
      | undefined;
    expect(providerProps?.fetchAppCheckToken).toBeDefined();

    const tokenResult = await providerProps?.fetchAppCheckToken?.();
    expect(tokenResult).toEqual({ token: "token-123" });
    expect(mockGetToken).toHaveBeenCalled();
  });
});
