import { doc, getDoc } from "firebase/firestore";
import { getToken } from "firebase/app-check";
import { useState, useEffect } from "react";

import { useAuth } from "@/features/login/useAuth";
import { appCheck, db } from "@/lib/firebase";
import type { CandidateInfo, ElectionType } from "@/shared/types/ward";

interface UseWardCandidatesResult {
  candidates: CandidateInfo[];
  isLoading: boolean;
  error: string | null;
  nominationDeadline: string | null;
}

export function useWardCandidates(
  constituencyId: string | null,
  electionType: ElectionType,
): UseWardCandidatesResult {
  const { user } = useAuth();
  const [candidates, setCandidates] = useState<CandidateInfo[]>([]);
  const [nominationDeadline, setNominationDeadline] = useState<string | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      if (!constituencyId || !user) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const electionId =
          electionType === "lok_sabha" ? "loksabha_2024" : "vidhansabha_2024";

        // Fetch nomination deadline from elections doc
        const electionDocRef = doc(db, "elections", electionId);
        const electionSnap = await getDoc(electionDocRef);
        let deadline: string | null = null;
        if (electionSnap.exists()) {
          deadline = (electionSnap.data().nominationDeadline as string | null) ?? null;
          if (isMounted) setNominationDeadline(deadline);
        }

        const isEmulator = import.meta.env.VITE_USE_EMULATORS === "true";
        const projectId = String(import.meta.env.VITE_FIREBASE_PROJECT_ID);
        const region = "us-east1";

        const baseUrl = isEmulator
          ? `http://127.0.0.1:5001/${projectId}/${region}`
          : `https://${region}-${projectId}.cloudfunctions.net`;

        const url = new URL(`${baseUrl}/candidateFetch`);
        url.searchParams.append("constituency", constituencyId);
        url.searchParams.append("electionType", electionType);

        let appCheckToken = "";
        try {
          appCheckToken = isEmulator
            ? "emulator-token"
            : appCheck
              ? (await getToken(appCheck)).token
              : "";
        } catch {
          // ignore app check error in development
        }

        const response = await fetch(url.toString(), {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "X-Firebase-AppCheck": appCheckToken,
            "x-uid": user.uid,
          },
        });

        if (!response.ok) {
          const errData = (await response.json()) as { error?: string };
          throw new Error(errData.error ?? "Failed to fetch candidates");
        }

        const data = (await response.json()) as {
          candidates?: CandidateInfo[];
        };

        if (isMounted) {
          setCandidates(data.candidates ?? []);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "Failed to fetch candidates",
          );
          setIsLoading(false);
        }
      }
    }

    void fetchData();

    return () => {
      isMounted = false;
    };
  }, [constituencyId, electionType, user]);

  return { candidates, isLoading, error, nominationDeadline };
}
