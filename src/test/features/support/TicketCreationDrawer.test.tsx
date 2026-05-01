import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TicketCreationDrawer } from "@/features/support/components/TicketCreationDrawer";

const createTicket = vi.fn();

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k: string, fallback?: string) => fallback ?? k }),
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
  MediaUpload: ({
    onUploadComplete,
  }: {
    onUploadComplete: (url: string, type: string) => void;
  }) => (
    <button onClick={() => { onUploadComplete("https://img", "image/png"); }}>Upload</button>
  ),
}));

describe("TicketCreationDrawer", () => {
  it("returns null when closed", () => {
    const { container } = render(<TicketCreationDrawer isOpen={false} onClose={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("goes through steps to confirmation", async () => {
    createTicket.mockResolvedValue("ticket-1");
    render(<TicketCreationDrawer isOpen={true} onClose={vi.fn()} />);

    fireEvent.change(screen.getByLabelText(/what's the issue/i), {
      target: { value: "Water leakage" },
    });
    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    await waitFor(() => { expect(createTicket).toHaveBeenCalled(); });

    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    expect(screen.getByText(/ai summary/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /raise ticket/i })).toBeInTheDocument();
  });
});
