import { z } from "zod";

export const PartyResultSchema = z.object({
  party: z.string(),
  fullName: z.string(),
  voteShare2019: z.number().optional(),
  voteShare2024: z.number().optional(),
  seats2019: z.number().optional(),
  seats2024: z.number().optional(),
  color: z.string(),
});

export const CandidateInfoSchema = z.object({
  name: z.string(),
  party: z.string(),
  symbol: z.string().optional(),
  assetsTotal: z.string().optional(),
  liabilitiesTotal: z.string().optional(),
  criminalCases: z.number().optional(),
  education: z.string().optional(),
  source: z.string().optional(),
});

export const HistoricalWinnerSchema = z.object({
  id: z.string(),
  year: z.number(),
  winnerName: z.string(),
  party: z.string(),
  voteMargin: z.number(),
});
