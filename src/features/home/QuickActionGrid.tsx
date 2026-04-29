import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

interface QuickActionProps {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  path: string;
  color: string;
}

function QuickActionCard({
  title,
  subtitle,
  icon,
  path,
  color,
}: QuickActionProps) {
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
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "var(--space-md)",
        padding: "var(--space-sm) 0",
      }}
    >
      {actions.map((action) => (
        <QuickActionCard key={action.id} {...action} />
      ))}
    </div>
  );
}
