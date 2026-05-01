import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TicketCard } from "@/features/support/components/TicketCard";
import type { Ticket } from "@/shared/types/support";

const baseTicket: Ticket = {
  id: "abc12345",
  userId: "u1",
  category: "technical-issue",
  description: "Map is not loading",
  status: "open",
  createdAt: { seconds: 1700000000, nanoseconds: 0 },
  updatedAt: { seconds: 1700000000, nanoseconds: 0 },
} as Ticket;

describe("TicketCard", () => {
  it("renders ticket info and status label", () => {
    render(<TicketCard ticket={baseTicket} />);
    expect(screen.getByText("#ABC12345")).toBeInTheDocument();
    expect(screen.getByText("technical issue")).toBeInTheDocument();
    expect(screen.getByText("Open")).toBeInTheDocument();
  });

  it("applies hover style transitions", () => {
    const { container } = render(<TicketCard ticket={baseTicket} />);
    const card = container.firstElementChild as HTMLElement;
    fireEvent.mouseEnter(card);
    expect(card.style.transform).toBe("translateY(-2px)");
    fireEvent.mouseLeave(card);
    expect(card.style.transform).toBe("translateY(0)");
  });
});
