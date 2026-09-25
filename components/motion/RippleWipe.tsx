"use client";

import { useEffect, useRef } from "react";
import DiyaGlyph from "@/components/ui/DiyaGlyph";
import { prefersReducedMotion } from "@/lib/device";
import { useGsap } from "./SmoothScroll";

/**
 * Water-ripple transition between major sections: concentric rings spread
 * out from a diya as the divider scrolls through the viewport (scrubbed).
 * Under reduced motion it is the plain divider — thin gold line + glyph.
 */
export default function RippleWipe({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const g = useGsap();

  useEffect(() => {
    const el = ref.current;
    if (!g || !el || prefersReducedMotion()) return;
    const ctx = g.gsap.context(() => {
      const rings = g.gsap.utils.toArray<SVGElement>("[data-ring]", el);
      g.gsap.fromTo(
        rings,
        { scale: 0.15, opacity: 0, transformOrigin: "50% 50%" },
        {
          scale: 1,
          opacity: 0.8,
          stagger: 0.12,
          ease: "expo.inOut",
          scrollTrigger: { trigger: el, start: "top 95%", end: "bottom 45%", scrub: 0.5 },
        },
      );
    }, el);
    return () => ctx.revert();
  }, [g]);

  return (
    <div
      ref={ref}
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
  );
}
