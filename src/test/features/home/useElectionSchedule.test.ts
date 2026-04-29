import { renderHook, waitFor } from "@testing-library/react";
import * as firestore from "firebase/firestore";
import { describe, it, expect, vi, beforeEach } from "vitest";

import type { ElectionSchedule } from "@/features/home/home.types";
import { useElectionSchedule } from "@/features/home/useElectionSchedule";

// Mock Firebase
vi.mock("firebase/firestore", () => ({
  getDoc: vi.fn(),
  doc: vi.fn(),
  getFirestore: vi.fn(),
}));

vi.mock("@/lib/firebase", () => ({
  db: {},
}));

describe("useElectionSchedule", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns isLoading:true on mount", () => {
    vi.mocked(firestore.getDoc).mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useElectionSchedule("test-id"));
    expect(result.current.isLoading).toBe(true);
  });

  it("resolves to schedule doc", async () => {
    const mockData = { type: "General", phases: [] } as unknown as ElectionSchedule;
    const mockSnapshot = {
      exists: () => true,
      data: () => mockData,
    } as unknown as firestore.DocumentSnapshot;

    vi.mocked(firestore.getDoc).mockResolvedValue(mockSnapshot);

    const { result } = renderHook(() => useElectionSchedule("test-id"));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.schedule).toEqual(mockData);
  });

  it("sets error on Firestore rejection", async () => {
    vi.mocked(firestore.getDoc).mockRejectedValue(new Error("Permission denied"));

    const { result } = renderHook(() => useElectionSchedule("test-id"));

    await waitFor(() => {
      expect(result.current.error).toBe("Permission denied");
    });
    expect(result.current.isLoading).toBe(false);
  });
});
