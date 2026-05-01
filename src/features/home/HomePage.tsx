/**
 * HomePage — Screen 2
 *
 * Primary dashboard for the user.
 * Displays election countdown, timeline milestones, and quick actions.
 */

import { useElectionSchedule } from "@features/home/useElectionSchedule";
import { BottomNav } from "@shared/components/BottomNav";
import { MughalJaaliPattern } from "@shared/components/MughalJaaliPattern";
import { ScreenErrorBoundary } from "@shared/components/ScreenErrorBoundary";
import {
  ScreenEmptyState,
  ScreenErrorState,
} from "@shared/components/ScreenStates";

import { QuickActionGrid } from "./QuickActionGrid";
import { TopBar } from "./TopBar";
import { ElectionStatusCard } from "./components/ElectionStatusCard";
import { ElectionTimeline } from "./components/ElectionTimeline";

export function HomePage() {
  const { schedule, isLoading, error } = useElectionSchedule("loksabha_2024");

  return (
    <ScreenErrorBoundary>
      <main
        style={{
          minHeight: "100dvh",
          background: "var(--color-bg)",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          paddingBottom: "100px", // Space for BottomNav
        }}
      >
        <TopBar />

        {/* Background Pattern — subtle Indigo theme */}
        <div
          style={{
            position: "absolute",
            top: "64px", // Below TopBar
            left: 0,
            right: 0,
            height: "220px",
            background:
              "linear-gradient(180deg, var(--in-l) 0%, var(--color-bg) 100%)",
            zIndex: 0,
          }}
        >
          <MughalJaaliPattern opacity={0.06} color="var(--in)" tileSize={48} />
        </div>

        <div
          style={{
            position: "relative",
            zIndex: 1,
            padding: "var(--space-md) var(--space-lg)",
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-lg)",
          }}
        >
          {error ? (
            <ScreenErrorState message={error} retryLabel="Retry" />
          ) : !isLoading && !schedule ? (
            <ScreenEmptyState
              title="No election schedule yet"
              message="We could not find election timeline data for this screen."
            />
          ) : (
            <>
              <ElectionStatusCard schedule={schedule} isLoading={isLoading} />
              <ElectionTimeline schedule={schedule} />
              <QuickActionGrid />
            </>
          )}

          {/* Footer Text */}
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "11px",
              color: "var(--text-muted)",
              textAlign: "center",
              marginTop: "var(--space-md)",
              lineHeight: 1.5,
              opacity: 0.8,
            }}
          >
            Stay informed. Stay empowered. Your vote is your power.
            <br />© 2024 CivicCompass
          </p>
        </div>

        <BottomNav />
      </main>
    </ScreenErrorBoundary>
  );
}
