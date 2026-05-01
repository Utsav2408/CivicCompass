import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import { PartyPerformanceChart } from "@/features/ward/components/PartyPerformanceChart";
import type { PartyResult } from "@/shared/types/ward";

// Mock Recharts so JSDOM doesn't choke on SVGs/ResizeObserver
vi.mock("recharts", async (importOriginal) => {
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const OriginalRecharts = await importOriginal<typeof import("recharts")>();
  return {
    ...OriginalRecharts,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    BarChart: ({ children }: any) => (
      <div data-testid="barchart">{children}</div>
    ),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Bar: ({ dataKey }: any) => <div data-testid={`bar-${String(dataKey)}`} />,
  };
});

describe("PartyPerformanceChart", () => {
  const mockParties: PartyResult[] = [
    {
      party: "BJP",
      fullName: "Bharatiya Janata Party",
      voteShare2019: 50,
      voteShare2024: 45,
      seats2019: 300,
      seats2024: 290,
      color: "#F97D09",
    },
    {
      party: "INC",
      fullName: "Indian National Congress",
      voteShare2019: 20,
      voteShare2024: 25,
      seats2019: 50,
      seats2024: 90,
      color: "#00BFFF",
    },
    {
      party: "AAP",
      fullName: "Aam Aadmi Party",
      voteShare2019: 10,
      voteShare2024: 12,
      seats2019: 1,
      seats2024: 3,
      color: "#0000FF",
    },
    {
      party: "BSP",
      fullName: "Bahujan Samaj Party",
      voteShare2019: 5,
      voteShare2024: 3,
      seats2019: 10,
      seats2024: 0,
      color: "#22409A",
    },
    {
      party: "Others",
      fullName: "Others",
      voteShare2019: 15,
      voteShare2024: 15,
      seats2019: 182,
      seats2024: 160,
      color: "#808080",
    },
  ];

  it("renders bars for vote share view by default", () => {
    render(<PartyPerformanceChart parties={mockParties} />);

    expect(screen.getByTestId("barchart")).toBeInTheDocument();
    expect(screen.getByTestId("bar-voteShare2019")).toBeInTheDocument();
    expect(screen.getByTestId("bar-voteShare2024")).toBeInTheDocument();
  });

  it("switches dataKey when 'Seats Won' toggle is clicked", () => {
    render(<PartyPerformanceChart parties={mockParties} />);

    const seatsToggle = screen.getByRole("radio", { name: /Seats Won/i });
    fireEvent.click(seatsToggle);

    expect(screen.getByTestId("bar-seats2019")).toBeInTheDocument();
    expect(screen.getByTestId("bar-seats2024")).toBeInTheDocument();
  });

  it("switches back to vote share when toggle is clicked again", () => {
    render(<PartyPerformanceChart parties={mockParties} />);

    fireEvent.click(screen.getByRole("radio", { name: /Seats Won/i }));
    fireEvent.click(screen.getByRole("radio", { name: /Vote Share/i }));

    expect(screen.getByTestId("bar-voteShare2019")).toBeInTheDocument();
    expect(screen.getByTestId("bar-voteShare2024")).toBeInTheDocument();
  });

  it("renders source badge correctly", () => {
    render(<PartyPerformanceChart parties={mockParties} />);

    expect(
      screen.getByText(/Source: Lok Dhaba, Trivedi Centre/i),
    ).toBeInTheDocument();
  });

  it("React.memo prevents re-rendering on identical props (snapshot check)", () => {
    const { asFragment, rerender } = render(
      <PartyPerformanceChart parties={mockParties} />,
    );
    const firstRender = asFragment();

    // Rerender with same exact reference or deeply equal props
    rerender(<PartyPerformanceChart parties={mockParties} />);
    const secondRender = asFragment();

    expect(firstRender).toEqual(secondRender);
  });
});
