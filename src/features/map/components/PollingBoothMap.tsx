import { useState, useMemo, useEffect, useCallback } from "react";
import { useMapsLibrary } from "@vis.gl/react-google-maps";

import { useAuth } from "@/features/login/useAuth";
import { SectionLoader } from "@/shared/components/AshokaCakraLoader";
import { ScreenEmptyState, ScreenErrorState } from "@/shared/components/ScreenStates";
import { useOfflineStatus } from "@/shared/hooks/useOfflineStatus";
import type { PollingBooth } from "@/shared/types/map";

import { useAllPollingBooths } from "../hooks/useAllPollingBooths";
import { usePoliceStations } from "../hooks/usePoliceStations";
import { usePollingBooth } from "../hooks/usePollingBooth";
import { useUserLocation } from "../hooks/useUserLocation";
import { useWardSearch } from "../hooks/useWardSearch";


import { BoothBottomSheet } from "./BoothBottomSheet";
import { MapView } from "./MapView";
import type { PlaceSearchResult } from "./WardSearchBar";
import { WardSearchBar } from "./WardSearchBar";


interface PollingBoothMapProps {
  initialCoords: { lat: number; lng: number } | null;
}

export function PollingBoothMap({ initialCoords }: PollingBoothMapProps) {
  const { user } = useAuth();
  const isOffline = useOfflineStatus();
  const {
    coords: userCoords,
    requestCurrentLocation,
    permissionState,
    error: locationError,
  } = useUserLocation();
  const {
    booth: myBooth,
    isLoading: isBoothLoading,
    error: boothError,
  } = usePollingBooth(user?.uid);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [isDirectionsVisible, setIsDirectionsVisible] = useState(false);
  const [directionsError, setDirectionsError] = useState<string | null>(null);
  const [placeResults, setPlaceResults] = useState<PlaceSearchResult[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<PlaceSearchResult | null>(null);
  const placesLibrary = useMapsLibrary("places");
  const { results: searchResults, isSearching } = useWardSearch(searchQuery);
  const [selectedBooth, setSelectedBooth] = useState<PollingBooth | null>(null);
  const shouldLoadAllBooths = !myBooth && !isBoothLoading;
  const {
    booths: allBooths,
    isLoading: isAllBoothsLoading,
    error: allBoothsError,
  } =
    useAllPollingBooths(shouldLoadAllBooths);

  useEffect(() => {
    if (myBooth && !selectedBooth && !initialCoords) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedBooth(myBooth);
    }
  }, [myBooth, selectedBooth, initialCoords]);

  const savedOfflineBooth = useMemo(() => {
    if (!user?.uid) return null;
    const key = `saved-booth:${user.uid}`;
    const nextBooth = selectedBooth ?? myBooth;
    if (nextBooth) {
      localStorage.setItem(key, JSON.stringify(nextBooth));
      return nextBooth;
    }
    const cached = localStorage.getItem(key);
    if (!cached) return null;
    try {
      return JSON.parse(cached) as PollingBooth;
    } catch {
      return null;
    }
  }, [user, myBooth, selectedBooth]);

  const offlineBooth = isOffline ? savedOfflineBooth : null;
  const resolvedBooth = selectedBooth ?? myBooth ?? offlineBooth;
  const city = resolvedBooth?.city ?? "New Delhi";
  const nearestCoords =
    resolvedBooth?.coordinates ?? userCoords ?? undefined;
  const { stations, error: stationsError } = usePoliceStations(city, nearestCoords);

  const isLoading =
    isBoothLoading ||
    isAllBoothsLoading ||
    (isSearching && searchQuery.length > 0);

  // Determine center of map
  const fallbackBoothCenter = allBooths[0]?.coordinates ?? null;
  const resolvedCenter = useMemo(() => {
    return resolvedBooth?.coordinates ??
           initialCoords ?? 
           fallbackBoothCenter ??
           userCoords ?? 
           { lat: 28.6139, lng: 77.2090 };
  }, [resolvedBooth, initialCoords, userCoords, fallbackBoothCenter]);

  useEffect(() => {
    setMapCenter((prev) => {
      if (!prev) return resolvedCenter;
      const movedEnough =
        Math.abs(prev.lat - resolvedCenter.lat) > 0.0001 ||
        Math.abs(prev.lng - resolvedCenter.lng) > 0.0001;
      return movedEnough ? resolvedCenter : prev;
    });
  }, [resolvedCenter]);

  const handleSelectBooth = useCallback((booth: PollingBooth) => {
    setSelectedBooth(booth);
    setSelectedPlace(null);
    setSearchQuery(""); // Clear search
    setPlaceResults([]);
    setMapCenter(booth.coordinates);
    setIsDirectionsVisible(false);
    setDirectionsError(null);
  }, []);
  const handleSelectPlace = useCallback((place: PlaceSearchResult) => {
    setSelectedPlace(place);
    setSearchQuery(place.title);
    setPlaceResults([]);
    setMapCenter(place.coordinates);
    setIsDirectionsVisible(false);
    setDirectionsError(null);
  }, []);
  useEffect(() => {
    if (!placesLibrary || !searchQuery.trim()) {
      setPlaceResults([]);
      return;
    }

    const service = new placesLibrary.AutocompleteService();
    const timeoutId = window.setTimeout(() => {
      const request: google.maps.places.AutocompletionRequest = {
        input: searchQuery,
        componentRestrictions: { country: "in" },
        locationBias: userCoords
          ? {
              center: userCoords,
              radius: 30_000,
            }
          : null,
      };
      service.getPlacePredictions(
        request,
        (predictions) => {
          if (!predictions?.length) {
            setPlaceResults([]);
            return;
          }

          const geocoder = new google.maps.Geocoder();
          void Promise.all(
            predictions.slice(0, 5).map(async (prediction) => {
              const geocodeResult = await geocoder.geocode({ placeId: prediction.place_id });
              const location = geocodeResult.results[0]?.geometry.location;
              if (!location) return null;
              return {
                id: prediction.place_id,
                title: prediction.structured_formatting.main_text,
                subtitle: prediction.structured_formatting.secondary_text,
                coordinates: {
                  lat: location.lat(),
                  lng: location.lng(),
                },
              } satisfies PlaceSearchResult;
            }),
          ).then((resolvedPlaces) => {
            setPlaceResults(
              resolvedPlaces.filter(
                (place): place is NonNullable<typeof place> => place !== null,
              ),
            );
          });
        },
      );
    }, 250);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [placesLibrary, searchQuery, userCoords]);

  const activeBooth = selectedPlace ? null : resolvedBooth;
  const showAllBoothMarkers = !activeBooth && allBooths.length > 0;
  const mapError = boothError ?? allBoothsError ?? stationsError;
  const showEmptyState =
    !isLoading &&
    !mapError &&
    !activeBooth &&
    allBooths.length === 0 &&
    searchQuery.length === 0;

  const handleGetDirections = useCallback(async () => {
    if (!activeBooth) return;

    let resolvedCoords = userCoords;
    if (!resolvedCoords) {
      resolvedCoords = await requestCurrentLocation();
    }

    if (!resolvedCoords) {
      if (permissionState === "denied") {
        window.alert("Location access is blocked. Please allow location in browser site settings, then try again.");
      }
      return;
    }

    setMapCenter(activeBooth.coordinates);
    setIsDirectionsVisible(true);
    setDirectionsError(null);
  }, [activeBooth, userCoords, requestCurrentLocation, permissionState]);
  const isLocationEnabled = permissionState === "granted" || Boolean(userCoords);

  const openGoogleMapsFallback = useCallback(() => {
    if (!activeBooth) return;
    const destination = `${activeBooth.coordinates.lat},${activeBooth.coordinates.lng}`;
    const origin = userCoords ? `${userCoords.lat},${userCoords.lng}` : undefined;
    const params = new URLSearchParams({
      api: "1",
      destination,
      ...(origin ? { origin } : {}),
      travelmode: "driving",
    });
    window.open(`https://www.google.com/maps/dir/?${params.toString()}`, "_blank", "noopener,noreferrer");
  }, [activeBooth, userCoords]);

  const handleDirectionsError = useCallback((reason: string) => {
    setIsDirectionsVisible(false);
    setDirectionsError(reason);
    openGoogleMapsFallback();
  }, [openGoogleMapsFallback]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100dvh", overflow: "hidden" }}>
      {isLoading && (
        <div
          style={{
            position: "absolute",
            inset: "84px 16px auto 16px",
            zIndex: "var(--z-overlay)",
            background: "color-mix(in srgb, var(--paper) 88%, transparent)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            backdropFilter: "blur(2px)",
          }}
        >
          <SectionLoader label="Loading map details" />
        </div>
      )}
      {mapError && (
        <div style={{ position: "absolute", zIndex: "var(--z-overlay)", inset: "84px 16px auto 16px" }}>
          <ScreenErrorState
            message={mapError.message}
            retryLabel="Retry"
          />
        </div>
      )}
      {showEmptyState && (
        <div style={{ position: "absolute", zIndex: "var(--z-raised)", inset: "120px 16px auto 16px" }}>
          <ScreenEmptyState
            title="No polling booth data"
            message="No booth records are available yet. Try again after syncing data."
          />
        </div>
      )}
      {isOffline && activeBooth && (
        <div
          role="status"
          style={{
            position: "absolute",
            top: "84px",
            left: "16px",
            right: "16px",
            zIndex: "var(--z-overlay)",
            background: "var(--lo-l)",
            color: "var(--lo-text)",
            border: "1px solid var(--lo-tint)",
            borderRadius: "var(--radius-md)",
            padding: "8px 12px",
            textAlign: "center",
            fontSize: "13px",
            fontWeight: 600,
          }}
        >
          Offline - showing saved location
        </div>
      )}
      {!userCoords && locationError && (
        <div
          role="status"
          style={{
            position: "absolute",
            top: "84px",
            left: "16px",
            right: "16px",
            zIndex: "var(--z-overlay)",
            background: "color-mix(in srgb, var(--lo-l) 82%, white)",
            color: "var(--lo-text)",
            border: "1px solid var(--lo-tint)",
            borderRadius: "var(--radius-md)",
            padding: "8px 12px",
            textAlign: "center",
            fontSize: "12px",
            fontWeight: 600,
          }}
        >
          Location is off. Tap "Enable location to proceed" to open the permission prompt.
        </div>
      )}
      {directionsError && (
        <div
          role="status"
          style={{
            position: "absolute",
            top: userCoords ? "84px" : "132px",
            left: "16px",
            right: "16px",
            zIndex: "var(--z-overlay)",
            background: "color-mix(in srgb, var(--wa-l) 86%, white)",
            color: "var(--wa-text)",
            border: "1px solid var(--wa-tint)",
            borderRadius: "var(--radius-md)",
            padding: "8px 12px",
            textAlign: "center",
            fontSize: "12px",
            fontWeight: 600,
          }}
        >
          In-app route unavailable ({directionsError}). Opened directions in Google Maps.
        </div>
      )}
      
      <WardSearchBar 
        value={searchQuery} 
        onChange={setSearchQuery} 
        boothResults={searchResults}
        placeResults={placeResults}
        onSelectBooth={handleSelectBooth}
        onSelectPlace={handleSelectPlace}
      />

      <MapView 
        center={mapCenter ?? resolvedCenter}
        userCoords={userCoords}
        booth={activeBooth}
        searchedPlace={selectedPlace?.coordinates ?? null}
        boothMarkers={showAllBoothMarkers ? allBooths : []}
        onBoothSelect={handleSelectBooth}
        stations={stations}
        showDirections={isDirectionsVisible}
        onDirectionsError={handleDirectionsError}
      />

      { activeBooth && (
        <BoothBottomSheet 
          booth={activeBooth}
          userCoords={userCoords}
          isLocationEnabled={isLocationEnabled}
          onGetDirections={handleGetDirections}
        />
      )}
    </div>
  );
}
