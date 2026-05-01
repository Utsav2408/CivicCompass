import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CandidateCard } from "@/features/ward/components/CandidateCard";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (_k: string, fallback?: string) => fallback ?? _k }),
}));

describe("CandidateCard branch paths", () => {
  it("renders fallback values when optional candidate fields are missing", () => {
    render(
      <CandidateCard
        candidate={{
          name: "Jane Roe",
          party: "ABC",
          symbol: "",
          assetsTotal: undefined,
          criminalCases: undefined,
          education: undefined,
        }}
      />,
    );

    expect(screen.getByText("ABC")).toBeInTheDocument();
    expect(screen.queryByText(/•/)).not.toBeInTheDocument();
    expect(screen.getAllByText("N/A").length).toBeGreaterThanOrEqual(3);
    expect(
      screen.getByText(/Jane Roe has declared unknown in assets and 0 criminal cases/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/background is not specified/i)).toBeInTheDocument();
  });
});
