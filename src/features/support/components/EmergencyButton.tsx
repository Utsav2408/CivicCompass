import { memo } from "react";
import { useTranslation } from "react-i18next";

import { useEmergency } from "../hooks/useEmergency";

export const EmergencyButton = memo(function EmergencyButton() {
  const { t } = useTranslation();
  const { activate, isActive } = useEmergency();

  if (isActive) return null;

  return (
    <button
      id="sos-button"
      onClick={activate}
      aria-label={t("support.sos.button_label", "SOS Emergency")}
      style={{
        position: "fixed",
        bottom: "90px", // Above BottomNav (72px)
        left: "var(--space-md)",
        background: "var(--lo)",
        color: "white",
        border: "none",
        borderRadius: "var(--radius-full)",
        padding: "12px 20px",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        boxShadow: "var(--shadow-lg)",
        zIndex: "var(--z-sos)",
        cursor: "pointer",
        fontFamily: "var(--font-body)",
        fontWeight: 700,
        fontSize: "14px",
        animation: "pulse-sos 2s infinite",
        transition: "var(--transition-base)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.05)";
        e.currentTarget.style.background = "var(--lo-mid)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.background = "var(--lo)";
      }}
    >
      <SirenIcon />
      <span>{t("support.sos.button_label", "SOS Emergency")}</span>
      <style>
        {`
          @keyframes pulse-sos {
            0% { box-shadow: 0 0 0 0 rgba(191, 61, 101, 0.6); }
            70% { box-shadow: 0 0 0 15px rgba(191, 61, 101, 0); }
            100% { box-shadow: 0 0 0 0 rgba(191, 61, 101, 0); }
          }
        `}
      </style>
    </button>
  );
});

function SirenIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C7.03 2 3 6.03 3 11V19H21V11C21 6.03 16.97 2 12 2ZM12 4C15.86 4 19 7.14 19 11V17H5V11C5 7.14 8.14 4 12 4Z" fill="currentColor" />
      <path d="M12 7V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M7.76001 8.76001L9.17001 10.17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M16.24 8.76001L14.83 10.17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="13" r="2" fill="currentColor" />
    </svg>
  );
}
