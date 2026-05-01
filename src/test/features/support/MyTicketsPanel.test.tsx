import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { MyTicketsPanel } from "@/features/support/components/MyTicketsPanel";

const setFilter = vi.fn();

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (k: string, fallback?: string) => fallback ?? k,
  }),
}));
vi.mock("@/features/login/useAuth", () => ({
  useAuth: () => ({ user: { uid: "u1" } }),
}));
vi.mock("@/features/support/hooks/useTickets", () => ({
  useTickets: () => ({
    tickets: [],
    isLoading: false,
    error: null,
    filter: "all",
    setFilter,
  }),
}));
vi.mock("@/features/support/components/TicketList", () => ({
  TicketList: ({
    onFilterChange,
    onTicketClick,
  }: {
    onFilterChange: (f: "all" | "open" | "resolved" | "closed") => void;
    onTicketClick: (t: { id: string }) => void;
  }) => (
    <div>
      <button
        onClick={() => {
          onFilterChange("open");
        }}
      >
        Filter Open
      </button>
      <button
        onClick={() => {
          onTicketClick({ id: "t1" });
        }}
      >
        Select Ticket
      </button>
    </div>
  ),
}));
vi.mock("@/features/support/components/TicketDetailSheet", () => ({
  TicketDetailSheet: ({ ticket }: { ticket: { id: string } | null }) =>
    ticket ? <div data-testid="ticket-sheet">{ticket.id}</div> : null,
}));
vi.mock("@/features/support/components/TicketCreationDrawer", () => ({
  TicketCreationDrawer: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="create-drawer">Drawer</div> : null,
}));
vi.mock("@/shared/components/AshokaCakraLoader", () => ({
  AshokaCakraLoader: () => <div data-testid="loader" />,
}));
vi.mock("@/shared/components/ScreenStates", () => ({
  ScreenErrorState: ({ message }: { message: string }) => <div>{message}</div>,
}));

describe("MyTicketsPanel", () => {
  it("opens creation drawer and reacts to ticket list callbacks", () => {
    render(<MyTicketsPanel />);

    fireEvent.click(screen.getByRole("button", { name: /\+ new ticket/i }));
    expect(screen.getByTestId("create-drawer")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Filter Open" }));
    expect(setFilter).toHaveBeenCalledWith("open");

    fireEvent.click(screen.getByRole("button", { name: "Select Ticket" }));
    expect(screen.getByTestId("ticket-sheet")).toHaveTextContent("t1");
  });
});
