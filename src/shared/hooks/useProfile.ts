import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";

import { useAuth } from "@/features/login/useAuth";
import { db } from "@/lib/firebase";

import type { UserProfile } from "../types/user";

/**
 * useProfile — hook to fetch and manage the user's Firestore profile.
 */
export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(!!user);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchProfile() {
      if (!user) {
        setProfile(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (isMounted) {
          if (docSnap.exists()) {
            setProfile({ uid: user.uid, ...docSnap.data() } as UserProfile);
          } else {
            setError("Profile not found.");
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "Failed to fetch profile",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [user]);

  return { profile, isLoading, error };
}
