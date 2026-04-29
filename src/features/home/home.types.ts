import type { Timestamp } from "firebase/firestore";

export interface ElectionPhase {
  id: string;
  label: string;
  date: string;
  status: "past" | "current" | "upcoming";
}

export interface ElectionSchedule {
  electionId: string;
  type: string;
  pollingDate: string;
  announcementDate?: string;
  nominationDeadline?: string;
  scrutinyDate?: string;
  withdrawalDeadline?: string;
  resultsDate?: string;
  sourceUrl: string;
  phases: ElectionPhase[];
  lastUpdated: Timestamp;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  path: string;
  isUrgent?: boolean;
}

export interface HomeScreenState {
  schedule: ElectionSchedule | null;
  isLoading: boolean;
  error: string | null;
}
