import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AIChatDrawer } from "@/features/process/components/AIChatDrawer";

const send = vi.fn();
let latestRecognition: MockSpeechRecognition | null = null;

const MockSpeechRecognition = vi.fn(() => {
  const recognition = {
    continuous: false,
    interimResults: false,
    lang: "en-IN",
    onresult: () => {},
    onerror: () => {},
    onend: () => {},
    start: vi.fn(),
    stop: vi.fn(),
  };
  latestRecognition = recognition;
  return recognition;
});
type MockSpeechRecognition = ReturnType<typeof MockSpeechRecognition>;

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

describe("AIChatDrawer speech branch", () => {
  it("renders speech button and toggles start/stop", () => {
    (
      window as unknown as { SpeechRecognition: typeof MockSpeechRecognition }
    ).SpeechRecognition = MockSpeechRecognition;
    render(<AIChatDrawer isOpen={true} onClose={vi.fn()} />);
    const mic = screen.getByRole("button", { name: "🎤" });
    fireEvent.click(mic);
    expect(latestRecognition?.start).toHaveBeenCalled();
    const stop = screen.getByRole("button", { name: "⏹️" });
    fireEvent.click(stop);
    expect(latestRecognition?.stop).toHaveBeenCalled();
  });
});
