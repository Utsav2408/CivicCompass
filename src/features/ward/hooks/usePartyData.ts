import { collection, getDocs } from "firebase/firestore";
import { useState, useEffect } from "react";

import { db } from "@/lib/firebase";
import type { PartyResult, ElectionType } from "@/shared/types/ward";

interface UsePartyDataResult {
  parties: PartyResult[];
  isLoading: boolean;
  error: string | null;
}

export function usePartyData(
  constituencyId: string | null,
  electionType: ElectionType,
): UsePartyDataResult {
  const [parties, setParties] = useState<PartyResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchPartyData() {
      // Don't fetch if constituencyId is missing, though party data is national in the seed script.
      if (!constituencyId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const electionId =
          electionType === "lok_sabha" ? "loksabha_2024" : "vidhansabha_2024";
        const resultsRef = collection(db, "elections", electionId, "results");
        const snapshot = await getDocs(resultsRef);

        if (isMounted) {
          const fetchedParties: PartyResult[] = [];
          snapshot.forEach((doc) => {
            fetchedParties.push(doc.data() as PartyResult);
          });
          setParties(fetchedParties);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "Failed to fetch party data",
          );
          setIsLoading(false);
        }
      }
    }

    void fetchPartyData();

    return () => {
      isMounted = false;
    };
  }, [constituencyId, electionType]);

  return { parties, isLoading, error };
}
