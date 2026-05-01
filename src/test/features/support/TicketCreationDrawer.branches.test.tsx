import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TicketCreationDrawer } from "@/features/support/components/TicketCreationDrawer";

const createTicket = vi.fn();

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (_k: string, fallback?: string) => fallback ?? _k }),
}));
vi.mock("@/features/login/useAuth", () => ({
  useAuth: () => ({ user: { uid: "u1" } }),
}));
vi.mock("@/features/support/hooks/useTickets", () => ({
  useTickets: () => ({ createTicket }),
}));
vi.mock("@/shared/components/AshokaCakraLoader", () => ({
  AshokaCakraLoader: () => <div data-testid="loader" />,
}));
vi.mock("@/features/support/components/MediaUpload", () => ({
  MediaUpload: () => <div>upload</div>,
}));

describe("TicketCreationDrawer branches", () => {
  it("goes back from step 2 to step 1", async () => {
    createTicket.mockResolvedValue("t1");
    render(<TicketCreationDrawer isOpen={true} onClose={vi.fn()} />);

    fireEvent.change(screen.getByLabelText(/what's the issue/i), {
      target: { value: "Issue" },
    });
    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    await waitFor(() => { expect(createTicket).toHaveBeenCalled(); });
    fireEvent.click(screen.getByRole("button", { name: /back/i }));
    expect(screen.getByLabelText(/what's the issue/i)).toBeInTheDocument();
  });
});
