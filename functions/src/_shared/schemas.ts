import { z } from "zod";

export const VoterIdSchema = z
  .string()
  .regex(/^[A-Z]{3}[0-9]{7}$/, "Voter ID must be 3 letters + 7 digits")
  .toUpperCase();

export const TicketSchema = z.object({
  description: z.string().min(10).max(1000).trim(),
  category: z.enum(["voter-roll", "booth", "id-card", "other"]),
  mediaUrl: z.string().url().optional(),
  userId: z.string().min(1),
});

export const GeminiRequestSchema = z.object({
  prompt: z.string().min(1).max(2000),
  sessionId: z.string().optional(),
});

export const CandidateFetchSchema = z.object({
  constituency: z.string().min(1),
  electionType: z.enum(["lok_sabha", "vidhan_sabha"]),
});
