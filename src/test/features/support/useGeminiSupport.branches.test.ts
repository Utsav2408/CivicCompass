import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useGeminiSupport } from "@/features/support/hooks/useGeminiSupport";

const createTicket = vi.fn();

vi.mock("@/features/login/useAuth", () => ({
  useAuth: () => ({ user: { uid: "u1" } }),
}));
vi.mock("@/features/support/hooks/useTickets", () => ({
  useTickets: () => ({ createTicket }),
}));

describe("useGeminiSupport extra branches", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses supportAgent response for non voter-roll prompts", async () => {
    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ response: "General support reply" }),
    } as Response);

    const { result } = renderHook(() => useGeminiSupport());
    await act(async () => {
      await result.current.send("How do I file a complaint?");
    });

    expect(result.current.pendingTicketDraft).toBeNull();
    expect(result.current.messages.at(-1)).toMatchObject({
      role: "model",
      text: "General support reply",
    });
    const requestBody = JSON.parse(
      (fetchSpy.mock.calls[0]?.[1] as RequestInit).body as string,
    ) as {
      prompt: string;
      chatSummary: string;
    };
    expect(requestBody.chatSummary).toContain(
      "User: How do I file a complaint?",
    );
  });

  it("sets API error when supportAgent returns non-ok", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: "support unavailable" }),
    } as Response);
    const { result } = renderHook(() => useGeminiSupport());

    await act(async () => {
      await result.current.send("Need help");
    });
    expect(result.current.error).toBe("support unavailable");
  });

  it("returns null when raising ticket without pending draft", async () => {
    const { result } = renderHook(() => useGeminiSupport());
    await act(async () => {
      const val = await result.current.raisePendingTicket();
      expect(val).toBeNull();
    });
    expect(createTicket).not.toHaveBeenCalled();
  });

  it("sets error when raisePendingTicket fails", async () => {
    createTicket.mockRejectedValue(new Error("ticket failed"));
    const { result } = renderHook(() => useGeminiSupport());
    await act(async () => {
      await result.current.send("My name is missing from voter roll");
    });
    await waitFor(() => {
      expect(result.current.pendingTicketDraft).not.toBeNull();
    });
    await act(async () => {
      await result.current.raisePendingTicket();
    });
    expect(result.current.error).toBe("ticket failed");
  });
});
