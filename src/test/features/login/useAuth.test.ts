/**
 * useAuth — unit tests
 *
 * Firebase Auth is fully mocked — no network, no emulator required.
 * Tests cover the four required scenarios:
 *   1. sign-in success
 *   2. sign-in error
 *   3. loading state (initial + during sign-in)
 *   4. listener cleanup on unmount
 */

import { waitFor } from "@testing-library/dom";
import { renderHook, act } from "@testing-library/react";
import {
  type User,
  type NextOrObserver,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useAuth } from "@features/login/useAuth";

// ── Mocks ────────────────────────────────────────────────────────────────────

vi.mock("@/lib/firebase", () => ({ auth: {} }));

vi.mock("firebase/auth", () => ({
  GoogleAuthProvider: vi.fn(),
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
}));

// Typed mock helpers
const mockOnAuthStateChanged = vi.mocked(onAuthStateChanged);
const mockSignInWithPopup = vi.mocked(signInWithPopup);
const mockSignOut = vi.mocked(signOut);

// Minimal Firebase User stub
const fakeUser = {
  uid: "test-uid-123",
  email: "priya.sharma.test@gmail.com",
  displayName: "Priya Sharma",
} as User;

// ── Helper — simulate onAuthStateChanged firing ───────────────────────────────

/**
 * onAuthStateChanged captures the observer callback when the hook mounts.
 * This helper captures it and exposes a `fire` function to simulate
 * Firebase firing the observer with a user or null.
 */
function setupAuthListener() {
  let capturedObserver: NextOrObserver<User | null> | null = null;
  const unsubscribe = vi.fn();

  mockOnAuthStateChanged.mockImplementation((_auth, observerOrNext) => {
    capturedObserver = observerOrNext;
    return unsubscribe;
  });

  return {
    unsubscribe,
    fire: (user: User | null) => {
      if (typeof capturedObserver === "function") capturedObserver(user);
    },
  };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("useAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── 1. Loading state ────────────────────────────────────────────────────────

  it("starts with isLoading: true before auth state resolves", () => {
    // onAuthStateChanged registered but observer not fired yet
    mockOnAuthStateChanged.mockReturnValue(vi.fn());

    const { result } = renderHook(() => useAuth());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.user).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("sets isLoading: false once onAuthStateChanged fires with null", async () => {
    const { fire } = setupAuthListener();
    const { result } = renderHook(() => useAuth());

    act(() => {
      fire(null);
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.user).toBeNull();
    });
  });

  // ── 2. Sign-in success ──────────────────────────────────────────────────────

  it("sets user after successful sign-in", async () => {
    const { fire } = setupAuthListener();
    mockSignInWithPopup.mockResolvedValue({
      user: fakeUser,
    } as Awaited<ReturnType<typeof signInWithPopup>>);

    const { result } = renderHook(() => useAuth());

    // Auth resolves as unauthenticated initially
    act(() => {
      fire(null);
    });

    // Trigger sign-in
    await act(async () => {
      await result.current.signIn();
    });

    // Simulate Firebase firing the observer with the signed-in user
    act(() => {
      fire(fakeUser);
    });

    await waitFor(() => {
      expect(result.current.user).toEqual(fakeUser);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  it("sets isLoading: true during sign-in, then false after", async () => {
    const { fire } = setupAuthListener();

    // Delay sign-in resolution so we can assert the loading state
    let resolveSignIn!: () => void;
    mockSignInWithPopup.mockReturnValue(
      new Promise<Awaited<ReturnType<typeof signInWithPopup>>>((resolve) => {
        resolveSignIn = () => {
          resolve({
            user: fakeUser,
          } as Awaited<ReturnType<typeof signInWithPopup>>);
        };
      }),
    );

    const { result } = renderHook(() => useAuth());
    act(() => {
      fire(null);
    });

    // Start sign-in — don't await
    act(() => {
      void result.current.signIn();
    });

    // Loading should be true while popup is open
    expect(result.current.isLoading).toBe(true);

    // Resolve the popup
    act(() => {
      resolveSignIn();
    });

    act(() => {
      fire(fakeUser);
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  // ── 3. Sign-in error ────────────────────────────────────────────────────────

  it("sets error message when sign-in popup is dismissed or fails", async () => {
    const { fire } = setupAuthListener();
    mockSignInWithPopup.mockRejectedValue(
      new Error("auth/popup-closed-by-user"),
    );

    const { result } = renderHook(() => useAuth());
    act(() => {
      fire(null);
    });

    await act(async () => {
      await result.current.signIn();
    });

    await waitFor(() => {
      expect(result.current.error).toBe("auth/popup-closed-by-user");
      expect(result.current.isLoading).toBe(false);
      expect(result.current.user).toBeNull();
    });
  });

  it("sets generic error message when error is not an Error instance", async () => {
    const { fire } = setupAuthListener();
    mockSignInWithPopup.mockRejectedValue("unexpected string error");

    const { result } = renderHook(() => useAuth());
    act(() => {
      fire(null);
    });

    await act(async () => {
      await result.current.signIn();
    });

    await waitFor(() => {
      expect(result.current.error).toBe("Sign-in failed");
    });
  });

  // ── 4. Sign-out ─────────────────────────────────────────────────────────────

  it("clears user after sign-out", async () => {
    const { fire } = setupAuthListener();
    mockSignOut.mockResolvedValue(undefined);

    const { result } = renderHook(() => useAuth());
    act(() => {
      fire(fakeUser);
    }); // start authenticated

    await waitFor(() => {
      expect(result.current.user).toEqual(fakeUser);
    });

    await act(async () => {
      await result.current.signOut();
    });

    act(() => {
      fire(null);
    }); // Firebase fires observer with null after sign-out

    await waitFor(() => {
      expect(result.current.user).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });
  });

  // ── 5. Listener cleanup on unmount ──────────────────────────────────────────

  it("calls unsubscribe on unmount — no listener leak", () => {
    const { unsubscribe } = setupAuthListener();

    const { unmount } = renderHook(() => useAuth());
    unmount();

    expect(unsubscribe).toHaveBeenCalledOnce();
  });
});
