import type { PollingBooth } from "@/shared/types/map";
import { getDistance } from "@/shared/utils/haversine";

interface BoothBottomSheetProps {
  booth: PollingBooth;
  userCoords: { lat: number; lng: number } | null;
}

export function BoothBottomSheet({ booth, userCoords }: BoothBottomSheetProps) {
  const distance = userCoords 
    ? getDistance(userCoords.lat, userCoords.lng, booth.coordinates.lat, booth.coordinates.lng)
    : null;

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${booth.coordinates.lat},${booth.coordinates.lng}`;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        background: "var(--paper)",
        padding: "var(--space-lg)",
        borderTopLeftRadius: "var(--radius-xl)",
        borderTopRightRadius: "var(--radius-xl)",
        boxShadow: "0 -4px 20px rgba(0,0,0,0.15)",
        zIndex: 100,
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-md)",
      }}
    >
      <div style={{ width: "40px", height: "4px", background: "var(--border)", borderRadius: "2px", margin: "0 auto var(--space-xs)" }} />
      
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <h2 style={{ font: "var(--text-h1)", color: "var(--sf)", margin: 0 }}>
            {booth.name}
          </h2>
          <span style={{ font: "var(--text-h2)", color: "var(--in)" }}>
            #{booth.boothNumber}
          </span>
        </div>
        <p style={{ font: "var(--text-body)", color: "var(--text-muted)", margin: "4px 0" }}>
          {booth.address}
        </p>
        {distance !== null && (
          <p style={{ font: "var(--text-small)", color: "var(--in)", fontWeight: "600", margin: 0 }}>
            {distance.toFixed(1)} km away
          </p>
        )}
      </div>

      <div style={{ borderTop: "1px solid var(--border)", paddingTop: "var(--space-md)" }}>
        <p style={{ font: "var(--text-small)", color: "var(--text-muted)", margin: "0 0 var(--space-sm) 0" }}>
          Source: ECI Voter Portal
        </p>
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "var(--space-md)",
            background: "var(--sf)",
            color: "white",
            textDecoration: "none",
            borderRadius: "var(--radius-md)",
            font: "var(--text-h2)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          Get Directions
        </a>
      </div>
    </div>
  );
}
