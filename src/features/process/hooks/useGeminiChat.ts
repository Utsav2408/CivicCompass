import { getToken } from "firebase/app-check";
import { useState, useCallback } from "react";

import { useAuth } from "@/features/login/useAuth";
import { appCheck } from "@/lib/firebase";

export interface Message {
  role: "user" | "model";
  text: string;
  source?: string | undefined;
  fromCache?: boolean | undefined;
}

const projectId = import.meta.env["VITE_FIREBASE_PROJECT_ID"] as string;
const isEmulator = import.meta.env["VITE_USE_EMULATORS"] === "true";
const geminiProxyUrl = isEmulator
  ? `http://127.0.0.1:5001/${projectId}/us-east1/geminiProxy`
  : `https://us-east1-${projectId}.cloudfunctions.net/geminiProxy`;

export function useGeminiChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const send = useCallback(
    async (prompt: string) => {
      if (!user) return;

      setIsLoading(true);
      setError(null);

      // Append user message immediately
      const userMessage: Message = { role: "user", text: prompt };
      setMessages((prev) => [...prev, userMessage]);

      try {
        let appCheckToken = "";
        try {
          appCheckToken = isEmulator
            ? "emulator-token"
            : appCheck
              ? (await getToken(appCheck)).token
              : "";
        } catch {
          // Ignore app check error in development
        }

        const response = await fetch(geminiProxyUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Firebase-AppCheck": appCheckToken,
            "x-uid": user.uid,
          },
          body: JSON.stringify({ prompt }),
        });

        if (!response.ok) {
          const errData = (await response.json()) as { error?: string };
          throw new Error(errData.error ?? "Failed to get AI response");
        }

        const data = (await response.json()) as {
          response: string;
          source?: string;
          fromCache?: boolean;
        };
        const aiMessage: Message = {
          role: "model",
          text: data.response,
          source: data.source,
          fromCache: data.fromCache,
        };

        setMessages((prev) => [...prev, aiMessage]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "AI service unavailable");
      } finally {
        setIsLoading(false);
      }
    },
    [user],
  );

  return { messages, send, isLoading, error };
}
