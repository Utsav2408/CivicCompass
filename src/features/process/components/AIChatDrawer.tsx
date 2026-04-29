import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

import { AshokaCakraLoader } from "@/shared/components/AshokaCakraLoader";
import { useOfflineStatus } from "@/shared/hooks/useOfflineStatus";

import { useGeminiChat } from "../hooks/useGeminiChat";

interface AIChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SpeechRecognitionEvent extends Event {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
    length: number;
  };
}

export function AIChatDrawer({ isOpen, onClose }: AIChatDrawerProps) {
  const { t } = useTranslation();
  const { messages, send, isLoading, error: chatError } = useGeminiChat();
  const isOffline = useOfflineStatus();
  const isOnline = !isOffline;

  const [inputValue, setInputValue] = useState("");
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Speech Recognition setup
  const [speechSupported, setSpeechSupported] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const SpeechRecognition =
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
      (window as any).SpeechRecognition ??
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
      (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSpeechSupported(true);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
      const recognition = new SpeechRecognition();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      recognition.continuous = true;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      recognition.interimResults = true;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      recognition.lang = "en-IN"; // Default to English India

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = Array.from(
          event.results as unknown as SpeechRecognitionResultList,
        )
          .map((result: SpeechRecognitionResult) => result[0])
          .map(
            (alt: SpeechRecognitionAlternative | undefined) =>
              alt?.transcript ?? "",
          )
          .join("");
        setInputValue(transcript);
      };

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      recognition.onerror = () => {
        setIsListening(false);
      };
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      recognition.onend = () => {
        setIsListening(false);
      };
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      recognitionRef.current = recognition;
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!inputValue.trim() || !isOnline || isLoading) return;
    const prompt = inputValue;
    setInputValue("");
    await send(prompt);
  };

  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        recognitionRef.current.stop();
      }
    } else {
      setInputValue("");
      if (recognitionRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        recognitionRef.current.start();
      }
      setIsListening(true);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={() => {
          onClose();
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            onClose();
          }
        }}
        role="button"
        tabIndex={-1}
        aria-label="Close chat"
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.4)",
          backdropFilter: "blur(4px)",
          zIndex: "var(--z-modal)",
          animation: "fade-in var(--duration-normal) var(--ease-out)",
        }}
      />

      {/* Drawer Container */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t("process.ai.title")}
        style={{
          position: "fixed",
          zIndex: "calc(var(--z-modal) + 1)",
          background: "var(--paper)",
          boxShadow: "var(--shadow-xl)",
          display: "flex",
          flexDirection: "column",
          // Responsive styles via JS for simplicity in this file
          ...(window.innerWidth < 768
            ? {
                bottom: 0,
                left: 0,
                right: 0,
                height: "80vh",
                borderRadius: "var(--radius-xl) var(--radius-xl) 0 0",
                animation: "slide-up var(--duration-normal) var(--ease-out)",
              }
            : {
                top: 0,
                bottom: 0,
                right: 0,
                width: "400px",
                animation: "fade-in var(--duration-normal) var(--ease-out)",
              }),
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "var(--space-md) var(--space-lg)",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "var(--in)",
            color: "#fff",
            borderRadius:
              window.innerWidth < 768
                ? "var(--radius-xl) var(--radius-xl) 0 0"
                : "0",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-sm)",
            }}
          >
            <span style={{ fontSize: "20px" }}>🤖</span>
            <h2 style={{ font: "var(--text-h2)", margin: 0 }}>
              {t("process.ai.title")}
            </h2>
          </div>
          <button
            onClick={() => {
              onClose();
            }}
            aria-label={t("process.ai.close_label")}
            style={{
              background: "none",
              border: "none",
              color: "#fff",
              fontSize: "24px",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>

        {/* Message List */}
        <div
          ref={scrollRef}
          role="log"
          aria-live="polite"
          aria-label={t("process.ai.message_list_label")}
          aria-atomic="false"
          style={{
            flex: 1,
            padding: "var(--space-lg)",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-md)",
            background: "var(--pg)",
          }}
        >
          {messages.length === 0 && (
            <div
              style={{
                textAlign: "center",
                marginTop: "var(--space-2xl)",
                color: "var(--text-muted)",
              }}
            >
              <p style={{ font: "var(--text-h2)" }}>
                {t("process.ai.empty_title")}
              </p>
              <p style={{ font: "var(--text-body)" }}>
                {t("process.ai.empty_message")}
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                maxWidth: "85%",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}
            >
              <div
                style={{
                  padding: "var(--space-sm) var(--space-md)",
                  borderRadius: "var(--radius-md)",
                  background:
                    msg.role === "user" ? "var(--sf)" : "var(--paper)",
                  color: msg.role === "user" ? "#fff" : "var(--color-text)",
                  border:
                    msg.role === "user" ? "none" : "1px solid var(--border)",
                  font: "var(--text-body)",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                {msg.text}
              </div>
              {msg.role === "model" && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "2px",
                    marginLeft: "4px",
                  }}
                >
                  {msg.source && (
                    <span
                      style={{
                        background: "var(--gd-l)",
                        color: "var(--gd-dark)",
                        padding: "2px 8px",
                        borderRadius: "var(--radius-full)",
                        fontSize: "10px",
                        fontWeight: 700,
                        alignSelf: "flex-start",
                      }}
                    >
                      {t("process.card.source")}: {msg.source}
                    </span>
                  )}
                  <span
                    style={{
                      fontSize: "9px",
                      color: "var(--text-muted)",
                      fontStyle: "italic",
                    }}
                  >
                    {t("process.ai.disclaimer")}
                  </span>
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div
              style={{
                alignSelf: "flex-start",
                display: "flex",
                gap: "var(--space-sm)",
                alignItems: "center",
              }}
            >
              <AshokaCakraLoader size={20} color="var(--in)" />
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                {t("process.ai.thinking")}
              </span>
            </div>
          )}

          {chatError && (
            <div
              style={{
                background: "var(--lo-l)",
                padding: "var(--space-sm)",
                borderRadius: "var(--radius-sm)",
                color: "var(--lo-text)",
                fontSize: "12px",
                textAlign: "center",
              }}
            >
              {chatError}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div
          style={{
            padding: "var(--space-md) var(--space-lg)",
            borderTop: "1px solid var(--border)",
            background: "var(--paper)",
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-sm)",
          }}
        >
          {!isOnline && (
            <div
              style={{
                color: "var(--lo-text)",
                fontSize: "12px",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              {t("process.ai.offline")}
            </div>
          )}

          <div
            style={{
              display: "flex",
              gap: "var(--space-sm)",
              alignItems: "center",
            }}
          >
            {speechSupported && (
              <button
                onClick={() => {
                  toggleListening();
                }}
                disabled={!isOnline}
                style={{
                  background: isListening ? "var(--lo-l)" : "var(--border)",
                  border: "none",
                  borderRadius: "var(--radius-full)",
                  width: "40px",
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: isOnline ? "pointer" : "not-allowed",
                  fontSize: "18px",
                  color: isListening ? "var(--lo-text)" : "var(--text-muted)",
                }}
              >
                {isListening ? "⏹️" : "🎤"}
              </button>
            )}

            <input
              type="text"
              placeholder={
                isOnline ? t("process.ai.placeholder") : t("common.offline")
              }
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  void handleSend();
                }
              }}
              disabled={!isOnline || isLoading}
              style={{
                flex: 1,
                padding: "10px var(--space-md)",
                borderRadius: "var(--radius-md)",
                border: "1.5px solid var(--border)",
                outline: "none",
                font: "var(--text-body)",
                background: isOnline ? "var(--paper)" : "var(--pg)",
              }}
            />

            <button
              onClick={() => {
                void handleSend();
              }}
              disabled={!isOnline || isLoading || !inputValue.trim()}
              style={{
                background: isOnline ? "var(--sf)" : "var(--border)",
                color: "#fff",
                border: "none",
                borderRadius: "var(--radius-md)",
                padding: "10px 16px",
                cursor: isOnline ? "pointer" : "not-allowed",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {!isOnline ? "🔒" : t("process.ai.send")}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
