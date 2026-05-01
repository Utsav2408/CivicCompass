import { renderHook, waitFor } from "@testing-library/react";
import { getDocs } from "firebase/firestore";
import { describe, expect, it, vi } from "vitest";

import { useAllPollingBooths } from "@/features/map/hooks/useAllPollingBooths";

vi.mock("@/lib/firebase", () => ({ db: {} }));
vi.mock("firebase/firestore", () => ({
  collection: vi.fn(),
  query: vi.fn(),
  getDocs: vi.fn(),
}));

describe("useAllPollingBooths error branch", () => {
  it("sets normalized error when getDocs rejects with non-Error", async () => {
    vi.mocked(getDocs).mockRejectedValue("bad");
    const { result } = renderHook(() => useAllPollingBooths(true));
    await waitFor(() => { expect(result.current.isLoading).toBe(false); });
    expect(result.current.error?.message).toBe("Failed to fetch polling booths");
  });
});
