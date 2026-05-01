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
  MediaUpload: ({ onUploadComplete }: { onUploadComplete: (u: string, t: string) => void }) => (
    <button onClick={() => { onUploadComplete("https://img", "image/png"); }}>upload</button>
  ),
}));

describe("TicketCreationDrawer confirm flow", () => {
  it("reaches step 3 and confirms ticket", async () => {
    createTicket.mockResolvedValue("ticket-1");
    const onClose = vi.fn();
    render(<TicketCreationDrawer isOpen={true} onClose={onClose} />);

    fireEvent.change(screen.getByLabelText(/what's the issue/i), {
      target: { value: "Road damage" },
    });
    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    await waitFor(() => { expect(createTicket).toHaveBeenCalled(); });
    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    fireEvent.click(screen.getByRole("button", { name: /raise ticket/i }));
    await waitFor(() => { expect(onClose).toHaveBeenCalled(); }, { timeout: 2200 });
  }, 10000);
});
