import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AIChatDrawer } from "@/features/process/components/AIChatDrawer";

const mockSend = vi.fn();

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));
vi.mock("@/shared/hooks/useOfflineStatus", () => ({
  useOfflineStatus: vi.fn(() => false),
}));
vi.mock("@/features/process/hooks/useGeminiChat", () => ({
  useGeminiChat: () => ({
    messages: [],
    send: mockSend,
    isLoading: false,
    error: null,
  }),
}));
vi.mock("@/shared/components/AshokaCakraLoader", () => ({
  AshokaCakraLoader: () => <div data-testid="loader" />,
}));

describe("AIChatDrawer", () => {
  it("returns null when closed", () => {
    const { container } = render(
      <AIChatDrawer isOpen={false} onClose={vi.fn()} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders and sends message on enter", () => {
    render(<AIChatDrawer isOpen={true} onClose={vi.fn()} />);
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "hello" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(mockSend).toHaveBeenCalledWith("hello");
  });
});
