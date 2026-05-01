import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { WardPage } from "@/features/ward/WardPage";

vi.mock("react-router-dom", () => ({ useNavigate: () => vi.fn() }));
vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (_k: string, fallback?: string) => fallback ?? _k }),
}));
vi.mock("@/shared/hooks/useProfile", () => ({
  useProfile: () => ({ profile: { constituency: "New Delhi" } }),
}));
vi.mock("@/features/ward/hooks/usePartyData", () => ({
  usePartyData: () => ({ parties: [], isLoading: false, error: null }),
}));
vi.mock("@/features/ward/hooks/useWardCandidates", () => ({
  useWardCandidates: () => ({
    candidates: [],
    isLoading: false,
    error: null,
    nominationDeadline: null,
  }),
}));
vi.mock("@/features/ward/hooks/useHistoricalWinners", () => ({
  useHistoricalWinners: () => ({ winners: [], isLoading: false, error: null }),
}));
vi.mock("@/shared/components/ScreenErrorBoundary", () => ({
  ScreenErrorBoundary: ({ children }: { children: ReactNode }) => <>{children}</>,
}));
vi.mock("@/shared/components/AshokaCakraLoader", () => ({ AshokaCakraLoader: () => <div>loader</div> }));
vi.mock("@/shared/components/BottomNav", () => ({ BottomNav: () => <div>nav</div> }));
vi.mock("@/shared/components/LotusMotif", () => ({ LotusMotif: () => <div>lotus</div> }));
vi.mock("@/shared/components/ScreenStates", () => ({
  ScreenEmptyState: ({ title }: { title: string }) => <div>{title}</div>,
  ScreenErrorState: ({ message }: { message: string }) => <div>{message}</div>,
  ScreenLoadingState: ({ label }: { label: string }) => <div>{label}</div>,
}));
vi.mock("@/features/ward/components/ElectionTypeToggle", () => ({ ElectionTypeToggle: () => <div>toggle</div> }));
vi.mock("@/features/ward/components/CandidateList", () => ({ CandidateList: () => <div>candidates</div> }));
vi.mock("@/features/ward/components/HistoricalWinnerTable", () => ({ HistoricalWinnerTable: () => <div>winners</div> }));
vi.mock("@/features/ward/components/PartyPerformanceChart", () => ({ PartyPerformanceChart: () => <div>chart</div> }));

describe("WardPage empty aggregate branch", () => {
  it("shows overall empty state when all ward sections are empty", () => {
    render(<WardPage />);
    expect(screen.getAllByText("No ward data yet").length).toBeGreaterThan(0);
  });
});
