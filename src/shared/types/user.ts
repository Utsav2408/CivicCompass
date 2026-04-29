import type { FieldValue } from "firebase/firestore";

import type { PollingBooth } from "./map";


/**
 * UserProfile interface for CivicCompass
 * Represents the persisted user data in Firestore.
 */
export interface UserProfile {
  uid: string;
  name: string;
  voterIdNumber?: string; // Optional until ECI lookup
  phoneHash?: string;    // SHA-256 hash of phone for privacy-safe matching
  constituency?: string;  // e.g., "New Delhi PC-01"
  pollingBooth?: PollingBooth;
  language: "en" | "hi";
  electionInterest: string[]; // e.g., ["local-issues", "candidate-track-record"]
  isComplete: boolean;        // Whether personalization flow is finished
  createdAt: number | FieldValue;      // Epoch timestamp or Firestore serverTimestamp
  updatedAt: number | FieldValue;      // Epoch timestamp or Firestore serverTimestamp
}
