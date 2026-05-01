import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CandidateList } from "@/features/ward/components/CandidateList";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (_k: string, fallback?: string) => fallback ?? _k,
  }),
}));

vi.mock("@/features/ward/components/CandidateCard", () => ({
  CandidateCard: ({ candidate }: { candidate: { name: string } }) => (
    <div>{candidate.name}</div>
  ),
}));

describe("CandidateList", () => {
  it("renders empty state and nomination deadline when no candidates", () => {
    render(
      <CandidateList
        candidates={[]}
        nominationDeadline="2026-05-01T00:00:00.000Z"
      />,
    );

    expect(
      screen.getByText("No candidates have filed nominations yet."),
    ).toBeInTheDocument();
    expect(screen.getByText(/Nomination Deadline:/)).toBeInTheDocument();
  });

  it("renders candidate cards when candidates are present", () => {
    render(
      <CandidateList
        candidates={[
          { name: "Alice", party: "ABC" },
          { name: "Bob", party: "XYZ" },
        ]}
        nominationDeadline={null}
      />,
    );

    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(
      screen.queryByText("No candidates have filed nominations yet."),
    ).not.toBeInTheDocument();
  });
});
