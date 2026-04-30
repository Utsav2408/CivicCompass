import { useState, useCallback } from "react";

import { useAuth } from "@/features/login/useAuth";

import { useTickets } from "./useTickets";

export interface Message {
  role: "user" | "model";
  text: string;
}

export function useGeminiSupport() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { createTicket } = useTickets(user?.uid);

  const send = useCallback(
    async (prompt: string) => {
      if (!user) return;

      setIsLoading(true);
      setError(null);

      const userMessage: Message = { role: "user", text: prompt };
      setMessages((prev) => [...prev, userMessage]);

      try {
        // App Check token (mocked for now as in useGeminiChat)
        const appCheckToken = "emulator-token";

        const response = await fetch(
          "https://us-east1-civic-compass.cloudfunctions.net/supportAgent",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Firebase-AppCheck": appCheckToken,
              "x-uid": user.uid,
            },
            body: JSON.stringify({ prompt }),
          }
        );

        if (!response.ok) {
          const errData = (await response.json()) as { error?: string };
          throw new Error(errData.error ?? "Failed to get AI response");
        }

        const data = (await response.json()) as {
          response: string;
        };
        
        const aiMessage: Message = {
          role: "model",
          text: data.response,
        };

        setMessages((prev) => [...prev, aiMessage]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "AI support unavailable");
      } finally {
        setIsLoading(false);
      }
    },
    [user]
  );

  return {
    messages,
    send,
    isLoading,
    error,
    createTicket,
  };
}
