import { renderHook, waitFor } from "@testing-library/react";
import { getDocs } from "firebase/firestore";
import { beforeEach, describe, expect, it, vi } from "vitest";

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
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockStations = [
    { id: "1", name: "Station A", city: "Delhi", latitude: 28.6, longitude: 77.2 },
    { id: "2", name: "Station B", city: "Delhi", latitude: 28.7, longitude: 77.3 },
  ];

  type MockDoc = { id: string; data: () => unknown };
  type MockSnapshot = {
    forEach: (callback: (doc: MockDoc) => void) => void;
  };

  function createSnapshot(docs: MockDoc[]): MockSnapshot {
    return {
      forEach: (callback) => {
        docs.forEach((doc) => {
          callback(doc);
        });
      },
    };
  }

  it("should handle empty city by returning empty array", () => {
    const { result } = renderHook(() => usePoliceStations(undefined));
    expect(result.current.stations).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it("should fetch and filter stations by city", async () => {
    vi.mocked(getDocs).mockResolvedValue(
      createSnapshot(
        mockStations.map((station) => ({
          id: station.id,
          data: () => station,
        })),
      ) as never,
    );

    const { result } = renderHook(() => usePoliceStations("Delhi"));
    
    await waitFor(() => { expect(result.current.isLoading).toBe(false); });
    expect(result.current.stations).toHaveLength(2);
    expect(vi.mocked(getDocs)).toHaveBeenCalled();
    expect(result.current.stations[0]?.name).toBe("Station A");
  });

  it("should sort stations by distance using Haversine formula", async () => {
    vi.mocked(getDocs).mockResolvedValue(
      createSnapshot(
        mockStations.map((station) => ({
          id: station.id,
          data: () => station,
        })),
      ) as never,
    );

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

  it("should prioritize Connaught Place/Karol Bagh/Paharganj stations and cap to 3", async () => {
    const stations = [
      { id: "1", name: "Connaught Place Police Station", city: "New Delhi", latitude: 28.6, longitude: 77.2 },
      { id: "2", name: "Karol Bagh Police Station", city: "New Delhi", latitude: 28.64, longitude: 77.19 },
      { id: "3", name: "Paharganj Police Station", city: "New Delhi", latitude: 28.64, longitude: 77.22 },
      { id: "4", name: "Parliament Street Police Station", city: "New Delhi", latitude: 28.62, longitude: 77.21 },
    ];

    vi.mocked(getDocs).mockResolvedValue(
      createSnapshot(
        stations.map((station) => ({
          id: station.id,
          data: () => station,
        })),
      ) as never,
    );

    const { result } = renderHook(() =>
      usePoliceStations("New Delhi", { lat: 28.61, lng: 77.2 }),
    );

    await waitFor(() => { expect(result.current.isLoading).toBe(false); });

    expect(result.current.stations).toHaveLength(3);
    expect(result.current.stations.map((station) => station.name)).toEqual([
      "Connaught Place Police Station",
      "Karol Bagh Police Station",
      "Paharganj Police Station",
    ]);
  });

  it("should query both Delhi and New Delhi aliases", async () => {
    vi.mocked(getDocs)
      .mockResolvedValueOnce(createSnapshot([]) as never)
      .mockResolvedValueOnce(
        createSnapshot([
          {
            id: "d1",
            data: () => ({
              id: "d1",
              name: "Connaught Place Police Station",
              city: "Delhi",
              latitude: 28.6,
              longitude: 77.2,
            }),
          },
        ]) as never,
      );

    const { result } = renderHook(() => usePoliceStations("New Delhi"));
    await waitFor(() => { expect(result.current.isLoading).toBe(false); });

    expect(vi.mocked(getDocs).mock.calls.length).toBeGreaterThanOrEqual(2);
    expect(result.current.stations).toHaveLength(1);
  });

  it("should handle fetch errors gracefully", async () => {
    vi.mocked(getDocs).mockRejectedValue(new Error("Firestore Error"));

    const { result } = renderHook(() => usePoliceStations("Delhi"));

    await waitFor(() => { expect(result.current.isLoading).toBe(false); });
    expect(result.current.error?.message).toBe("Firestore Error");
    expect(result.current.stations).toEqual([]);
  });
});
