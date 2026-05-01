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

describe("AIChatDrawer escape branch", () => {
  it("closes when Escape pressed on backdrop", () => {
    const onClose = vi.fn();
    render(<AIChatDrawer isOpen={true} onClose={onClose} />);
    const backdrop = screen.getByRole("button", { name: /close chat/i });
    fireEvent.keyDown(backdrop, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });
});
