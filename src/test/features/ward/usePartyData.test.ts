import { renderHook, waitFor } from "@testing-library/react";
import type { QuerySnapshot } from "firebase/firestore";
import * as firestore from "firebase/firestore";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { usePartyData } from "@/features/ward/hooks/usePartyData";
import type { PartyResult } from "@/shared/types/ward";

// Mock Firebase
vi.mock("firebase/firestore", () => ({
  getFirestore: vi.fn(),
  collection: vi.fn(),
  getDocs: vi.fn(),
}));

vi.mock("@/lib/firebase", () => ({
  db: {},
}));

function makeMockSnapshot(parties: PartyResult[]): QuerySnapshot {
  return {
    forEach: (callback: (doc: unknown) => void) => {
      parties.forEach((party) => {
        callback({ data: () => party });
      });
    },
  } as unknown as QuerySnapshot;
}

describe("usePartyData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockParties: PartyResult[] = [
    {
      party: "BJP",
      fullName: "Bharatiya Janata Party",
      voteShare2019: 50,
      voteShare2024: 45,
      color: "#F97D09",
    },
    {
      party: "INC",
      fullName: "Indian National Congress",
      voteShare2019: 20,
      voteShare2024: 25,
      color: "#00BFFF",
    },
  ];

  it("returns correct party array after resolving", async () => {
    vi.mocked(firestore.getDocs).mockResolvedValue(
      makeMockSnapshot(mockParties),
    );

    const { result } = renderHook(() =>
      usePartyData("constituency-1", "lok_sabha"),
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.parties).toEqual(mockParties);
    expect(firestore.getDocs).toHaveBeenCalledTimes(1);
  });

  it("handles empty sub-collection correctly", async () => {
    vi.mocked(firestore.getDocs).mockResolvedValue(makeMockSnapshot([]));

    const { result } = renderHook(() =>
      usePartyData("constituency-1", "lok_sabha"),
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.parties).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it("handles Firestore error correctly", async () => {
    vi.mocked(firestore.getDocs).mockRejectedValue(
      new Error("Permission Denied"),
    );

    const { result } = renderHook(() =>
      usePartyData("constituency-1", "lok_sabha"),
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.parties).toEqual([]);
    expect(result.current.error).toBe("Permission Denied");
  });

  it("does not fetch if constituencyId is null", async () => {
    const { result } = renderHook(() => usePartyData(null, "lok_sabha"));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(firestore.getDocs).not.toHaveBeenCalled();
    expect(result.current.parties).toEqual([]);
  });
});
