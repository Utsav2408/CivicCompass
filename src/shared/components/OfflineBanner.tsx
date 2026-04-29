import { useTranslation } from "react-i18next";

import { useOfflineStatus } from "@shared/hooks/useOfflineStatus";

/**
 * OfflineBanner — Displays a subtle warning strip when the user is offline.
 * Disappears automatically when the connection is restored.
 */
export function OfflineBanner() {
  const isOffline = useOfflineStatus();
  const { t } = useTranslation();

  if (!isOffline) return null;

  return (
    <div
      role="alert"
      style={{
        background: "var(--lo-l)",
        color: "var(--lo)",
        padding: "6px var(--space-lg)",
        fontSize: "12px",
        fontWeight: 600,
        textAlign: "center",
        borderBottom: "1px solid var(--lo-tint)",
        position: "sticky",
        top: 0,
        zIndex: "var(--z-sos)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "var(--space-sm)",
        animation: "slideDown 0.3s ease-out",
      }}
    >
      <span style={{ fontSize: "14px" }}>⚠️</span>
      <span>{t("common.offline_notice")}</span>

      <style>
        {`
          @keyframes slideDown {
            from { transform: translateY(-100%); }
            to { transform: translateY(0); }
          }
        `}
      </style>
    </div>
  );
}
