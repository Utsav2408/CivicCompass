import { Suspense, useMemo } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useSearchParams } from "react-router-dom";

import { PollingBoothMap } from "@/features/map/components/PollingBoothMap";
import { PageLoader } from "@/shared/components/AshokaCakraLoader";




/**
 * MapPage — Screen 5
 * Page layer component that handles routing params and error boundaries.
 */
export function MapPage() {
  const [searchParams] = useSearchParams();

  // Read pre-selected booth coordinates from URL params
  const initialCoords = useMemo(() => {
    const lat = parseFloat(searchParams.get("lat") ?? "");
    const lng = parseFloat(searchParams.get("lng") ?? "");
    return !isNaN(lat) && !isNaN(lng) ? { lat, lng } : null;
  }, [searchParams]);

  return (
    <ErrorBoundary
      fallback={
        <div style={{ padding: "20px", textAlign: "center", color: "var(--lo-text)" }}>
          <h2>Something went wrong loading the map.</h2>
          <button onClick={() => { window.location.reload(); }}>Retry</button>
        </div>
      }
    >
      <Suspense fallback={<PageLoader />}>
        <PollingBoothMap initialCoords={initialCoords} />
      </Suspense>
    </ErrorBoundary>
  );
}
