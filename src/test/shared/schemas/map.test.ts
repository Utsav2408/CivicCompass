import { describe, expect, it } from "vitest";

import { PoliceStationSchema, PollingBoothSchema } from "@/shared/schemas/map";

describe("map schemas", () => {
  it("parses valid polling booth and rejects invalid coordinates", () => {
    const valid = {
      id: "booth-1",
      name: "Booth 1",
      address: "A street",
      coordinates: { lat: 28.61, lng: 77.2 },
      wardName: "Ward 10",
      wardCode: "W10",
      constituency: "New Delhi",
      city: "Delhi",
      boothNumber: "10A",
    };
    expect(PollingBoothSchema.safeParse(valid).success).toBe(true);
    expect(
      PollingBoothSchema.safeParse({
        ...valid,
        coordinates: { lat: "28.61", lng: 77.2 },
      }).success,
    ).toBe(false);
  });

  it("parses valid police station and rejects invalid latitude", () => {
    const valid = {
      id: "ps-1",
      name: "Police Station",
      address: "Addr",
      city: "Delhi",
      latitude: 28.6,
      longitude: 77.1,
      phone: "100",
      state: "Delhi",
    };
    expect(PoliceStationSchema.safeParse(valid).success).toBe(true);
    expect(
      PoliceStationSchema.safeParse({ ...valid, latitude: "28.6" }).success,
    ).toBe(false);
  });
});
