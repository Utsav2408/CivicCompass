/**
 * MughalJaaliPattern
 *
 * Geometric stone lattice screens (Jaali) found at Fatehpur Sikri,
 * the Agra Fort, and the Taj Mahal.
 *
 * Applied at 12–18% opacity over Indigo backgrounds.
 * Usage: Login hero, Home countdown card corner, Screen 3 process cards.
 *
 * Built with SVG <pattern> element — zero image assets, fully scalable.
 */

import { useId } from "react";

interface MughalJaaliPatternProps {
  /** Opacity — 0.12 to 0.18 recommended over Indigo backgrounds */
  opacity?: number;
  /** Fill colour of the pattern lines */
  color?: string;
  /** Pattern tile size in pixels */
  tileSize?: number;
  /** Width of the pattern container */
  width?: string | number;
  /** Height of the pattern container */
  height?: string | number;
  className?: string;
}

export function MughalJaaliPattern({
  opacity = 0.15,
  color = "#FFFFFF",
  tileSize = 40,
  width = "100%",
  height = "100%",
  className,
}: MughalJaaliPatternProps) {
  const half = tileSize / 2;
  const quarter = tileSize / 4;
  const id = useId();

  // Unique ID to prevent pattern collision when multiple instances render
  const patternId = `jaali-${tileSize}-${id.replace(/:/g, "")}`;

  return (
    <svg
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      role="presentation"
      className={className}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    >
      <defs>
        <pattern
          id={patternId}
          x="0"
          y="0"
          width={tileSize}
          height={tileSize}
          patternUnits="userSpaceOnUse"
        >
          {/* ── Interlocking star and square geometry ── */}

          {/* Outer diamond — rotated square */}
          <polygon
            points={`
              ${half},${quarter}
              ${tileSize - quarter},${half}
              ${half},${tileSize - quarter}
              ${quarter},${half}
            `}
            fill="none"
            stroke={color}
            strokeWidth="0.8"
          />

          {/* Inner square — aligned to axes */}
          <rect
            x={quarter + 2}
            y={quarter + 2}
            width={half - 4}
            height={half - 4}
            fill="none"
            stroke={color}
            strokeWidth="0.6"
          />

          {/* 8-pointed star — cross lines through diamond */}
          <line
            x1={half}
            y1={0}
            x2={half}
            y2={tileSize}
            stroke={color}
            strokeWidth="0.5"
          />
          <line
            x1={0}
            y1={half}
            x2={tileSize}
            y2={half}
            stroke={color}
            strokeWidth="0.5"
          />
          <line
            x1={0}
            y1={0}
            x2={tileSize}
            y2={tileSize}
            stroke={color}
            strokeWidth="0.4"
          />
          <line
            x1={tileSize}
            y1={0}
            x2={0}
            y2={tileSize}
            stroke={color}
            strokeWidth="0.4"
          />

          {/* Corner dots — connecting nodes */}
          <circle cx={0} cy={0} r="1.2" fill={color} />
          <circle cx={tileSize} cy={0} r="1.2" fill={color} />
          <circle cx={0} cy={tileSize} r="1.2" fill={color} />
          <circle cx={tileSize} cy={tileSize} r="1.2" fill={color} />
          <circle cx={half} cy={0} r="1" fill={color} />
          <circle cx={0} cy={half} r="1" fill={color} />
          <circle cx={tileSize} cy={half} r="1" fill={color} />
          <circle cx={half} cy={tileSize} r="1" fill={color} />
          {/* Centre node */}
          <circle cx={half} cy={half} r="1.5" fill={color} />
        </pattern>
      </defs>

      <rect
        width="100%"
        height="100%"
        fill={`url(#${patternId})`}
        opacity={opacity}
      />
    </svg>
  );
}

/**
 * Hero version — used on the Login screen full-bleed background.
 * Slightly denser tile size for more visual impact.
 */
export function JaaliHero() {
  return (
    <MughalJaaliPattern
      opacity={0.14}
      color="#FFFFFF"
      tileSize={32}
      width="100%"
      height="100%"
    />
  );
}

/**
 * Card version — used on process step cards (Screen 3).
 * Lighter opacity so card content remains readable.
 */
export function JaaliCard() {
  return (
    <MughalJaaliPattern
      opacity={0.1}
      color="#FFFFFF"
      tileSize={40}
      width="100%"
      height="100%"
    />
  );
}
