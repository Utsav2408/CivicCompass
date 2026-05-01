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

describe("useProfile error branch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sets fetch error when firestore getDoc throws", async () => {
    vi.mocked(authHook.useAuth).mockReturnValue({ user: { uid: "u1" } } as never);
    vi.mocked(getDoc).mockRejectedValue(new Error("fetch profile failed"));

    const { result } = renderHook(() => useProfile());
    await waitFor(() => { expect(result.current.isLoading).toBe(false); });
    expect(result.current.error).toBe("fetch profile failed");
  });
});
