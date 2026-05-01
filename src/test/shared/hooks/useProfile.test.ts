import { renderHook, waitFor } from "@testing-library/react";
import { getDoc } from "firebase/firestore";
import { beforeEach, describe, expect, it, vi } from "vitest";

import * as authHook from "@/features/login/useAuth";
import { useProfile } from "@/shared/hooks/useProfile";

vi.mock("@/features/login/useAuth");
vi.mock("@/lib/firebase", () => ({ db: {} }));
vi.mock("firebase/firestore", () => ({
  doc: vi.fn(),
  getDoc: vi.fn(),
}));

describe("useProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null profile when user is not authenticated", async () => {
    vi.mocked(authHook.useAuth).mockReturnValue({ user: null } as never);
    const { result } = renderHook(() => useProfile());
    await waitFor(() => { expect(result.current.isLoading).toBe(false); });
    expect(result.current.profile).toBeNull();
  });

  it("sets profile not found error when doc does not exist", async () => {
    vi.mocked(authHook.useAuth).mockReturnValue({ user: { uid: "u1" } } as never);
    vi.mocked(getDoc).mockResolvedValue({
      exists: () => false,
      data: () => ({}),
    } as never);
    const { result } = renderHook(() => useProfile());
    await waitFor(() => { expect(result.current.isLoading).toBe(false); });
    expect(result.current.error).toBe("Profile not found.");
  });
});
