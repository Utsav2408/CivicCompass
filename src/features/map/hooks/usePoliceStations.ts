import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";

import { db } from "@/lib/firebase";
import type { PoliceStation } from "@shared/types/map";
import { getDistance } from "@shared/utils/haversine";

const TARGET_AREA_KEYWORDS = ["connaught", "karol", "paharganj"];

function normalizeCityName(city: string): string[] {
  const canonical = city.trim().toLowerCase();
  if (canonical === "new delhi" || canonical === "delhi") {
    return ["New Delhi", "Delhi"];
  }
  return [city];
}

function prioritizeTargetStations(stations: PoliceStation[]): PoliceStation[] {
  const targetMatches = stations.filter((station) =>
    TARGET_AREA_KEYWORDS.some((keyword) =>
      station.name.toLowerCase().includes(keyword),
    ),
  );

  if (targetMatches.length >= 3) {
    return targetMatches.slice(0, 3);
  }

  const targetIds = new Set(targetMatches.map((station) => station.id));
  const nearestFallback = stations.filter((station) => !targetIds.has(station.id));
  return [...targetMatches, ...nearestFallback].slice(0, 3);
}

export function usePoliceStations(
  city: string | undefined,
  userCoords?: { lat: number; lng: number },
) {
  const [stations, setStations] = useState<PoliceStation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const currentCity = city ?? "";
    if (!currentCity) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStations([]);
       
      setIsLoading(false);
      return;
    }

    async function fetchStations() {
      setIsLoading(true);
      setError(null);
      try {
        const cityCandidates = normalizeCityName(currentCity);
        const snapshots = await Promise.all(
          cityCandidates.map((cityName) =>
            getDocs(
              query(
                collection(db, "policeStations"),
                where("city", "==", cityName),
                orderBy("latitude", "asc"),
              ),
            ),
          ),
        );

        if (isMounted) {
          const deduped = new Map<string, PoliceStation>();
          snapshots.forEach((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              deduped.set(doc.id, { id: doc.id, ...doc.data() } as PoliceStation);
            });
          });
          setStations(Array.from(deduped.values()));
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
    const byDistance = !userCoords
      ? stations
      : [...stations].sort((a, b) => {
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

    return prioritizeTargetStations(byDistance);
  }, [stations, userCoords]);

  return { stations: sortedStations, isLoading, error };
}
