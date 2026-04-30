import { useState, useRef, useEffect, memo } from "react";
import { useTranslation } from "react-i18next";

import { ChatInput } from "@/features/support/components/ChatInput";
import { MessageBubble } from "@/features/support/components/MessageBubble";
import { AshokaCakraLoader } from "@/shared/components/AshokaCakraLoader";

import { useGeminiSupport } from "../hooks/useGeminiSupport";

export const ChatPanel = memo(function ChatPanel() {
  const { t } = useTranslation();
  const { messages, send, isLoading, error } = useGeminiSupport();
  const [showSidebar, setShowSidebar] = useState(window.innerWidth > 768);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <div style={{ display: "flex", height: "100%", background: "var(--paper)" }}>
      {/* Sidebar - Desktop Only for now or mobile with toggle */}
      {showSidebar && (
        <div style={{ 
          width: window.innerWidth < 768 ? "100%" : "30%", 
          borderRight: "1px solid var(--border)",
          background: "var(--pg)",
          display: "flex",
          flexDirection: "column",
          position: window.innerWidth < 768 ? "absolute" : "relative",
          zIndex: 10,
          height: "100%"
        }}>
          <div style={{ padding: "var(--space-md)", borderBottom: "1px solid var(--border)", background: "var(--paper)" }}>
            <h3 style={{ margin: 0, fontSize: "16px" }}>{t("support.chat.conversations", "Conversations")}</h3>
          </div>
          <div style={{ flex: 1, overflowY: "auto" }}>
             <ConversationItem 
               active={true} 
               onClick={() => {
                 if (window.innerWidth < 768) {
                   setShowSidebar(false);
                 }
               }}
             />
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div style={{ 
        flex: 1, 
        display: "flex", 
        flexDirection: "column",
        background: "var(--pg)",
        position: "relative"
      }}>
        {/* Chat Header */}
        <div style={{ 
          padding: "var(--space-sm) var(--space-md)", 
          background: "var(--paper)", 
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          gap: "var(--space-sm)"
        }}>
          {window.innerWidth < 768 && (
             <button 
               onClick={() => { setShowSidebar(true); }}
               style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer" }}
             >
               ☰
             </button>
          )}
          <div>
            <h3 style={{ margin: 0, fontSize: "16px" }}>{t("support.chat.agent_name", "Support Agent")}</h3>
            <span style={{ fontSize: "12px", color: "var(--in)", fontWeight: 600 }}>● Online</span>
          </div>
        </div>

        {/* Message List */}
        <div 
          ref={scrollRef}
          aria-busy={isLoading}
          aria-live="polite"
          style={{ 
            flex: 1, 
            overflowY: "auto", 
            padding: "var(--space-md)",
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-md)"
          }}
        >
          {messages.length === 0 && (
            <div style={{ textAlign: "center", marginTop: "var(--space-2xl)", color: "var(--text-muted)" }}>
               <p>{t("support.chat.welcome", "Hello! I am your CivicCompass Assistant. How can I help you today?")}</p>
            </div>
          )}

          {messages.map((msg, i) => (
            <MessageBubble key={i} message={msg} />
          ))}

          {isLoading && (
            <div style={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: "8px" }}>
              <AshokaCakraLoader size={20} color="var(--in)" />
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{t("support.chat.thinking", "Agent is typing...")}</span>
            </div>
          )}

          {error && (
            <div role="alert" style={{ padding: "var(--space-sm)", background: "var(--lo-l)", color: "var(--lo-text)", borderRadius: "var(--radius-sm)", fontSize: "12px", textAlign: "center" }}>
              {error}
            </div>
          )}
        </div>

        {/* Input Area */}
        <ChatInput onSend={send} disabled={isLoading} />
      </div>
    </div>
  );
});

function ConversationItem({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <div 
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      style={{ 
        padding: "var(--space-md)", 
        background: active ? "rgba(42, 107, 184, 0.1)" : "transparent",
        borderLeft: active ? "4px solid var(--in)" : "4px solid transparent",
        cursor: "pointer",
        transition: "var(--transition-base)"
      }}
    >
      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "var(--in)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "20px" }}>
          🤖
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: "14px" }}>Support Agent</div>
          <div style={{ fontSize: "12px", color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "150px" }}>
            Click to chat with AI
          </div>
        </div>
      </div>
    </div>
  );
}
