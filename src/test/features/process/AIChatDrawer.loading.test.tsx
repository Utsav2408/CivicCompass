import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AIChatDrawer } from "@/features/process/components/AIChatDrawer";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));
vi.mock("@/features/process/hooks/useGeminiChat", () => ({
  useGeminiChat: () => ({
    messages: [{ role: "model", text: "m1", source: "src" }],
    send: vi.fn(),
    isLoading: true,
    error: null,
  }),
}));
vi.mock("@/shared/hooks/useOfflineStatus", () => ({
  useOfflineStatus: () => false,
}));
vi.mock("@/shared/components/AshokaCakraLoader", () => ({
  AshokaCakraLoader: () => <div>loader</div>,
}));

describe("AIChatDrawer loading branch", () => {
  it("renders thinking indicator while loading", () => {
    render(<AIChatDrawer isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByText("process.ai.thinking")).toBeInTheDocument();
  });
});
