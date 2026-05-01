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

describe("TicketCreationDrawer error branches", () => {
  it("stays on step 1 when initial ticket creation fails", async () => {
    createTicket.mockRejectedValue(new Error("create failed"));
    render(<TicketCreationDrawer isOpen={true} onClose={vi.fn()} />);
    fireEvent.change(screen.getByLabelText(/what's the issue/i), {
      target: { value: "Issue content" },
    });
    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    await waitFor(() => { expect(createTicket).toHaveBeenCalled(); });
    expect(screen.getByLabelText(/what's the issue/i)).toBeInTheDocument();
  });
});
