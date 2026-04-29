import { useTranslation } from "react-i18next";

interface CountdownTimerProps {
  days: number;
  hours: number;
  minutes: number;
  isUrgent: boolean;
  sourceUrl?: string;
}

function TimeUnit({ value, label, isUrgent }: { value: number; label: string; isUrgent: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minWidth: "60px",
      }}
    >
      <span
        style={{
          font: "var(--text-display)",
          fontSize: "42px",
          color: isUrgent ? "var(--sf)" : "var(--in)",
          animation: isUrgent ? "pulse-saffron 2s infinite" : "none",
          // Respect prefers-reduced-motion
          transition: "none",
        }}
        className={isUrgent ? "urgent-pulse" : ""}
      >
        {String(value).padStart(2, "0")}
      </span>
      <span
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "12px",
          fontWeight: 400,
          color: "var(--text-muted)",
          textTransform: "lowercase",
        }}
      >
        {label}
      </span>
      <style>
        {`
          @media (prefers-reduced-motion: reduce) {
            .urgent-pulse {
              animation: none !important;
            }
          }
        `}
      </style>
    </div>
  );
}

export function CountdownTimer({
  days,
  hours,
  minutes,
  isUrgent,
  sourceUrl,
}: CountdownTimerProps) {
  const { t } = useTranslation();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "var(--space-md)",
        width: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "var(--space-lg)",
          width: "100%",
        }}
        aria-label={`${days} days, ${hours} hours, and ${minutes} minutes remaining`}
      >
        <TimeUnit value={days} label={t("home.countdown.days")} isUrgent={isUrgent} />
        <TimeUnit value={hours} label={t("home.countdown.hours")} isUrgent={isUrgent} />
        <TimeUnit value={minutes} label={t("home.countdown.minutes")} isUrgent={isUrgent} />
      </div>

      {sourceUrl && (
        <div
          style={{
            marginTop: "var(--space-xs)",
            borderTop: "1px solid var(--border)",
            paddingTop: "var(--space-xs)",
            width: "100%",
            textAlign: "center",
          }}
        >
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t("home.source_eci_aria")}
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "10px",
              color: "var(--text-muted)",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px",
            }}
          >
            <span>Source:</span>
            <span style={{ textDecoration: "underline" }}>eci.gov.in</span>
            <span style={{ fontSize: "10px" }}>↗</span>
          </a>
        </div>
      )}
    </div>
  );
}
