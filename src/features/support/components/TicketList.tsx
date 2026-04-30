import { memo, useMemo } from "react";
import { FixedSizeList as List } from "react-window";

import type { Ticket, TicketStatus } from "@/shared/types/support";

import { TicketCard } from "./TicketCard";

interface TicketListProps {
  tickets: Ticket[];
  onTicketClick: (ticket: Ticket) => void;
  activeFilter: TicketStatus | "all";
  onFilterChange: (filter: TicketStatus | "all") => void;
}

export const TicketList = memo(function TicketList({ 
  tickets, 
  onTicketClick, 
  activeFilter, 
  onFilterChange 
}: TicketListProps) {
  const filteredTickets = useMemo(() => {
    if (activeFilter === "all") return tickets;
    return tickets.filter(t => t.status === activeFilter);
  }, [tickets, activeFilter]);

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const ticket = filteredTickets[index];
    const handleClick = () => { onTicketClick(ticket); };
    
    return (
      <div style={{ ...style, paddingBottom: "12px" }}>
        <div 
          role="button"
          tabIndex={0}
          onClick={handleClick}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleClick();
            }
          }}
        >
          <TicketCard ticket={ticket} />
        </div>
      </div>
    );
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
      {/* Filter Bar */}
      <div style={{ display: "flex", gap: "var(--space-sm)", overflowX: "auto", paddingBottom: "4px" }}>
        {(["all", "open", "resolved", "closed"] as const).map(f => (
          <FilterChip 
            key={f}
            label={f.charAt(0).toUpperCase() + f.slice(1)} 
            active={activeFilter === f} 
            onClick={() => { onFilterChange(f); }} 
          />
        ))}
      </div>

      {/* Grid or Virtualized List */}
      <div style={{ flex: 1, minHeight: 0 }}>
        {filteredTickets.length > 20 ? (
          <List
            height={600} // This should ideally be dynamic
            itemCount={filteredTickets.length}
            itemSize={160} // Height of TicketCard + gap
            width="100%"
          >
            {Row}
          </List>
        ) : (
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", 
            gap: "var(--space-md)",
            paddingBottom: "var(--space-xl)"
          }}>
            {filteredTickets.map(ticket => (
              <div 
                key={ticket.id} 
                role="button"
                tabIndex={0}
                onClick={() => { onTicketClick(ticket); }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onTicketClick(ticket);
                  }
                }}
              >
                <TicketCard ticket={ticket} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "6px 16px",
        borderRadius: "var(--radius-full)",
        border: active ? "1.5px solid var(--in)" : "1.5px solid var(--border)",
        background: active ? "var(--in-l)" : "var(--paper)",
        color: active ? "var(--in)" : "var(--text-muted)",
        fontSize: "13px",
        fontWeight: 600,
        cursor: "pointer",
        whiteSpace: "nowrap",
        transition: "var(--transition-base)"
      }}
    >
      {label}
    </button>
  );
}
