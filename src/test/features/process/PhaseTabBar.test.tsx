import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { PhaseTabBar } from "@/features/process/components/PhaseTabBar";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        "process.phases.pre-election": "Pre-Election",
        "process.phases.election-day": "Election Day",
        "process.phases.post-election": "Post-Election",
        "process.phases.label": "Election Phase",
      };
      return map[key] ?? key;
    },
  }),
}));

describe("PhaseTabBar", () => {
  const onPhaseChange = vi.fn();

  beforeEach(() => {
    onPhaseChange.mockClear();
  });

  it("clicking a tab calls onPhaseChange with the correct phase value", () => {
    render(
      <PhaseTabBar activePhase="pre-election" onPhaseChange={onPhaseChange} />,
    );

    fireEvent.click(screen.getByRole("tab", { name: "Election Day" }));
    expect(onPhaseChange).toHaveBeenCalledWith("election-day");
  });

  it("pressing ArrowRight moves selection to the next tab", () => {
    render(
      <PhaseTabBar activePhase="pre-election" onPhaseChange={onPhaseChange} />,
    );

    const preElectionTab = screen.getByRole("tab", { name: "Pre-Election" });
    fireEvent.keyDown(preElectionTab, { key: "ArrowRight" });

    expect(onPhaseChange).toHaveBeenCalledWith("election-day");
  });

  it("each tab has correct aria-selected value reflecting active/inactive state", () => {
    render(
      <PhaseTabBar activePhase="election-day" onPhaseChange={onPhaseChange} />,
    );

    expect(screen.getByRole("tab", { name: "Pre-Election" })).toHaveAttribute(
      "aria-selected",
      "false",
    );
    expect(screen.getByRole("tab", { name: "Election Day" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("tab", { name: "Post-Election" })).toHaveAttribute(
      "aria-selected",
      "false",
    );
  });

  it("pressing ArrowLeft on the first tab wraps to the last tab", () => {
    render(
      <PhaseTabBar activePhase="pre-election" onPhaseChange={onPhaseChange} />,
    );

    const preElectionTab = screen.getByRole("tab", { name: "Pre-Election" });
    fireEvent.keyDown(preElectionTab, { key: "ArrowLeft" });

    expect(onPhaseChange).toHaveBeenCalledWith("post-election");
  });
});
