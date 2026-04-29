import { collection, getDocs } from "firebase/firestore";
import { useState, useEffect } from "react";

import { db } from "@/lib/firebase";
import type { HistoricalWinner } from "@/shared/types/ward";

interface UseHistoricalWinnersResult {
  winners: HistoricalWinner[];
  isLoading: boolean;
  error: string | null;
}

export function useHistoricalWinners(
  constituencyId: string | null,
): UseHistoricalWinnersResult {
  const [winners, setWinners] = useState<HistoricalWinner[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchWinners() {
      if (!constituencyId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Assuming election ID is loksabha_2024 based on seed.ts
        const winnersRef = collection(
          db,
          "elections",
          "loksabha_2024",
          "winners",
        );
        const snapshot = await getDocs(winnersRef);

        if (isMounted) {
          const fetchedWinners: HistoricalWinner[] = [];
          snapshot.forEach((doc) => {
            fetchedWinners.push(doc.data() as HistoricalWinner);
          });
          // Sort by year DESC
          fetchedWinners.sort((a, b) => b.year - a.year);
          setWinners(fetchedWinners);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to fetch historical winners",
          );
          setIsLoading(false);
        }
      }
    }

    void fetchWinners();

    return () => {
      isMounted = false;
    };
  }, [constituencyId]);

  return { winners, isLoading, error };
}
