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
  MediaUpload: ({ onUploadComplete }: { onUploadComplete: (url: string, type: string) => void }) => (
    <button onClick={() => { onUploadComplete("https://img", "image/png"); }}>mock upload</button>
  ),
}));

describe("TicketCreationDrawer media summary", () => {
  it("shows media attached indicator on confirm step", async () => {
    createTicket.mockResolvedValue("ticket-2");
    render(<TicketCreationDrawer isOpen={true} onClose={vi.fn()} />);

    fireEvent.change(screen.getByLabelText(/what's the issue/i), {
      target: { value: "Street lights issue" },
    });
    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    await waitFor(() => { expect(createTicket).toHaveBeenCalled(); });
    fireEvent.click(screen.getByRole("button", { name: /mock upload/i }));
    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    expect(screen.getByText(/media attached successfully/i)).toBeInTheDocument();
  });
});
