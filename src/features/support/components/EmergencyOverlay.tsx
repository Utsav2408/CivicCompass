import {
  useMap,
  Map,
  AdvancedMarker,
  Pin,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";
import { useState, useEffect, useMemo, memo } from "react";
import { useTranslation } from "react-i18next";

import { useUserLocation } from "@/features/map/hooks/useUserLocation";

import { useEmergency } from "../hooks/useEmergency";

// Declare google global to satisfy TypeScript since it's loaded asynchronously by APIProvider
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const google: any;

export const EmergencyOverlay = memo(function EmergencyOverlay() {
  const { t } = useTranslation();
  const { isActive, cancel, eta, nearestStation } = useEmergency();
  const [step, setStep] = useState<"alerting" | "alerted">("alerting");

  useEffect(() => {
    if (!isActive) return;

    const timer = setTimeout(() => {
      setStep("alerted");
    }, 2000);
    return () => {
      clearTimeout(timer);
      setStep("alerting"); // Reset when inactive or cleanup
    };
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(184, 0, 0, 0.98)", // Deep emergency red
        zIndex: "var(--z-sos)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        padding: "var(--space-lg)",
        animation: step === "alerting" ? "blink-red 0.5s infinite" : "none",
      }}
    >
      {/* Cancel Button */}
      <button
        type="button"
        onClick={cancel}
        aria-label={t("support.sos.aria.cancel", "Cancel emergency alert")}
        style={{
          position: "absolute",
          top: "var(--space-lg)",
          right: "var(--space-lg)",
          background: "rgba(255, 255, 255, 0.2)",
          border: "none",
          borderRadius: "50%",
          width: "44px",
          height: "44px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontSize: "24px",
          cursor: "pointer",
          zIndex: 10,
        }}
      >
        ✕
      </button>

      <div
        style={{
          textAlign: "center",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "32px",
            marginBottom: "var(--space-md)",
          }}
        >
          {step === "alerting"
            ? t("support.sos.alerting", "Alerting Authorities...")
            : t("support.sos.alerted", "Police Alerted")}
        </h1>

        <p
          style={{
            fontSize: "18px",
            opacity: 0.9,
            marginBottom: "var(--space-lg)",
          }}
        >
          {step === "alerting"
            ? t(
                "support.sos.connecting",
                "Connecting to the nearest control room...",
              )
            : t("support.sos.eta_msg", "Arriving in approx. {{eta}} minutes", {
                eta: eta ?? 3,
              })}
        </p>

        {nearestStation && (
          <p
            style={{
              fontSize: "16px",
              fontWeight: 700,
              marginBottom: "var(--space-md)",
            }}
          >
            {nearestStation.name} — {nearestStation.phone || "N/A"}
          </p>
        )}

        {step === "alerted" && (
          <div
            aria-label={t(
              "support.sos.aria.map",
              "Map showing route from nearest police station",
            )}
            style={{
              width: "100%",
              height: "300px",
              borderRadius: "var(--radius-lg)",
              overflow: "hidden",
              marginBottom: "var(--space-lg)",
              border: "2px solid white",
            }}
          >
            <EmergencyMap />
          </div>
        )}

        <p
          style={{
            fontSize: "12px",
            opacity: 0.7,
            maxWidth: "280px",
            margin: "0 auto",
          }}
        >
          {t(
            "support.sos.disclaimer",
            "IMPORTANT: For life-threatening emergencies, please call 100 directly.",
          )}
        </p>
      </div>

      <style>
        {`
          @keyframes blink-red {
            0% { background: rgba(184, 0, 0, 0.98); }
            50% { background: rgba(255, 0, 0, 0.98); }
            100% { background: rgba(184, 0, 0, 0.98); }
          }
        `}
      </style>
    </div>
  );
});

function EmergencyMap() {
  const { nearestStation } = useEmergency();
  const { coords: userCoords } = useEmergencyLocation();

  const center = useMemo(() => {
    return userCoords ?? { lat: 28.6139, lng: 77.209 };
  }, [userCoords]);

  return (
    <Map
      mapId="emergency_map"
      center={center}
      zoom={15}
      gestureHandling="none"
      disableDefaultUI={true}
    >
      <DirectionsLayer />
      {userCoords && (
        <AdvancedMarker position={userCoords}>
          <Pin
            background={"#4285F4"}
            glyphColor={"#FFFFFF"}
            borderColor={"#FFFFFF"}
          />
        </AdvancedMarker>
      )}
      {nearestStation && (
        <AdvancedMarker
          position={{
            lat: nearestStation.latitude,
            lng: nearestStation.longitude,
          }}
        >
          <Pin
            background={"#B80000"}
            glyphColor={"#FFFFFF"}
            borderColor={"#FFFFFF"}
          />
        </AdvancedMarker>
      )}
    </Map>
  );
}

function DirectionsLayer() {
  const map = useMap();
  const routesLibrary = useMapsLibrary("routes");

  const { nearestStation } = useEmergency();
  const { coords: userCoords } = useEmergencyLocation();

  useEffect(() => {
    if (!map || !routesLibrary || !nearestStation || !userCoords) return;

    /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
    const directionsService = new routesLibrary.DirectionsService();
    const directionsRenderer = new routesLibrary.DirectionsRenderer({
      map,
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: "#B80000",
        strokeWeight: 6,
      },
    });

    void directionsService.route(
      {
        origin: { lat: nearestStation.latitude, lng: nearestStation.longitude },
        destination: userCoords,
        travelMode: google.maps.TravelMode.DRIVING,
      },

      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          directionsRenderer.setDirections(result);
        }
      },
    );

    return () => {
      directionsRenderer.setMap(null);
    };
    /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
  }, [map, routesLibrary, nearestStation, userCoords]);

  return null;
}

function useEmergencyLocation() {
  return useUserLocation();
}
