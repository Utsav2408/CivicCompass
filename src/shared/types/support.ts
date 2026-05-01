export type TicketStatus =
  | "draft"
  | "open"
  | "resolved"
  | "closed"
  | "Draft"
  | "Open"
  | "Resolved"
  | "Closed";

export type TicketCategory =
  | "voter-roll"
  | "booth"
  | "id-card"
  | "voter-card"
  | "infrastructure"
  | "safety"
  | "general"
  | "other";

export interface FirestoreTimestamp {
  seconds: number;
  nanoseconds: number;
}

export interface Ticket {
  id: string;
  userId: string;
  description: string;
  category: TicketCategory;
  status: TicketStatus;
  mediaUrl?: string;
  mediaType?: string;
  mediaError?: string;
  createdAt: FirestoreTimestamp;
  resolvedAt?: FirestoreTimestamp;
}
