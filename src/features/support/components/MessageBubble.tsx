import { memo } from "react";
import { useTranslation } from "react-i18next";

import type { Message } from "../hooks/useGeminiSupport";

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble = memo(function MessageBubble({ message }: MessageBubbleProps) {
  const { t } = useTranslation();
  const isAi = message.role === "model";

  return (
    <div style={{ 
      alignSelf: isAi ? "flex-start" : "flex-end",
      maxWidth: "85%",
      display: "flex",
      flexDirection: "column",
      gap: "4px"
    }}>
      {isAi && (
        <span style={{ 
          fontSize: "11px", 
          fontWeight: 700, 
          color: "var(--in)", 
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          marginLeft: "4px"
        }}>
          {t("support.chat.ai_label", "CivicCompass AI")}
        </span>
      )}
      
      <div style={{
        padding: "12px 16px",
        borderRadius: isAi ? "0 16px 16px 16px" : "16px 16px 0 16px",
        background: isAi ? "var(--paper)" : "var(--in)",
        color: isAi ? "var(--text)" : "white",
        boxShadow: "var(--shadow-sm)",
        border: isAi ? "1px solid var(--border)" : "none",
        fontSize: "14px",
        lineHeight: "1.5",
        position: "relative"
      }}>
        {message.text}
      </div>

      {isAi && (
        <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginLeft: "4px" }}>
          <span style={{ fontSize: "10px", color: "var(--text-muted)", fontStyle: "italic" }}>
            {t("support.chat.ai_disclaimer", "AI-generated response. Verify critical info.")}
          </span>
        </div>
      )}
    </div>
  );
});
