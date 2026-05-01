import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useGeminiSupport } from "@/features/support/hooks/useGeminiSupport";

vi.mock("@/features/login/useAuth", () => ({
  useAuth: () => ({ user: { uid: "u1" } }),
}));
vi.mock("@/features/support/hooks/useTickets", () => ({
  useTickets: () => ({ createTicket: vi.fn() }),
}));

describe("useGeminiSupport resetConversation", () => {
  it("clears conversation state", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ response: "ok" }),
    } as Response);
    const { result } = renderHook(() => useGeminiSupport());
    await act(async () => {
      await result.current.send("hello");
    });
    expect(result.current.messages.length).toBeGreaterThan(0);
    act(() => {
      result.current.resetConversation();
    });
    expect(result.current.messages).toEqual([]);
    expect(result.current.lastTicketId).toBeNull();
  });
});
