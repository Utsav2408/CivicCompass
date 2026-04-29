import { useState, useMemo, memo } from "react";
import { useTranslation } from "react-i18next";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import type { PartyResult } from "@/shared/types/ward";

interface PartyPerformanceChartProps {
  parties: PartyResult[];
}

function PartyPerformanceChartBase({ parties }: PartyPerformanceChartProps) {
  const { t } = useTranslation();
  const [view, setView] = useState<"voteShare" | "seats">("voteShare");

  const data = useMemo(() => {
    return parties.map((p) => ({
      name: p.party,
      color: p.color,
      voteShare2019: p.voteShare2019 ?? 0,
      voteShare2024: p.voteShare2024 ?? 0,
      seats2019: p.seats2019 ?? 0,
      seats2024: p.seats2024 ?? 0,
    }));
  }, [parties]);

  if (data.length === 0) return null;

  return (
    <div
      style={{
        background: "var(--color-surface)",
        borderRadius: "var(--radius-lg)",
        padding: "var(--space-md)",
        border: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-md)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "var(--space-sm)",
        }}
      >
        <h3
          style={{
            font: "var(--text-h2)",
            margin: 0,
            color: "var(--text-warm)",
          }}
        >
          {t("ward.chart.title", "Party Performance")}
        </h3>

        {/* View Toggle */}
        <div
          style={{
            display: "flex",
            background: "var(--border)",
            borderRadius: "var(--radius-sm)",
            padding: "2px",
          }}
          role="radiogroup"
          aria-label={t("ward.chart.toggle_label", "Toggle Chart View")}
        >
          <button
            role="radio"
            aria-checked={view === "voteShare"}
            onClick={() => {
              setView("voteShare");
            }}
            style={{
              padding: "4px 8px",
              background:
                view === "voteShare" ? "var(--color-bg)" : "transparent",
              color:
                view === "voteShare"
                  ? "var(--color-text)"
                  : "var(--text-muted)",
              border: "none",
              borderRadius: "2px",
              font: "var(--text-small)",
              fontWeight: view === "voteShare" ? 600 : 400,
              cursor: "pointer",
            }}
          >
            {t("ward.chart.vote_share", "Vote Share %")}
          </button>
          <button
            role="radio"
            aria-checked={view === "seats"}
            onClick={() => {
              setView("seats");
            }}
            style={{
              padding: "4px 8px",
              background: view === "seats" ? "var(--color-bg)" : "transparent",
              color:
                view === "seats" ? "var(--color-text)" : "var(--text-muted)",
              border: "none",
              borderRadius: "2px",
              font: "var(--text-small)",
              fontWeight: view === "seats" ? 600 : 400,
              cursor: "pointer",
            }}
          >
            {t("ward.chart.seats", "Seats Won")}
          </button>
        </div>
      </div>

      <div 
        style={{ width: "100%", height: 300 }}
        role="region"
        aria-label={t("ward.chart.title", "Party Performance")}
      >
        <ResponsiveContainer>
          <BarChart
            data={data}
            accessibilityLayer
            margin={{ top: 20, right: 0, left: -20, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--border)"
            />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: "var(--text-muted)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "var(--text-muted)" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "var(--radius-md)",
                border: "none",
                boxShadow: "var(--shadow-md)",
                font: "var(--text-small)",
              }}
            />
            <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
            <Bar
              name="2019"
              dataKey={view === "voteShare" ? "voteShare2019" : "seats2019"}
              fill="var(--text-muted)"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              name="2024"
              dataKey={view === "voteShare" ? "voteShare2024" : "seats2024"}
              fill="var(--sf)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Terracotta Source Badge */}
      <div
        style={{
          background: "var(--tc-l)",
          color: "var(--tc)",
          padding: "var(--space-sm)",
          borderRadius: "var(--radius-sm)",
          font: "var(--text-small)",
          textAlign: "center",
          border: "1px solid var(--tc-tint)",
        }}
      >
        Source: Lok Dhaba, Trivedi Centre — tcpd.ashoka.edu.in
      </div>
    </div>
  );
}

export const PartyPerformanceChart = memo(PartyPerformanceChartBase);
