import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { ProcessPage } from "@/features/process/ProcessPage";

vi.mock("react-router-dom", () => ({ useNavigate: () => vi.fn() }));
vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));
vi.mock("@/features/process/hooks/useProcessSteps", () => ({
  useProcessSteps: () => ({ steps: [], isLoading: true, error: null }),
}));
vi.mock("@/shared/components/ScreenErrorBoundary", () => ({
  ScreenErrorBoundary: ({ children }: { children: ReactNode }) => (
    <>{children}</>
  ),
}));
vi.mock("@/shared/components/AshokaCakraLoader", () => ({
  AshokaCakraLoader: () => <div data-testid="process-loader">loading</div>,
}));
vi.mock("@/shared/components/BottomNav", () => ({
  BottomNav: () => <div>nav</div>,
}));
vi.mock("@/shared/components/LotusMotif", () => ({
  LotusEmptyState: () => <div>empty</div>,
}));
vi.mock("@/shared/components/ScreenStates", () => ({
  ScreenErrorState: () => <div>error</div>,
}));
vi.mock("@/features/process/components/AIChatDrawer", () => ({
  AIChatDrawer: () => null,
}));
vi.mock("@/features/process/components/ElectionTypeToggle", () => ({
  ElectionTypeToggle: () => <div>toggle</div>,
}));
vi.mock("@/features/process/components/PhaseTabBar", () => ({
  PhaseTabBar: () => <div>tabs</div>,
}));
vi.mock("@/features/process/components/ProcessStepCard", () => ({
  ProcessStepCard: () => <div>card</div>,
}));

describe("ProcessPage loading", () => {
  it("renders loading state when process steps are loading", () => {
    render(<ProcessPage />);
    expect(screen.getByTestId("process-loader")).toBeInTheDocument();
  });
});
