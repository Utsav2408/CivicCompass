import { memo } from "react";

import type { Ticket } from "@/shared/types/support";

interface TicketCardProps {
  ticket: Ticket;
}

export const TicketCard = memo(function TicketCard({
  ticket,
}: TicketCardProps) {
  const getStatusStyles = (status: string) => {
    switch (status.toLowerCase()) {
      case "open":
        return { bg: "var(--in-l)", color: "var(--in)", label: "Open" };
      case "resolved":
        return {
          bg: "var(--gd-l)",
          color: "var(--gd-dark)",
          label: "Resolved",
        };
      case "closed":
        return {
          bg: "var(--border)",
          color: "var(--text-muted)",
          label: "Closed",
        };
      default:
        return { bg: "var(--pg)", color: "var(--text-muted)", label: status };
    }
  };

  const status = getStatusStyles(ticket.status);

  return (
    <div
      style={{
        background: "var(--paper)",
        border: "1.5px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        padding: "var(--space-md)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-sm)",
        boxShadow: "var(--shadow-sm)",
        transition: "var(--transition-base)",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--in)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <span
          style={{
            fontSize: "12px",
            color: "var(--text-muted)",
            fontWeight: 500,
          }}
        >
          #{ticket.id.slice(0, 8).toUpperCase()}
        </span>
        <span
          style={{
            padding: "2px 8px",
            borderRadius: "var(--radius-full)",
            fontSize: "10px",
            fontWeight: 700,
            background: status.bg,
            color: status.color,
            textTransform: "uppercase",
          }}
        >
          {status.label}
        </span>
      </div>

      <h4
        style={{
          margin: 0,
          fontSize: "15px",
          color: "var(--text)",
          fontWeight: 600,
        }}
      >
        {ticket.category.replace("-", " ")}
      </h4>

      <p
        style={{
          margin: 0,
          fontSize: "13px",
          color: "var(--text-muted)",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {ticket.description}
      </p>

      <div
        style={{
          marginTop: "4px",
          paddingTop: "var(--space-sm)",
          borderTop: "1px solid var(--border)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
          {new Date(ticket.createdAt.seconds * 1000).toLocaleDateString()}
        </span>
        {ticket.mediaUrl && (
          <span style={{ fontSize: "11px", color: "var(--in)" }}>
            📎 Media attached
          </span>
        )}
      </div>
    </div>
  );
});
