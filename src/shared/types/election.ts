/**
 * Election Process types
 */

export type ElectionPhase = "pre-election" | "election-day" | "post-election";
export type ElectionType = "lok_sabha" | "vidhan_sabha";

export interface ProcessStep {
  id: string;
  title: string;
  description: string;
  extendedDescription: string;
  phase: ElectionPhase;
  electionType: ElectionType;
  stepOrder: number;
  source: string;
  sourceUrl: string;
}
