import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ChatInput } from "@/features/support/components/ChatInput";

const useOfflineStatus = vi.fn(() => false);

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
  useTranslation: () => ({ t: (_k: string, fallback?: string) => fallback ?? _k }),
}));
vi.mock("@/shared/hooks/useOfflineStatus", () => ({
  useOfflineStatus: () => useOfflineStatus(),
}));

describe("ChatInput extra branches", () => {
  it("sends on click button when text exists", async () => {
    const onSend = vi.fn().mockResolvedValue(undefined);
    render(<ChatInput onSend={onSend} disabled={false} />);
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "button-send" } });
    fireEvent.click(screen.getAllByRole("button")[1] as HTMLButtonElement);
    await waitFor(() => { expect(onSend).toHaveBeenCalledWith("button-send"); });
  });

  it("toggles speech recognition start/stop", () => {
    (window as unknown as { SpeechRecognition: typeof MockSpeechRecognition }).SpeechRecognition =
      MockSpeechRecognition;
    const onSend = vi.fn().mockResolvedValue(undefined);
    render(<ChatInput onSend={onSend} disabled={false} />);

    const micButton = screen.getAllByRole("button")[0] as HTMLButtonElement;
    fireEvent.click(micButton);
    expect(latestRecognition?.start).toHaveBeenCalled();

    // second click triggers stop branch
    fireEvent.click(micButton);
    expect(latestRecognition?.stop).toHaveBeenCalled();
  });
});
