import { renderHook, waitFor } from "@testing-library/react";
import { getDocs } from "firebase/firestore";
import { describe, expect, it, vi } from "vitest";

import { usePoliceStations } from "@/features/map/hooks/usePoliceStations";
import { getDistance } from "@shared/utils/haversine";

vi.mock("firebase/firestore", () => ({
  collection: vi.fn(),
  getDocs: vi.fn(),
  orderBy: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  getFirestore: vi.fn(),
}));

vi.mock("@shared/utils/haversine", () => ({
  getDistance: vi.fn(),
}));

vi.mock("@/lib/firebase", () => ({
  db: {},
}));

describe("usePoliceStations", () => {
  const mockStations = [
    { id: "1", name: "Station A", city: "Delhi", latitude: 28.6, longitude: 77.2 },
    { id: "2", name: "Station B", city: "Delhi", latitude: 28.7, longitude: 77.3 },
  ];

  it("should handle empty city by returning empty array", () => {
    const { result } = renderHook(() => usePoliceStations(undefined));
    expect(result.current.stations).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it("should fetch and filter stations by city", async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    vi.mocked(getDocs).mockResolvedValue({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
      forEach: (callback: any) => { mockStations.forEach((s) => callback({ id: s.id, data: () => s })); },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    const { result } = renderHook(() => usePoliceStations("Delhi"));
    
    await waitFor(() => { expect(result.current.isLoading).toBe(false); });
    expect(result.current.stations).toHaveLength(2);
    expect(result.current.stations[0]?.name).toBe("Station A");
  });

  it("should sort stations by distance using Haversine formula", async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    vi.mocked(getDocs).mockResolvedValue({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
      forEach: (callback: any) => { mockStations.forEach((s) => callback({ id: s.id, data: () => s })); },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    // Mock distance: Station B is closer than Station A
    vi.mocked(getDistance).mockImplementation((_lat1: number, _lng1: number, lat2: number) => {
      return lat2 === 28.7 ? 5 : 10; // 28.7 is Station B
    });

    const userCoords = { lat: 28.5, lng: 77.1 };
    const { result } = renderHook(() => usePoliceStations("Delhi", userCoords));

    await waitFor(() => { expect(result.current.isLoading).toBe(false); });
    
    // Station B (closer) should be first
    expect(result.current.stations[0]?.name).toBe("Station B");
    expect(result.current.stations[1]?.name).toBe("Station A");
  });

  it("should handle fetch errors gracefully", async () => {
    vi.mocked(getDocs).mockRejectedValue(new Error("Firestore Error"));

    const { result } = renderHook(() => usePoliceStations("Delhi"));

    await waitFor(() => { expect(result.current.isLoading).toBe(false); });
    expect(result.current.error?.message).toBe("Firestore Error");
    expect(result.current.stations).toEqual([]);
  });
});
