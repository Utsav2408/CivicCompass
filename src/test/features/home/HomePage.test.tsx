import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";

import { HomePage } from "@/features/home/HomePage";
import type { ElectionSchedule } from "@/features/home/home.types";
import { useElectionSchedule } from "@/features/home/useElectionSchedule";

// Mocks
vi.mock("@features/home/useElectionSchedule");
vi.mock("@features/login/useAuth", () => ({
  useAuth: () => ({ user: { uid: "123" } }),
}));
vi.mock("@shared/hooks/useProfile", () => ({
  useProfile: () => ({ profile: { constituency: "Delhi" }, isLoading: false }),
}));
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: "en", changeLanguage: vi.fn() },
  }),
}));

describe("HomePage", () => {
  it("renders loading state on mount", () => {
    vi.mocked(useElectionSchedule).mockReturnValue({
      schedule: null,
      isLoading: true,
      error: null,
      refresh: vi.fn(),
    } as ReturnType<typeof useElectionSchedule>);

    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>,
    );

    // AshokaCakraLoader should be visible (within ElectionStatusCard)
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("renders countdown and timeline after Firestore mock resolves", () => {
    const mockSchedule = {
      electionId: "loksabha_2024",
      type: "General Election",
      pollingDate: "2024-05-20",
      announcementDate: "2024-03-01",
      sourceUrl: "https://eci.gov.in",
      phases: [
        { id: "p1", label: "Phase 1", date: "2024-05-10", status: "upcoming" },
      ],
    } as unknown as ElectionSchedule;

    vi.mocked(useElectionSchedule).mockReturnValue({
      schedule: mockSchedule,
      isLoading: false,
      error: null,
      refresh: vi.fn(),
    } as ReturnType<typeof useElectionSchedule>);

    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>,
    );

    expect(screen.getByText("General Election")).toBeInTheDocument();
    expect(screen.getByText("home.timeline.title")).toBeInTheDocument();
  });

  it("hides timer section when schedule is null", () => {
    vi.mocked(useElectionSchedule).mockReturnValue({
      schedule: null,
      isLoading: false,
      error: null,
      refresh: vi.fn(),
    } as ReturnType<typeof useElectionSchedule>);

    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>,
    );

    // The ElectionStatusCard returns null if schedule is null
    expect(screen.queryByText("General Election")).not.toBeInTheDocument();
  });

  it("error state shows retry button", () => {
    vi.mocked(useElectionSchedule).mockReturnValue({
      schedule: null,
      isLoading: false,
      error: "Failed to fetch",
      refresh: vi.fn(),
    } as ReturnType<typeof useElectionSchedule>);

    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>,
    );

    expect(screen.getByText("Failed to fetch")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
  });
});
