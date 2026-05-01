import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useGeminiSupport } from "@/features/support/hooks/useGeminiSupport";

const createTicket = vi.fn();

vi.mock("@/features/login/useAuth", () => ({
  useAuth: () => ({ user: null }),
}));
vi.mock("@/features/support/hooks/useTickets", () => ({
  useTickets: () => ({ createTicket }),
}));

describe("useGeminiSupport unauthenticated", () => {
  it("returns early on send without user", async () => {
    const fetchSpy = vi.spyOn(global, "fetch");
    const { result } = renderHook(() => useGeminiSupport());
    await act(async () => {
      await result.current.send("hello");
    });
    expect(result.current.messages).toEqual([]);
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(createTicket).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });
});
