import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ChatPanel } from "@/features/support/components/ChatPanel";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (_k: string, fallback?: string) => fallback ?? _k }),
}));
vi.mock("@/features/support/hooks/useGeminiSupport", () => ({
  useGeminiSupport: () => ({
    messages: [{ role: "model", text: "hello" }],
    send: vi.fn(),
    isLoading: false,
    error: null,
    pendingTicketDraft: { description: "d", category: "voter-roll" },
    isRaisingTicket: true,
    raisePendingTicket: vi.fn(),
    resetConversation: vi.fn(),
  }),
}));
vi.mock("@/features/support/components/ChatInput", () => ({ ChatInput: () => <div>input</div> }));
vi.mock("@/features/support/components/MessageBubble", () => ({
  MessageBubble: ({ message }: { message: { text: string } }) => <div>{message.text}</div>,
}));
vi.mock("@/shared/components/AshokaCakraLoader", () => ({ AshokaCakraLoader: () => <div>loader</div> }));
vi.mock("@/shared/components/LotusMotif", () => ({ LotusEmptyState: () => <div>empty</div> }));

describe("ChatPanel raising state", () => {
  it("renders disabled raising button label", () => {
    render(<ChatPanel />);
    expect(screen.getByRole("button", { name: /raising/i })).toBeDisabled();
  });
});
