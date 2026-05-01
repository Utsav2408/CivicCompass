import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { usePoliceStations } from "@/features/map/hooks/usePoliceStations";
import { useUserLocation } from "@/features/map/hooks/useUserLocation";
import { useEmergency } from "@/features/support/hooks/useEmergency";
import { useProfile } from "@/shared/hooks/useProfile";

// Mock hooks
vi.mock("@/shared/hooks/useProfile");
vi.mock("@/features/map/hooks/useUserLocation");
vi.mock("@/features/map/hooks/usePoliceStations");

describe("useEmergency", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    vi.mocked(useProfile).mockReturnValue({ 
      profile: { 
        uid: "user-123",
        name: "Test User",
        pollingBooth: {
          id: "booth-1",
          name: "Booth 1",
          city: "New Delhi",
          address: "Address 1",
          coordinates: { lat: 0, lng: 0 },
          wardName: "Ward 1",
          wardCode: "W01",
          constituency: "New Delhi",
          boothNumber: "101",
        },
        language: "en",
        electionInterest: ["lok_sabha"],
        isComplete: true,
        createdAt: 0,
        updatedAt: 0,
      },
      isLoading: false,
      error: null,
    });
    vi.mocked(useUserLocation).mockReturnValue({ 
      coords: { lat: 28.6139, lng: 77.209 },
      permissionState: "granted",
      error: null
    });
    vi.mocked(usePoliceStations).mockReturnValue({ 
      stations: [
        {
          name: "Connaught Place Police Station",
          latitude: 28.632,
          longitude: 77.218,
          id: "station-1",
          address: "CP",
          city: "New Delhi",
          phone: "100",
          state: "Delhi",
        }
      ],
      isLoading: false,
      error: null
    });
  });

  it("should be inactive by default", () => {
    const { result } = renderHook(() => useEmergency());
    expect(result.current.isActive).toBe(false);
  });

  it("should activate within 500ms (state update is instantaneous)", () => {
    const { result } = renderHook(() => useEmergency());
    
    const startTime = performance.now();
    act(() => {
      result.current.activate();
    });
    const endTime = performance.now();
    
    expect(result.current.isActive).toBe(true);
    expect(endTime - startTime).toBeLessThan(500);
  });

  it("should populate nearest station and calculate ETA", () => {
    const { result } = renderHook(() => useEmergency());
    
    expect(result.current.nearestStation?.name).toBe("Connaught Place Police Station");
    expect(result.current.eta).toBeGreaterThan(0);
    expect(typeof result.current.eta).toBe("number");
  });

  it("should reset state when canceled", () => {
    const { result } = renderHook(() => useEmergency());
    
    act(() => {
      result.current.activate();
    });
    expect(result.current.isActive).toBe(true);
    
    act(() => {
      result.current.cancel();
    });
    expect(result.current.isActive).toBe(false);
  });
});
