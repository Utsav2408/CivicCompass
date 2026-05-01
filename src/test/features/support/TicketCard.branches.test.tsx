import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TicketCard } from "@/features/support/components/TicketCard";
import type { Ticket } from "@/shared/types/support";

function makeTicket(status: string, mediaUrl?: string): Ticket {
  return {
    id: "t-12345678",
    userId: "u1",
    category: "voter-roll",
    description: "Issue",
    status,
    mediaUrl,
    createdAt: { seconds: 1700000000, nanoseconds: 0 },
    updatedAt: { seconds: 1700000000, nanoseconds: 0 },
  } as Ticket;
}

describe("TicketCard status branches", () => {
  it("renders resolved and closed labels", () => {
    const { rerender } = render(<TicketCard ticket={makeTicket("resolved")} />);
    expect(screen.getByText("Resolved")).toBeInTheDocument();
    rerender(<TicketCard ticket={makeTicket("closed")} />);
    expect(screen.getByText("Closed")).toBeInTheDocument();
  });

  it("renders default status label and media attachment indicator", () => {
    render(<TicketCard ticket={makeTicket("pending-review", "https://img")} />);
    expect(screen.getByText("pending-review")).toBeInTheDocument();
    expect(screen.getByText(/media attached/i)).toBeInTheDocument();
  });
});
