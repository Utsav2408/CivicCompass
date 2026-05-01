import { act, renderHook, waitFor } from "@testing-library/react";
import * as firestore from "firebase/firestore";
import { describe, expect, it, vi } from "vitest";

import { useTickets } from "@/features/support/hooks/useTickets";

vi.mock("@/lib/firebase", () => ({ db: {} }));
vi.mock("firebase/firestore", () => ({
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  onSnapshot: vi.fn(),
  addDoc: vi.fn(),
  Timestamp: { now: vi.fn(() => ({ seconds: 1, nanoseconds: 0 })) },
}));

describe("useTickets filter branches", () => {
  it("applies non-all filter in snapshot normalization", async () => {
    let snapshotCallback: ((snapshot: { docs: Array<{ id: string; data: () => unknown }> }) => void) | undefined;
    vi.mocked(firestore.onSnapshot).mockImplementation((_q, cb) => {
      snapshotCallback = cb as typeof snapshotCallback;
      return vi.fn();
    });

    const { result } = renderHook(() => useTickets("u1"));
    act(() => {
      result.current.setFilter("Open");
    });

    await waitFor(() => { expect(result.current.filter).toBe("Open"); });
    act(() => {
      snapshotCallback?.({
        docs: [
          { id: "1", data: () => ({ status: "Open", description: "d1" }) },
          { id: "2", data: () => ({ status: "Resolved", description: "d2" }) },
        ],
      });
    });

    await waitFor(() => {
      expect(result.current.tickets).toHaveLength(1);
      expect(result.current.tickets[0]?.id).toBe("1");
    });
  });
});
