import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { ProcessPage } from "@/features/process/ProcessPage";

const { useProcessStepsMock } = vi.hoisted(() => ({
  useProcessStepsMock: vi.fn(),
}));

vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
}));
vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));
vi.mock("@/features/process/hooks/useProcessSteps", () => ({
  useProcessSteps: useProcessStepsMock,
}));
vi.mock("@/shared/components/AshokaCakraLoader", () => ({
  AshokaCakraLoader: () => <div>loading</div>,
}));
vi.mock("@/shared/components/BottomNav", () => ({ BottomNav: () => <div>bottom-nav</div> }));
vi.mock("@/shared/components/LotusMotif", () => ({ LotusEmptyState: () => <div>empty-state</div> }));
vi.mock("@/shared/components/ScreenErrorBoundary", () => ({
  ScreenErrorBoundary: ({ children }: { children: ReactNode }) => <>{children}</>,
}));
vi.mock("@/shared/components/ScreenStates", () => ({
  ScreenErrorState: ({ message }: { message: string }) => <div>{message}</div>,
}));
vi.mock("@/features/process/components/AIChatDrawer", () => ({
  AIChatDrawer: () => null,
}));
vi.mock("@/features/process/components/ElectionTypeToggle", () => ({
  ElectionTypeToggle: () => <div>election-toggle</div>,
}));
vi.mock("@/features/process/components/PhaseTabBar", () => ({
  PhaseTabBar: () => <div>phase-tab</div>,
}));
vi.mock("@/features/process/components/ProcessStepCard", () => ({
  ProcessStepCard: ({ step }: { step: { id: string } }) => <div>{step.id}</div>,
}));

describe("ProcessPage branches", () => {
  it("shows error state", () => {
    useProcessStepsMock.mockReturnValue({ steps: [], isLoading: false, error: "boom" });
    render(<ProcessPage />);
    expect(screen.getByText("boom")).toBeInTheDocument();
  });

  it("shows empty state when no steps", () => {
    useProcessStepsMock.mockReturnValue({ steps: [], isLoading: false, error: null });
    render(<ProcessPage />);
    expect(screen.getByText("empty-state")).toBeInTheDocument();
  });
});
