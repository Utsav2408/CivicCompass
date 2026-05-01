import { useCallback, useEffect, useState } from "react";

export function useUserLocation() {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [permissionState, setPermissionState] = useState<
    PermissionState | "prompt"
  >("prompt");
  const [error, setError] = useState<string | null>(null);

  const requestCurrentLocation = useCallback(async () => {
    if (!("geolocation" in navigator)) {
      setError("Geolocation is not supported by your browser");
      return null;
    }

    return await new Promise<{ lat: number; lng: number } | null>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const nextCoords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCoords(nextCoords);
          setError(null);
          setPermissionState("granted");
          resolve(nextCoords);
        },
        (err) => {
          setError(err.message);
          if (err.code === err.PERMISSION_DENIED) {
            setPermissionState("denied");
          }
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
      );
    });
  }, []);

  useEffect(() => {
    let isMounted = true;

    const checkPermissionAndLocation = async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (navigator.permissions && "query" in navigator.permissions) {
          const status = await navigator.permissions.query({
            name: "geolocation",
          });
          if (isMounted) {
            setPermissionState(status.state);
          }
          status.onchange = () => {
            if (isMounted) {
              setPermissionState(status.state);
            }
          };
        }
      } catch {
        // Some browsers don't support permissions API properly, ignore
      }

      if (!("geolocation" in navigator)) {
        if (isMounted) {
          setError("Geolocation is not supported by your browser");
        }
        return;
      }

      await requestCurrentLocation();
    };

    void checkPermissionAndLocation();

    return () => {
      isMounted = false;
    };
  }, [requestCurrentLocation]);

  return { coords, permissionState, error, requestCurrentLocation };
}
