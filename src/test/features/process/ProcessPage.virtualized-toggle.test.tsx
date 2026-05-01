import { fireEvent, render, screen } from "@testing-library/react";
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
    <div>
      {Array.from({ length: rowCount + 1 }).map((_, i) => (
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
  ProcessStepCard: ({
    step,
    isExpanded,
    onToggle,
  }: {
    step: { id: string };
    isExpanded: boolean;
    onToggle: () => void;
  }) => (
    <button onClick={onToggle}>
      {step.id}:{isExpanded ? "open" : "closed"}
    </button>
  ),
}));

describe("ProcessPage virtualized toggle", () => {
  it("handles toggle callback in virtualized row rendering", () => {
    render(<ProcessPage />);
    fireEvent.click(screen.getByRole("button", { name: "s0:closed" }));
    expect(screen.getByRole("button", { name: "s0:open" })).toBeInTheDocument();
  });
});
