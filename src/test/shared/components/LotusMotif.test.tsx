import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  LotusEmptyState,
  LotusMotif,
  LotusSuccess,
} from "@/shared/components/LotusMotif";

describe("LotusMotif family", () => {
  it("renders motif with and without center", () => {
    const { container, rerender } = render(
      <LotusMotif size={48} showCentre={true} />,
    );
    expect(container.querySelectorAll("ellipse").length).toBeGreaterThan(0);
    rerender(<LotusMotif size={48} showCentre={false} />);
    expect(container.querySelectorAll("circle").length).toBe(0);
  });

  it("renders empty and success variants", () => {
    render(
      <div>
        <LotusEmptyState title="No Data" message="Nothing here" />
        <LotusSuccess message="Done" />
      </div>,
    );
    expect(screen.getAllByRole("status").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("Done")).toBeInTheDocument();
  });
});
