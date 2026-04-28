/**
 * RangoliBorder
 *
 * Diamond chain from Rangoli floor art — drawn at the threshold of
 * homes to welcome guests. Used as card borders and section dividers.
 *
 * Signals a warm welcome to the citizen entering their civic space.
 * Built with SVG polyline — repeating diamond chain pattern.
 */

interface RangoliBorderProps {
  /** Width of the border in pixels */
  width?: number | string;
  /** Colour of the diamond chain */
  color?: string;
  /** Diamond size — controls density of the pattern */
  diamondSize?: number;
  /** Orientation of the border */
  orientation?: "horizontal" | "vertical";
  /** Stroke width */
  strokeWidth?: number;
  className?: string;
}

export function RangoliBorder({
  width = "100%",
  color = "var(--sf)",
  diamondSize = 12,
  orientation = "horizontal",
  strokeWidth = 1.5,
  className,
}: RangoliBorderProps) {
  const height = diamondSize * 1.2;
  const half = diamondSize / 2;

  if (orientation === "horizontal") {
    return (
      <svg
        width={width}
        height={height}
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        role="presentation"
        className={className}
        style={{ display: "block", overflow: "visible" }}
      >
        <defs>
          <pattern
            id={`rangoli-h-${diamondSize}`}
            x="0"
            y="0"
            width={diamondSize}
            height={height}
            patternUnits="userSpaceOnUse"
          >
            {/* Single diamond tile */}
            <polygon
              points={`
                0,${height / 2}
                ${half},${height / 2 - half}
                ${diamondSize},${height / 2}
                ${half},${height / 2 + half}
              `}
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinejoin="round"
            />
            {/* Centre dot */}
            <circle
              cx={half}
              cy={height / 2}
              r={1.5}
              fill={color}
              opacity={0.7}
            />
          </pattern>
        </defs>
        <rect
          width="100%"
          height={height}
          fill={`url(#rangoli-h-${diamondSize})`}
        />
      </svg>
    );
  }

  // Vertical orientation
  return (
    <svg
      width={height}
      height={width}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      role="presentation"
      className={className}
      style={{ display: "block" }}
    >
      <defs>
        <pattern
          id={`rangoli-v-${diamondSize}`}
          x="0"
          y="0"
          width={height}
          height={diamondSize}
          patternUnits="userSpaceOnUse"
        >
          <polygon
            points={`
              ${height / 2},0
              ${height / 2 + half},${half}
              ${height / 2},${diamondSize}
              ${height / 2 - half},${half}
            `}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />
          <circle
            cx={height / 2}
            cy={half}
            r={1.5}
            fill={color}
            opacity={0.7}
          />
        </pattern>
      </defs>
      <rect
        width={height}
        height="100%"
        fill={`url(#rangoli-v-${diamondSize})`}
      />
    </svg>
  );
}

/**
 * Section divider — full-width Rangoli border used between page sections.
 */
export function RangoliDivider({
  color = "var(--border)",
  className,
}: {
  color?: string;
  className?: string;
}) {
  return (
    <div
      style={{ width: "100%", padding: "var(--space-md) 0" }}
      className={className}
    >
      <RangoliBorder
        width="100%"
        color={color}
        diamondSize={10}
        strokeWidth={1}
      />
    </div>
  );
}

/**
 * Card accent border — used as a decorative bottom border on featured cards.
 */
export function RangoliCardAccent({ color = "var(--sf)" }: { color?: string }) {
  return (
    <RangoliBorder
      width="100%"
      color={color}
      diamondSize={8}
      strokeWidth={1.2}
    />
  );
}
