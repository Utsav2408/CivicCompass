import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useOfflineStatus } from "@/shared/hooks/useOfflineStatus";

describe("useOfflineStatus", () => {
  it("tracks browser online/offline events", () => {
    vi.spyOn(window.navigator, "onLine", "get").mockReturnValue(true);
    const { result } = renderHook(() => useOfflineStatus());
    expect(result.current).toBe(false);

    act(() => {
      window.dispatchEvent(new Event("offline"));
    });
    expect(result.current).toBe(true);

    act(() => {
      window.dispatchEvent(new Event("online"));
    });
    expect(result.current).toBe(false);
  });
});
