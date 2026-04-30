import { z } from "zod";

export const CoordinatesSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});

export const PollingBoothSchema = z.object({
  id: z.string(),
  name: z.string(),
  address: z.string(),
  coordinates: CoordinatesSchema,
  wardName: z.string(),
  wardCode: z.string(),
  constituency: z.string(),
  city: z.string(),
  boothNumber: z.string(),
});

export const PoliceStationSchema = z.object({
  id: z.string(),
  name: z.string(),
  address: z.string(),
  city: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  phone: z.string(),
  state: z.string(),
});
