import { useState, useRef, useEffect, memo } from "react";
import { useTranslation } from "react-i18next";

import { ChatInput } from "@/features/support/components/ChatInput";
import { MessageBubble } from "@/features/support/components/MessageBubble";
import { AshokaCakraLoader } from "@/shared/components/AshokaCakraLoader";
import { LotusEmptyState } from "@/shared/components/LotusMotif";

import { useGeminiSupport } from "../hooks/useGeminiSupport";

export const ChatPanel = memo(function ChatPanel() {
  const { t } = useTranslation();
  const {
    messages,
    send,
    isLoading,
    error,
    pendingTicketDraft,
    isRaisingTicket,
    raisePendingTicket,
    resetConversation,
  } = useGeminiSupport();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <div style={{ display: "flex", height: "100%", background: "var(--paper)" }}>
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          background: "var(--pg)",
          position: "relative",
          minWidth: 0,
        }}
      >
        {/* Chat Header */}
        <div
          style={{
            padding: "var(--space-sm) var(--space-md)",
            background: "var(--paper)",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "var(--space-sm)",
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: "16px" }}>
              {t("support.chat.agent_name", "Support Agent")}
            </h3>
            <span style={{ fontSize: "12px", color: "var(--in)", fontWeight: 600 }}>
              ● Online
            </span>
          </div>
          <button
            type="button"
            onClick={resetConversation}
            style={{
              border: "1px solid var(--border)",
              background: "var(--paper)",
              color: "var(--text)",
              borderRadius: "var(--radius-md)",
              padding: "6px 10px",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {t("support.chat.new_chat", "New Chat")}
          </button>
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
            <div style={{ marginTop: "var(--space-xl)" }}>
              <LotusEmptyState
                title={t("support.chat.welcome_title", "Support Assistant Ready")}
                message={t(
                  "support.chat.welcome",
                  "Hello! I am your CivicCompass Assistant. How can I help you today?",
                )}
              />
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

          {pendingTicketDraft && (
            <div
              style={{
                alignSelf: "flex-start",
                background: "var(--paper)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)",
                padding: "10px",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <button
                type="button"
                onClick={() => {
                  void raisePendingTicket();
                }}
                disabled={isRaisingTicket}
                style={{
                  border: "none",
                  background: "var(--in)",
                  color: "white",
                  borderRadius: "var(--radius-md)",
                  padding: "8px 14px",
                  fontWeight: 600,
                  cursor: isRaisingTicket ? "not-allowed" : "pointer",
                }}
              >
                {isRaisingTicket
                  ? t("support.create.submitting", "Raising...")
                  : t("support.create.submit", "Raise Ticket")}
              </button>
            </div>
          )}
        </div>

        {/* Input Area */}
        <ChatInput onSend={send} disabled={isLoading} />
      </div>
    </div>
  );
});
