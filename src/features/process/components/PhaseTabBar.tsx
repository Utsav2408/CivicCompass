import { useRef } from "react";
import { useTranslation } from "react-i18next";

import type { ElectionPhase } from "@/shared/types/election";

interface PhaseTabBarProps {
  activePhase: ElectionPhase;
  onPhaseChange: (phase: ElectionPhase) => void;
}

export function PhaseTabBar({ activePhase, onPhaseChange }: PhaseTabBarProps) {
  const { t } = useTranslation();
  const tabListRef = useRef<HTMLDivElement>(null);

  const phases: { id: ElectionPhase; label: string }[] = [
    { id: "pre-election", label: t("process.phases.pre-election") },
    { id: "election-day", label: t("process.phases.election-day") },
    { id: "post-election", label: t("process.phases.post-election") },
  ];

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let nextIndex = -1;
    if (e.key === "ArrowRight") {
      nextIndex = (index + 1) % phases.length;
    } else if (e.key === "ArrowLeft") {
      nextIndex = (index - 1 + phases.length) % phases.length;
    }

    if (nextIndex !== -1 && tabListRef.current) {
      const nextTab = tabListRef.current.children[nextIndex] as HTMLElement;
      nextTab.focus();
      const selectedPhase = phases[nextIndex]?.id;
      if (selectedPhase) {
        onPhaseChange(selectedPhase);
      }
    }
  };

  return (
    <div
      ref={tabListRef}
      role="tablist"
      aria-label={t("process.phases.label")}
      style={{
        display: "flex",
        borderBottom: "1px solid var(--border)",
        background: "var(--paper)",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      {phases.map((phase, index) => {
        const isActive = activePhase === phase.id;
        return (
          <button
            key={phase.id}
            role="tab"
            aria-selected={isActive}
            aria-controls={`panel-${phase.id}`}
            id={`tab-${phase.id}`}
            tabIndex={isActive ? 0 : -1}
            onClick={() => {
              onPhaseChange(phase.id);
            }}
            onKeyDown={(e) => {
              handleKeyDown(e, index);
            }}
            style={{
              flex: 1,
              padding: "var(--space-md) var(--space-sm)",
              border: "none",
              background: "transparent",
              color: isActive ? "var(--sf)" : "var(--text-muted)",
              font: "var(--text-h2)",
              fontWeight: isActive ? 700 : 500,
              cursor: "pointer",
              position: "relative",
              transition: "var(--transition-fast)",
              outlineOffset: "-4px",
            }}
          >
            {phase.label}
            {isActive && (
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: "20%",
                  right: "20%",
                  height: "3px",
                  background: "var(--sf)",
                  borderRadius: "var(--radius-full) var(--radius-full) 0 0",
                }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
