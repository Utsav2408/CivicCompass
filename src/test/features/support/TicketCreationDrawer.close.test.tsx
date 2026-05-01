import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TicketCreationDrawer } from "@/features/support/components/TicketCreationDrawer";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (_k: string, fallback?: string) => fallback ?? _k }),
}));
vi.mock("@/features/login/useAuth", () => ({
  useAuth: () => ({ user: { uid: "u1" } }),
}));
vi.mock("@/features/support/hooks/useTickets", () => ({
  useTickets: () => ({ createTicket: vi.fn() }),
}));
vi.mock("@/shared/components/AshokaCakraLoader", () => ({
  AshokaCakraLoader: () => <div>loader</div>,
}));
vi.mock("@/features/support/components/MediaUpload", () => ({
  MediaUpload: () => <div>upload</div>,
}));

describe("TicketCreationDrawer close", () => {
  it("calls onClose when close button clicked", () => {
    const onClose = vi.fn();
    render(<TicketCreationDrawer isOpen={true} onClose={onClose} />);
    fireEvent.click(screen.getByRole("button", { name: /close/i }));
    expect(onClose).toHaveBeenCalled();
  });
});
