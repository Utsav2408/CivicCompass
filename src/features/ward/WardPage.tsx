import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { AshokaCakraLoader } from "@/shared/components/AshokaCakraLoader";
import { BottomNav } from "@/shared/components/BottomNav";
import { LotusMotif } from "@/shared/components/LotusMotif";
import { ScreenErrorBoundary } from "@/shared/components/ScreenErrorBoundary";
import {
  ScreenEmptyState,
  ScreenErrorState,
  ScreenLoadingState,
} from "@/shared/components/ScreenStates";
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
  const navigate = useNavigate();
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

  const hasAnyError = [partyError, winnersError, candidatesError].some(
    (errorMessage) => errorMessage != null,
  );
  const firstError =
    partyError ?? winnersError ?? candidatesError ?? "Failed to load ward data.";
  const isAnyLoading = isLoadingParties || isLoadingCandidates || isLoadingWinners;
  const isAllEmpty =
    Boolean(constituencyId) &&
    !isAnyLoading &&
    !hasAnyError &&
    parties.length === 0 &&
    winners.length === 0 &&
    candidates.length === 0;

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
          {isAnyLoading && (
            <ScreenLoadingState label={t("common.loading", "Loading...")} />
          )}

          {hasAnyError && (
            <ScreenErrorState
              message={firstError}
              retryLabel={t("ward.error.retry", "Retry")}
            />
          )}

          {isAllEmpty && (
            <ScreenEmptyState
              title={t("ward.empty_title", "No ward data yet")}
              message={t("ward.empty", "No data available for this constituency")}
            />
          )}

          {/* Party Performance Section */}
          {!constituencyId && (
            <section
              style={{
                background: "var(--paper)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-lg)",
                padding: "var(--space-lg)",
                textAlign: "center",
              }}
            >
              <h2
                style={{
                  font: "var(--text-h2)",
                  color: "var(--text-warm)",
                  marginBottom: "var(--space-sm)",
                }}
              >
                {t("ward.profile_required_title", "Complete profile to continue")}
              </h2>
              <p
                style={{
                  font: "var(--text-body)",
                  color: "var(--text-muted)",
                  marginBottom: "var(--space-md)",
                }}
              >
                {t(
                  "ward.profile_required_desc",
                  "Please update your constituency in Personalization to view Ward insights.",
                )}
              </p>
              <button
                type="button"
                onClick={() => {
                  void navigate("/personalization");
                }}
                style={{
                  background: "var(--sf)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "var(--radius-md)",
                  padding: "10px 14px",
                  cursor: "pointer",
                  font: "var(--text-h2)",
                }}
              >
                {t("ward.complete_profile", "Update Profile")}
              </button>
            </section>
          )}

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
            {!constituencyId ? (
              <p style={{ color: "var(--text-muted)", textAlign: "center" }}>
                {t("ward.profile_required", "Update profile to access Ward data.")}
              </p>
            ) : isLoadingParties ? (
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
              <ScreenErrorState
                message={partyError}
                retryLabel={t("ward.error.retry", "Retry")}
              />
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
            {!constituencyId ? (
              <p style={{ color: "var(--text-muted)", textAlign: "center" }}>
                {t("ward.profile_required", "Update profile to access Ward data.")}
              </p>
            ) : isLoadingWinners ? (
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
              <ScreenErrorState
                message={winnersError}
                retryLabel={t("ward.error.retry", "Retry")}
              />
            ) : winners.length === 0 ? (
              <ScreenEmptyState
                title={t("ward.empty_title", "No ward data yet")}
                message={t("ward.empty", "No data available for this constituency")}
              />
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
            {!constituencyId ? (
              <p style={{ color: "var(--text-muted)", textAlign: "center" }}>
                {t("ward.profile_required", "Update profile to access Ward data.")}
              </p>
            ) : isLoadingCandidates ? (
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
              <ScreenErrorState
                message={candidatesError}
                retryLabel={t("ward.error.retry", "Retry")}
              />
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
