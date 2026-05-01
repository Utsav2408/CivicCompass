import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AIChatDrawer } from "@/features/process/components/AIChatDrawer";

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

describe("AIChatDrawer speech handlers", () => {
  it("updates transcript and handles recognition error/end", () => {
    (
      window as unknown as { SpeechRecognition: typeof MockSpeechRecognition }
    ).SpeechRecognition = MockSpeechRecognition;
    render(<AIChatDrawer isOpen={true} onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "🎤" }));
    const speechResult = { 0: { transcript: "spoken prompt" } };
    const results = {
      0: speechResult,
      length: 1,
      [Symbol.iterator]: function* iterator() {
        yield speechResult;
      },
    };
    act(() => {
      if (!latestRecognition) return;
      (latestRecognition.onresult as (event: { results: unknown }) => void)({
        results,
      });
    });
    expect(screen.getByRole("textbox")).toHaveValue("spoken prompt");
    act(() => {
      latestRecognition?.onerror();
      latestRecognition?.onend();
    });
    expect(screen.getByRole("button", { name: "🎤" })).toBeInTheDocument();
  });
});
