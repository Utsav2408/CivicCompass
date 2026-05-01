/**
 * AshokaCakraLoader
 *
 * The 24-spoked Dharmachakra from the Indian national flag.
 * Replaces generic loading spinners throughout CivicCompass.
 * Spokes generated via JavaScript — zero SVG file assets.
 *
 * Accessibility:
 *   - Functional use (loaders): role="img" + aria-label, visible to screen readers
 *   - Decorative use (card motif): pass decorative={true} → aria-hidden="true"
 *   - prefers-reduced-motion: uses data-chakra attribute (not aria-label selector)
 *     to avoid fragile CSS template-literal selectors
 */

interface AshokaCakraLoaderProps {
  size?: number;
  color?: string;
  label?: string;
  /** When true, renders as aria-hidden decorative SVG — no screen reader announcement */
  decorative?: boolean;
  animated?: boolean;
}

export function AshokaCakraLoader({
  size = 48,
  color = "var(--sf)",
  label = "Loading…",
  decorative = false,
  animated = true,
}: AshokaCakraLoaderProps) {
  const cx = 50;
  const cy = 50;
  const outerR = 38;
  const innerR = 18;
  const hubR = 8;
  const rimR = 40;

  const spokes = Array.from({ length: 24 }, (_, i) => {
    const angleDeg = i * 15;
    const angleRad = (angleDeg * Math.PI) / 180;
    const x1 = cx + innerR * Math.sin(angleRad);
    const y1 = cy - innerR * Math.cos(angleRad);
    const x2 = cx + outerR * Math.sin(angleRad);
    const y2 = cy - outerR * Math.cos(angleRad);
    const opacity = 0.35 + (i / 23) * 0.65;
    return { x1, y1, x2, y2, opacity, key: i };
  });

  // Decorative: aria-hidden, no role, no label — screen readers skip entirely
  // Functional: role="img" + aria-label — announced as a landmark image
  const ariaProps = decorative
    ? { "aria-hidden": true as const }
    : { role: "img" as const, "aria-label": label };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      data-chakra="spinner"
      style={
        animated ? { animation: "chakra-spin 12s linear infinite" } : undefined
      }
      {...ariaProps}
    >
      {/*
        prefers-reduced-motion via data attribute selector — avoids the fragile
        svg[aria-label="..."] pattern which breaks if label text changes.
      */}
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          svg[data-chakra="spinner"] { animation-play-state: paused; }
        }
      `}</style>

      <circle
        cx={cx}
        cy={cy}
        r={rimR}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        opacity="0.9"
      />

      {spokes.map(({ x1, y1, x2, y2, opacity, key }) => (
        <line
          key={key}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          opacity={opacity}
        />
      ))}

      <circle cx={cx} cy={cy} r={hubR} fill={color} opacity="0.9" />
    </svg>
  );
}

/** Full-page Suspense fallback */
export function PageLoader() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100dvh",
        gap: "var(--space-md)",
        background: "var(--color-bg)",
      }}
      role="status"
      aria-live="polite"
      aria-label="Loading CivicCompass"
    >
      <AshokaCakraLoader size={56} label="Loading CivicCompass" />
      <span
        style={{ font: "var(--text-small)", color: "var(--color-text-muted)" }}
      >
        Loading CivicCompass…
      </span>
    </div>
  );
}

/** Inline section loader — used inside cards and containers */
export function SectionLoader({ label = "Loading…" }: { label?: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--space-xl)",
      }}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <AshokaCakraLoader size={36} label={label} />
    </div>
  );
}
