import { useState, useMemo, useCallback } from "react";

import { usePoliceStations } from "@/features/map/hooks/usePoliceStations";
import { useUserLocation } from "@/features/map/hooks/useUserLocation";
import { useProfile } from "@/shared/hooks/useProfile";
import { getDistance } from "@/shared/utils/haversine";

/**
 * useEmergency — manages the SOS emergency state and finds the nearest police station.
 * Estimates ETA based on a default speed of 40 km/h.
 */
export function useEmergency() {
  const [isActive, setIsActive] = useState(false);
  const { profile } = useProfile();
  const { coords } = useUserLocation();
  
  // Attempt to find the city from the user profile's polling booth.
  // Default to New Delhi as a fallback for the lookup.
  const city = profile?.pollingBooth?.city ?? "New Delhi";
  
  const { stations } = usePoliceStations(city, coords ?? undefined);

  const activate = useCallback(() => {
    setIsActive(true);
  }, []);

  const cancel = useCallback(() => {
    setIsActive(false);
  }, []);

  const nearestStation = useMemo(() => {
    return stations[0] ?? null;
  }, [stations]);

  const eta = useMemo(() => {
    if (!coords || !nearestStation) return null;
    
    const distance = getDistance(
      coords.lat,
      coords.lng,
      nearestStation.latitude,
      nearestStation.longitude
    );
    
    // Estimate ETA assuming an average urban response speed of 40 km/h
    const timeInMinutes = (distance / 40) * 60;
    
    // Add a minimum 2-minute response time buffer
    return Math.max(2, Math.ceil(timeInMinutes));
  }, [coords, nearestStation]);

  return {
    isActive,
    activate,
    cancel,
    nearestStation,
    eta,
  };
}
