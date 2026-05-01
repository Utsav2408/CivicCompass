import { useState, useCallback } from "react";
import { getToken } from "firebase/app-check";

import { useAuth } from "@/features/login/useAuth";
import { appCheck } from "@/lib/firebase";
import type { TicketCategory } from "@/shared/types/support";

import { useTickets } from "./useTickets";

export interface Message {
  role: "user" | "model";
  text: string;
  source?: string;
}

interface TicketDraft {
  description: string;
  category: TicketCategory;
}

function buildChatSummary(messages: Message[], latestPrompt: string): string {
  const recentTurns = [...messages, { role: "user" as const, text: latestPrompt }]
    .slice(-8)
    .map((message) => `${message.role === "user" ? "User" : "Assistant"}: ${message.text}`);
  return recentTurns.join("\n");
}

const projectId = import.meta.env["VITE_FIREBASE_PROJECT_ID"] as string;
const isEmulator = import.meta.env["VITE_USE_EMULATORS"] === "true";
const supportAgentUrl = isEmulator
  ? `http://127.0.0.1:5001/${projectId}/us-east1/supportAgent`
  : `https://us-east1-${projectId}.cloudfunctions.net/supportAgent`;

export function useGeminiSupport() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingTicketDraft, setPendingTicketDraft] = useState<TicketDraft | null>(null);
  const [isRaisingTicket, setIsRaisingTicket] = useState(false);
  const [lastTicketId, setLastTicketId] = useState<string | null>(null);
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
        const lowerPrompt = prompt.toLowerCase();
        const isVoterRollIssue =
          lowerPrompt.includes("voter roll") ||
          lowerPrompt.includes("missing from voter roll") ||
          lowerPrompt.includes("name is missing");

        if (isVoterRollIssue) {
          const aiMessage: Message = {
            role: "model",
            text:
              "I understand — your name appears missing from the voter roll. Please confirm if you want me to raise a support ticket for this issue.",
            source: "CivicCompass Support Rules",
          };
          setMessages((prev) => [...prev, aiMessage]);
          setPendingTicketDraft({
            description: prompt,
            category: "voter-roll",
          });
          return;
        }

        let appCheckToken = "";
        try {
          appCheckToken = isEmulator
            ? "emulator-token"
            : appCheck
              ? (await getToken(appCheck)).token
              : "";
        } catch {
          // Ignore app check errors in development.
        }

        const chatSummary = buildChatSummary(messages, prompt);
        const response = await fetch(supportAgentUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Firebase-AppCheck": appCheckToken,
            "x-uid": user.uid,
          },
          body: JSON.stringify({ prompt, chatSummary }),
        });

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
          source: "Gemini 2.5 Flash",
        };

        setMessages((prev) => [...prev, aiMessage]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "AI support unavailable");
      } finally {
        setIsLoading(false);
      }
    },
    [messages, user]
  );

  const raisePendingTicket = useCallback(async () => {
    if (!pendingTicketDraft) return null;
    setIsRaisingTicket(true);
    setError(null);
    try {
      const ticketId = await createTicket(
        pendingTicketDraft.description,
        pendingTicketDraft.category,
        "Open",
      );
      setLastTicketId(ticketId);
      setPendingTicketDraft(null);
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: `Ticket raised successfully. Ticket ID: ${ticketId.slice(0, 8).toUpperCase()} (Status: Open).`,
          source: "CivicCompass Ticketing",
        },
      ]);
      return ticketId;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create ticket");
      return null;
    } finally {
      setIsRaisingTicket(false);
    }
  }, [pendingTicketDraft, createTicket]);

  const resetConversation = useCallback(() => {
    setMessages([]);
    setError(null);
    setPendingTicketDraft(null);
    setLastTicketId(null);
  }, []);

  return {
    messages,
    send,
    isLoading,
    error,
    pendingTicketDraft,
    isRaisingTicket,
    lastTicketId,
    raisePendingTicket,
    resetConversation,
    createTicket,
  };
}
