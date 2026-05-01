import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { useProfile } from "@/shared/hooks/useProfile";

interface QuickActionProps {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  path: string;
  color: string;
  disabled?: boolean;
  onDisabledClick?: () => void;
}

function QuickActionCard({
  title,
  subtitle,
  icon,
  path,
  color,
  disabled = false,
  onDisabledClick,
}: QuickActionProps) {
  if (disabled) {
    return (
      <button
        type="button"
        onClick={onDisabledClick}
        aria-disabled="true"
        style={{
          background: "var(--paper)",
          borderRadius: "var(--radius-lg)",
          padding: "var(--space-md)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-xs)",
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow-sm)",
          minHeight: "120px",
          position: "relative",
          overflow: "hidden",
          opacity: 0.7,
          cursor: "not-allowed",
          textAlign: "left",
        }}
      >
        <div
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "var(--radius-md)",
            background: `${color}15`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "24px",
            marginBottom: "var(--space-xs)",
            filter: "grayscale(1)",
          }}
        >
          {icon}
        </div>
        <h3
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "14px",
            fontWeight: 700,
            color: "var(--ch)",
          }}
        >
          {title}
        </h3>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "11px",
            color: "var(--text-muted)",
            lineHeight: 1.3,
          }}
        >
          {subtitle}
        </p>
      </button>
    );
  }

  return (
    <Link
      to={path}
      style={{
        background: "var(--paper)",
        borderRadius: "var(--radius-lg)",
        padding: "var(--space-md)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-xs)",
        textDecoration: "none",
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow-sm)",
        transition: "var(--transition-base)",
        minHeight: "120px",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "var(--shadow-md)";
        e.currentTarget.style.borderColor = color;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.boxShadow = "var(--shadow-sm)";
        e.currentTarget.style.borderColor = "var(--border)";
      }}
    >
      <div
        style={{
          width: "44px",
          height: "44px",
          borderRadius: "var(--radius-md)",
          background: `${color}15`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "24px",
          marginBottom: "var(--space-xs)",
        }}
      >
        {icon}
      </div>
      <h3
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "14px",
          fontWeight: 700,
          color: "var(--ch)",
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "11px",
          color: "var(--text-muted)",
          lineHeight: 1.3,
        }}
      >
        {subtitle}
      </p>
    </Link>
  );
}

export function QuickActionGrid() {
  const { t } = useTranslation();
  const { profile } = useProfile();
  const [showProfilePrompt, setShowProfilePrompt] = useState(false);

  const canOpenWard = Boolean(profile?.constituency);
  const canOpenBooth = Boolean(profile?.pollingBooth?.coordinates);

  const showPrompt = () => {
    setShowProfilePrompt(true);
    window.setTimeout(() => {
      setShowProfilePrompt(false);
    }, 2500);
  };

  const actions: QuickActionProps[] = [
    {
      id: "process",
      title: t("home.actions.process"),
      subtitle: t("home.actions.process_sub"),
      icon: "🗳️",
      path: "/process",
      color: "var(--sf)",
    },
    {
      id: "ward",
      title: t("home.actions.ward"),
      subtitle: t("home.actions.ward_sub"),
      icon: "🏘️",
      path: "/ward",
      color: "var(--bn)",
    },
    {
      id: "booth",
      title: t("home.actions.booth"),
      subtitle: t("home.actions.booth_sub"),
      icon: "📍",
      path: "/map",
      color: "var(--in)",
    },
    {
      id: "issue",
      title: t("home.actions.report"),
      subtitle: t("home.actions.report_sub"),
      icon: "✋",
      path: "/support",
      color: "var(--lo)",
    },
  ];

  return (
    <>
      {showProfilePrompt && (
        <div
          role="status"
          aria-live="polite"
          style={{
            marginBottom: "var(--space-sm)",
            background: "var(--in)",
            color: "#fff",
            padding: "8px 12px",
            borderRadius: "var(--radius-md)",
            fontFamily: "var(--font-body)",
            fontSize: "12px",
            textAlign: "center",
          }}
        >
          {t(
            "ward.profile_required",
            "Update your profile to access Ward and Booth data.",
          )}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "var(--space-md)",
          padding: "var(--space-sm) 0",
        }}
      >
        {actions.map((action) => (
          <QuickActionCard
            key={action.id}
            {...action}
            disabled={
              (action.id === "ward" && !canOpenWard) ||
              (action.id === "booth" && !canOpenBooth)
            }
            onDisabledClick={showPrompt}
          />
        ))}
      </div>
    </>
  );
}
