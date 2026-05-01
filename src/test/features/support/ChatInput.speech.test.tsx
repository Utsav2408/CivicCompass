import { fireEvent, render, screen } from "@testing-library/react";
import { act } from "react";
import { describe, expect, it, vi } from "vitest";

import { ChatInput } from "@/features/support/components/ChatInput";

let latestRecognition: MockSpeechRecognition | null = null;
const MockSpeechRecognition = vi.fn(() => {
  const recognition = {
    continuous: false,
    interimResults: false,
    lang: "",
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
  useTranslation: () => ({
    t: (_k: string, fallback?: string) => fallback ?? _k,
  }),
}));
vi.mock("@/shared/hooks/useOfflineStatus", () => ({
  useOfflineStatus: () => false,
}));

describe("ChatInput speech handlers", () => {
  it("updates state via speech result and handles error/end", () => {
    (
      window as unknown as { SpeechRecognition: typeof MockSpeechRecognition }
    ).SpeechRecognition = MockSpeechRecognition;
    render(
      <ChatInput
        onSend={vi.fn().mockResolvedValue(undefined)}
        disabled={false}
      />,
    );
    fireEvent.click(screen.getAllByRole("button")[0] as HTMLButtonElement);
    const speechResult = { 0: { transcript: "spoken text" } };
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
    expect(screen.getByRole("textbox")).toHaveValue("spoken text");
    act(() => {
      latestRecognition?.onerror();
      latestRecognition?.onend();
    });
    expect(screen.getAllByRole("button")[0]).toBeInTheDocument();
  });
});
