import { useTranslation } from "react-i18next";

import type { CandidateInfo } from "@/shared/types/ward";

import { CandidateCard } from "./CandidateCard";

interface CandidateListProps {
  candidates: CandidateInfo[];
  nominationDeadline: string | null;
}

export function CandidateList({
  candidates,
  nominationDeadline,
}: CandidateListProps) {
  const { t } = useTranslation();

  if (candidates.length === 0) {
    return (
      <div
        style={{
          padding: "var(--space-xl) var(--space-md)",
          textAlign: "center",
          background: "var(--color-surface)",
          border: "1px dashed var(--border)",
          borderRadius: "var(--radius-lg)",
        }}
      >
        <p
          style={{
            font: "var(--text-body)",
            color: "var(--text-muted)",
            marginBottom: "var(--space-sm)",
          }}
        >
          {t(
            "ward.candidates.no_nominations",
            "No candidates have filed nominations yet.",
          )}
        </p>
        {nominationDeadline && (
          <p
            style={{
              font: "var(--text-small)",
              color: "var(--text-warm)",
              fontWeight: 600,
            }}
          >
            {t("ward.candidates.deadline", "Nomination Deadline:")}{" "}
            {new Date(nominationDeadline).toLocaleDateString()}
          </p>
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-md)",
      }}
    >
      {candidates.map((candidate) => (
        <CandidateCard key={candidate.name} candidate={candidate} />
      ))}
    </div>
  );
}
