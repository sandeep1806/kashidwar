import type { CSSProperties } from "react";
import DiyaGlyph from "@/components/ui/DiyaGlyph";
import Static from "@/components/ui/Static";

/** Small diyas afloat on the water line: position, drift span, duration, delay (negative = already under way). */
const FLOATERS = [
  { left: "14%", span: "46px", dur: "15s", delay: "-4s" },
  { left: "30%", span: "30px", dur: "11s", delay: "-9s" },
  { left: "70%", span: "38px", dur: "13s", delay: "-2s" },
  { left: "86%", span: "52px", dur: "17s", delay: "-11s" },
];

/**
 * Water-ripple transition between major sections: the water line wipes out
 * from the centre and concentric rings spread from a diya as the divider
 * scrolls through the viewport (scrubbed by <RevealController>, which finds
 * `data-ripple`), while small diyas drift and bob on the line (CSS, running
 * only while the divider is in view). Server component; under reduced motion
 * it is the plain divider — thin gold line + glyph, the floaters still.
 */
export default function RippleWipe({ className = "" }: { className?: string }) {
  return (
    <Static>
      <div
        data-ripple=""
        aria-hidden="true"
        className={`ripple-wipe relative mx-auto flex h-40 w-full max-w-5xl items-center justify-center overflow-hidden ${className}`}
      >
        <svg viewBox="0 0 1600 160" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid meet">
          <line data-line="l" x1="0" y1="80" x2="640" y2="80" stroke="var(--kashi-diya)" strokeWidth="1" opacity="0.35" />
          <line data-line="r" x1="960" y1="80" x2="1600" y2="80" stroke="var(--kashi-diya)" strokeWidth="1" opacity="0.35" />
          {[1, 2, 3, 4].map((i) => (
            <ellipse
              key={i}
              data-ring
              cx="800"
              cy="80"
              rx={90 * i}
              ry={14 * i}
              fill="none"
              stroke="var(--kashi-diya)"
              strokeWidth="1"
              opacity="0.35"
            />
          ))}
        </svg>
        {FLOATERS.map((f) => (
          <span key={f.left} className="drift-diya" style={{ left: f.left, "--span": f.span, "--dur": f.dur, "--delay": f.delay } as CSSProperties} />
        ))}
        <DiyaGlyph className="relative h-10 w-10 drop-shadow-[0_0_12px_rgba(255,210,122,0.6)]" />
      </div>
    </Static>
  );
}
