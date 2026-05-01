import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TicketDetailSheet } from "@/features/support/components/TicketDetailSheet";
import type { Ticket } from "@/shared/types/support";

describe("TicketDetailSheet branches", () => {
  it("renders video element for video media type", () => {
    const ticket = {
      id: "abc",
      userId: "u1",
      category: "general",
      description: "desc",
      status: "resolved",
      createdAt: { seconds: 1700000000, nanoseconds: 0 },
      updatedAt: { seconds: 1700000000, nanoseconds: 0 },
      mediaUrl: "https://example.com/v.mp4",
      mediaType: "video/mp4",
    } as Ticket;

    render(<TicketDetailSheet ticket={ticket} onClose={() => {}} />);
    expect(document.querySelector("video")).toBeInTheDocument();
    expect(screen.getByText("resolved")).toBeInTheDocument();
  });
});
