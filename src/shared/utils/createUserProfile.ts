import { doc, setDoc, serverTimestamp } from "firebase/firestore";

import { db } from "@/lib/firebase";
import type { UserProfile } from "@/shared/types/user";

/**
 * Creates or updates a user profile in Firestore.
 * Idempotent: uses merge to preserve existing fields if re-run.
 */
export async function createUserProfile(
  uid: string,
  profileData: Partial<Omit<UserProfile, "uid" | "createdAt" | "updatedAt">>
): Promise<void> {
  const userRef = doc(db, "users", uid);

  // Default values for a new profile
  const defaultProfile = {
    uid,
    language: "en" as const,
    electionInterest: [],
    isComplete: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(
    userRef,
    {
      ...defaultProfile,
      ...profileData,
      updatedAt: serverTimestamp(), // Always update the timestamp
    },
    { merge: true }
  );
}
