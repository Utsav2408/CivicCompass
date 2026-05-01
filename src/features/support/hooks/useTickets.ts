import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  addDoc,
  Timestamp,
} from "firebase/firestore";
import { useState, useEffect, useCallback } from "react";

import { db } from "@/lib/firebase";
import type {
  Ticket,
  TicketStatus,
  TicketCategory,
} from "@/shared/types/support";

export function useTickets(uid: string | undefined) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filter, setFilter] = useState<TicketStatus | "all">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [prevUid, setPrevUid] = useState(uid);
  const [prevFilter, setPrevFilter] = useState(filter);

  if (uid !== prevUid || filter !== prevFilter) {
    setPrevUid(uid);
    setPrevFilter(filter);
    setIsLoading(true);
  }

  useEffect(() => {
    if (!uid) {
      setTimeout(() => {
        setTickets((prev) => (prev.length > 0 ? [] : prev));
        setIsLoading((prev) => (prev ? false : prev));
      }, 0);
      return;
    }

    const q = query(
      collection(db, "tickets"),
      where("userId", "==", uid),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const ticketData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Ticket[];
        const normalized =
          filter === "all"
            ? ticketData
            : ticketData.filter(
                (ticket) =>
                  ticket.status.toLowerCase() === filter.toLowerCase(),
              );
        setTickets(normalized);
        setIsLoading(false);
      },
      () => {
        setError("Failed to load tickets");
        setIsLoading(false);
      },
    );

    return () => {
      unsubscribe();
    };
  }, [uid, filter]);

  const createTicket = useCallback(
    async (
      description: string,
      category: TicketCategory,
      status: TicketStatus = "Open",
    ) => {
      if (!uid) throw new Error("User not authenticated");

      try {
        const docRef = await addDoc(collection(db, "tickets"), {
          userId: uid,
          description,
          category,
          status,
          createdAt: Timestamp.now(),
        });
        return docRef.id;
      } catch {
        throw new Error("Failed to create ticket");
      }
    },
    [uid],
  );

  return {
    tickets,
    createTicket,
    filter,
    setFilter,
    isLoading,
    error,
  };
}
