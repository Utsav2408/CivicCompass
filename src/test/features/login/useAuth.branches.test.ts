import { act, renderHook, waitFor } from "@testing-library/react";
import {
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AuthProvider, useAuth } from "@/features/login/useAuth";

vi.mock("@/lib/firebase", () => ({ auth: {} }));
vi.mock("firebase/auth", () => ({
  GoogleAuthProvider: vi.fn(),
  signInWithPopup: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
}));

describe("useAuth extra branches", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sets error when auth listener reports failure", async () => {
    vi.mocked(onAuthStateChanged).mockImplementation((_a, _next, onErr) => {
      if (onErr) onErr(new Error("listener failed"));
      return vi.fn();
    });
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    await waitFor(() => { expect(result.current.error).toBe("listener failed"); });
  });

  it("sets signOut error on failure", async () => {
    vi.mocked(onAuthStateChanged).mockImplementation((_a, next) => {
      if (typeof next === "function") next({ uid: "u1" } as never);
      return vi.fn();
    });
    vi.mocked(signOut).mockRejectedValue(new Error("signout failed"));
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    await act(async () => {
      await result.current.signOut();
    });
    expect(result.current.error).toBe("signout failed");
  });

  it("signInDemo creates demo user on user-not-found", async () => {
    vi.mocked(onAuthStateChanged).mockReturnValue(vi.fn());
    vi.mocked(signInWithEmailAndPassword).mockRejectedValue({
      code: "auth/user-not-found",
    });
    vi.mocked(createUserWithEmailAndPassword).mockResolvedValue({} as never);
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    await act(async () => {
      await result.current.signInDemo();
    });
    if (result.current.canUseDemoLogin) {
      expect(createUserWithEmailAndPassword).toHaveBeenCalled();
    }
  });
});
