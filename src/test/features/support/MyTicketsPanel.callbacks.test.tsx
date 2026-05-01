import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { MyTicketsPanel } from "@/features/support/components/MyTicketsPanel";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (_k: string, fallback?: string) => fallback ?? _k }),
}));
vi.mock("@/features/login/useAuth", () => ({
  useAuth: () => ({ user: { uid: "u1" } }),
}));
vi.mock("@/features/support/hooks/useTickets", () => ({
  useTickets: () => ({
    tickets: [{ id: "t1" }],
    isLoading: false,
    error: null,
    filter: "all",
    setFilter: vi.fn(),
  }),
}));
vi.mock("@/features/support/components/TicketList", () => ({
  TicketList: ({ onTicketClick }: { onTicketClick: (t: { id: string }) => void }) => (
    <button onClick={() => { onTicketClick({ id: "t1" }); }}>open ticket</button>
  ),
}));
vi.mock("@/features/support/components/TicketDetailSheet", () => ({
  TicketDetailSheet: ({
    ticket,
    onClose,
  }: {
    ticket: { id: string } | null;
    onClose: () => void;
  }) => (ticket ? <button onClick={onClose}>close detail</button> : null),
}));
vi.mock("@/features/support/components/TicketCreationDrawer", () => ({
  TicketCreationDrawer: ({
    isOpen,
    onClose,
  }: {
    isOpen: boolean;
    onClose: () => void;
  }) => (isOpen ? <button onClick={onClose}>close drawer</button> : null),
}));
vi.mock("@/shared/components/AshokaCakraLoader", () => ({
  AshokaCakraLoader: () => <div>loader</div>,
}));
vi.mock("@/shared/components/ScreenStates", () => ({
  ScreenErrorState: () => null,
}));

describe("MyTicketsPanel callbacks", () => {
  it("closes detail sheet and creation drawer", () => {
    render(<MyTicketsPanel />);
    fireEvent.click(screen.getByRole("button", { name: /new ticket/i }));
    fireEvent.click(screen.getByRole("button", { name: /open ticket/i }));
    expect(screen.getByRole("button", { name: /close drawer/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /close detail/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /close detail/i }));
    expect(screen.queryByRole("button", { name: /close detail/i })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /close drawer/i }));
    expect(screen.queryByRole("button", { name: /close drawer/i })).not.toBeInTheDocument();
  });
});
