import { useTranslation } from "react-i18next";

import type { CandidateInfo } from "@/shared/types/ward";

interface CandidateCardProps {
  candidate: CandidateInfo;
}

export function CandidateCard({ candidate }: CandidateCardProps) {
  const { t } = useTranslation();

  return (
    <article
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        padding: "var(--space-md)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-sm)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <h4
            style={{
              font: "var(--text-h2)",
              margin: 0,
              color: "var(--color-text)",
            }}
          >
            {candidate.name}
          </h4>
          <span
            style={{
              display: "inline-block",
              background: "var(--in-l)",
              color: "var(--in)",
              padding: "2px 8px",
              borderRadius: "var(--radius-sm)",
              font: "var(--text-small)",
              fontWeight: 600,
              marginTop: "4px",
            }}
          >
            {candidate.party}
            {candidate.symbol ? ` • ${candidate.symbol}` : ""}
          </span>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "var(--space-sm)",
          background: "var(--pg)",
          padding: "var(--space-sm)",
          borderRadius: "var(--radius-md)",
          marginTop: "4px",
        }}
      >
        <div>
          <span
            style={{
              font: "var(--text-label)",
              color: "var(--text-muted)",
              textTransform: "uppercase",
            }}
          >
            {t("ward.candidate.assets", "Total Assets")}
          </span>
          <p style={{ font: "var(--text-body)", fontWeight: 600, margin: 0 }}>
            {candidate.assetsTotal ?? "N/A"}
          </p>
        </div>
        <div>
          <span
            style={{
              font: "var(--text-label)",
              color: "var(--text-muted)",
              textTransform: "uppercase",
            }}
          >
            {t("ward.candidate.criminal_cases", "Criminal Cases")}
          </span>
          <p style={{ font: "var(--text-body)", fontWeight: 600, margin: 0 }}>
            {candidate.criminalCases ?? "N/A"}
          </p>
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <span
            style={{
              font: "var(--text-label)",
              color: "var(--text-muted)",
              textTransform: "uppercase",
            }}
          >
            {t("ward.candidate.education", "Education")}
          </span>
          <p style={{ font: "var(--text-body)", fontWeight: 600, margin: 0 }}>
            {candidate.education ?? "N/A"}
          </p>
        </div>
      </div>

      {/* Gemini AI Blurb */}
      <div
        style={{
          background:
            "linear-gradient(135deg, rgba(66,133,244,0.05), rgba(155,114,203,0.05))",
          border: "1px solid rgba(66,133,244,0.1)",
          borderRadius: "var(--radius-md)",
          padding: "var(--space-sm) var(--space-md)",
          marginTop: "var(--space-sm)",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            marginBottom: "4px",
          }}
        >
          <span aria-hidden="true" style={{ fontSize: "14px" }}>
            ✨
          </span>
          <span
            style={{
              font: "var(--text-label)",
              color: "#4285F4",
              fontWeight: 700,
            }}
          >
            AI SUMMARY
          </span>
        </div>
        <p
          style={{
            font: "var(--text-small)",
            color: "var(--text-warm)",
            margin: 0,
            fontStyle: "italic",
          }}
        >
          {/* Mocked summary until Gemini streaming is implemented for candidates */}
          {candidate.name} has declared {candidate.assetsTotal ?? "unknown"} in
          assets and {candidate.criminalCases ?? 0} criminal cases. Educational
          background is {candidate.education ?? "not specified"}.
        </p>
      </div>
    </article>
  );
}
