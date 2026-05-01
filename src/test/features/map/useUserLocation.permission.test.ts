import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useUserLocation } from "@/features/map/hooks/useUserLocation";

describe("useUserLocation permission branch", () => {
  it("updates permissionState using permissions API", async () => {
    const status = { state: "granted" as const, onchange: null as (() => void) | null };
    Object.defineProperty(globalThis.navigator, "permissions", {
      value: { query: () => Promise.resolve(status) },
      configurable: true,
    });
    Object.defineProperty(globalThis.navigator, "geolocation", {
      value: {
        getCurrentPosition: (
          success: (p: { coords: { latitude: number; longitude: number } }) => void,
        ) => { success({ coords: { latitude: 1, longitude: 2 } }); },
      },
      configurable: true,
    });

    const { result } = renderHook(() => useUserLocation());
    await waitFor(() => { expect(result.current.permissionState).toBe("granted"); });
  });
});
