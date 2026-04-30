import { useMap, Map, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";
import { memo, useEffect } from "react";

import { PoliceStationMarker } from "@/features/map/components/PoliceStationMarker";
import type { PollingBooth, PoliceStation } from "@/shared/types/map";


interface MapViewProps {
  center: { lat: number; lng: number };
  userCoords: { lat: number; lng: number } | null;
  booth: PollingBooth | null;
  stations: PoliceStation[];
}

export const MapView = memo(function MapView({
  center,
  userCoords,
  booth,
  stations,
}: MapViewProps) {
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Map
        mapId="bf50a8734d974f66" // Example Map ID for Advanced Markers
        center={center}
        zoom={14}
        gestureHandling="greedy"
        disableDefaultUI={true}
      >
        <MapCleanup />
        
        {/* User Location */}
        {userCoords && (
          <AdvancedMarker position={userCoords}>
            <Pin background={"#4285F4"} glyphColor={"#FFFFFF"} borderColor={"#FFFFFF"} />
          </AdvancedMarker>
        )}

        {/* Polling Booth (Saffron Ballot Box) */}
        {booth && (
          <AdvancedMarker position={booth.coordinates}>
            <div style={{ transform: "translateY(-50%)" }}>
              <BoothPin />
            </div>
          </AdvancedMarker>
        )}

        {/* Police Stations */}
        {stations.map((station) => (
          <PoliceStationMarker key={station.id} station={station} />
        ))}
      </Map>
    </div>
  );
});

/**
 * Ensures map instance is cleaned up on unmount to prevent memory leaks
 */
function MapCleanup() {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const map = useMap();
  useEffect(() => {
    return () => {
      if (map) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
        if (typeof (map as any).unbindAll === "function") {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
          (map as any).unbindAll();
        }
      }
    };
  }, [map]);
  return null;
}

function BoothPin() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z"
        fill="#B84200" // Specific Saffron
        stroke="white"
        strokeWidth="1.5"
      />
      {/* Ballot Box Icon inside the pin */}
      <rect x="9" y="7" width="6" height="4" fill="white" rx="0.5" />
      <path d="M10 8H14" stroke="#B84200" strokeWidth="0.5" />
      <rect x="8" y="9" width="8" height="3" fill="white" rx="0.5" />
    </svg>
  );
}
