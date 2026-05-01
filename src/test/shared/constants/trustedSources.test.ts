import { describe, expect, it } from "vitest";

import {
  AI_DISCLAIMER,
  TRUSTED_SOURCES,
} from "@/shared/constants/trustedSources";

describe("trustedSources constants", () => {
  it("exports known trusted domains and disclaimer", () => {
    expect(TRUSTED_SOURCES).toContain("eci.gov.in");
    expect(TRUSTED_SOURCES).toContain("nvsp.in");
    expect(TRUSTED_SOURCES.length).toBeGreaterThanOrEqual(5);
    expect(AI_DISCLAIMER).toMatch(/verify at eci\.gov\.in/i);
  });
});
