import { describe, it, expect } from "vitest";

import type { ElectionSchedule } from "@/features/home/home.types";
import { getCurrentPhase } from "@/shared/utils/electionPhase";

describe("getCurrentPhase", () => {
  const mockSchedule: ElectionSchedule = {
    electionId: "test",
    type: "Test Election",
    pollingDate: "2024-05-20",
    announcementDate: "2024-03-01",
    phases: [
      { id: "p1", label: "Phase 1", date: "2024-05-10", status: "upcoming" },
      { id: "p2", label: "Phase 2", date: "2024-05-20", status: "upcoming" },
    ],
    sourceUrl: "https://example.com",
    lastUpdated: {
      seconds: 0,
      nanoseconds: 0,
    } as unknown as ElectionSchedule["lastUpdated"],
  };

  it("returns null if phases array is empty", () => {
    const result = getCurrentPhase({ ...mockSchedule, phases: [] });
    expect(result).toBeNull();
  });

  it("returns correct phase for a date matching a phase date", () => {
    const now = new Date("2024-05-10T12:00:00Z");
    const result = getCurrentPhase(mockSchedule, now);
    expect(result?.id).toBe("p1");
  });

  it("returns the next upcoming phase if currently between phases", () => {
    const now = new Date("2024-05-15T12:00:00Z"); // Between P1 and P2
    const result = getCurrentPhase(mockSchedule, now);
    expect(result?.id).toBe("p2");
  });

  it("returns null if all phases are in the past", () => {
    const now = new Date("2024-05-25T12:00:00Z");
    const result = getCurrentPhase(mockSchedule, now);
    expect(result).toBeNull();
  });
});
