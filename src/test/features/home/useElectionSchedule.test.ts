import { renderHook, waitFor } from "@testing-library/react";
import * as firestore from "firebase/firestore";
import { describe, it, expect, vi, beforeEach } from "vitest";

import type { ElectionSchedule } from "@/features/home/home.types";
import { useElectionSchedule } from "@/features/home/useElectionSchedule";


// Mock Firebase
vi.mock("firebase/firestore", () => ({
  onSnapshot: vi.fn(),
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
    vi.mocked(firestore.onSnapshot).mockReturnValue(vi.fn());

    const { result } = renderHook(() => useElectionSchedule("test-id"));
    expect(result.current.isLoading).toBe(true);
  });

  it("resolves to schedule doc when snapshot fires", async () => {
    const mockData = { type: "General" } as ElectionSchedule;
    const mockSnapshot = {
      exists: () => true,
      data: () => mockData,
    } as unknown as firestore.DocumentSnapshot;

    let snapshotCallback!: (snapshot: firestore.DocumentSnapshot) => void;
    vi.mocked(firestore.onSnapshot).mockImplementation((_query, cb) => {
      snapshotCallback = cb as unknown as (snapshot: firestore.DocumentSnapshot) => void;
      return vi.fn();
    });

    const { result } = renderHook(() => useElectionSchedule("test-id"));

    // Simulate snapshot event
    snapshotCallback(mockSnapshot);

    await waitFor(() => { expect(result.current.isLoading).toBe(false); });
    expect(result.current.schedule).toEqual(mockData);
  });

  it("sets error on Firestore rejection", async () => {
    let errorCallback!: (error: Error) => void;
    vi.mocked(firestore.onSnapshot).mockImplementation((_query, _cb, errCb) => {
      errorCallback = errCb as unknown as (error: Error) => void;
      return vi.fn();
    });

    const { result } = renderHook(() => useElectionSchedule("test-id"));

    // Simulate error
    errorCallback(new Error("Permission denied"));

    await waitFor(() => { expect(result.current.error).toBe("Permission denied"); });
    expect(result.current.isLoading).toBe(false);
  });
});
