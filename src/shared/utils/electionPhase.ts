import type { ElectionPhase, ElectionSchedule } from "@/features/home/home.types";

/**
 * getCurrentPhase — finds the active or most relevant phase based on current date.
 * @param schedule — The full election schedule
 * @param now — The reference date (defaults to now, injectable for testing)
 * @returns The current ElectionPhase or null if none match
 */
export function getCurrentPhase(
  schedule: ElectionSchedule,
  now: Date = new Date(),
): ElectionPhase | null {
  if (!schedule.phases || schedule.phases.length === 0) return null;

  // Format now as YYYY-MM-DD for comparison
  const todayStr = now.toISOString().split("T")[0] ?? "";

  // 1. Try to find an exact match for today
  const todayPhase = schedule.phases.find((p) => p.date === todayStr);
  if (todayPhase) return todayPhase;

  // 2. Find the first upcoming phase
  const upcomingPhase = schedule.phases.find((p) => p.date > todayStr);
  if (upcomingPhase) return upcomingPhase;

  // 3. If all phases are in the past, return null
  return null;
}
