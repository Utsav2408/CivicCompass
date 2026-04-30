import { useState, useMemo, useEffect } from "react";

import { useAuth } from "@/features/login/useAuth";
import { PageLoader } from "@/shared/components/AshokaCakraLoader";
import type { PollingBooth } from "@/shared/types/map";

import { usePoliceStations } from "../hooks/usePoliceStations";
import { usePollingBooth } from "../hooks/usePollingBooth";
import { useUserLocation } from "../hooks/useUserLocation";
import { useWardSearch } from "../hooks/useWardSearch";


import { BoothBottomSheet } from "./BoothBottomSheet";
import { MapView } from "./MapView";
import { WardSearchBar } from "./WardSearchBar";


interface PollingBoothMapProps {
  initialCoords: { lat: number; lng: number } | null;
}

export function PollingBoothMap({ initialCoords }: PollingBoothMapProps) {
  const { user } = useAuth();
  const { coords: userCoords } = useUserLocation();
  const { booth: myBooth, isLoading: isBoothLoading } = usePollingBooth(user?.uid);
  
  const [searchQuery, setSearchQuery] = useState("");
  const { results: searchResults, isSearching } = useWardSearch(searchQuery);
  const [selectedBooth, setSelectedBooth] = useState<PollingBooth | null>(null);

  useEffect(() => {
    if (myBooth && !selectedBooth && !initialCoords) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedBooth(myBooth);
    }
  }, [myBooth, selectedBooth, initialCoords]);

  const city = myBooth?.city ?? "New Delhi";
  const { stations } = usePoliceStations(city, userCoords ?? undefined);

  const isLoading = isBoothLoading || (isSearching && searchQuery.length > 0);

  // Determine center of map
  const center = useMemo(() => {
    return selectedBooth?.coordinates ?? 
           initialCoords ?? 
           userCoords ?? 
           myBooth?.coordinates ?? 
           { lat: 28.6139, lng: 77.2090 };
  }, [selectedBooth, initialCoords, userCoords, myBooth]);

  const handleSelectBooth = (booth: PollingBooth) => {
    setSelectedBooth(booth);
    setSearchQuery(""); // Clear search
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100dvh", overflow: "hidden" }}>
      {isLoading && <PageLoader />}
      
      <WardSearchBar 
        value={searchQuery} 
        onChange={setSearchQuery} 
        results={searchResults}
        onSelect={handleSelectBooth}
      />

      <MapView 
        center={center}
        userCoords={userCoords}
        booth={selectedBooth ?? myBooth}
        stations={stations}
      />

      { (selectedBooth ?? myBooth) && (
        <BoothBottomSheet 
          booth={(selectedBooth ?? myBooth) as PollingBooth} 
          userCoords={userCoords} 
        />
      )}
    </div>
  );
}
