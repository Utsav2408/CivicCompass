import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { List } from "react-window";

import { useProcessSteps } from "@/features/process/hooks/useProcessSteps";
import { AshokaCakraLoader } from "@/shared/components/AshokaCakraLoader";
import { BottomNav } from "@/shared/components/BottomNav";
import { LotusEmptyState } from "@/shared/components/LotusMotif";
import { ScreenErrorBoundary } from "@/shared/components/ScreenErrorBoundary";
import { ScreenErrorState } from "@/shared/components/ScreenStates";
import type { ElectionPhase, ElectionType } from "@/shared/types/election";

import { AIChatDrawer } from "./components/AIChatDrawer";
import { ElectionTypeToggle } from "./components/ElectionTypeToggle";
import { PhaseTabBar } from "./components/PhaseTabBar";
import { ProcessStepCard } from "./components/ProcessStepCard";

export function ProcessPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [electionType, setElectionType] = useState<ElectionType>("lok_sabha");
  const [phase, setPhase] = useState<ElectionPhase>("pre-election");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const { steps, isLoading, error } = useProcessSteps(electionType, phase);

  const handleBack = () => {
    void navigate("/home", { replace: true });
  };

  const handleToggle = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  const renderStep = ({
    index,
    style,
  }: {
    index: number;
    style: React.CSSProperties;
  }) => {
    const step = steps[index];
    if (!step) return null;
    return (
      <ProcessStepCard
        step={step}
        isExpanded={expandedId === step.id}
        onToggle={() => {
          handleToggle(step.id);
        }}
        style={style}
      />
    );
  };

  return (
    <ScreenErrorBoundary>
      <main
        style={{
          minHeight: "100dvh",
          background: "var(--color-bg)",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          paddingBottom: "100px",
        }}
      >
        {/* Header with Back Button */}
        <header
          style={{
            padding: "var(--space-md) var(--space-lg)",
            display: "flex",
            alignItems: "center",
            gap: "var(--space-md)",
            background: "var(--in)",
            color: "#fff",
            position: "sticky",
            top: 0,
            zIndex: "var(--z-overlay)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <button
            onClick={handleBack}
            aria-label={t("common.back")}
            style={{
              background: "rgba(255, 255, 255, 0.15)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              borderRadius: "var(--radius-full)",
              width: "40px",
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#fff",
              fontSize: "18px",
            }}
          >
            ←
          </button>
          <h1 style={{ font: "var(--text-h1)", margin: 0, flex: 1 }}>
            {t("process.title")}
          </h1>

          <button
            onClick={() => {
              setIsChatOpen(true);
            }}
            aria-label={t("process.ai.open_button_label")}
            aria-haspopup="dialog"
            style={{
              background: "var(--sf)",
              color: "#fff",
              border: "none",
              borderRadius: "var(--radius-full)",
              padding: "8px 16px",
              font: "var(--text-body)",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <span aria-hidden="true">🤖</span>
            <span>{t("process.ai.ask_ai")}</span>
          </button>
        </header>

        {/* Election Type Toggle */}
        <div
          style={{ padding: "var(--space-lg) var(--space-lg) var(--space-md)" }}
        >
          <ElectionTypeToggle value={electionType} onChange={setElectionType} />
        </div>

        {/* Phase Tab Bar */}
        <PhaseTabBar activePhase={phase} onPhaseChange={setPhase} />

        {/* Content Area */}
        <div
          style={{ flex: 1, padding: "var(--space-lg)", overflowX: "hidden" }}
        >
          {isLoading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                paddingTop: "var(--space-2xl)",
              }}
            >
              <AshokaCakraLoader size={64} color="var(--in)" />
            </div>
          ) : error ? (
            <ScreenErrorState
              message={error}
              retryLabel={t("process.error.retry")}
            />
          ) : steps.length === 0 ? (
            <LotusEmptyState
              title={t("process.empty.title")}
              message={t("process.empty.message")}
            />
          ) : steps.length > 8 ? (
            <div
              id={`panel-${phase}`}
              role="tabpanel"
              aria-labelledby={`tab-${phase}`}
              style={{ height: "calc(100vh - 300px)", width: "100%" }}
            >
              <List<Record<string, never>>
                rowCount={steps.length}
                rowHeight={140}
                rowComponent={renderStep}
                rowProps={{}}
                style={{ height: 600, width: "100%" }}
              />
            </div>
          ) : (
            <div
              id={`panel-${phase}`}
              role="tabpanel"
              aria-labelledby={`tab-${phase}`}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-md)",
              }}
            >
              {steps.map((step) => (
                <ProcessStepCard
                  key={step.id}
                  step={step}
                  isExpanded={expandedId === step.id}
                  onToggle={() => {
                    handleToggle(step.id);
                  }}
                />
              ))}
            </div>
          )}
        </div>

        <BottomNav />

        <AIChatDrawer
          isOpen={isChatOpen}
          onClose={() => {
            setIsChatOpen(false);
          }}
        />
      </main>
    </ScreenErrorBoundary>
  );
}
