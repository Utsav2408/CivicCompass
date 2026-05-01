import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { OfflineBanner } from "@/shared/components/OfflineBanner";

vi.mock("@shared/hooks/useOfflineStatus", () => ({
  useOfflineStatus: () => true,
}));
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (_k: string, fallback?: string) => fallback ?? _k,
  }),
}));

describe("OfflineBanner retry", () => {
  it("reloads page when retry clicked", () => {
    const reload = vi.fn();
    Object.defineProperty(window, "location", {
      value: { reload },
      configurable: true,
    });
    render(<OfflineBanner />);
    fireEvent.click(screen.getByRole("button", { name: /retry/i }));
    expect(reload).toHaveBeenCalled();
  });
});
