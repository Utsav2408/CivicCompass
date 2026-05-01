import { memo } from "react";

import type { Ticket } from "@/shared/types/support";

interface TicketDetailSheetProps {
  ticket: Ticket | null;
  onClose: () => void;
}

export const TicketDetailSheet = memo(function TicketDetailSheet({
  ticket,
  onClose,
}: TicketDetailSheetProps) {
  if (!ticket) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: "var(--z-modal)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        background: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "600px",
          background: "var(--paper)",
          borderRadius: "var(--radius-xl) var(--radius-xl) 0 0",
          padding: "var(--space-lg)",
          maxHeight: "90vh",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-lg)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <span
              style={{
                fontSize: "12px",
                color: "var(--text-muted)",
                fontWeight: 500,
              }}
            >
              #{ticket.id.toUpperCase()}
            </span>
            <h2 style={{ margin: 0, fontSize: "20px" }}>
              {ticket.category.replace("-", " ")}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>

        {/* Status Section */}
        <div style={{ display: "flex", gap: "var(--space-sm)" }}>
          <span
            style={{
              padding: "4px 12px",
              borderRadius: "var(--radius-full)",
              fontSize: "12px",
              fontWeight: 700,
              background:
                ticket.status === "open" ? "var(--in-l)" : "var(--gd-l)",
              color: ticket.status === "open" ? "var(--in)" : "var(--gd-dark)",
              textTransform: "uppercase",
            }}
          >
            {ticket.status}
          </span>
          <span
            style={{
              fontSize: "12px",
              color: "var(--text-muted)",
              display: "flex",
              alignItems: "center",
            }}
          >
            Raised on{" "}
            {new Date(ticket.createdAt.seconds * 1000).toLocaleString()}
          </span>
        </div>

        {/* Description */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-xs)",
          }}
        >
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600 }}>
            Description
          </h3>
          <p
            style={{
              margin: 0,
              fontSize: "14px",
              lineHeight: "1.6",
              color: "var(--text)",
            }}
          >
            {ticket.description}
          </p>
        </div>

        {/* Media Section */}
        {ticket.mediaUrl && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-xs)",
            }}
          >
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600 }}>
              Attached Media
            </h3>
            <div
              style={{
                width: "100%",
                borderRadius: "var(--radius-md)",
                overflow: "hidden",
                border: "1px solid var(--border)",
              }}
            >
              {ticket.mediaType?.startsWith("video") ? (
                <video src={ticket.mediaUrl} controls style={{ width: "100%" }}>
                  <track kind="captions" />
                </video>
              ) : (
                <img
                  src={ticket.mediaUrl}
                  alt="Ticket Media"
                  style={{ width: "100%", display: "block" }}
                />
              )}
            </div>
          </div>
        )}

        {/* AI Summary Section (Affidavit Style) */}
        <div
          style={{
            padding: "var(--space-md)",
            background: "var(--sf-l)",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--sf)",
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-sm)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "18px" }}>⚖️</span>
              <h3
                style={{
                  margin: 0,
                  fontSize: "15px",
                  fontWeight: 700,
                  color: "var(--sf-dark)",
                }}
              >
                AI Case Summary
              </h3>
            </div>
            <span
              style={{
                background: "var(--sf)",
                color: "white",
                fontSize: "9px",
                padding: "2px 6px",
                borderRadius: "4px",
                fontWeight: 800,
              }}
            >
              VERIFIED BY GEMINI
            </span>
          </div>

          <div
            style={{
              fontSize: "13px",
              color: "var(--text)",
              lineHeight: "1.5",
            }}
          >
            <strong>Classification:</strong> {ticket.category.toUpperCase()}
            <br />
            <strong>Urgency:</strong>{" "}
            {ticket.category === "safety" ? "HIGH" : "MEDIUM"}
            <br />
            <strong>Summary:</strong> This ticket describes an issue regarding{" "}
            {ticket.category}. The user has provided descriptive text{" "}
            {ticket.mediaUrl ? "and visual evidence" : "to support the claim"}.
          </div>

          <div
            style={{
              fontSize: "11px",
              color: "var(--text-muted)",
              fontStyle: "italic",
              borderTop: "1px solid rgba(0,0,0,0.1)",
              paddingTop: "8px",
            }}
          >
            Disclaimer: This summary is AI-generated and used for internal
            routing.
          </div>
        </div>
      </div>
    </div>
  );
});
