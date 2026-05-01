import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import type * as ReactRouterDom from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import { WardPage } from "@/features/ward/WardPage";

const mockNavigate = vi.fn();

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback ?? key,
  }),
}));

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof ReactRouterDom>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("@/shared/hooks/useProfile", () => ({
  useProfile: vi.fn(() => ({ profile: null })),
}));

vi.mock("@/features/ward/hooks/usePartyData", () => ({
  usePartyData: vi.fn(() => ({ parties: [], isLoading: false, error: null })),
}));
vi.mock("@/features/ward/hooks/useWardCandidates", () => ({
  useWardCandidates: vi.fn(() => ({
    candidates: [],
    isLoading: false,
    error: null,
    nominationDeadline: null,
  })),
}));
vi.mock("@/features/ward/hooks/useHistoricalWinners", () => ({
  useHistoricalWinners: vi.fn(() => ({ winners: [], isLoading: false, error: null })),
}));

vi.mock("@/shared/components/ScreenErrorBoundary", () => ({
  ScreenErrorBoundary: ({ children }: { children: ReactNode }) => <>{children}</>,
}));
vi.mock("@/shared/components/BottomNav", () => ({
  BottomNav: () => <div data-testid="bottom-nav" />,
}));
vi.mock("@/shared/components/LotusMotif", () => ({
  LotusMotif: () => <div data-testid="lotus-motif" />,
}));
vi.mock("@/shared/components/AshokaCakraLoader", () => ({
  AshokaCakraLoader: () => <div data-testid="loader" />,
}));
vi.mock("@/shared/components/ScreenStates", () => ({
  ScreenEmptyState: ({ title }: { title: string }) => <div>{title}</div>,
  ScreenErrorState: ({ message }: { message: string }) => <div>{message}</div>,
  ScreenLoadingState: ({ label }: { label: string }) => <div>{label}</div>,
}));
vi.mock("@/features/ward/components/ElectionTypeToggle", () => ({
  ElectionTypeToggle: () => <div data-testid="election-toggle" />,
}));
vi.mock("@/features/ward/components/PartyPerformanceChart", () => ({
  PartyPerformanceChart: () => <div data-testid="party-chart" />,
}));
vi.mock("@/features/ward/components/HistoricalWinnerTable", () => ({
  HistoricalWinnerTable: () => <div data-testid="history-table" />,
}));
vi.mock("@/features/ward/components/CandidateList", () => ({
  CandidateList: () => <div data-testid="candidate-list" />,
}));

describe("WardPage", () => {
  it("renders no-constituency CTA and navigates to personalization", () => {
    render(
      <MemoryRouter>
        <WardPage />
      </MemoryRouter>,
    );

    expect(screen.getByText(/complete profile to continue/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /update profile/i }));
    expect(mockNavigate).toHaveBeenCalledWith("/personalization");
  });

  it("renders data sections for constituency profile", async () => {
    const { useProfile } = await import("@/shared/hooks/useProfile");
    const { usePartyData } = await import("@/features/ward/hooks/usePartyData");
    const { useHistoricalWinners } = await import(
      "@/features/ward/hooks/useHistoricalWinners"
    );
    const { useWardCandidates } = await import("@/features/ward/hooks/useWardCandidates");

    vi.mocked(useProfile).mockReturnValue({
      profile: { constituency: "New Delhi" },
    } as never);
    vi.mocked(usePartyData).mockReturnValue({
      parties: [{ party: "BJP" }],
      isLoading: false,
      error: null,
    } as never);
    vi.mocked(useHistoricalWinners).mockReturnValue({
      winners: [{ year: 2019 }],
      isLoading: false,
      error: null,
    } as never);
    vi.mocked(useWardCandidates).mockReturnValue({
      candidates: [{ name: "A Candidate" }],
      isLoading: false,
      error: null,
      nominationDeadline: null,
    } as never);

    render(
      <MemoryRouter>
        <WardPage />
      </MemoryRouter>,
    );

    expect(screen.getByText("New Delhi")).toBeInTheDocument();
    expect(screen.getByTestId("party-chart")).toBeInTheDocument();
    expect(screen.getByTestId("history-table")).toBeInTheDocument();
    expect(screen.getByTestId("candidate-list")).toBeInTheDocument();
  });
});
