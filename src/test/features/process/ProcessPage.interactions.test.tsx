import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import type * as ReactRouterDom from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import { ProcessPage } from "@/features/process/ProcessPage";

const { mockNavigate, useProcessStepsMock } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  useProcessStepsMock: vi.fn(),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof ReactRouterDom>();
  return { ...actual, useNavigate: () => mockNavigate };
});
vi.mock("@/features/process/hooks/useProcessSteps", () => ({
  useProcessSteps: useProcessStepsMock,
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
vi.mock("@/shared/components/LotusMotif", () => ({
  LotusEmptyState: () => <div>empty</div>,
}));
vi.mock("@/shared/components/ScreenStates", () => ({
  ScreenErrorState: ({ message }: { message: string }) => <div>{message}</div>,
}));
vi.mock("@/features/process/components/ElectionTypeToggle", () => ({
  ElectionTypeToggle: ({
    onChange,
  }: {
    onChange: (v: "lok_sabha" | "vidhan_sabha") => void;
  }) => (
    <button
      onClick={() => {
        onChange("vidhan_sabha");
      }}
    >
      change election
    </button>
  ),
}));
vi.mock("@/features/process/components/PhaseTabBar", () => ({
  PhaseTabBar: ({
    onPhaseChange,
  }: {
    onPhaseChange: (
      p: "pre-election" | "during-election" | "post-election",
    ) => void;
  }) => (
    <button
      onClick={() => {
        onPhaseChange("during-election");
      }}
    >
      change phase
    </button>
  ),
}));
vi.mock("@/features/process/components/ProcessStepCard", () => ({
  ProcessStepCard: ({
    step,
    isExpanded,
    onToggle,
  }: {
    step: { id: string; title?: string };
    isExpanded: boolean;
    onToggle: () => void;
  }) => (
    <button onClick={onToggle}>
      {step.id}:{isExpanded ? "open" : "closed"}
    </button>
  ),
}));
vi.mock("@/features/process/components/AIChatDrawer", () => ({
  AIChatDrawer: ({
    isOpen,
    onClose,
  }: {
    isOpen: boolean;
    onClose: () => void;
  }) => (isOpen ? <button onClick={onClose}>close ai</button> : null),
}));

describe("ProcessPage interactions", () => {
  it("updates params for steps hook and toggles card open/close", () => {
    useProcessStepsMock.mockReturnValue({
      steps: [{ id: "s1", title: "Step 1" }],
      isLoading: false,
      error: null,
    });

    render(<ProcessPage />);
    expect(useProcessStepsMock).toHaveBeenLastCalledWith(
      "lok_sabha",
      "pre-election",
    );

    fireEvent.click(screen.getByRole("button", { name: /change election/i }));
    expect(useProcessStepsMock).toHaveBeenLastCalledWith(
      "vidhan_sabha",
      "pre-election",
    );

    fireEvent.click(screen.getByRole("button", { name: /change phase/i }));
    expect(useProcessStepsMock).toHaveBeenLastCalledWith(
      "vidhan_sabha",
      "during-election",
    );

    const card = screen.getByRole("button", { name: "s1:closed" });
    fireEvent.click(card);
    expect(screen.getByRole("button", { name: "s1:open" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "s1:open" }));
    expect(
      screen.getByRole("button", { name: "s1:closed" }),
    ).toBeInTheDocument();
  });

  it("opens and closes AI drawer", () => {
    useProcessStepsMock.mockReturnValue({
      steps: [{ id: "s1", title: "Step 1" }],
      isLoading: false,
      error: null,
    });
    render(<ProcessPage />);
    fireEvent.click(
      screen.getByRole("button", { name: /process.ai.open_button_label/i }),
    );
    fireEvent.click(screen.getByRole("button", { name: /close ai/i }));
    expect(
      screen.queryByRole("button", { name: /close ai/i }),
    ).not.toBeInTheDocument();
  });
});
