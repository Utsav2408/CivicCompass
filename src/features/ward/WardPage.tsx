import { useState } from "react";
import { useTranslation } from "react-i18next";

import { AshokaCakraLoader } from "@/shared/components/AshokaCakraLoader";
import { BottomNav } from "@/shared/components/BottomNav";
import { LotusMotif } from "@/shared/components/LotusMotif";
import { ScreenErrorBoundary } from "@/shared/components/ScreenErrorBoundary";
import { useProfile } from "@/shared/hooks/useProfile";
import type { ElectionType } from "@/shared/types/ward";

import { CandidateList } from "./components/CandidateList";
import { ElectionTypeToggle } from "./components/ElectionTypeToggle";
import { HistoricalWinnerTable } from "./components/HistoricalWinnerTable";
import { PartyPerformanceChart } from "./components/PartyPerformanceChart";
import { useHistoricalWinners } from "./hooks/useHistoricalWinners";
import { usePartyData } from "./hooks/usePartyData";
import { useWardCandidates } from "./hooks/useWardCandidates";

export function WardPage() {
  const { t } = useTranslation();
  const { profile } = useProfile();

  // Using constituency from profile, fallback to null
  const constituencyId = profile?.constituency ?? null;

  const [electionType, setElectionType] = useState<ElectionType>("lok_sabha");

  // Fetch data
  const {
    parties,
    isLoading: isLoadingParties,
    error: partyError,
  } = usePartyData(constituencyId, electionType);
  const {
    candidates,
    isLoading: isLoadingCandidates,
    error: candidatesError,
    nominationDeadline,
  } = useWardCandidates(constituencyId, electionType);
  const {
    winners,
    isLoading: isLoadingWinners,
    error: winnersError,
  } = useHistoricalWinners(constituencyId);

  return (
    <ScreenErrorBoundary>
      <main
        style={{
          minHeight: "100dvh",
          background: "var(--color-bg)",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          paddingBottom: "100px", // space for BottomNav
        }}
      >
        <header
          style={{
            padding: "var(--space-md) var(--space-lg)",
            background: "var(--in)",
            color: "#fff",
            boxShadow: "var(--shadow-md)",
            position: "sticky",
            top: 0,
            zIndex: "var(--z-overlay)",
            textAlign: "center",
          }}
        >
          <h1 style={{ font: "var(--text-h1)", margin: 0 }}>
            {t("ward.title", "My Ward")}
          </h1>
          <p style={{ font: "var(--text-body)", opacity: 0.9, margin: 0 }}>
            {constituencyId ??
              t("ward.no_constituency", "Constituency Not Found")}
          </p>
        </header>

        <div
          style={{ padding: "var(--space-lg) var(--space-lg) var(--space-md)" }}
        >
          <ElectionTypeToggle value={electionType} onChange={setElectionType} />
        </div>

        <div
          style={{
            flex: 1,
            padding: "var(--space-md) var(--space-lg)",
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-xl)",
          }}
        >
          {/* Party Performance Section */}
          <section>
            <h2
              style={{
                font: "var(--text-h2)",
                color: "var(--color-text)",
                marginBottom: "var(--space-md)",
              }}
            >
              {t("ward.section.performance", "Party Performance")}
            </h2>
            {isLoadingParties ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  padding: "var(--space-xl)",
                }}
              >
                <AshokaCakraLoader size={48} color="var(--sf)" />
              </div>
            ) : partyError ? (
              <div
                style={{
                  background: "var(--lo-l)",
                  color: "var(--lo-text)",
                  padding: "var(--space-md)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--lo-tint)",
                }}
              >
                <p>{partyError}</p>
                <button
                  onClick={() => {
                    window.location.reload();
                  }}
                  style={{
                    marginTop: "8px",
                    background: "var(--lo)",
                    color: "#fff",
                    border: "none",
                    padding: "4px 12px",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  {t("ward.error.retry", "Retry")}
                </button>
              </div>
            ) : parties.length === 0 ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <LotusMotif />
                <p style={{ marginTop: "12px", color: "var(--text-muted)" }}>
                  {t("ward.empty", "No data available for this constituency")}
                </p>
              </div>
            ) : (
              <PartyPerformanceChart parties={parties} />
            )}
          </section>

          {/* Historical Winners Section */}
          <section>
            <h2
              style={{
                font: "var(--text-h2)",
                color: "var(--color-text)",
                marginBottom: "var(--space-md)",
              }}
            >
              {t("ward.section.history", "Historical Winners")}
            </h2>
            {isLoadingWinners ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  padding: "var(--space-xl)",
                }}
              >
                <AshokaCakraLoader size={48} color="var(--sf)" />
              </div>
            ) : winnersError ? (
              <div
                style={{
                  background: "var(--lo-l)",
                  color: "var(--lo-text)",
                  padding: "var(--space-md)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--lo-tint)",
                }}
              >
                <p>{winnersError}</p>
              </div>
            ) : winners.length === 0 ? (
              <p style={{ color: "var(--text-muted)", textAlign: "center" }}>
                {t("ward.empty", "No data available for this constituency")}
              </p>
            ) : (
              <HistoricalWinnerTable winners={winners} />
            )}
          </section>

          {/* Candidates Section */}
          <section>
            <h2
              style={{
                font: "var(--text-h2)",
                color: "var(--color-text)",
                marginBottom: "var(--space-md)",
              }}
            >
              {t("ward.section.candidates", "Candidates")}
            </h2>
            {isLoadingCandidates ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  padding: "var(--space-xl)",
                }}
              >
                <AshokaCakraLoader size={48} color="var(--in)" />
              </div>
            ) : candidatesError ? (
              <div
                style={{
                  background: "var(--lo-l)",
                  color: "var(--lo-text)",
                  padding: "var(--space-md)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--lo-tint)",
                }}
              >
                <p>{candidatesError}</p>
                <button
                  onClick={() => {
                    window.location.reload();
                  }}
                  style={{
                    marginTop: "8px",
                    background: "var(--lo)",
                    color: "#fff",
                    border: "none",
                    padding: "4px 12px",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  {t("ward.error.retry", "Retry")}
                </button>
              </div>
            ) : (
              <CandidateList
                candidates={candidates}
                nominationDeadline={nominationDeadline}
              />
            )}
          </section>
        </div>

        <BottomNav />
      </main>
    </ScreenErrorBoundary>
  );
}

export default WardPage;
