import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { EmergencyButton } from "@/features/support/components/EmergencyButton";
import { useEmergency } from "@/features/support/hooks/useEmergency";

vi.mock("@/features/support/hooks/useEmergency", () => ({
  useEmergency: vi.fn(),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback ?? key,
  }),
}));

describe("EmergencyButton", () => {
  const activate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useEmergency).mockReturnValue({
      activate,
      cancel: vi.fn(),
      isActive: false,
      nearestStation: null,
      eta: null,
    });
  });

  it("renders and calls activate on click", () => {
    render(<EmergencyButton />);
    const button = screen.getByRole("button", { name: /sos emergency/i });
    fireEvent.click(button);
    expect(activate).toHaveBeenCalledOnce();
  });

  it("handles hover enter and leave styles", () => {
    render(<EmergencyButton />);
    const button = screen.getByRole("button", { name: /sos emergency/i });

    fireEvent.mouseEnter(button);
    expect(button).toHaveStyle({ transform: "scale(1.05)" });

    fireEvent.mouseLeave(button);
    expect(button).toHaveStyle({ transform: "scale(1)" });
  });

  it("is hidden when emergency is active", () => {
    vi.mocked(useEmergency).mockReturnValue({
      activate,
      cancel: vi.fn(),
      isActive: true,
      nearestStation: null,
      eta: null,
    });

    render(<EmergencyButton />);
    expect(screen.queryByRole("button", { name: /sos emergency/i })).toBeNull();
  });
});
