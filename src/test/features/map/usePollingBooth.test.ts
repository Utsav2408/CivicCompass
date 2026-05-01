import { renderHook, waitFor } from "@testing-library/react";
import { getDoc } from "firebase/firestore";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { usePollingBooth } from "@/features/map/hooks/usePollingBooth";

vi.mock("@/lib/firebase", () => ({ db: {} }));
vi.mock("firebase/firestore", () => ({
  doc: vi.fn(),
  getDoc: vi.fn(),
}));

describe("usePollingBooth", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns null booth when uid is undefined", () => {
    const { result } = renderHook(() => usePollingBooth(undefined));
    expect(result.current.booth).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it("loads booth from user profile", async () => {
    vi.mocked(getDoc).mockResolvedValue({
      exists: () => true,
      data: () => ({ pollingBooth: { id: "b1", name: "Booth 1" } }),
    } as never);

    const { result } = renderHook(() => usePollingBooth("u1"));
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.booth).toMatchObject({ id: "b1" });
  });
});
