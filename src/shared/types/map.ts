/**
 * Map types for CivicCompass
 * Shared between voter lookup, user profiles, and the Map feature.
 */

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface PollingBooth {
  name: string;
  address: string;
  coordinates: Coordinates;
}

export interface Constituency {
  id: string;
  name: string;
  pcCode?: string; // Parliamentary Constituency code
  acCode?: string; // Assembly Constituency code
}
