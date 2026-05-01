import { useState, useRef, useEffect, memo } from "react";
import { useTranslation } from "react-i18next";

import { useOfflineStatus } from "@/shared/hooks/useOfflineStatus";

interface ChatInputProps {
  onSend: (text: string) => Promise<void>;
  disabled: boolean;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: Event) => void;
  onend: (event: Event) => void;
  start(): void;
  stop(): void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

export const ChatInput = memo(function ChatInput({
  onSend,
  disabled,
}: ChatInputProps) {
  const { t } = useTranslation();
  const isOffline = useOfflineStatus();
  const [value, setValue] = useState("");
  const [isListening, setIsListening] = useState(false);

  const isInteractionDisabled = disabled || isOffline;

  // Speech Recognition
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-IN";

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = Array.from(event.results)
          .map((result: SpeechRecognitionResult) => result[0]?.transcript ?? "")
          .join("");
        setValue(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };
      recognition.onend = () => {
        setIsListening(false);
      };
      recognitionRef.current = recognition;
    }
  }, []);

  const handleSend = async () => {
    if (!value.trim() || disabled) return;
    const text = value;
    setValue("");
    await onSend(text);
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setValue("");
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  return (
    <div
      style={{
        padding: "var(--space-md)",
        background: "var(--paper)",
        borderTop: "1px solid var(--border)",
        display: "flex",
        gap: "var(--space-sm)",
        alignItems: "center",
      }}
    >
      <button
        type="button"
        onClick={toggleListening}
        disabled={isInteractionDisabled}
        style={{
          background: isListening ? "var(--lo-l)" : "var(--pg)",
          border: "none",
          borderRadius: "50%",
          width: "40px",
          height: "40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: isInteractionDisabled ? "not-allowed" : "pointer",
          fontSize: "20px",
          color: isListening ? "var(--lo)" : "var(--text-muted)",
          transition: "var(--transition-base)",
        }}
        title={t("support.chat.voice_input", "Voice Input")}
      >
        {isListening ? "⏹️" : "🎤"}
      </button>

      <input
        type="text"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            void handleSend();
          }
        }}
        placeholder={
          isOffline
            ? t("common.offline", "Offline")
            : t("support.chat.placeholder", "Type your issue here...")
        }
        disabled={isInteractionDisabled}
        style={{
          flex: 1,
          padding: "12px 16px",
          borderRadius: "var(--radius-full)",
          border: "1.5px solid var(--border)",
          outline: "none",
          fontSize: "14px",
          fontFamily: "var(--font-body)",
          background: isInteractionDisabled ? "var(--pg)" : "var(--paper)",
        }}
      />

      <button
        type="button"
        onClick={() => {
          void handleSend();
        }}
        disabled={isInteractionDisabled || !value.trim()}
        style={{
          background: "var(--in)",
          color: "white",
          border: "none",
          borderRadius: "var(--radius-full)",
          width: "40px",
          height: "40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor:
            isInteractionDisabled || !value.trim() ? "not-allowed" : "pointer",
          opacity: isInteractionDisabled || !value.trim() ? 0.6 : 1,
          transition: "var(--transition-base)",
        }}
      >
        <SendIcon />
      </button>
    </div>
  );
});

function SendIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M22 2L11 13"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M22 2L15 22L11 13L2 9L22 2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
