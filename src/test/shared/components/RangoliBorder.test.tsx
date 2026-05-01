import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  RangoliBorder,
  RangoliCardAccent,
  RangoliDivider,
} from "@/shared/components/RangoliBorder";

describe("RangoliBorder family", () => {
  it("renders horizontal and vertical border variants", () => {
    const { container, rerender } = render(<RangoliBorder />);
    expect(container.querySelector("svg")).toBeInTheDocument();
    rerender(<RangoliBorder orientation="vertical" width={80} />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders divider and card accent wrappers", () => {
    render(
      <div>
        <RangoliDivider />
        <RangoliCardAccent />
      </div>,
    );
    expect(
      screen.getAllByRole("presentation", { hidden: true }).length,
    ).toBeGreaterThanOrEqual(2);
  });
});
