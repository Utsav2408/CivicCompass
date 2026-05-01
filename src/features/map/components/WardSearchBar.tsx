import type { PollingBooth } from "@/shared/types/map";

export interface PlaceSearchResult {
  id: string;
  title: string;
  subtitle?: string;
  coordinates: { lat: number; lng: number };
}

interface WardSearchBarProps {
  value: string;
  onChange: (val: string) => void;
  boothResults: PollingBooth[];
  placeResults: PlaceSearchResult[];
  onSelectBooth: (booth: PollingBooth) => void;
  onSelectPlace: (place: PlaceSearchResult) => void;
}

export function WardSearchBar({
  value,
  onChange,
  boothResults,
  placeResults,
  onSelectBooth,
  onSelectPlace,
}: WardSearchBarProps) {
  const hasResults = boothResults.length > 0 || placeResults.length > 0;

  return (
    <div
      style={{
        position: "absolute",
        top: "var(--space-md)",
        left: "50%",
        transform: "translateX(-50%)",
        width: "min(560px, calc(100% - (2 * var(--space-md))))",
        zIndex: "var(--z-overlay)",
      }}
    >
      <div
        role="combobox"
        aria-expanded={hasResults}
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
          onChange={(e) => {
            onChange(e.target.value);
          }}
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

      {hasResults && (
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
            maxHeight: "min(42dvh, 360px)",
            overflowY: "auto",
          }}
        >
          {placeResults.map((place) => (
            <li key={`place-${place.id}`} role="option" aria-selected={false}>
              <button
                onClick={() => {
                  onSelectPlace(place);
                }}
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
                <span style={{ font: "var(--text-h2)", color: "var(--in)" }}>
                  {place.title}
                </span>
                {place.subtitle && (
                  <span
                    style={{
                      font: "var(--text-small)",
                      color: "var(--text-muted)",
                    }}
                  >
                    {place.subtitle}
                  </span>
                )}
              </button>
            </li>
          ))}
          {boothResults.map((booth) => (
            <li key={booth.id} role="option" aria-selected={false}>
              <button
                onClick={() => {
                  onSelectBooth(booth);
                }}
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
                <span
                  style={{
                    font: "var(--text-small)",
                    color: "var(--text-muted)",
                  }}
                >
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
