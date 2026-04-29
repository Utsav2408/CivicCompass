import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";

import { db } from "@/lib/firebase";
import type {
  ProcessStep,
  ElectionPhase,
  ElectionType,
} from "@/shared/types/election";

/**
 * useProcessSteps — hook to fetch election process steps.
 * Performs a single .get() read on mount.
 */
export function useProcessSteps(
  electionType: ElectionType,
  phase: ElectionPhase,
) {
  const [steps, setSteps] = useState<ProcessStep[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchSteps() {
      setIsLoading(true);
      setError(null);

      try {
        const q = query(
          collection(db, "process-steps"),
          where("electionType", "==", electionType),
          where("phase", "==", phase),
          orderBy("stepOrder", "asc"),
        );

        const querySnapshot = await getDocs(q);

        if (isMounted) {
          const fetchedSteps: ProcessStep[] = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<ProcessStep, "id">),
          }));
          setSteps(fetchedSteps);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to fetch process steps",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void fetchSteps();

    return () => {
      isMounted = false;
    };
  }, [electionType, phase]);

  return { steps, isLoading, error };
}
