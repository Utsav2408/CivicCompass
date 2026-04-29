import { memo } from "react";
import { useTranslation } from "react-i18next";

import { MughalJaaliPattern } from "@/shared/components/MughalJaaliPattern";
import { RangoliCardAccent } from "@/shared/components/RangoliBorder";
import type { ProcessStep } from "@/shared/types/election";

interface ProcessStepCardProps {
  step: ProcessStep;
  isExpanded: boolean;
  onToggle: () => void;
  style?: React.CSSProperties; // For virtualization
}

function ProcessStepCardComponent({
  step,
  isExpanded,
  onToggle,
  style,
}: ProcessStepCardProps) {
  const { t } = useTranslation();
  return (
    <div style={{ ...style, paddingBottom: "var(--space-md)" }}>
      <div
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            onToggle();
          }
        }}
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        aria-label={step.title}
        style={{
          background: "var(--paper)",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--border)",
          boxShadow: isExpanded ? "var(--shadow-md)" : "var(--shadow-sm)",
          cursor: "pointer",
          position: "relative",
          overflow: "hidden",
          transition: "var(--transition-base)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Jaali Accent behind the title */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "60px",
            opacity: 0.04,
            pointerEvents: "none",
          }}
        >
          <MughalJaaliPattern color="var(--in)" tileSize={30} />
        </div>

        <div
          style={{
            padding: "var(--space-md)",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "var(--space-md)",
            }}
          >
            {/* Saffron Step Bubble */}
            <div
              style={{
                minWidth: "32px",
                height: "32px",
                borderRadius: "var(--radius-full)",
                background: "var(--sf)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                font: "var(--text-h2)",
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {step.stepOrder}
            </div>

            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "var(--space-sm)",
                }}
              >
                <h3
                  style={{
                    font: "var(--text-h2)",
                    color: "var(--in)", // Sacred Indigo
                    marginBottom: "var(--space-xs)",
                  }}
                >
                  {step.title}
                </h3>
                {/* Turmeric Gold Source Badge */}
                <span
                  style={{
                    background: "var(--gd-l)",
                    color: "var(--gd-dark)",
                    padding: "2px 8px",
                    borderRadius: "var(--radius-sm)",
                    fontSize: "10px",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.02em",
                    whiteSpace: "nowrap",
                  }}
                >
                  {step.source}
                </span>
              </div>
              <p
                style={{ font: "var(--text-body)", color: "var(--color-text)" }}
              >
                {step.description}
              </p>
            </div>
          </div>

          {/* Expandable Section */}
          {isExpanded && (
            <div
              style={{
                marginTop: "var(--space-md)",
                paddingTop: "var(--space-md)",
                borderTop: "1px dashed var(--border)",
                animation: "slide-up var(--duration-normal) var(--ease-out)",
              }}
            >
              <p
                style={{
                  font: "var(--text-body)",
                  color: "var(--color-text-secondary)",
                  lineHeight: 1.5,
                  marginBottom: "var(--space-md)",
                }}
              >
                {step.extendedDescription}
              </p>
              <a
                href={step.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.stopPropagation();
                }} // Prevent card toggle on link click
                style={{
                  color: "var(--sf)",
                  textDecoration: "none",
                  font: "var(--text-h2)",
                  fontSize: "13px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                {t("process.card.learn_more")} <span>→</span>
              </a>
            </div>
          )}
        </div>

        {/* Rangoli Bottom Accent */}
        <div aria-hidden="true" style={{ marginTop: "auto" }}>
          <RangoliCardAccent />
        </div>
      </div>
    </div>
  );
}

// Custom comparator for React.memo
export const ProcessStepCard = memo(ProcessStepCardComponent, (prev, next) => {
  return (
    prev.isExpanded === next.isExpanded &&
    prev.step.id === next.step.id &&
    prev.step.title === next.step.title &&
    prev.step.description === next.step.description &&
    prev.step.extendedDescription === next.step.extendedDescription
  );
});
