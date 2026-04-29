import { useTranslation } from "react-i18next";

import type { HistoricalWinner } from "@/shared/types/ward";

interface HistoricalWinnerTableProps {
  winners: HistoricalWinner[];
}

export function HistoricalWinnerTable({ winners }: HistoricalWinnerTableProps) {
  const { t } = useTranslation();

  // Show only last 2 winners
  const displayWinners = winners.slice(0, 2);

  if (displayWinners.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        background: "var(--color-surface)",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--border)",
        overflow: "hidden",
      }}
    >
      <table
        role="table"
        style={{
          width: "100%",
          borderCollapse: "collapse",
          textAlign: "left",
        }}
      >
        <caption
          style={{
            padding: "var(--space-md)",
            font: "var(--text-h2)",
            color: "var(--text-warm)",
            borderBottom: "1px solid var(--border)",
            background: "var(--pg)",
            textAlign: "left",
          }}
        >
          {t("ward.history.title", "Historical Winners")}
        </caption>
        <thead>
          <tr
            style={{
              background: "var(--color-bg)",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <th
              scope="col"
              style={{
                padding: "var(--space-sm) var(--space-md)",
                font: "var(--text-small)",
                color: "var(--text-muted)",
                fontWeight: 600,
              }}
            >
              {t("ward.history.year", "Year")}
            </th>
            <th
              scope="col"
              style={{
                padding: "var(--space-sm) var(--space-md)",
                font: "var(--text-small)",
                color: "var(--text-muted)",
                fontWeight: 600,
              }}
            >
              {t("ward.history.candidate", "Candidate")}
            </th>
            <th
              scope="col"
              style={{
                padding: "var(--space-sm) var(--space-md)",
                font: "var(--text-small)",
                color: "var(--text-muted)",
                fontWeight: 600,
              }}
            >
              {t("ward.history.party", "Party")}
            </th>
            <th
              scope="col"
              style={{
                padding: "var(--space-sm) var(--space-md)",
                font: "var(--text-small)",
                color: "var(--text-muted)",
                fontWeight: 600,
                textAlign: "right",
              }}
            >
              {t("ward.history.margin", "Margin")}
            </th>
          </tr>
        </thead>
        <tbody>
          {displayWinners.map((winner) => (
            <tr
              key={winner.id}
              
              style={{
                borderBottom: "1px solid var(--border)",
              }}
            >
              <td
                
                style={{
                  padding: "var(--space-sm) var(--space-md)",
                  font: "var(--text-body)",
                }}
              >
                {winner.year}
              </td>
              <td
                
                style={{
                  padding: "var(--space-sm) var(--space-md)",
                  font: "var(--text-body)",
                  fontWeight: 600,
                  color: "var(--color-text)",
                }}
              >
                {winner.winnerName}
              </td>
              <td
                
                style={{ padding: "var(--space-sm) var(--space-md)" }}
              >
                <span
                  style={{
                    display: "inline-block",
                    padding: "2px 8px",
                    background: "var(--border)",
                    borderRadius: "var(--radius-sm)",
                    font: "var(--text-small)",
                    fontWeight: 700,
                  }}
                >
                  {winner.party}
                </span>
              </td>
              <td
                
                style={{
                  padding: "var(--space-sm) var(--space-md)",
                  font: "var(--text-body)",
                  textAlign: "right",
                }}
              >
                {winner.voteMargin.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
