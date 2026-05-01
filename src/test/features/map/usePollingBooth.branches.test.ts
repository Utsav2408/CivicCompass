import { renderHook, waitFor } from "@testing-library/react";
import { getDoc } from "firebase/firestore";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { usePollingBooth } from "@/features/map/hooks/usePollingBooth";

vi.mock("@/lib/firebase", () => ({ db: {} }));
vi.mock("firebase/firestore", () => ({
  doc: vi.fn(),
  getDoc: vi.fn(),
}));

describe("usePollingBooth extra branches", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns null when user doc does not exist", async () => {
    vi.mocked(getDoc).mockResolvedValue({
      exists: () => false,
      data: () => ({}),
    } as never);
    const { result } = renderHook(() => usePollingBooth("u1"));
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.booth).toBeNull();
  });

  it("sets normalized error when getDoc rejects non-Error", async () => {
    vi.mocked(getDoc).mockRejectedValue("bad");
    const { result } = renderHook(() => usePollingBooth("u1"));
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.error?.message).toBe("Failed to fetch polling booth");
  });
});
