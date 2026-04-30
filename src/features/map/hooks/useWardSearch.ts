import { collection, getDocs, limit, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";

import { db } from "@/lib/firebase";
import type { PollingBooth } from "@shared/types/map";

export function useWardSearch(searchQuery: string) {
  const [results, setResults] = useState<PollingBooth[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    let isMounted = true;

    if (!searchQuery.trim()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResults([]);
       
      setIsSearching(false);
      return;
    }

     
    setIsSearching(true);

    const timeoutId = setTimeout(() => {
      void (async () => {
        try {
          const q = query(
            collection(db, "pollingBooths"),
            where("wardName", ">=", searchQuery),
            where("wardName", "<=", searchQuery + "\uf8ff"),
            limit(10),
          );

          const querySnapshot = await getDocs(q);
          if (isMounted) {
            const docs: PollingBooth[] = [];
            querySnapshot.forEach((doc) => {
              docs.push({ id: doc.id, ...doc.data() } as PollingBooth);
            });
            setResults(docs);
          }
        } catch {
          // Ignore errors
        } finally {
          if (isMounted) {
            setIsSearching(false);
          }
        }
      })();
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [searchQuery]);

  return { results, isSearching };
}
