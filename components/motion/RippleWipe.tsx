import DiyaGlyph from "@/components/ui/DiyaGlyph";
import Static from "@/components/ui/Static";

/**
 * Water-ripple transition between major sections: concentric rings spread
 * out from a diya as the divider scrolls through the viewport (scrubbed by
 * <RevealController>, which finds `data-ripple`). Server component; under
 * reduced motion it is the plain divider — thin gold line + glyph.
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
          <line x1="0" y1="80" x2="640" y2="80" stroke="var(--kashi-diya)" strokeWidth="1" opacity="0.35" />
          <line x1="960" y1="80" x2="1600" y2="80" stroke="var(--kashi-diya)" strokeWidth="1" opacity="0.35" />
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
        <DiyaGlyph className="relative h-10 w-10 drop-shadow-[0_0_12px_rgba(255,210,122,0.6)]" />
      </div>
    </Static>
  );
}
