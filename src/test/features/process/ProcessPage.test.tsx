import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import type * as ReactRouterDom from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import { ProcessPage } from "@/features/process/ProcessPage";

const { mockNavigate, mockUseProcessSteps } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockUseProcessSteps: vi.fn(),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof ReactRouterDom>();
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("@/features/process/hooks/useProcessSteps", () => ({
  useProcessSteps: mockUseProcessSteps,
}));
vi.mock("@/shared/components/ScreenErrorBoundary", () => ({
  ScreenErrorBoundary: ({ children }: { children: ReactNode }) => (
    <>{children}</>
  ),
}));
vi.mock("@/shared/components/AshokaCakraLoader", () => ({
  AshokaCakraLoader: () => <div data-testid="loader" />,
}));
vi.mock("@/shared/components/BottomNav", () => ({
  BottomNav: () => <div data-testid="bottom-nav" />,
}));
vi.mock("@/shared/components/LotusMotif", () => ({
  LotusEmptyState: ({ title }: { title: string }) => <div>{title}</div>,
}));
vi.mock("@/shared/components/ScreenStates", () => ({
  ScreenErrorState: ({ message }: { message: string }) => <div>{message}</div>,
}));
vi.mock("@/features/process/components/ElectionTypeToggle", () => ({
  ElectionTypeToggle: () => <div data-testid="election-toggle" />,
}));
vi.mock("@/features/process/components/PhaseTabBar", () => ({
  PhaseTabBar: () => <div data-testid="phase-tabbar" />,
}));
vi.mock("@/features/process/components/ProcessStepCard", () => ({
  ProcessStepCard: ({ step }: { step: { title: string } }) => (
    <div>{step.title}</div>
  ),
}));
vi.mock("@/features/process/components/AIChatDrawer", () => ({
  AIChatDrawer: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="ai-drawer">AI Drawer</div> : null,
}));

describe("ProcessPage", () => {
  it("renders step content and opens AI drawer", () => {
    mockUseProcessSteps.mockReturnValue({
      steps: [{ id: "1", title: "Step 1" }],
      isLoading: false,
      error: null,
    });

    render(
      <MemoryRouter>
        <ProcessPage />
      </MemoryRouter>,
    );

    expect(screen.getByText("Step 1")).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: /process.ai.open_button_label/i }),
    );
    expect(screen.getByTestId("ai-drawer")).toBeInTheDocument();
  });

  it("navigates back to home from header back button", () => {
    mockUseProcessSteps.mockReturnValue({
      steps: [],
      isLoading: false,
      error: null,
    });

    render(
      <MemoryRouter>
        <ProcessPage />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: /common.back/i }));
    expect(mockNavigate).toHaveBeenCalledWith("/home", { replace: true });
  });
});
