import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AIChatDrawer } from "@/features/process/components/AIChatDrawer";

const { useOfflineStatusMock, useGeminiChatMock } = vi.hoisted(() => ({
  useOfflineStatusMock: vi.fn(),
  useGeminiChatMock: vi.fn(),
}));

class MockSpeechRecognition {
  continuous = false;
  interimResults = false;
  lang = "en-IN";
  onresult = () => {};
  onerror = () => {};
  onend = () => {};
  start = vi.fn();
  stop = vi.fn();
}

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k: string, fallback?: string) => fallback ?? k }),
}));
vi.mock("@/shared/hooks/useOfflineStatus", () => ({
  useOfflineStatus: useOfflineStatusMock,
}));
vi.mock("@/features/process/hooks/useGeminiChat", () => ({
  useGeminiChat: useGeminiChatMock,
}));
vi.mock("@/shared/components/AshokaCakraLoader", () => ({ AshokaCakraLoader: () => <div>loader</div> }));

describe("AIChatDrawer remaining branches", () => {
  it("renders user/model messages and uses default source fallback", () => {
    useOfflineStatusMock.mockReturnValue(false);
    useGeminiChatMock.mockReturnValue({
      messages: [
        { role: "user", text: "u1" },
        { role: "model", text: "m1" },
      ],
      send: vi.fn(),
      isLoading: false,
      error: null,
    });
    render(<AIChatDrawer isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByText("u1")).toBeInTheDocument();
    expect(screen.getByText("m1")).toBeInTheDocument();
    expect(screen.getByText(/Source: Gemini 2.5 Flash/i)).toBeInTheDocument();
  });

  it("disables speech button with offline cursor style when speech is supported", () => {
    (window as unknown as { SpeechRecognition: typeof MockSpeechRecognition }).SpeechRecognition =
      MockSpeechRecognition;
    useOfflineStatusMock.mockReturnValue(true);
    useGeminiChatMock.mockReturnValue({
      messages: [],
      send: vi.fn(),
      isLoading: false,
      error: null,
    });
    render(<AIChatDrawer isOpen={true} onClose={vi.fn()} />);
    const speechBtn = screen.getByRole("button", { name: "🎤" });
    expect(speechBtn).toBeDisabled();
    expect(speechBtn).toHaveStyle({ cursor: "not-allowed" });
  });

  it("does not send empty input on Enter", () => {
    const send = vi.fn();
    useOfflineStatusMock.mockReturnValue(false);
    useGeminiChatMock.mockReturnValue({
      messages: [],
      send,
      isLoading: false,
      error: null,
    });
    render(<AIChatDrawer isOpen={true} onClose={vi.fn()} />);
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" });
    expect(send).not.toHaveBeenCalled();
  });
});
