import { renderHook, waitFor } from "@testing-library/react";
import { getDoc } from "firebase/firestore";
import { beforeEach, describe, expect, it, vi } from "vitest";

import * as authHook from "@/features/login/useAuth";
import { useWardCandidates } from "@/features/ward/hooks/useWardCandidates";

vi.mock("@/features/login/useAuth");
vi.mock("@/lib/firebase", () => ({ db: {} }));
vi.mock("firebase/firestore", () => ({
  doc: vi.fn(),
  getDoc: vi.fn(),
}));

describe("useWardCandidates branches", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: "candidate fetch failed" }),
    } as Response);
    vi.mocked(getDoc).mockResolvedValue({
      exists: () => false,
      data: () => ({}),
    } as never);
  });

  it("stops loading without fetch when user is null", async () => {
    vi.mocked(authHook.useAuth).mockReturnValue({ user: null } as never);
    const { result } = renderHook(() =>
      useWardCandidates("New Delhi PC-01", "lok_sabha"),
    );
    await waitFor(() => { expect(result.current.isLoading).toBe(false); });
    expect(result.current.candidates).toEqual([]);
  });

  it("sets error when candidate fetch responds non-ok", async () => {
    vi.mocked(authHook.useAuth).mockReturnValue({ user: { uid: "u1" } } as never);
    const { result } = renderHook(() =>
      useWardCandidates("New Delhi PC-01", "lok_sabha"),
    );
    await waitFor(() => { expect(result.current.isLoading).toBe(false); });
    expect(result.current.error).toBe("candidate fetch failed");
  });
});
