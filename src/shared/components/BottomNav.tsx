import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";

interface NavItemProps {
  to: string;
  label: string;
  icon: string;
  active: boolean;
}

function NavItem({ to, label, icon, active }: NavItemProps) {
  return (
    <Link
      to={to}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
        gap: "4px",
        textDecoration: "none",
        color: active ? "var(--sf)" : "var(--text-muted)",
        transition: "var(--transition-fast)",
      }}
    >
      <span
        style={{
          fontSize: "24px",
          filter: active ? "none" : "grayscale(1) opacity(0.7)",
        }}
        aria-hidden="true"
      >
        {icon}
      </span>
      <span
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "11px",
          fontWeight: active ? 700 : 500,
        }}
      >
        {label}
      </span>
    </Link>
  );
}

export function BottomNav() {
  const { t } = useTranslation();
  const location = useLocation();

  const navItems = [
    { path: "/home", label: t("nav.home"), icon: "🏛️" },
    { path: "/map", label: t("nav.map"), icon: "🗺️" },
    { path: "/ward", label: t("nav.ward"), icon: "🏘️" },
    { path: "/process", label: t("nav.process"), icon: "🗳️" },
    { path: "/support", label: t("nav.support"), icon: "✋" },
  ];

  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: "72px",
        background: "rgba(255, 252, 247, 0.95)",
        backdropFilter: "blur(12px)",
        borderTop: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        paddingBottom: "env(safe-area-inset-bottom)",
        zIndex: "var(--z-overlay)",
        boxShadow: "0 -4px 12px rgba(21, 15, 6, 0.04)",
      }}
    >
      {navItems.map((item) => (
        <NavItem
          key={item.path}
          to={item.path}
          label={item.label}
          icon={item.icon}
          active={location.pathname === item.path}
        />
      ))}
    </nav>
  );
}
