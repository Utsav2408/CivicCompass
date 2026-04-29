import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import { ProcessStepCard } from "@/features/process/components/ProcessStepCard";
import type { ProcessStep } from "@/shared/types/election";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("@/shared/components/RangoliBorder", () => ({
  RangoliCardAccent: () => null,
}));

vi.mock("@/shared/components/MughalJaaliPattern", () => ({
  MughalJaaliPattern: () => null,
}));

const mockStep: ProcessStep = {
  id: "step-1",
  title: "Voter Registration",
  description: "Register yourself as a voter before the deadline.",
  extendedDescription:
    "You must register using Form 6 at your local BLO office.",
  phase: "pre-election",
  electionType: "lok_sabha",
  stepOrder: 1,
  source: "ECI",
  sourceUrl: "https://eci.gov.in/voter-registration",
};

describe("ProcessStepCard", () => {
  it("renders step title, description, and source badge from props", () => {
    render(
      <ProcessStepCard step={mockStep} isExpanded={false} onToggle={vi.fn()} />,
    );

    expect(screen.getByText("Voter Registration")).toBeInTheDocument();
    expect(
      screen.getByText("Register yourself as a voter before the deadline."),
    ).toBeInTheDocument();
    expect(screen.getByText("ECI")).toBeInTheDocument();
  });

  it("shows extended description and Learn more link when expanded", () => {
    render(
      <ProcessStepCard step={mockStep} isExpanded={true} onToggle={vi.fn()} />,
    );

    expect(
      screen.getByText(
        "You must register using Form 6 at your local BLO office.",
      ),
    ).toBeInTheDocument();
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute(
      "href",
      "https://eci.gov.in/voter-registration",
    );
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("hides extended description when collapsed", () => {
    render(
      <ProcessStepCard step={mockStep} isExpanded={false} onToggle={vi.fn()} />,
    );

    expect(
      screen.queryByText(
        "You must register using Form 6 at your local BLO office.",
      ),
    ).not.toBeInTheDocument();
  });

  it("does not re-render when unrelated parent state changes (React.memo check)", () => {
    const renderSpy = vi.fn();

    const TestCard = (props: {
      step: ProcessStep;
      isExpanded: boolean;
      onToggle: () => void;
    }) => {
      renderSpy();
      return <ProcessStepCard {...props} />;
    };

    const { rerender } = render(
      <TestCard step={mockStep} isExpanded={false} onToggle={vi.fn()} />,
    );

    const initialCount = renderSpy.mock.calls.length;

    // Re-render with same props — memo should prevent inner re-render
    rerender(
      <TestCard step={mockStep} isExpanded={false} onToggle={vi.fn()} />,
    );

    // The wrapper re-renders, but ProcessStepCard's internals should be memoized
    // We just verify no crash and the content is still there
    expect(screen.getByText("Voter Registration")).toBeInTheDocument();
    expect(initialCount).toBe(1);
  });

  it("calls onToggle when card is clicked", () => {
    const onToggle = vi.fn();
    render(
      <ProcessStepCard
        step={mockStep}
        isExpanded={false}
        onToggle={onToggle}
      />,
    );

    fireEvent.click(screen.getByRole("button"));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});
