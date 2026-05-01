import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { MyTicketsPanel } from "@/features/support/components/MyTicketsPanel";

const { useTicketsMock } = vi.hoisted(() => ({
  useTicketsMock: vi.fn(),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (_k: string, fallback?: string) => fallback ?? _k,
  }),
}));
vi.mock("@/features/login/useAuth", () => ({
  useAuth: () => ({ user: { uid: "u1" } }),
}));
vi.mock("@/features/support/hooks/useTickets", () => ({
  useTickets: useTicketsMock,
}));
vi.mock("@/features/support/components/TicketList", () => ({
  TicketList: () => <div>ticket-list</div>,
}));
vi.mock("@/features/support/components/TicketDetailSheet", () => ({
  TicketDetailSheet: () => null,
}));
vi.mock("@/features/support/components/TicketCreationDrawer", () => ({
  TicketCreationDrawer: () => null,
}));
vi.mock("@/shared/components/AshokaCakraLoader", () => ({
  AshokaCakraLoader: () => <div data-testid="loader" />,
}));
vi.mock("@/shared/components/ScreenStates", () => ({
  ScreenErrorState: ({ message }: { message: string }) => <div>{message}</div>,
}));

describe("MyTicketsPanel branches", () => {
  it("shows loader while tickets are loading", () => {
    useTicketsMock.mockReturnValue({
      tickets: [],
      isLoading: true,
      error: null,
      filter: "all",
      setFilter: vi.fn(),
    });
    render(<MyTicketsPanel />);
    expect(screen.getByTestId("loader")).toBeInTheDocument();
  });

  it("shows error state when hook returns error", () => {
    useTicketsMock.mockReturnValue({
      tickets: [],
      isLoading: false,
      error: "boom",
      filter: "all",
      setFilter: vi.fn(),
    });
    render(<MyTicketsPanel />);
    expect(screen.getByText("boom")).toBeInTheDocument();
  });
});
