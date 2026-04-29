import { useTranslation } from "react-i18next";

import { useCountdownTick } from "@features/home/hooks/useCountdownTick";
import { SectionLoader } from "@shared/components/AshokaCakraLoader";
import { getCurrentPhase } from "@shared/utils/electionPhase";

import type { ElectionSchedule } from "../home.types";

import { CountdownTimer } from "./CountdownTimer";

interface ElectionStatusCardProps {
  schedule: ElectionSchedule | null;
  isLoading?: boolean;
}

export function ElectionStatusCard({ schedule, isLoading }: ElectionStatusCardProps) {
  const { t } = useTranslation();
  const countdown = useCountdownTick(schedule?.pollingDate);

  const currentPhase = schedule ? getCurrentPhase(schedule) : null;

  if (isLoading) {
    return (
      <div
        style={{
          padding: "var(--space-xl)",
          background: "var(--paper)",
          borderRadius: "var(--radius-lg)",
          display: "flex",
          justifyContent: "center",
          boxShadow: "var(--shadow-md)",
        }}
      >
        <SectionLoader label={t("common.loading")} />
      </div>
    );
  }

  // If no schedule or countdown, hide the entire section
  if (!schedule || !countdown) return null;

  return (
    <section
      style={{
        background: "var(--paper)",
        borderRadius: "var(--radius-lg)",
        padding: "var(--space-lg)",
        boxShadow: "var(--shadow-lg)",
        border: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-md)",
        position: "relative",
        overflow: "hidden",
      }}
      aria-labelledby="election-status-title"
    >
      <div style={{ position: "relative", zIndex: 1 }}>
        <h2
          id="election-status-title"
          style={{
            font: "var(--text-h2)",
            color: "var(--text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            marginBottom: "var(--space-md)",
            textAlign: "center",
          }}
        >
          {schedule.type}
        </h2>

        <CountdownTimer
          days={countdown.days}
          hours={countdown.hours}
          minutes={countdown.minutes}
          isUrgent={countdown.isUrgent}
          sourceUrl={schedule.sourceUrl}
        />

        {currentPhase && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-sm)",
              marginTop: "var(--space-lg)",
              padding: "var(--space-sm) var(--space-md)",
              background: "var(--sf-l)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--sf-tint)",
            }}
          >
            <span style={{ fontSize: "18px" }}>🗳️</span>
            <div>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "var(--sf)",
                }}
              >
                {currentPhase.label}
              </p>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "11px",
                  color: "var(--text-warm)",
                }}
              >
                {t("home.voting_on")} {currentPhase.date}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
