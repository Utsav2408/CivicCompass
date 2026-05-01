import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TicketList } from "@/features/support/components/TicketList";
import type { Ticket } from "@/shared/types/support";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (_k: string, fallback?: string) => fallback ?? _k }),
}));
vi.mock("@/shared/components/LotusMotif", () => ({
  LotusEmptyState: ({ title }: { title: string }) => <div>{title}</div>,
}));
vi.mock("@/features/support/components/TicketCard", () => ({
  TicketCard: ({ ticket }: { ticket: { id: string } }) => <div>{ticket.id}</div>,
}));

const ticket: Ticket = {
  id: "id-1",
  userId: "u1",
  category: "general",
  description: "d",
  status: "open",
  createdAt: { seconds: 1, nanoseconds: 0 },
  updatedAt: { seconds: 1, nanoseconds: 0 },
} as Ticket;

describe("TicketList branch coverage", () => {
  it("renders empty state when filtered tickets are empty", () => {
    render(
      <TicketList
        tickets={[ticket]}
        activeFilter="resolved"
        onFilterChange={vi.fn()}
        onTicketClick={vi.fn()}
      />,
    );
    expect(screen.getByText("No Tickets Found")).toBeInTheDocument();
  });

  it("supports keyboard ticket selection with Enter", () => {
    const onTicketClick = vi.fn();
    render(
      <TicketList
        tickets={[ticket]}
        activeFilter="all"
        onFilterChange={vi.fn()}
        onTicketClick={onTicketClick}
      />,
    );
    const cardButton = screen.getByRole("button", { name: /id-1/i });
    fireEvent.keyDown(cardButton, { key: "Enter" });
    expect(onTicketClick).toHaveBeenCalledWith(ticket);
  });
});
