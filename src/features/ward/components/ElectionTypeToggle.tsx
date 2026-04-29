import { useTranslation } from "react-i18next";

import type { ElectionType } from "@/shared/types/ward";

interface ElectionTypeToggleProps {
  value: ElectionType;
  onChange: (value: ElectionType) => void;
}

export function ElectionTypeToggle({
  value,
  onChange,
}: ElectionTypeToggleProps) {
  const { t } = useTranslation();

  const options: { id: ElectionType; label: string }[] = [
    { id: "lok_sabha", label: t("ward.types.lok_sabha", "Lok Sabha") },
    { id: "vidhan_sabha", label: t("ward.types.vidhan_sabha", "Vidhan Sabha") },
  ];

  return (
    <div
      style={{
        display: "flex",
        background: "var(--border)",
        padding: "4px",
        borderRadius: "var(--radius-full)",
        width: "100%",
        maxWidth: "320px",
        margin: "0 auto",
      }}
      role="group"
      aria-label={t("ward.types.label", "Select Election Type")}
    >
      {options.map((option) => {
        const isActive = value === option.id;
        return (
          <button
            key={option.id}
            onClick={() => {
              onChange(option.id);
            }}
            aria-pressed={isActive}
            style={{
              flex: 1,
              padding: "var(--space-sm) var(--space-md)",
              border: "none",
              borderRadius: "calc(var(--radius-full) - 2px)",
              background: isActive ? "var(--sf)" : "transparent",
              color: isActive ? "#fff" : "var(--text-muted)",
              font: "var(--text-h2)",
              cursor: "pointer",
              transition: "var(--transition-fast)",
              outlineOffset: "2px",
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
