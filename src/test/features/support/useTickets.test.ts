import { act, renderHook, waitFor } from "@testing-library/react";
import * as firestore from "firebase/firestore";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { useTickets } from "@/features/support/hooks/useTickets";

// Mock Firebase
vi.mock("firebase/firestore", () => ({
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  onSnapshot: vi.fn(),
  addDoc: vi.fn(),
  Timestamp: {
    now: vi.fn(() => ({ seconds: 123, nanoseconds: 456 })),
  },
}));

vi.mock("@/lib/firebase", () => ({
  db: {},
}));

describe("useTickets", () => {
  const mockUid = "test-user-123";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sets up snapshot listener on mount", () => {
    const unsubscribe = vi.fn();
    vi.mocked(firestore.onSnapshot).mockReturnValue(unsubscribe);

    const { unmount } = renderHook(() => useTickets(mockUid));

    expect(firestore.onSnapshot).toHaveBeenCalled();
    
    unmount();
    expect(unsubscribe).toHaveBeenCalled();
  });

  it("updates tickets when snapshot changes", async () => {
    let snapshotCallback: (snapshot: { docs: unknown[] }) => void = () => {};
    vi.mocked(firestore.onSnapshot).mockImplementation((_q, cb) => {
      snapshotCallback = cb as (snapshot: { docs: unknown[] }) => void;
      return vi.fn();
    });

    const { result } = renderHook(() => useTickets(mockUid));

    const mockDocs = [
      { id: "1", data: () => ({ description: "Issue 1", status: "open", userId: mockUid }) },
      { id: "2", data: () => ({ description: "Issue 2", status: "resolved", userId: mockUid }) },
    ];

    act(() => {
      snapshotCallback({ docs: mockDocs });
    });

    await waitFor(() => {
      expect(result.current.tickets).toHaveLength(2);
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.tickets[0]).toBeDefined();
    expect(result.current.tickets[0]?.id).toBe("1");
  });

  it("filters tickets by status", async () => {
    renderHook(() => useTickets(mockUid));
    
    // Default filter is 'all'
    expect(firestore.where).toHaveBeenCalledWith("userId", "==", mockUid);

    vi.clearAllMocks();
    
    const { result } = renderHook(() => useTickets(mockUid));
    act(() => {
      result.current.setFilter("resolved");
    });

    await waitFor(() => {
      expect(result.current.filter).toBe("resolved");
    });
  });

  it("creates a new ticket", async () => {
    const mockDocRef = { id: "new-ticket-id" };
    vi.mocked(firestore.addDoc).mockResolvedValue(mockDocRef as unknown as firestore.DocumentReference);

    const { result } = renderHook(() => useTickets(mockUid));

    let ticketId;
    await waitFor(async () => {
      ticketId = await result.current.createTicket("My problem", "safety", "open");
    });

    expect(firestore.addDoc).toHaveBeenCalledWith(undefined, expect.objectContaining({
      description: "My problem",
      category: "safety",
      status: "open",
      userId: mockUid
    }));
    expect(ticketId).toBe("new-ticket-id");
  });

  it("handles error when snapshot fails", async () => {
    vi.mocked(firestore.onSnapshot).mockImplementation((_q, _cb, errCb) => {
      if (typeof errCb === "function") {
        (
          errCb as unknown as (error: Error) => void
        )(new Error("Database error"));
      }
      return vi.fn();
    });

    const { result } = renderHook(() => useTickets(mockUid));

    await waitFor(() => {
      expect(result.current.error).toBe("Failed to load tickets");
      expect(result.current.isLoading).toBe(false);
    });
  });

  it("returns empty array when no UID provided", async () => {
    const { result } = renderHook(() => useTickets(undefined));
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.tickets).toEqual([]);
  });
});
