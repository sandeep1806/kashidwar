import { useId } from "react";

/**
 * The diya glyph: a clay lamp with a single flame. Used by the page loader and
 * (from Phase 8) by section dividers. Pure SVG, colors from design tokens.
 */
export default function DiyaGlyph({
  className,
  flameClassName,
}: {
  className?: string;
  flameClassName?: string;
}) {
  const id = useId();
  const flameGrad = `${id}-flame`;
  const coreGrad = `${id}-core`;
  const bowlGrad = `${id}-bowl`;

  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={flameGrad} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--kashi-diya)" />
          <stop offset="0.55" stopColor="var(--kashi-marigold)" />
          <stop offset="1" stopColor="var(--kashi-saffron)" />
        </linearGradient>
        <radialGradient id={coreGrad} cx="0.5" cy="0.7" r="0.5">
          <stop offset="0" stopColor="var(--kashi-white)" />
          <stop offset="1" stopColor="var(--kashi-diya)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={bowlGrad} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8a4b2f" />
          <stop offset="1" stopColor="var(--kashi-rudraksha)" />
        </linearGradient>
      </defs>
      <g className={flameClassName}>
        <path
          d="M32 8 C37.5 18 42 22.5 42 29 A10 10 0 0 1 22 29 C22 22.5 26.5 18 32 8 Z"
          fill={`url(#${flameGrad})`}
        />
        <path
          d="M32 20 C35 25 37 27 37 30.5 A5 5 0 0 1 27 30.5 C27 27 29 25 32 20 Z"
          fill={`url(#${coreGrad})`}
        />
      </g>
      <rect x="31" y="35" width="2" height="4" rx="1" fill="#2a1208" />
      <path
        d="M10 40 Q32 48 54 40 Q52 52 32 54 Q12 52 10 40 Z"
        fill={`url(#${bowlGrad})`}
      />
      <path
        d="M10 40 Q32 48 54 40"
        fill="none"
        stroke="var(--kashi-diya)"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.9"
      />
    </svg>
  );
}
