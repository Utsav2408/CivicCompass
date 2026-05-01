import { collection, getDocs, query } from "firebase/firestore";
import { useEffect, useState } from "react";

import { db } from "@/lib/firebase";
import type { PollingBooth } from "@shared/types/map";

export function useAllPollingBooths(enabled: boolean) {
  const [booths, setBooths] = useState<PollingBooth[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!enabled) return;

    void (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const snapshot = await getDocs(query(collection(db, "pollingBooths")));
        const results: PollingBooth[] = [];
        snapshot.forEach((doc) => {
          results.push({ id: doc.id, ...doc.data() } as PollingBooth);
        });
        setBooths(results);
      } catch (err) {
        setError(
          err instanceof Error
            ? err
            : new Error("Failed to fetch polling booths"),
        );
      } finally {
        setIsLoading(false);
      }
    })();
  }, [enabled]);

  return {
    booths: enabled ? booths : [],
    isLoading: enabled ? isLoading : false,
    error: enabled ? error : null,
  };
}
