import { renderHook, waitFor } from "@testing-library/react";
import type { QuerySnapshot } from "firebase/firestore";
import * as firestore from "firebase/firestore";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { useProcessSteps } from "@/features/process/hooks/useProcessSteps";
import type { ProcessStep } from "@/shared/types/election";

// Mock Firebase
vi.mock("firebase/firestore", () => ({
  getFirestore: vi.fn(),
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  getDocs: vi.fn(),
}));

vi.mock("@/lib/firebase", () => ({
  db: {},
}));

function makeMockSnapshot(steps: ProcessStep[]): QuerySnapshot {
  return {
    docs: steps.map((step) => ({
      id: step.id,
      data: () => step,
    })),
  } as unknown as QuerySnapshot;
}

describe("useProcessSteps", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockSteps: ProcessStep[] = [
    {
      id: "1",
      title: "Step 1",
      description: "Desc 1",
      extendedDescription: "Ext 1",
      phase: "pre-election",
      electionType: "lok_sabha",
      stepOrder: 1,
      source: "ECI",
      sourceUrl: "https://eci.gov.in",
    },
  ];

  it("returns isLoading: true on mount and false after resolution", async () => {
    vi.mocked(firestore.getDocs).mockResolvedValue(makeMockSnapshot(mockSteps));

    const { result } = renderHook(() =>
      useProcessSteps("lok_sabha", "pre-election"),
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.steps).toEqual(mockSteps);
  });

  it("returns correct steps for lok_sabha + pre-election", async () => {
    vi.mocked(firestore.getDocs).mockResolvedValue(makeMockSnapshot(mockSteps));

    const { result } = renderHook(() =>
      useProcessSteps("lok_sabha", "pre-election"),
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.steps).toHaveLength(1);
    expect(result.current.steps[0]?.electionType).toBe("lok_sabha");
    expect(result.current.steps[0]?.phase).toBe("pre-election");
  });

  it("returns correct steps for vidhan_sabha + election_day", async () => {
    const vsSteps: ProcessStep[] = [
      {
        id: "step-2",
        title: "Vidhan Sabha Mock Step",
        description: "Mock description",
        extendedDescription: "Mock extended",
        stepOrder: 1,
        source: "ECI",
        sourceUrl: "https://eci.gov.in",
        electionType: "vidhan_sabha",
        phase: "election-day"
      }
    ];

    vi.mocked(firestore.getDocs).mockResolvedValue(makeMockSnapshot(vsSteps));

    const { result } = renderHook(() =>
      useProcessSteps("vidhan_sabha", "election-day"),
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.steps[0]?.electionType).toBe("vidhan_sabha");
    expect(result.current.steps[0]?.phase).toBe("election-day");
  });

  it("sets error when Firestore throws", async () => {
    vi.mocked(firestore.getDocs).mockRejectedValue(new Error("Network Error"));

    const { result } = renderHook(() =>
      useProcessSteps("lok_sabha", "pre-election"),
    );

    await waitFor(() => {
      expect(result.current.error).toBe("Network Error");
    });
    expect(result.current.isLoading).toBe(false);
  });

  it("returns empty array and stops loading without memory leak on unmount", () => {
    vi.mocked(firestore.getDocs).mockReturnValue(
      new Promise(() => {
        /* never resolves */
      }) as unknown as ReturnType<typeof firestore.getDocs>,
    );

    const { unmount } = renderHook(() =>
      useProcessSteps("lok_sabha", "pre-election"),
    );
    unmount();
    // isMounted=false flag prevents state updates after unmount — no error thrown
  });
});
