import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";

import { db } from "@/lib/firebase";
import type {
  ProcessStep,
  ElectionPhase,
  ElectionType,
} from "@/shared/types/election";

function getCacheKey(electionType: ElectionType, phase: ElectionPhase) {
  return `process-steps:${electionType}:${phase}`;
}

function getFallbackSteps(
  electionType: ElectionType,
  phase: ElectionPhase,
): ProcessStep[] {
  const fallback: Record<ElectionPhase, ProcessStep[]> = {
    "pre-election": [
      {
        id: "fallback-pre-1",
        title: "Voter Registration",
        description: "Ensure your name is on the electoral roll.",
        extendedDescription:
          "Use NVSP/ECI services to verify and update your voter registration details before polling.",
        phase: "pre-election",
        electionType,
        stepOrder: 1,
        source: "eci.gov.in",
        sourceUrl: "https://eci.gov.in/",
      },
      {
        id: "fallback-pre-2",
        title: "Nomination and Campaign Period",
        description: "Track candidate list and campaign timelines.",
        extendedDescription:
          "After nominations and scrutiny, review official candidate information and public notices from ECI.",
        phase: "pre-election",
        electionType,
        stepOrder: 2,
        source: "eci.gov.in",
        sourceUrl: "https://eci.gov.in/",
      },
    ],
    "election-day": [
      {
        id: "fallback-day-1",
        title: "Cast Your Vote",
        description: "Visit your assigned polling booth with valid ID.",
        extendedDescription:
          "Confirm booth details, carry accepted ID proof, and complete voting through the official polling process.",
        phase: "election-day",
        electionType,
        stepOrder: 1,
        source: "eci.gov.in",
        sourceUrl: "https://eci.gov.in/",
      },
      {
        id: "fallback-day-2",
        title: "Polling Closure",
        description: "EVM/VVPAT units are sealed after polling closes.",
        extendedDescription:
          "Post-poll procedures are conducted by officials in line with ECI process and security requirements.",
        phase: "election-day",
        electionType,
        stepOrder: 2,
        source: "eci.gov.in",
        sourceUrl: "https://eci.gov.in/",
      },
    ],
    "post-election": [
      {
        id: "fallback-post-1",
        title: "Counting of Votes",
        description: "Votes are counted at designated counting centers.",
        extendedDescription:
          "Counting rounds are conducted under official supervision and results are tabulated by election authorities.",
        phase: "post-election",
        electionType,
        stepOrder: 1,
        source: "eci.gov.in",
        sourceUrl: "https://eci.gov.in/",
      },
      {
        id: "fallback-post-2",
        title: "Result Declaration",
        description: "Final results are announced by election officials.",
        extendedDescription:
          "Certified results are published through official channels after completion of the counting process.",
        phase: "post-election",
        electionType,
        stepOrder: 2,
        source: "eci.gov.in",
        sourceUrl: "https://eci.gov.in/",
      },
    ],
  };

  return fallback[phase];
}

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
    const cacheKey = getCacheKey(electionType, phase);

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
          const resolvedSteps =
            fetchedSteps.length > 0
              ? fetchedSteps
              : getFallbackSteps(electionType, phase);
          localStorage.setItem(cacheKey, JSON.stringify(resolvedSteps));
          setSteps(resolvedSteps);
        }
      } catch (err) {
        if (isMounted) {
          const cached = localStorage.getItem(cacheKey);
          if (cached) {
            try {
              const parsed = JSON.parse(cached) as ProcessStep[];
              setSteps(parsed);
              setError(null);
              return;
            } catch {
              // fall through to normal error path
            }
          }
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
