import { describe, expect, it } from "vitest";

import {
  CandidateInfoSchema,
  HistoricalWinnerSchema,
  PartyResultSchema,
} from "@/shared/schemas/ward";

describe("ward schemas", () => {
  it("validates party results", () => {
    expect(
      PartyResultSchema.safeParse({
        party: "ABC",
        fullName: "Aam Bharat Congress",
        color: "#fff",
      }).success,
    ).toBe(true);
    expect(
      PartyResultSchema.safeParse({
        party: "ABC",
        fullName: "Aam Bharat Congress",
      }).success,
    ).toBe(false);
  });

  it("validates candidate info and historical winners", () => {
    expect(
      CandidateInfoSchema.safeParse({
        name: "Jane",
        party: "XYZ",
      }).success,
    ).toBe(true);
    expect(
      HistoricalWinnerSchema.safeParse({
        id: "h1",
        year: 2024,
        winnerName: "Jane",
        party: "XYZ",
        voteMargin: 1234,
      }).success,
    ).toBe(true);
    expect(
      HistoricalWinnerSchema.safeParse({
        id: "h1",
        year: "2024",
        winnerName: "Jane",
        party: "XYZ",
        voteMargin: 1234,
      }).success,
    ).toBe(false);
  });
});
