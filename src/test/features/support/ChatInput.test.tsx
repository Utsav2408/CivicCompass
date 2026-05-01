import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ChatInput } from "@/features/support/components/ChatInput";

const mockUseOfflineStatus = vi.fn(() => false);

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k: string, fallback?: string) => fallback ?? k }),
}));
vi.mock("@/shared/hooks/useOfflineStatus", () => ({
  useOfflineStatus: () => mockUseOfflineStatus(),
}));

describe("ChatInput", () => {
  it("sends message on enter and clears input", async () => {
    const onSend = vi.fn().mockResolvedValue(undefined);
    render(<ChatInput onSend={onSend} disabled={false} />);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "Need help" } });
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() => { expect(onSend).toHaveBeenCalledWith("Need help"); });
    expect((input as HTMLInputElement).value).toBe("");
  });

  it("disables interaction when offline", () => {
    mockUseOfflineStatus.mockReturnValue(true);
    const onSend = vi.fn().mockResolvedValue(undefined);
    render(<ChatInput onSend={onSend} disabled={false} />);

    expect(screen.getByRole("textbox")).toBeDisabled();
    const buttons = screen.getAllByRole("button");
    expect(buttons[0]).toBeDisabled();
  });
});
