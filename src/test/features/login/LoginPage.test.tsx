/**
 * LoginPage — component tests
 *
 * All external dependencies mocked:
 *   - useAuth   → controlled auth state per test
 *   - i18next   → returns key as value, language controlled via mockLanguage
 *   - react-router-dom → navigate spy, no real routing needed
 */

import { screen, fireEvent, waitFor } from "@testing-library/dom";
import { render } from "@testing-library/react";
import { type User } from "firebase/auth";
import { describe, expect, it, vi, beforeEach } from "vitest";

// ── Mock state — must be declared BEFORE vi.mock calls ────────────────────────
// vi.mock factories are hoisted to the top of the file by Vitest.
// Using a closure variable lets individual tests control the mock's return value
// without calling vi.mock() again (which would be hoisted and affect all tests).

const mockSignIn = vi.fn();
const mockNavigate = vi.fn();
const mockChangeLanguage = vi.fn();
let mockLanguage = "en"; // controlled per-test — avoids nested vi.mock hoisting

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock("@features/login/useAuth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  Navigate: ({ to, replace }: { to: string; replace?: boolean }) => {
    mockNavigate(to, { replace: Boolean(replace) });
    return null;
  },
}));

// Single top-level mock — language read from closure variable, not hardcoded.
// Never re-call vi.mock() inside individual tests — it gets hoisted and
// overrides this mock for ALL tests, not just the one where it appears.
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      get language() {
        return mockLanguage;
      },
      changeLanguage: mockChangeLanguage,
    },
  }),
}));

import { LoginPage } from "@features/login/LoginPage";
import { useAuth } from "@features/login/useAuth";

// ── Default auth state — reset before every test ──────────────────────────────
// vi.clearAllMocks() resets call counts but NOT mockReturnValue implementations.
// Explicitly setting the default return value here ensures test isolation —
// a test that calls mockReturnValue({error:'...'}) won't bleed into the next.

function defaultAuthState() {
  vi.mocked(useAuth).mockReturnValue({
    user: null,
    isLoading: false,
    error: null,
    signIn: mockSignIn,
    signOut: vi.fn(),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockLanguage = "en"; // reset language to EN before every test
  defaultAuthState(); // reset auth state before every test
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("LoginPage", () => {
  // ── 1. Renders sign-in button ───────────────────────────────────────────────

  it("renders the Sign in with Google button", () => {
    render(<LoginPage />);
    const button = screen.getByRole("button", { name: /login\.cta/i });
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });

  it("calls signIn when the CTA button is clicked", async () => {
    mockSignIn.mockResolvedValue(undefined);
    render(<LoginPage />);
    fireEvent.click(screen.getByRole("button", { name: /login\.cta/i }));
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledOnce();
    });
  });

  it("renders the wordmark and both taglines", () => {
    render(<LoginPage />);
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    expect(screen.getByText("login.tagline")).toBeInTheDocument();
    expect(screen.getByText("login.tagline_hi_script")).toBeInTheDocument();
  });

  it("renders the ECI footer link pointing to eci.gov.in", () => {
    render(<LoginPage />);
    const link = screen.getByRole("link", { name: /login\.footer_eci_label/i });
    expect(link).toHaveAttribute("href", "https://eci.gov.in");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  // ── 2. Language toggle ──────────────────────────────────────────────────────

  it("renders the language toggle button with aria-label", () => {
    render(<LoginPage />);
    expect(
      screen.getByRole("button", { name: /lang\.toggle_aria/i }),
    ).toBeInTheDocument();
  });

  it("calls changeLanguage with 'hi' when toggled from EN", async () => {
    mockLanguage = "en"; // explicit — language is EN
    render(<LoginPage />);
    fireEvent.click(screen.getByRole("button", { name: /lang\.toggle_aria/i }));
    await waitFor(() => {
      expect(mockChangeLanguage).toHaveBeenCalledWith("hi");
    });
  });

  it("calls changeLanguage with 'en' when toggled from HI", async () => {
    mockLanguage = "hi"; // set to HI before render — no nested vi.mock needed
    render(<LoginPage />);
    fireEvent.click(screen.getByRole("button", { name: /lang\.toggle_aria/i }));
    await waitFor(() => {
      expect(mockChangeLanguage).toHaveBeenCalledWith("en");
    });
  });

  // ── 3. Error state ──────────────────────────────────────────────────────────

  it("shows error alert when useAuth returns an error", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isLoading: false,
      error: "auth/popup-closed-by-user",
      signIn: mockSignIn,
      signOut: vi.fn(),
    });
    render(<LoginPage />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("login.error_generic")).toBeInTheDocument();
  });

  it("does not show error alert when there is no error", () => {
    // defaultAuthState() already set error: null in beforeEach —
    // this test confirms the previous error test didn't bleed through
    render(<LoginPage />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  // ── 4. Loading state ────────────────────────────────────────────────────────

  it("disables the CTA button and shows loading label while signing in", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isLoading: true,
      error: null,
      signIn: mockSignIn,
      signOut: vi.fn(),
    });
    render(<LoginPage />);
    const button = screen.getByRole("button", { name: /login\.cta_loading/i });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
  });

  it("shows the Ashoka Chakra spinner inside the button when loading", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isLoading: true,
      error: null,
      signIn: mockSignIn,
      signOut: vi.fn(),
    });
    render(<LoginPage />);
    expect(
      screen.getByRole("img", { name: /login\.cta_loading/i }),
    ).toBeInTheDocument();
  });

  // ── 5. Authenticated redirect ───────────────────────────────────────────────

  it("redirects to /home immediately when user is already authenticated", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { uid: "test-uid", displayName: "Priya" } as User,
      isLoading: false,
      error: null,
      signIn: mockSignIn,
      signOut: vi.fn(),
    });
    render(<LoginPage />);
    expect(mockNavigate).toHaveBeenCalledWith("/home", { replace: true });
  });
});
