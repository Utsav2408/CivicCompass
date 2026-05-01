import { collection, getDocs, query } from "firebase/firestore";
import { useEffect, useState } from "react";

import { db } from "@/lib/firebase";
import type { PollingBooth } from "@shared/types/map";

export function useWardSearch(searchQuery: string) {
  const [results, setResults] = useState<PollingBooth[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [allBooths, setAllBooths] = useState<PollingBooth[] | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const snapshot = await getDocs(query(collection(db, "pollingBooths")));
        const docs: PollingBooth[] = [];
        snapshot.forEach((doc) => {
          docs.push({ id: doc.id, ...doc.data() } as PollingBooth);
        });
        setAllBooths(docs);
      } catch {
        setAllBooths([]);
      }
    })();
  }, []);

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
      try {
        const normalizedQuery = searchQuery.trim().toLowerCase();
        const source = allBooths ?? [];
        const filtered = source
          .filter((booth) => {
            const fields = [
              booth.wardName,
              booth.name,
              booth.address,
              booth.constituency,
              booth.city,
            ]
              .filter(Boolean)
              .map((value) => value.toLowerCase());
            return fields.some((field) => field.includes(normalizedQuery));
          })
          .slice(0, 12);
        if (isMounted) {
          setResults(filtered);
        }
      } finally {
        if (isMounted) {
          setIsSearching(false);
        }
      }
    }, 250);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [searchQuery, allBooths]);

  return { results, isSearching };
}
