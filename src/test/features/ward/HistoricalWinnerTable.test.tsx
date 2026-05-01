import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { HistoricalWinnerTable } from "@/features/ward/components/HistoricalWinnerTable";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (_k: string, fallback?: string) => fallback ?? _k,
  }),
}));

describe("HistoricalWinnerTable", () => {
  it("renders nothing for empty winners", () => {
    const { container } = render(<HistoricalWinnerTable winners={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders top two winners only", () => {
    render(
      <HistoricalWinnerTable
        winners={[
          {
            id: "1",
            year: 2024,
            winnerName: "A",
            party: "X",
            voteMargin: 1000,
          },
          { id: "2", year: 2019, winnerName: "B", party: "Y", voteMargin: 900 },
          { id: "3", year: 2014, winnerName: "C", party: "Z", voteMargin: 800 },
        ]}
      />,
    );
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
    expect(screen.queryByText("C")).not.toBeInTheDocument();
  });
});
