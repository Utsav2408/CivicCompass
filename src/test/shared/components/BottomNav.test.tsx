import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import { BottomNav } from "@/shared/components/BottomNav";

const mockUseProfile = vi.fn(() => ({ profile: null }));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback ?? key,
  }),
}));
vi.mock("@/shared/hooks/useProfile", () => ({
  useProfile: () => mockUseProfile(),
}));

describe("BottomNav", () => {
  it("shows ward prompt when ward nav is disabled and clicked", () => {
    render(
      <MemoryRouter initialEntries={["/home"]}>
        <BottomNav />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: /nav.ward/i }));
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("renders ward as link when profile constituency exists", () => {
    mockUseProfile.mockReturnValue({ profile: { constituency: "New Delhi" } });
    render(
      <MemoryRouter initialEntries={["/home"]}>
        <BottomNav />
      </MemoryRouter>,
    );
    const wardLink = screen.getByRole("link", { name: /nav.ward/i });
    expect(wardLink).toHaveAttribute("href", "/ward");
  });
});
