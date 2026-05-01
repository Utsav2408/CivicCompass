import { renderHook, waitFor } from "@testing-library/react";
import { getDocs } from "firebase/firestore";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useHistoricalWinners } from "@/features/ward/hooks/useHistoricalWinners";

vi.mock("@/lib/firebase", () => ({ db: {} }));
vi.mock("firebase/firestore", () => ({
  collection: vi.fn(),
  getDocs: vi.fn(),
}));

describe("useHistoricalWinners", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns empty winners when constituencyId is null", async () => {
    const { result } = renderHook(() => useHistoricalWinners(null));
    await waitFor(() => { expect(result.current.isLoading).toBe(false); });
    expect(result.current.winners).toEqual([]);
  });

  it("fetches and sorts winners by year desc", async () => {
    vi.mocked(getDocs).mockResolvedValue({
      forEach: (cb: (doc: { data: () => unknown }) => void) => {
        cb({ data: () => ({ id: "a", year: 2019, winnerName: "A", party: "X", voteMargin: 1 }) });
        cb({ data: () => ({ id: "b", year: 2024, winnerName: "B", party: "Y", voteMargin: 2 }) });
      },
    } as never);

    const { result } = renderHook(() => useHistoricalWinners("const-1"));
    await waitFor(() => { expect(result.current.isLoading).toBe(false); });
    expect(result.current.winners[0]?.year).toBe(2024);
  });
});
