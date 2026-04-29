import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { CandidateCard } from "@/features/ward/components/CandidateCard";
import type { CandidateInfo } from "@/shared/types/ward";

describe("CandidateCard", () => {
  const mockCandidate: CandidateInfo = {
    name: "John Doe",
    party: "IND",
    symbol: "Bicycle",
    assetsTotal: "1.5 Cr",
    criminalCases: 0,
    education: "Graduate",
  };

  it("renders candidate name and party badge", () => {
    render(<CandidateCard candidate={mockCandidate} />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("IND • Bicycle")).toBeInTheDocument();
  });

  it("renders assets declared amount clearly", () => {
    render(<CandidateCard candidate={mockCandidate} />);

    expect(screen.getByText("Total Assets")).toBeInTheDocument();
    expect(screen.getByText("1.5 Cr")).toBeInTheDocument();
  });

  it("AI source badge is always visible on the text blurb", () => {
    render(<CandidateCard candidate={mockCandidate} />);

    expect(screen.getByText("AI SUMMARY")).toBeInTheDocument();
    expect(
      screen.getByText(/John Doe has declared 1.5 Cr in assets/i),
    ).toBeInTheDocument();
  });
});
