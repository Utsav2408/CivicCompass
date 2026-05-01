import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";

import { db } from "@/lib/firebase";

import type { ElectionSchedule } from "./home.types";

/**
 * useElectionSchedule — hook to fetch election schedule by ID.
 * Uses Firestore's offline persistence automatically (configured in firebase.ts).
 */
export function useElectionSchedule(id: string) {
  const [schedule, setSchedule] = useState<ElectionSchedule | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchSchedule() {
      setIsLoading(true);
      setError(null);

      try {
        const docRef = doc(db, "elections", id);
        const docSnap = await getDoc(docRef);

        if (isMounted) {
          if (docSnap.exists()) {
            const rawData: unknown = docSnap.data();
            const data = (rawData ?? {}) as Partial<ElectionSchedule>;
            setSchedule({
              ...data,
              phases: data.phases ?? [],
            } as ElectionSchedule);
          } else {
            setSchedule(null);
            setError(null);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to fetch election schedule",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void fetchSchedule();

    return () => {
      isMounted = false;
    };
  }, [id]);

  return { schedule, isLoading, error };
}
