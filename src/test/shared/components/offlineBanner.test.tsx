import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import { OfflineBanner } from "@/shared/components/OfflineBanner";
import { useOfflineStatus } from "@/shared/hooks/useOfflineStatus";

// Mocks
vi.mock("@shared/hooks/useOfflineStatus");
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe("OfflineBanner", () => {
  it("is hidden when online", () => {
    vi.mocked(useOfflineStatus).mockReturnValue(false);
    render(<OfflineBanner />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows when offline", () => {
    vi.mocked(useOfflineStatus).mockReturnValue(true);
    render(<OfflineBanner />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("common.offline_notice")).toBeInTheDocument();
  });
});
