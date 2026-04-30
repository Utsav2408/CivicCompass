/**
 * Map types for CivicCompass
 * Shared between voter lookup, user profiles, and the Map feature.
 */

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface PollingBooth {
  id: string;
  name: string;
  address: string;
  coordinates: Coordinates;
  wardName: string;
  wardCode: string;
  constituency: string;
  city: string;
  boothNumber: string;
}

export interface PoliceStation {
  id: string;
  name: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  phone: string;
  state: string;
}

export interface Constituency {
  id: string;
  name: string;
  pcCode?: string; // Parliamentary Constituency code
  acCode?: string; // Assembly Constituency code
}
