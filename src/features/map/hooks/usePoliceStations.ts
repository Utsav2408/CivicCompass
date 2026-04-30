import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";

import { db } from "@/lib/firebase";
import type { PoliceStation } from "@shared/types/map";
import { getDistance } from "@shared/utils/haversine";

export function usePoliceStations(
  city: string | undefined,
  userCoords?: { lat: number; lng: number },
) {
  const [stations, setStations] = useState<PoliceStation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (!city) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStations([]);
       
      setIsLoading(false);
      return;
    }

    async function fetchStations() {
      setIsLoading(true);
      setError(null);
      try {
        const q = query(
          collection(db, "policeStations"),
          where("city", "==", city),
          orderBy("latitude", "asc"),
        );
        const querySnapshot = await getDocs(q);

        if (isMounted) {
          const results: PoliceStation[] = [];
          querySnapshot.forEach((doc) => {
            results.push({ id: doc.id, ...doc.data() } as PoliceStation);
          });
          setStations(results);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err
              : new Error("Failed to fetch police stations"),
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void fetchStations();

    return () => {
      isMounted = false;
    };
  }, [city]);

  const sortedStations = useMemo(() => {
    if (!userCoords) return stations;

    return [...stations].sort((a, b) => {
      const distA = getDistance(
        userCoords.lat,
        userCoords.lng,
        a.latitude,
        a.longitude,
      );
      const distB = getDistance(
        userCoords.lat,
        userCoords.lng,
        b.latitude,
        b.longitude,
      );
      return distA - distB;
    });
  }, [stations, userCoords]);

  return { stations: sortedStations, isLoading, error };
}
