import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TicketDetailSheet } from "@/features/support/components/TicketDetailSheet";
import type { Ticket } from "@/shared/types/support";

const ticket: Ticket = {
  id: "abc123",
  userId: "u1",
  category: "safety",
  description: "Streetlight not working",
  status: "open",
  createdAt: { seconds: 1700000000, nanoseconds: 0 },
  updatedAt: { seconds: 1700000000, nanoseconds: 0 },
  mediaUrl: "https://example.com/image.png",
  mediaType: "image/png",
} as Ticket;

describe("TicketDetailSheet", () => {
  it("returns null when ticket is null", () => {
    const { container } = render(
      <TicketDetailSheet ticket={null} onClose={vi.fn()} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders details and closes via close button", () => {
    const onClose = vi.fn();
    render(<TicketDetailSheet ticket={ticket} onClose={onClose} />);
    expect(screen.getByText(/streetlight not working/i)).toBeInTheDocument();
    expect(screen.getByText(/ai case summary/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "✕" }));
    expect(onClose).toHaveBeenCalled();
  });
});
