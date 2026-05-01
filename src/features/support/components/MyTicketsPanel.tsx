import { useState, memo } from "react";
import { useTranslation } from "react-i18next";

import { useAuth } from "@/features/login/useAuth";
import { AshokaCakraLoader } from "@/shared/components/AshokaCakraLoader";
import { ScreenErrorState } from "@/shared/components/ScreenStates";
import type { Ticket } from "@/shared/types/support";

import { useTickets } from "../hooks/useTickets";

import { TicketCreationDrawer } from "./TicketCreationDrawer";
import { TicketDetailSheet } from "./TicketDetailSheet";
import { TicketList } from "./TicketList";

export const MyTicketsPanel = memo(function MyTicketsPanel() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { tickets, isLoading, error, filter, setFilter } = useTickets(
    user?.uid,
  );

  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        <AshokaCakraLoader />
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "var(--space-md)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-md)",
        height: "100%",
      }}
    >
      {/* Action Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h3 style={{ margin: 0, fontSize: "16px" }}>
          {t("support.tickets.title", "Track Issues")}
        </h3>
        <button
          onClick={() => {
            setIsDrawerOpen(true);
          }}
          style={{
            background: "var(--in)",
            color: "white",
            border: "none",
            borderRadius: "var(--radius-md)",
            padding: "8px 16px",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          + {t("support.tickets.new", "New Ticket")}
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>
        <TicketList
          tickets={tickets}
          activeFilter={filter}
          onFilterChange={(f) => {
            setFilter(f);
          }}
          onTicketClick={setSelectedTicket}
        />
      </div>

      {error && (
        <ScreenErrorState
          message={error}
          retryLabel={t("common.retry", "Retry")}
        />
      )}

      {/* Overlays */}
      <TicketDetailSheet
        ticket={selectedTicket}
        onClose={() => {
          setSelectedTicket(null);
        }}
      />

      <TicketCreationDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
        }}
      />
    </div>
  );
});
