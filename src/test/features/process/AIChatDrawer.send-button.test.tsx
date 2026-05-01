import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AIChatDrawer } from "@/features/process/components/AIChatDrawer";

const send = vi.fn().mockResolvedValue(undefined);

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));
vi.mock("@/features/process/hooks/useGeminiChat", () => ({
  useGeminiChat: () => ({ messages: [], send, isLoading: false, error: null }),
}));
vi.mock("@/shared/hooks/useOfflineStatus", () => ({
  useOfflineStatus: () => false,
}));
vi.mock("@/shared/components/AshokaCakraLoader", () => ({
  AshokaCakraLoader: () => <div>loader</div>,
}));

describe("AIChatDrawer send button branch", () => {
  it("sends message via button click", () => {
    render(<AIChatDrawer isOpen={true} onClose={vi.fn()} />);
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "need help" },
    });
    fireEvent.click(screen.getByRole("button", { name: /process.ai.send/i }));
    expect(send).toHaveBeenCalledWith("need help");
  });
});
