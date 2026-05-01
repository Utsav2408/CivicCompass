import { renderHook, waitFor } from "@testing-library/react";
import { getDoc } from "firebase/firestore";
import { beforeEach, describe, expect, it, vi } from "vitest";

import * as authHook from "@/features/login/useAuth";
import { useWardCandidates } from "@/features/ward/hooks/useWardCandidates";

vi.mock("@/features/login/useAuth");
vi.mock("@/lib/firebase", () => ({ db: {} }));
vi.mock("firebase/firestore", () => ({ doc: vi.fn(), getDoc: vi.fn() }));

describe("useWardCandidates success branches", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sets nomination deadline when election doc exists and returns candidates", async () => {
    vi.mocked(authHook.useAuth).mockReturnValue({
      user: { uid: "u1" },
    } as never);
    vi.mocked(getDoc).mockResolvedValue({
      exists: () => true,
      data: () => ({ nominationDeadline: "2026-05-01" }),
    } as never);
    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ candidates: [{ name: "A", party: "P" }] }),
    } as Response);

    const { result } = renderHook(() =>
      useWardCandidates("New Delhi PC-01", "lok_sabha"),
    );
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.nominationDeadline).toBe("2026-05-01");
    expect(result.current.candidates).toHaveLength(1);
  });
});
