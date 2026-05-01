import { renderHook, waitFor } from "@testing-library/react";
import { getDocs } from "firebase/firestore";
import { describe, expect, it, vi, afterEach } from "vitest";

import { useWardSearch } from "@/features/map/hooks/useWardSearch";

vi.mock("firebase/firestore", () => ({
  collection: vi.fn(),
  getDocs: vi.fn(),
  limit: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  getFirestore: vi.fn(),
}));

vi.mock("@/lib/firebase", () => ({
  db: {},
}));

describe("useWardSearch", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("prefetches booths and keeps empty results for empty query", async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
    vi.mocked(getDocs).mockResolvedValue({ forEach: vi.fn() } as any);
    const { result } = renderHook(() => useWardSearch(""));
    await waitFor(() => {
      expect(getDocs).toHaveBeenCalledTimes(1);
    });
    await waitFor(() => {
      expect(result.current.isSearching).toBe(false);
    });
    expect(result.current.results).toEqual([]);
  });

  it("debounces search and clears searching state", async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
    vi.mocked(getDocs).mockResolvedValue({ forEach: vi.fn() } as any);

    const { result } = renderHook(() => useWardSearch("C"));

    expect(result.current.isSearching).toBe(true);

    await waitFor(() => {
      expect(result.current.isSearching).toBe(false);
    }, { timeout: 2000 });
  });

  it("should handle Firestore results correctly", async () => {
    const mockBooths = [{ id: "b1", wardName: "Connaught Place" }];
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    vi.mocked(getDocs).mockResolvedValue({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
      forEach: (callback: any) => { mockBooths.forEach((b) => callback({ id: b.id, data: () => b })); },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    const { result } = renderHook(() => useWardSearch("Connaught"));

    await waitFor(() => { expect(result.current.results.length).toBe(1); }, { timeout: 2000 });
    expect(result.current.results[0]?.wardName).toBe("Connaught Place");
    expect(result.current.isSearching).toBe(false);
  });
});
