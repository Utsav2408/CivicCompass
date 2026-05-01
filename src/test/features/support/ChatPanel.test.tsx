import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ChatPanel } from "@/features/support/components/ChatPanel";

const resetConversation = vi.fn();

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k: string, fallback?: string) => fallback ?? k }),
}));
vi.mock("@/features/support/hooks/useGeminiSupport", () => ({
  useGeminiSupport: () => ({
    messages: [],
    send: vi.fn(),
    isLoading: false,
    error: null,
    pendingTicketDraft: null,
    isRaisingTicket: false,
    raisePendingTicket: vi.fn(),
    resetConversation,
  }),
}));
vi.mock("@/features/support/components/ChatInput", () => ({
  ChatInput: () => <div data-testid="chat-input" />,
}));
vi.mock("@/features/support/components/MessageBubble", () => ({
  MessageBubble: () => <div data-testid="bubble" />,
}));
vi.mock("@/shared/components/AshokaCakraLoader", () => ({
  AshokaCakraLoader: () => <div data-testid="loader" />,
}));
vi.mock("@/shared/components/LotusMotif", () => ({
  LotusEmptyState: ({ title }: { title: string }) => <div>{title}</div>,
}));

describe("ChatPanel", () => {
  it("renders empty state and new chat button", () => {
    render(<ChatPanel />);
    expect(screen.getByText(/support assistant ready/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /new chat/i }));
    expect(resetConversation).toHaveBeenCalled();
  });
});
