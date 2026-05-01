import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useUserLocation } from "@/features/map/hooks/useUserLocation";

describe("useUserLocation", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("sets coords on successful geolocation lookup", async () => {
    Object.defineProperty(globalThis.navigator, "permissions", {
      value: {
        query: vi.fn().mockResolvedValue({ state: "granted", onchange: null }),
      },
      configurable: true,
    });
    Object.defineProperty(globalThis.navigator, "geolocation", {
      value: {
        getCurrentPosition: (
          success: (v: {
            coords: { latitude: number; longitude: number };
          }) => void,
        ) => {
          success({ coords: { latitude: 12.3, longitude: 45.6 } });
        },
      },
      configurable: true,
    });

    const { result } = renderHook(() => useUserLocation());
    await waitFor(() => {
      expect(result.current.coords).toEqual({ lat: 12.3, lng: 45.6 });
    });
    expect(result.current.error).toBeNull();
  });

  it("sets error when geolocation callback returns an error", async () => {
    Object.defineProperty(globalThis.navigator, "permissions", {
      value: undefined,
      configurable: true,
    });
    Object.defineProperty(globalThis.navigator, "geolocation", {
      value: {
        getCurrentPosition: (
          _success: unknown,
          error: (e: { message: string }) => void,
        ) => {
          error({ message: "Permission denied" });
        },
      },
      configurable: true,
    });

    const { result } = renderHook(() => useUserLocation());
    await waitFor(() => {
      expect(result.current.error).toBe("Permission denied");
    });
  });
});
