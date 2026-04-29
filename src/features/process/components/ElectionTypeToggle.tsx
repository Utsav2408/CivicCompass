import { useTranslation } from "react-i18next";

import type { ElectionType } from "@/shared/types/election";

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
    { id: "lok_sabha", label: t("process.types.lok_sabha") },
    { id: "vidhan_sabha", label: t("process.types.vidhan_sabha") },
  ];

  return (
    <div
      style={{
        display: "flex",
        background: "var(--border)",
        padding: "4px",
        borderRadius: "var(--radius-md)",
        width: "100%",
        maxWidth: "320px",
        margin: "0 auto",
      }}
      role="radiogroup"
      aria-label={t("process.types.label")}
    >
      {options.map((option) => {
        const isActive = value === option.id;
        return (
          <button
            key={option.id}
            onClick={() => {
              onChange(option.id);
            }}
            role="radio"
            aria-checked={isActive}
            style={{
              flex: 1,
              padding: "var(--space-sm) var(--space-md)",
              border: "none",
              borderRadius: "calc(var(--radius-md) - 2px)",
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
