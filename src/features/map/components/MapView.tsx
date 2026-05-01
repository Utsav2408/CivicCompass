import {
  useMap,
  Map,
  AdvancedMarker,
  Pin,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";

import { PoliceStationMarker } from "@/features/map/components/PoliceStationMarker";
import type { PollingBooth, PoliceStation } from "@/shared/types/map";

const MAP_ID =
  (import.meta.env.VITE_GOOGLE_MAP_ID as string | undefined) ?? "DEMO_MAP_ID";

interface MapViewProps {
  center: { lat: number; lng: number };
  userCoords: { lat: number; lng: number } | null;
  booth: PollingBooth | null;
  searchedPlace: { lat: number; lng: number } | null;
  boothMarkers?: PollingBooth[];
  onBoothSelect?: (booth: PollingBooth) => void;
  stations: PoliceStation[];
  showDirections?: boolean;
  onDirectionsError?: (reason: string) => void;
}

export const MapView = memo(function MapView({
  center,
  userCoords,
  booth,
  searchedPlace,
  boothMarkers = [],
  onBoothSelect,
  stations,
  showDirections = false,
  onDirectionsError,
}: MapViewProps) {
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const hasMultiBoothMarkers = boothMarkers.length > 0;
  const firstBoothMarker = boothMarkers[0];
  const focusTarget = useMemo(() => {
    if (booth) return booth.coordinates;
    if (hasMultiBoothMarkers && boothMarkers.length === 1 && firstBoothMarker) {
      return firstBoothMarker.coordinates;
    }
    return null;
  }, [booth, hasMultiBoothMarkers, boothMarkers.length, firstBoothMarker]);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <Map
        mapId={MAP_ID}
        defaultCenter={center}
        defaultZoom={14}
        style={{ width: "100%", height: "100%" }}
        gestureHandling="greedy"
        disableDefaultUI={false}
        zoomControl={true}
        scrollwheel={true}
        keyboardShortcuts={true}
        disableDoubleClickZoom={false}
      >
        <MapCameraController center={center} focusTarget={focusTarget} />
        <MapInstanceBridge onMapReady={setMapInstance} />
        <DirectionsLayer
          origin={userCoords}
          destination={booth?.coordinates ?? null}
          enabled={showDirections}
          onError={onDirectionsError}
        />

        {/* User Location */}
        {userCoords && (
          <AdvancedMarker position={userCoords}>
            <Pin
              background={"#4285F4"}
              glyphColor={"#FFFFFF"}
              borderColor={"#FFFFFF"}
            />
          </AdvancedMarker>
        )}
        {searchedPlace && (
          <AdvancedMarker position={searchedPlace}>
            <Pin
              background={"#0F9D58"}
              glyphColor={"#FFFFFF"}
              borderColor={"#FFFFFF"}
            />
          </AdvancedMarker>
        )}

        {/* Polling Booth marker(s) (Saffron Ballot Box) */}
        {hasMultiBoothMarkers
          ? boothMarkers.map((markerBooth) => (
              <AdvancedMarker
                key={markerBooth.id}
                position={markerBooth.coordinates}
                onClick={() => {
                  onBoothSelect?.(markerBooth);
                }}
              >
                <div style={{ transform: "translateY(-50%)" }}>
                  <BoothPin />
                </div>
              </AdvancedMarker>
            ))
          : booth && (
              <AdvancedMarker
                position={booth.coordinates}
                onClick={() => {
                  onBoothSelect?.(booth);
                }}
              >
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
      <MapZoomControls map={mapInstance} />
    </div>
  );
});

function MapCameraController({
  center,
  focusTarget,
}: {
  center: { lat: number; lng: number };
  focusTarget: { lat: number; lng: number } | null;
}) {
  const map = useMap();
  const hasInitialized = useRef(false);
  const lastCenter = useRef<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!map) return;

    if (!hasInitialized.current) {
      hasInitialized.current = true;
      map.setCenter(center);
      lastCenter.current = center;
      return;
    }

    const previous = lastCenter.current;
    const movedEnough =
      !previous ||
      Math.abs(previous.lat - center.lat) > 0.0001 ||
      Math.abs(previous.lng - center.lng) > 0.0001;

    if (movedEnough) {
      map.panTo(center);
      lastCenter.current = center;
    }
  }, [map, center]);

  useEffect(() => {
    if (!map || !focusTarget) return;
    map.panTo(focusTarget);
    // Keep selected marker below the top overlays (search + banners).
    map.panBy(0, -120);
  }, [map, focusTarget]);

  return null;
}

function DirectionsLayer({
  origin,
  destination,
  enabled,
  onError,
}: {
  origin: { lat: number; lng: number } | null;
  destination: { lat: number; lng: number } | null;
  enabled: boolean;
  onError: ((reason: string) => void) | undefined;
}) {
  const map = useMap();
  const routesLibrary = useMapsLibrary("routes");
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  const rendererRef = useRef<google.maps.DirectionsRenderer | null>(null);

  useEffect(() => {
    if (!map || !routesLibrary) return;
    if (!rendererRef.current) {
      rendererRef.current = new routesLibrary.DirectionsRenderer({
        map,
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: "#0F9D58",
          strokeWeight: 6,
          strokeOpacity: 0.85,
        },
      });
    } else {
      rendererRef.current.setMap(map);
    }

    return () => {
      rendererRef.current?.setMap(null);
    };
  }, [map, routesLibrary]);

  useEffect(() => {
    if (!map || !routesLibrary || !rendererRef.current) return;

    if (!enabled) {
      rendererRef.current.setMap(null);
      return;
    }
    rendererRef.current.setMap(map);

    if (!origin || !destination) return;

    const directionsService = new routesLibrary.DirectionsService();
    void directionsService
      .route({
        origin,
        destination,
        travelMode: google.maps.TravelMode.DRIVING,
      })
      .then((result) => {
        rendererRef.current?.setDirections(result);
      })
      .catch((error: unknown) => {
        const statusText =
          error instanceof Error ? error.message : "UNKNOWN_ERROR";
        if (statusText.includes("REQUEST_DENIED")) {
          onError?.("REQUEST_DENIED");
          return;
        }
        onError?.(statusText);
      });
  }, [map, routesLibrary, enabled, origin, destination, onError]);

  return null;
}

function MapZoomControls({ map }: { map: google.maps.Map | null }) {
  const zoomIn = () => {
    if (!map) return;
    const currentZoom = map.getZoom() ?? 14;
    map.setZoom(currentZoom + 1);
  };

  const zoomOut = () => {
    if (!map) return;
    const currentZoom = map.getZoom() ?? 14;
    map.setZoom(Math.max(3, currentZoom - 1));
  };

  return (
    <div
      style={{
        position: "absolute",
        top: "132px",
        right: "16px",
        zIndex: "var(--z-overlay)",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      }}
    >
      <button
        type="button"
        onClick={zoomIn}
        aria-label="Zoom in"
        style={zoomButtonStyle}
      >
        +
      </button>
      <button
        type="button"
        onClick={zoomOut}
        aria-label="Zoom out"
        style={zoomButtonStyle}
      >
        -
      </button>
    </div>
  );
}

function MapInstanceBridge({
  onMapReady,
}: {
  onMapReady: (map: google.maps.Map | null) => void;
}) {
  const map = useMap();

  useEffect(() => {
    onMapReady(map);
  }, [map, onMapReady]);

  return null;
}

const zoomButtonStyle: CSSProperties = {
  width: "40px",
  height: "40px",
  border: "1px solid var(--border)",
  borderRadius: "10px",
  background: "var(--paper)",
  color: "var(--text)",
  fontSize: "24px",
  lineHeight: 1,
  cursor: "pointer",
  boxShadow: "var(--shadow-md)",
  display: "grid",
  placeItems: "center",
};

function BoothPin() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
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
