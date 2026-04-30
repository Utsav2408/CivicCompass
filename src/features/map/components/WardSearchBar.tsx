import type { PollingBooth } from "@/shared/types/map";

interface WardSearchBarProps {
  value: string;
  onChange: (val: string) => void;
  results: PollingBooth[];
  onSelect: (booth: PollingBooth) => void;
}

export function WardSearchBar({ value, onChange, results, onSelect }: WardSearchBarProps) {
  return (
    <div
      style={{
        position: "absolute",
        top: "var(--space-md)",
        left: "var(--space-md)",
        right: "var(--space-md)",
        zIndex: 200,
      }}
    >
      <div
        role="combobox"
        aria-expanded={results.length > 0}
        aria-haspopup="listbox"
        aria-controls="ward-results-list"
        style={{
          background: "var(--paper)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-md)",
          display: "flex",
          alignItems: "center",
          padding: "var(--space-sm) var(--space-md)",
          border: "1.5px solid var(--border)",
        }}
      >
        <span style={{ marginRight: "var(--space-sm)" }}>🔍</span>
        <input
          type="text"
          placeholder="Search Ward (e.g. Connaught Place)"
          value={value}
          onChange={(e) => { onChange(e.target.value); }}
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            background: "transparent",
            font: "var(--text-body)",
          }}
          aria-label="Search by Ward Name"
          aria-autocomplete="list"
        />
      </div>

      {results.length > 0 && (
        <ul
          id="ward-results-list"
          role="listbox"
          style={{
            listStyle: "none",
            margin: "var(--space-xs) 0 0 0",
            padding: 0,
            background: "var(--paper)",
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--shadow-lg)",
            overflow: "hidden",
            border: "1px solid var(--border)",
          }}
        >
          {results.map((booth) => (
            <li key={booth.id} role="option" aria-selected={false}>
              <button
                onClick={() => { onSelect(booth); }}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "var(--space-md)",
                  background: "none",
                  border: "none",
                  borderBottom: "1px solid var(--border)",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px",
                }}
              >
                <span style={{ font: "var(--text-h2)", color: "var(--sf)" }}>
                  {booth.wardName}
                </span>
                <span style={{ font: "var(--text-small)", color: "var(--text-muted)" }}>
                  {booth.name}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
