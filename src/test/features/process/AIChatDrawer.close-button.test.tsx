import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AIChatDrawer } from "@/features/process/components/AIChatDrawer";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));
vi.mock("@/features/process/hooks/useGeminiChat", () => ({
  useGeminiChat: () => ({
    messages: [],
    send: vi.fn(),
    isLoading: false,
    error: null,
  }),
}));
vi.mock("@/shared/hooks/useOfflineStatus", () => ({
  useOfflineStatus: () => false,
}));
vi.mock("@/shared/components/AshokaCakraLoader", () => ({
  AshokaCakraLoader: () => <div>loader</div>,
}));

describe("AIChatDrawer header close", () => {
  it("closes when header close button is clicked", () => {
    const onClose = vi.fn();
    render(<AIChatDrawer isOpen={true} onClose={onClose} />);
    fireEvent.click(
      screen.getByRole("button", { name: "process.ai.close_label" }),
    );
    expect(onClose).toHaveBeenCalled();
  });
});
