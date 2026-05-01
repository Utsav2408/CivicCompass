import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { ProcessPage } from "@/features/process/ProcessPage";

vi.mock("react-router-dom", () => ({ useNavigate: () => vi.fn() }));
vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));
vi.mock("@/features/process/hooks/useProcessSteps", () => ({
  useProcessSteps: () => ({
    steps: Array.from({ length: 9 }).map((_, i) => ({
      id: `s${i}`,
      title: `Step ${i}`,
    })),
    isLoading: false,
    error: null,
  }),
}));
vi.mock("react-window", () => ({
  List: ({
    rowCount,
    rowComponent,
  }: {
    rowCount: number;
    rowComponent: (p: { index: number; style: object }) => ReactNode;
  }) => (
    <div data-testid="virtual-list">
      {Array.from({ length: rowCount }).map((_, i) => (
        <div key={i}>{rowComponent({ index: i, style: {} })}</div>
      ))}
    </div>
  ),
}));
vi.mock("@/shared/components/ScreenErrorBoundary", () => ({
  ScreenErrorBoundary: ({ children }: { children: ReactNode }) => (
    <>{children}</>
  ),
}));
vi.mock("@/shared/components/AshokaCakraLoader", () => ({
  AshokaCakraLoader: () => <div>loader</div>,
}));
vi.mock("@/shared/components/BottomNav", () => ({
  BottomNav: () => <div>nav</div>,
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
  ProcessStepCard: ({ step }: { step: { id: string } }) => <div>{step.id}</div>,
}));

describe("ProcessPage virtualized branch", () => {
  it("renders virtualized list when steps length is greater than 8", () => {
    render(<ProcessPage />);
    expect(screen.getByTestId("virtual-list")).toBeInTheDocument();
    expect(screen.getByText("s0")).toBeInTheDocument();
  });
});
