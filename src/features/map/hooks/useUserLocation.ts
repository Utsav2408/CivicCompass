import { useEffect, useState } from "react";

export function useUserLocation() {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [permissionState, setPermissionState] = useState<
    PermissionState | "prompt"
  >("prompt");
  const [error, setError] = useState<string | null>(null);

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

      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            if (isMounted) {
              setCoords({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              });
              setError(null);
            }
          },
          (err) => {
            if (isMounted) {
              setError(err.message);
            }
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
        );
      } else {
        if (isMounted) {
          setError("Geolocation is not supported by your browser");
        }
      }
    };

    void checkPermissionAndLocation();

    return () => {
      isMounted = false;
    };
  }, []);

  return { coords, permissionState, error };
}
