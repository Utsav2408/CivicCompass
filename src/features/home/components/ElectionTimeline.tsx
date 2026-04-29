import { useTranslation } from "react-i18next";

import { LotusMotif } from "@shared/components/LotusMotif";

import type { ElectionSchedule } from "../home.types";

interface ElectionTimelineProps {
  schedule: ElectionSchedule | null;
}

interface TimelineEvent {
  id: string;
  label: string;
  date: string;
  status: "past" | "current" | "upcoming";
  description: string;
}

export function ElectionTimeline({ schedule }: ElectionTimelineProps) {
  const { t } = useTranslation();

  if (!schedule?.announcementDate) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "var(--space-sm)",
          padding: "var(--space-xl) var(--space-md)",
          background: "var(--paper)",
          borderRadius: "var(--radius-lg)",
          border: "1px dashed var(--border)",
        }}
      >
        <LotusMotif size={48} petalOpacity={0.5} />
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "13px",
            color: "var(--text-muted)",
          }}
        >
          {t("home.timeline.empty")}
        </p>
      </div>
    );
  }

  const today = new Date().toISOString().slice(0, 10);

  const getStatus = (
    date: string | undefined,
  ): "past" | "current" | "upcoming" => {
    if (!date) return "upcoming";
    return date < today ? "past" : date === today ? "current" : "upcoming";
  };

  const events: TimelineEvent[] = [
    {
      id: "announcement",
      label: t("home.timeline.announcement"),
      date: schedule.announcementDate,
      description: t("home.timeline.announcement"), // Reusing label for simplicity as per requested flat keys
      status: getStatus(schedule.announcementDate),
    },
    {
      id: "nomination",
      label: t("home.timeline.nomination"),
      date: schedule.nominationDeadline ?? "TBD",
      description: t("home.timeline.nomination"),
      status: getStatus(schedule.nominationDeadline),
    },
    {
      id: "scrutiny",
      label: t("home.timeline.scrutiny"),
      date: schedule.scrutinyDate ?? "TBD",
      description: t("home.timeline.scrutiny"),
      status: getStatus(schedule.scrutinyDate),
    },
    {
      id: "withdrawal",
      label: t("home.timeline.withdrawal"),
      date: schedule.withdrawalDeadline ?? "TBD",
      description: t("home.timeline.withdrawal"),
      status: getStatus(schedule.withdrawalDeadline),
    },
    {
      id: "polling",
      label: t("home.timeline.polling"),
      date: schedule.pollingDate,
      description: t("home.timeline.polling"),
      status: getStatus(schedule.pollingDate),
    },
    {
      id: "results",
      label: t("home.timeline.results"),
      date: schedule.resultsDate ?? "TBD",
      description: t("home.timeline.results"),
      status: getStatus(schedule.resultsDate),
    },
  ];

  return (
    <section aria-labelledby="timeline-title">
      <h2
        id="timeline-title"
        style={{
          font: "var(--text-h2)",
          color: "var(--in)",
          marginBottom: "var(--space-md)",
          paddingLeft: "var(--space-xs)",
        }}
      >
        {t("home.timeline.title")}
      </h2>

      <div
        role="region"
        aria-label={t("home.timeline.title")}
        style={{
          display: "flex",
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          scrollBehavior: "smooth",
          gap: "var(--space-md)",
          paddingBottom: "var(--space-md)",
          paddingLeft: "2px",
          paddingRight: "var(--space-md)",
          msOverflowStyle: "none",
          scrollbarWidth: "none",
        }}
        className="no-scrollbar"
      >
        {events.map((event) => (
          <div
            key={event.id}
            style={{
              flex: "0 0 140px",
              scrollSnapAlign: "start",
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-xs)",
              cursor: "pointer",
              padding: "var(--space-sm)",
              background:
                event.status === "current" ? "var(--sf-l)" : "var(--paper)",
              borderRadius: "var(--radius-md)",
              border:
                event.status === "current"
                  ? "1px solid var(--sf)"
                  : event.status === "upcoming"
                    ? "1px solid var(--in-tint)"
                    : "1px solid var(--border)",
              boxShadow:
                event.status === "current" ? "var(--shadow-sm)" : "none",
              transition: "var(--transition-base)",
              opacity: event.status === "past" ? 0.7 : 1,
            }}
            title={event.description}
          >
            <div
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "var(--radius-full)",
                background:
                  event.status === "current" ? "var(--sf)" : "transparent",
                border:
                  event.status === "upcoming" ? "2px solid var(--in)" : "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: "12px",
              }}
            >
              {event.status === "past" && (
                <span style={{ color: "var(--bn)" }}>✓</span>
              )}
              {event.status === "current" && (
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    background: "#fff",
                    borderRadius: "var(--radius-full)",
                  }}
                />
              )}
            </div>

            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "13px",
                fontWeight: 700,
                color:
                  event.status === "past" ? "var(--text-muted)" : "var(--ch)",
              }}
            >
              {event.label}
            </p>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "11px",
                color: "var(--text-warm)",
              }}
            >
              {event.date}
            </p>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginTop: "var(--space-xs)",
        }}
      >
        <a
          href="https://eci.gov.in"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            background: "var(--tc-l)",
            color: "var(--tc)",
            padding: "4px 12px",
            borderRadius: "var(--radius-full)",
            fontFamily: "var(--font-body)",
            fontSize: "11px",
            fontWeight: 700,
            textDecoration: "none",
            border: "1px solid var(--tc-tint)",
          }}
        >
          {t("home.timeline.source")} ↗
        </a>
      </div>

      <style>
        {`
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
        `}
      </style>
    </section>
  );
}
