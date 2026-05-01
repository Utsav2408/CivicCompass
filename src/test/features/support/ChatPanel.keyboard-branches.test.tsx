import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ChatPanel } from "@/features/support/components/ChatPanel";

const { resetConversationMock } = vi.hoisted(() => ({
  resetConversationMock: vi.fn(),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (_k: string, fallback?: string) => fallback ?? _k,
  }),
}));
vi.mock("@/features/support/hooks/useGeminiSupport", () => ({
  useGeminiSupport: () => ({
    messages: [{ role: "model", text: "hello" }],
    send: vi.fn(),
    isLoading: false,
    error: null,
    pendingTicketDraft: null,
    isRaisingTicket: false,
    raisePendingTicket: vi.fn(),
    resetConversation: resetConversationMock,
  }),
}));
vi.mock("@/features/support/components/ChatInput", () => ({
  ChatInput: () => <div>input</div>,
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

describe("ChatPanel conversation keyboard branches", () => {
  beforeEach(() => {
    resetConversationMock.mockClear();
  });

  it("handles Space key activation on New Chat button", () => {
    render(<ChatPanel />);
    const newChatButton = screen.getByRole("button", { name: /new chat/i });
    fireEvent.keyDown(newChatButton, { key: " " });
    fireEvent.click(newChatButton);
    expect(resetConversationMock).toHaveBeenCalledTimes(1);
    expect(screen.getByText("hello")).toBeInTheDocument();
  });

  it("ignores unrelated keydown on New Chat button", () => {
    render(<ChatPanel />);
    const newChatButton = screen.getByRole("button", { name: /new chat/i });
    fireEvent.keyDown(newChatButton, { key: "Escape" });
    expect(resetConversationMock).not.toHaveBeenCalled();
    expect(newChatButton).toBeInTheDocument();
  });
});
