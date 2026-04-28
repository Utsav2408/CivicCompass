/**
 * LotusMotif
 *
 * India's national flower — 8 petals at 45-degree rotations.
 * The lotus grows in muddy water yet blooms pure —
 * mirroring civic participation producing something beautiful.
 *
 * Usage: Empty states, success confirmations, card corner decorations.
 * Built entirely with SVG ellipses and circles — zero image assets.
 */

interface LotusMotifProps {
  /** Size in pixels — diameter of the motif */
  size?: number;
  /** Primary petal colour */
  color?: string;
  /** Petal fill opacity */
  petalOpacity?: number;
  /** Whether to show the centre circle */
  showCentre?: boolean;
  className?: string;
}

export function LotusMotif({
  size = 64,
  color = "var(--lo)",
  petalOpacity = 0.85,
  showCentre = true,
  className,
}: LotusMotifProps) {
  // 8 petals at 45-degree intervals
  const petals = Array.from({ length: 8 }, (_, i) => ({
    rotation: i * 45,
    key: i,
    // Alternate petals slightly smaller for layered look
    rx: i % 2 === 0 ? 8 : 7,
    ry: i % 2 === 0 ? 18 : 16,
    cy: i % 2 === 0 ? -16 : -14,
  }));

  return (
    <svg
      width={size}
      height={size}
      viewBox="-50 -50 100 100"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      role="presentation"
      className={className}
    >
      {/* Outer glow layer — very subtle */}
      {petals.map(({ rotation, key, rx, ry, cy }) => (
        <ellipse
          key={`glow-${key}`}
          cx={0}
          cy={cy - 1}
          rx={rx + 2}
          ry={ry + 2}
          fill={color}
          opacity={0.06}
          transform={`rotate(${rotation})`}
        />
      ))}

      {/* Main petals */}
      {petals.map(({ rotation, key, rx, ry, cy }) => (
        <ellipse
          key={`petal-${key}`}
          cx={0}
          cy={cy}
          rx={rx}
          ry={ry}
          fill={color}
          opacity={petalOpacity}
          transform={`rotate(${rotation})`}
        />
      ))}

      {/* Petal tips — small teardrop accent */}
      {petals.map(({ rotation, key, cy, ry }) => (
        <ellipse
          key={`tip-${key}`}
          cx={0}
          cy={cy - ry + 3}
          rx={3}
          ry={4}
          fill="white"
          opacity={0.3}
          transform={`rotate(${rotation})`}
        />
      ))}

      {/* Centre circle — golden */}
      {showCentre && (
        <>
          <circle cx={0} cy={0} r={10} fill="var(--gd)" opacity={0.95} />
          <circle cx={0} cy={0} r={6} fill="var(--gd-l)" opacity={0.8} />
          <circle cx={0} cy={0} r={3} fill="var(--gd)" opacity={1} />
        </>
      )}
    </svg>
  );
}

/**
 * Empty state with Lotus — used when a list or section has no content.
 */
interface LotusEmptyStateProps {
  title: string;
  message: string;
  action?: React.ReactNode;
}

export function LotusEmptyState({
  title,
  message,
  action,
}: LotusEmptyStateProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--space-2xl) var(--space-lg)",
        gap: "var(--space-md)",
        textAlign: "center",
      }}
      role="status"
    >
      <LotusMotif size={72} />
      <h3
        style={{
          font: "var(--text-h2)",
          color: "var(--color-text)",
        }}
      >
        {title}
      </h3>
      <p
        style={{
          font: "var(--text-body)",
          color: "var(--color-text-muted)",
          maxWidth: "280px",
        }}
      >
        {message}
      </p>
      {action}
    </div>
  );
}

/**
 * Success confirmation with Lotus — used after ticket created, booth confirmed etc.
 */
export function LotusSuccess({ message }: { message: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--space-sm)",
        padding: "var(--space-sm) var(--space-md)",
        background: "var(--bn-l)",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--bn)",
      }}
      role="status"
      aria-live="polite"
    >
      <LotusMotif size={28} color="var(--bn)" showCentre={false} />
      <span
        style={{
          font: "var(--text-body)",
          color: "var(--bn)",
          fontWeight: 600,
        }}
      >
        {message}
      </span>
    </div>
  );
}
