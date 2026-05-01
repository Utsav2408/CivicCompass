import { Suspense, useMemo } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useSearchParams } from "react-router-dom";

import { PollingBoothMap } from "@/features/map/components/PollingBoothMap";
import { PageLoader } from "@/shared/components/AshokaCakraLoader";
import { BottomNav } from "@/shared/components/BottomNav";




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
        <div role="alert" aria-live="assertive" style={{ padding: "20px", textAlign: "center", color: "var(--lo-text)" }}>
          <h2>Something went wrong loading the map.</h2>
          <button type="button" onClick={() => { window.location.reload(); }}>Retry</button>
        </div>
      }
    >
      <Suspense fallback={<PageLoader />}>
        <main
          style={{
            minHeight: "100dvh",
            display: "flex",
            flexDirection: "column",
            paddingBottom: "100px",
          }}
        >
          <PollingBoothMap initialCoords={initialCoords} />
          <BottomNav />
        </main>
      </Suspense>
    </ErrorBoundary>
  );
}
