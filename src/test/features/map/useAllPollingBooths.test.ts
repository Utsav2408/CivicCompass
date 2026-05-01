import { renderHook, waitFor } from "@testing-library/react";
import { getDocs } from "firebase/firestore";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useAllPollingBooths } from "@/features/map/hooks/useAllPollingBooths";

vi.mock("@/lib/firebase", () => ({ db: {} }));
vi.mock("firebase/firestore", () => ({
  collection: vi.fn(),
  query: vi.fn(),
  getDocs: vi.fn(),
}));

describe("useAllPollingBooths", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns empty state when disabled", () => {
    const { result } = renderHook(() => useAllPollingBooths(false));
    expect(result.current.booths).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it("loads booths when enabled", async () => {
    vi.mocked(getDocs).mockResolvedValue({
      forEach: (cb: (doc: { id: string; data: () => unknown }) => void) => {
        cb({
          id: "b1",
          data: () => ({ name: "Booth A", coordinates: { lat: 1, lng: 2 } }),
        });
      },
    } as never);

    const { result } = renderHook(() => useAllPollingBooths(true));
    await waitFor(() => { expect(result.current.isLoading).toBe(false); });
    expect(result.current.booths).toHaveLength(1);
  });
});
