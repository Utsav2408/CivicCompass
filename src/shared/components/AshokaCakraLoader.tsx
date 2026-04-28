/**
 * AshokaCakraLoader
 *
 * The 24-spoked Dharmachakra from the Indian national flag.
 * Replaces generic loading spinners throughout CivicCompass.
 * Spokes generated via JavaScript — zero SVG file assets.
 *
 * Respects prefers-reduced-motion: animation paused when set.
 */

interface AshokaCakraLoaderProps {
  /** Size in pixels — diameter of the chakra */
  size?: number;
  /** Stroke colour — defaults to Saffron (--sf) */
  color?: string;
  /** Accessible label */
  label?: string;
}

export function AshokaCakraLoader({
  size = 48,
  color = "var(--sf)",
  label = "Loading…",
}: AshokaCakraLoaderProps) {
  const cx = 50;
  const cy = 50;
  const outerR = 38; // spoke tip
  const innerR = 18; // spoke base (hub edge)
  const hubR = 8; // centre hub radius
  const rimR = 40; // outer rim circle

  // 24 spokes at 15-degree intervals
  const spokes = Array.from({ length: 24 }, (_, i) => {
    const angleDeg = i * 15;
    const angleRad = (angleDeg * Math.PI) / 180;
    const x1 = cx + innerR * Math.sin(angleRad);
    const y1 = cy - innerR * Math.cos(angleRad);
    const x2 = cx + outerR * Math.sin(angleRad);
    const y2 = cy - outerR * Math.cos(angleRad);

    // Opacity fades from 0.35 to 1.0 across the 24 spokes
    const opacity = 0.35 + (i / 23) * 0.65;

    return { x1, y1, x2, y2, opacity, key: i };
  });

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={label}
      style={{
        animation: "chakra-spin 12s linear infinite",
      }}
    >
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          svg[aria-label="${label}"] {
            animation-play-state: paused;
          }
        }
      `}</style>

      {/* Outer rim */}
      <circle
        cx={cx}
        cy={cy}
        r={rimR}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        opacity="0.9"
      />

      {/* 24 spokes */}
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

      {/* Centre hub */}
      <circle cx={cx} cy={cy} r={hubR} fill={color} opacity="0.9" />
    </svg>
  );
}

/**
 * Full-page loading screen using AshokaCakraLoader.
 * Used as the Suspense fallback between route chunks.
 */
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
    >
      <AshokaCakraLoader size={56} />
      <span
        style={{
          font: "var(--text-small)",
          color: "var(--color-text-muted)",
        }}
      >
        Loading CivicCompass…
      </span>
    </div>
  );
}

/**
 * Inline section loader — used inside cards and containers.
 */
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
    >
      <AshokaCakraLoader size={36} label={label} />
    </div>
  );
}
