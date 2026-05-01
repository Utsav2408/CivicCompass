import { renderHook } from "@testing-library/react";
import { addDoc } from "firebase/firestore";
import { describe, expect, it, vi } from "vitest";

import { useTickets } from "@/features/support/hooks/useTickets";

vi.mock("@/lib/firebase", () => ({ db: {} }));
vi.mock("firebase/firestore", () => ({
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  onSnapshot: vi.fn(() => vi.fn()),
  addDoc: vi.fn(),
  Timestamp: { now: vi.fn(() => ({ seconds: 1, nanoseconds: 0 })) },
}));

describe("useTickets createTicket branches", () => {
  it("throws when uid is missing", async () => {
    const { result } = renderHook(() => useTickets(undefined));
    await expect(
      result.current.createTicket("d", "general", "Open"),
    ).rejects.toThrow("User not authenticated");
  });

  it("throws normalized error when addDoc fails", async () => {
    vi.mocked(addDoc).mockRejectedValue(new Error("raw"));
    const { result } = renderHook(() => useTickets("u1"));
    await expect(
      result.current.createTicket("d", "general", "Open"),
    ).rejects.toThrow("Failed to create ticket");
  });
});
