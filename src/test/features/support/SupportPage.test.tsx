import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import { SupportPage } from "@/features/support/SupportPage";

const { offlineStatusMock } = vi.hoisted(() => ({
  offlineStatusMock: vi.fn(() => false),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback ?? key,
  }),
}));

vi.mock("@/shared/hooks/useOfflineStatus", () => ({
  useOfflineStatus: offlineStatusMock,
}));

vi.mock("@/shared/components/ScreenErrorBoundary", () => ({
  ScreenErrorBoundary: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock("@/features/support/components/ChatPanel", () => ({
  ChatPanel: () => <div data-testid="chat-panel">Chat Panel</div>,
}));

vi.mock("@/features/support/components/MyTicketsPanel", () => ({
  MyTicketsPanel: () => <div data-testid="tickets-panel">Tickets Panel</div>,
}));
vi.mock("@/shared/components/BottomNav", () => ({
  BottomNav: () => <div data-testid="bottom-nav">Bottom Nav</div>,
}));

describe("SupportPage", () => {
  it("shows chat tab by default and switches to tickets tab", () => {
    offlineStatusMock.mockReturnValue(false);
    render(
      <MemoryRouter>
        <SupportPage />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("chat-panel")).toBeInTheDocument();
    expect(screen.queryByTestId("tickets-panel")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /my tickets/i }));
    expect(screen.getByTestId("tickets-panel")).toBeInTheDocument();
  });

  it("shows offline banner text when offline", () => {
    offlineStatusMock.mockReturnValue(true);
    render(
      <MemoryRouter>
        <SupportPage />
      </MemoryRouter>,
    );
    expect(
      screen.getByText(/internet required for ai assistant/i),
    ).toBeInTheDocument();
  });
});
