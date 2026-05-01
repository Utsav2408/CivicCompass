import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TicketList } from "@/features/support/components/TicketList";
import type { Ticket } from "@/shared/types/support";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k: string, fallback?: string) => fallback ?? k }),
}));
vi.mock("@/shared/components/LotusMotif", () => ({
  LotusEmptyState: ({ title }: { title: string }) => <div>{title}</div>,
}));
vi.mock("@/features/support/components/TicketCard", () => ({
  TicketCard: ({ ticket }: { ticket: { id: string } }) => <div>{ticket.id}</div>,
}));

const tickets: Ticket[] = [
  {
    id: "aaa111",
    userId: "u1",
    category: "technical",
    description: "desc",
    status: "open",
    createdAt: { seconds: 1, nanoseconds: 0 },
    updatedAt: { seconds: 1, nanoseconds: 0 },
  },
] as Ticket[];

describe("TicketList", () => {
  it("filters and invokes callbacks", () => {
    const onTicketClick = vi.fn();
    const onFilterChange = vi.fn();

    render(
      <TicketList
        tickets={tickets}
        activeFilter="all"
        onFilterChange={onFilterChange}
        onTicketClick={onTicketClick}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open" }));
    expect(onFilterChange).toHaveBeenCalledWith("open");

    fireEvent.click(screen.getByRole("button", { name: /aaa111/i }));
    expect(onTicketClick).toHaveBeenCalled();
  });
});
