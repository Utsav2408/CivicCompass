import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AIChatDrawer } from "@/features/process/components/AIChatDrawer";

const onClose = vi.fn();
const send = vi.fn();

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));
vi.mock("@/features/process/hooks/useGeminiChat", () => ({
  useGeminiChat: () => ({
    messages: [{ role: "model", text: "hello", source: "src" }],
    send,
    isLoading: false,
    error: "chat failed",
  }),
}));
vi.mock("@/shared/hooks/useOfflineStatus", () => ({
  useOfflineStatus: () => true,
}));
vi.mock("@/shared/components/AshokaCakraLoader", () => ({
  AshokaCakraLoader: () => <div>loader</div>,
}));

describe("AIChatDrawer extra branches", () => {
  it("closes on backdrop click and shows offline lock state", () => {
    render(<AIChatDrawer isOpen={true} onClose={onClose} />);
    expect(screen.getByText("chat failed")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Close chat" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "🔒" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Close chat" }));
    expect(onClose).toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });
});
