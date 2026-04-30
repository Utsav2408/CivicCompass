import { renderHook } from "@testing-library/react";
import { onSnapshot } from "firebase/firestore";
import { vi, describe, it, expect } from "vitest";

import { useTickets } from "./useTickets";

vi.mock("firebase/firestore", async () => {
  const actual = await vi.importActual("firebase/firestore");
  return {
    ...actual,
    onSnapshot: vi.fn(() => vi.fn()), // Returns an unsubscribe spy
    collection: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    orderBy: vi.fn(),
  };
});

describe("useTickets cleanup", () => {
  it("should return unsubscribe function and call it on unmount", () => {
    const unsubscribeSpy = vi.fn();
    vi.mocked(onSnapshot).mockReturnValue(unsubscribeSpy);

    const { unmount } = renderHook(() => useTickets("test-uid"));

    unmount();

    expect(unsubscribeSpy).toHaveBeenCalled();
  });
});
