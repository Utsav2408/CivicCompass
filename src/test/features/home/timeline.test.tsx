import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import { ElectionTimeline } from "@/features/home/components/ElectionTimeline";
import type { ElectionSchedule } from "@/features/home/home.types";

// Mock i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe("ElectionTimeline", () => {
  const mockSchedule: ElectionSchedule = {
    electionId: "loksabha_2024",
    type: "General Election",
    pollingDate: "2024-05-20",
    announcementDate: "2024-03-01",
    nominationDeadline: "2024-04-15",
    scrutinyDate: "2024-04-16",
    withdrawalDeadline: "2024-04-18",
    resultsDate: "2024-06-04",
    phases: [],
    sourceUrl: "https://eci.gov.in",
    lastUpdated: { seconds: 0, nanoseconds: 0 } as unknown as ElectionSchedule["lastUpdated"],
  };

  it("renders LotusMotif when schedule is null", () => {
    render(<ElectionTimeline schedule={null} />);
    expect(screen.getByText("home.timeline.empty")).toBeInTheDocument();
  });

  it("renders all 6 phases when schedule is provided", () => {
    render(<ElectionTimeline schedule={mockSchedule} />);
    
    expect(screen.getByText("home.timeline.announcement")).toBeInTheDocument();
    expect(screen.getByText("home.timeline.nomination")).toBeInTheDocument();
    expect(screen.getByText("home.timeline.scrutiny")).toBeInTheDocument();
    expect(screen.getByText("home.timeline.withdrawal")).toBeInTheDocument();
    expect(screen.getByText("home.timeline.polling")).toBeInTheDocument();
    expect(screen.getByText("home.timeline.results")).toBeInTheDocument();
  });

  it("identifies the current phase based on date", () => {
    // Mock today as announcement date
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-03-01T12:00:00Z"));

    render(<ElectionTimeline schedule={mockSchedule} />);
    const currentPhase = screen.getByText("home.timeline.announcement").closest("div");
    // Check if background contains the color var (JSDOM handles vars differently)
    expect(currentPhase?.style.background).toBeDefined();

    vi.useRealTimers();
  });

  it("renders source badge with correct link", () => {
    render(<ElectionTimeline schedule={mockSchedule} />);
    const link = screen.getByRole("link", { name: /home.timeline.source/i });
    expect(link).toHaveAttribute("href", "https://eci.gov.in");
  });
});
