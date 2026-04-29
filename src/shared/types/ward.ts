import type { z } from "zod";

import type {
  PartyResultSchema,
  CandidateInfoSchema,
  HistoricalWinnerSchema,
} from "../schemas/ward";

import type { ElectionType } from "./election";

// Re-export ElectionType so it can be imported from here as requested
export type { ElectionType };

export type PartyResult = z.infer<typeof PartyResultSchema>;
export type CandidateInfo = z.infer<typeof CandidateInfoSchema>;
export type HistoricalWinner = z.infer<typeof HistoricalWinnerSchema>;

export interface WardScreenState {
  electionType: ElectionType;
  constituencyId: string | null;
}
