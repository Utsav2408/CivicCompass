import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AIChatDrawer } from "@/features/process/components/AIChatDrawer";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));
vi.mock("@/features/process/hooks/useGeminiChat", () => ({
  useGeminiChat: () => ({ messages: [], send: vi.fn(), isLoading: false, error: null }),
}));
vi.mock("@/shared/hooks/useOfflineStatus", () => ({ useOfflineStatus: () => false }));
vi.mock("@/shared/components/AshokaCakraLoader", () => ({ AshokaCakraLoader: () => <div>loader</div> }));

describe("AIChatDrawer mobile layout branch", () => {
  it("applies mobile drawer styles when viewport is narrow", () => {
    Object.defineProperty(window, "innerWidth", { value: 375, configurable: true });
    render(<AIChatDrawer isOpen={true} onClose={vi.fn()} />);
    const dialog = screen.getByRole("dialog", { name: "process.ai.title" });
    expect(dialog).toHaveStyle({ bottom: "0px" });
    expect(dialog).toHaveStyle({ height: "80vh" });
  });
});
