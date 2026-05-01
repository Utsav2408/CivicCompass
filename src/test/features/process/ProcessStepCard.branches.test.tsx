import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ProcessStepCard } from "@/features/process/components/ProcessStepCard";
import type { ProcessStep } from "@/shared/types/election";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));
vi.mock("@/shared/components/RangoliBorder", () => ({
  RangoliCardAccent: () => null,
}));
vi.mock("@/shared/components/MughalJaaliPattern", () => ({
  MughalJaaliPattern: () => null,
}));

const step: ProcessStep = {
  id: "s1",
  title: "Step title",
  description: "Desc",
  extendedDescription: "More details",
  phase: "pre-election",
  electionType: "lok_sabha",
  stepOrder: 1,
  source: "ECI",
  sourceUrl: "https://eci.gov.in",
};

describe("ProcessStepCard keyboard/link branches", () => {
  it("toggles on Enter and Space keydown", () => {
    const onToggle = vi.fn();
    render(
      <ProcessStepCard step={step} isExpanded={false} onToggle={onToggle} />,
    );
    const card = screen.getByRole("button");
    fireEvent.keyDown(card, { key: "Enter" });
    fireEvent.keyDown(card, { key: " " });
    expect(onToggle).toHaveBeenCalledTimes(2);
  });

  it("stops propagation on learn-more link click when expanded", () => {
    const onToggle = vi.fn();
    render(
      <ProcessStepCard step={step} isExpanded={true} onToggle={onToggle} />,
    );
    const link = screen.getByRole("link");
    fireEvent.click(link);
    expect(onToggle).not.toHaveBeenCalled();
  });
});
