import { useState, memo } from "react";
import { useTranslation } from "react-i18next";

import { ChatPanel } from "@/features/support/components/ChatPanel";
import { MyTicketsPanel } from "@/features/support/components/MyTicketsPanel";
import { BottomNav } from "@/shared/components/BottomNav";
import { ScreenErrorBoundary } from "@/shared/components/ScreenErrorBoundary";
import { useOfflineStatus } from "@/shared/hooks/useOfflineStatus";

export const SupportPage = memo(function SupportPage() {
  const { t } = useTranslation();
  const isOffline = useOfflineStatus();
  const [activeTab, setActiveTab] = useState<"chat" | "tickets">("chat");

  return (
    <ScreenErrorBoundary>
      <div style={{ 
      minHeight: "100dvh", 
      display: "flex", 
      flexDirection: "column",
      background: "var(--pg)",
      overflow: "hidden",
      paddingBottom: "100px"
    }}>
      {/* Tab Header */}
      <div style={{ 
        display: "flex", 
        background: "var(--paper)", 
        borderBottom: "1px solid var(--border)",
        padding: "0 var(--space-md)"
      }}>
        <TabButton 
          active={activeTab === "chat"} 
          onClick={() => { setActiveTab("chat"); }}
        >
          {t("support.tabs.chat", "Help Chat")}
        </TabButton>
        <TabButton 
          active={activeTab === "tickets"} 
          onClick={() => { setActiveTab("tickets"); }}
        >
          {t("support.tabs.tickets", "My Tickets")}
        </TabButton>
      </div>

      {/* Tab Content */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {isOffline && (
           <div style={{ 
             background: "var(--lo-l)", 
             color: "var(--lo-text)", 
             padding: "8px var(--space-md)", 
             fontSize: "13px",
             textAlign: "center",
             borderBottom: "1px solid var(--lo)"
           }}>
             {t("support.chat.offline", "Internet required for AI assistant. Core info available below.")}
           </div>
        )}
        <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
          {activeTab === "chat" ? <ChatPanel /> : <MyTicketsPanel />}
        </div>
        </div>
      <BottomNav />
      </div>
    </ScreenErrorBoundary>
  );
});

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function TabButton({ active, onClick, children }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "16px var(--space-lg)",
        background: "none",
        border: "none",
        borderBottom: active ? "3px solid var(--in)" : "3px solid transparent",
        color: active ? "var(--in)" : "var(--text-muted)",
        fontWeight: 600,
        fontSize: "14px",
        cursor: "pointer",
        transition: "var(--transition-base)",
        flex: 1,
        textAlign: "center"
      }}
    >
      {children}
    </button>
  );
}
