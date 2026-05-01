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

describe("useGeminiSupport", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates pending ticket draft for voter roll issue", async () => {
    const { result } = renderHook(() => useGeminiSupport());

    await act(async () => {
      await result.current.send("My name is missing from voter roll");
    });

    expect(result.current.pendingTicketDraft).toMatchObject({
      category: "voter-roll",
    });
    expect(result.current.messages.at(-1)?.role).toBe("model");
  });

  it("raises pending ticket and stores ticket id", async () => {
    createTicket.mockResolvedValue("ticket-123456");
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

    await waitFor(() => {
      expect(result.current.lastTicketId).toBe("ticket-123456");
    });
  });
});
