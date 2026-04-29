import { useState } from "react";
import { useTranslation } from "react-i18next";

import { useProfile } from "@/shared/hooks/useProfile";

function LanguageToggle() {
  const { i18n, t } = useTranslation();
  const isHindi = i18n.language === "hi";

  function toggle() {
    void i18n.changeLanguage(isHindi ? "en" : "hi");
  }

  return (
    <button
      onClick={toggle}
      aria-label={t("lang.toggle_aria")}
      aria-pressed={isHindi}
      type="button"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "2px",
        background: "rgba(255, 255, 255, 0.15)",
        border: "1px solid rgba(255, 255, 255, 0.3)",
        borderRadius: "var(--radius-full)",
        padding: "4px",
        cursor: "pointer",
        minWidth: "64px",
        justifyContent: "center",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "11px",
          fontWeight: isHindi ? 400 : 700,
          color: isHindi ? "rgba(255, 255, 255, 0.7)" : "#fff",
          padding: "2px 6px",
          borderRadius: "var(--radius-full)",
          background: isHindi ? "transparent" : "rgba(255, 255, 255, 0.2)",
          transition: "var(--transition-fast)",
        }}
      >
        EN
      </span>
      <span
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "11px",
          fontWeight: isHindi ? 700 : 400,
          color: isHindi ? "#fff" : "rgba(255, 255, 255, 0.7)",
          padding: "2px 6px",
          borderRadius: "var(--radius-full)",
          background: isHindi ? "rgba(255, 255, 255, 0.2)" : "transparent",
          transition: "var(--transition-fast)",
        }}
      >
        हि
      </span>
    </button>
  );
}

export function TopBar() {
  const { t } = useTranslation();
  const { profile } = useProfile();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <header
      style={{
        padding: "var(--space-md) var(--space-lg)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "var(--in)",
        color: "#fff",
        position: "sticky",
        top: 0,
        zIndex: "var(--z-overlay)",
        boxShadow: "var(--shadow-md)",
      }}
    >
      {/* Constituency Chip */}
      <button
        onClick={() => {
          setIsSearchOpen(true);
        }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-sm)",
          background: "rgba(255, 255, 255, 0.12)",
          border: "1px solid rgba(255, 255, 255, 0.25)",
          borderRadius: "var(--radius-full)",
          padding: "6px 12px",
          cursor: "pointer",
          color: "#fff",
          maxWidth: "200px",
        }}
      >
        <span style={{ fontSize: "16px" }}>📍</span>
        <span
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "13px",
            fontWeight: 600,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {profile?.constituency ?? t("home.topbar.constituency")}
        </span>
        <span style={{ fontSize: "10px", opacity: 0.8 }}>▼</span>
      </button>

      <LanguageToggle />

      {/* Simple Search Overlay (Stub) */}
      {isSearchOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "var(--paper)",
            zIndex: "var(--z-sos)",
            padding: "var(--space-xl) var(--space-lg)",
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
            }}
          >
            <h2 style={{ font: "var(--text-h2)", color: "var(--in)" }}>
              {t("home.topbar.change")}
            </h2>
            <button
              onClick={() => {
                setIsSearchOpen(false);
              }}
              style={{
                background: "none",
                border: "none",
                fontSize: "24px",
                cursor: "pointer",
              }}
            >
              ✕
            </button>
          </div>
          <input
            type="text"
            placeholder={t("home.topbar.search_placeholder")}
            style={{
              width: "100%",
              padding: "var(--space-md)",
              borderRadius: "var(--radius-md)",
              border: "2px solid var(--border)",
              fontFamily: "var(--font-body)",
              fontSize: "16px",
            }}
          />
          <p
            style={{
              fontSize: "12px",
              color: "var(--text-muted)",
              textAlign: "center",
            }}
          >
            (Search results would appear here)
          </p>
        </div>
      )}
    </header>
  );
}
