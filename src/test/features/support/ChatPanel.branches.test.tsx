import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ChatPanel } from "@/features/support/components/ChatPanel";

const raisePendingTicket = vi.fn();

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (_k: string, fallback?: string) => fallback ?? _k,
  }),
}));
vi.mock("@/features/support/hooks/useGeminiSupport", () => ({
  useGeminiSupport: () => ({
    messages: [{ role: "model", text: "hello" }],
    send: vi.fn(),
    isLoading: true,
    error: "chat error",
    pendingTicketDraft: { description: "d", category: "voter-roll" },
    isRaisingTicket: false,
    raisePendingTicket,
    resetConversation: vi.fn(),
  }),
}));
vi.mock("@/features/support/components/ChatInput", () => ({
  ChatInput: () => <div>chat-input</div>,
}));
vi.mock("@/features/support/components/MessageBubble", () => ({
  MessageBubble: ({ message }: { message: { text: string } }) => (
    <div>{message.text}</div>
  ),
}));
vi.mock("@/shared/components/AshokaCakraLoader", () => ({
  AshokaCakraLoader: () => <div>loader</div>,
}));
vi.mock("@/shared/components/LotusMotif", () => ({
  LotusEmptyState: () => <div>empty</div>,
}));

describe("ChatPanel extra branches", () => {
  it("renders loading/error/pending ticket CTA and raises ticket", () => {
    render(<ChatPanel />);
    expect(screen.getByText("loader")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("chat error");
    fireEvent.click(screen.getByRole("button", { name: /raise ticket/i }));
    expect(raisePendingTicket).toHaveBeenCalled();
  });
});
