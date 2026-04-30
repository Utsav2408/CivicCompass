import { AdvancedMarker, InfoWindow, useAdvancedMarkerRef } from "@vis.gl/react-google-maps";
import { useState } from "react";

import type { PoliceStation } from "@/shared/types/map";

interface PoliceStationMarkerProps {
  station: PoliceStation;
}

export function PoliceStationMarker({ station }: PoliceStationMarkerProps) {
  const [open, setOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const [markerRef, marker] = useAdvancedMarkerRef();

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={{ lat: station.latitude, lng: station.longitude }}
        onClick={() => { setOpen(true); }}
        title={station.name}
      >
        <div
          style={{
            background: "#0055A4", // Blue
            color: "white",
            width: "24px",
            height: "24px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            font: "bold 12px sans-serif",
            border: "2px solid white",
            boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
          }}
        >
          P
        </div>
      </AdvancedMarker>

      {open && (
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        <InfoWindow anchor={marker} onCloseClick={() => { setOpen(false); }}>
          <div style={{ padding: "4px", color: "var(--text)" }}>
            <h3 style={{ margin: "0 0 4px 0", fontSize: "14px", fontWeight: "600" }}>{station.name}</h3>
            <p style={{ margin: "0 0 4px 0", fontSize: "12px" }}>{station.city}</p>
            {station.phone && (
              <a 
                href={`tel:${station.phone}`}
                style={{ fontSize: "12px", color: "var(--in)", textDecoration: "none" }}
              >
                📞 {station.phone}
              </a>
            )}
          </div>
        </InfoWindow>
      )}
    </>
  );
}
