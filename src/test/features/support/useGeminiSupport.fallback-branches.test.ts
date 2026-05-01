import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useGeminiSupport } from "@/features/support/hooks/useGeminiSupport";

const createTicket = vi.fn();

vi.mock("@/features/login/useAuth", () => ({
  useAuth: () => ({ user: { uid: "u1" } }),
}));
vi.mock("@/features/support/hooks/useTickets", () => ({
  useTickets: () => ({ createTicket }),
}));

describe("useGeminiSupport fallback branches", () => {
  it("uses fallback API error message when error payload is missing", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({}),
    } as Response);
    const { result } = renderHook(() => useGeminiSupport());
    await act(async () => {
      await result.current.send("Need support");
    });
    expect(result.current.error).toBe("Failed to get AI response");
  });

  it("uses non-Error fallback message in send catch", async () => {
    vi.spyOn(global, "fetch").mockRejectedValue("network-down");
    const { result } = renderHook(() => useGeminiSupport());
    await act(async () => {
      await result.current.send("Need support");
    });
    expect(result.current.error).toBe("AI support unavailable");
  });

  it("uses non-Error fallback message when raisePendingTicket fails", async () => {
    createTicket.mockRejectedValue("bad-ticket");
    const { result } = renderHook(() => useGeminiSupport());
    await act(async () => {
      await result.current.send("My name is missing from voter roll");
    });
    await waitFor(() => { expect(result.current.pendingTicketDraft).not.toBeNull(); });
    await act(async () => {
      await result.current.raisePendingTicket();
    });
    expect(result.current.error).toBe("Failed to create ticket");
  });
});
