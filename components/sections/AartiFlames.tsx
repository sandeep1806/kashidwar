"use client";

import { useEffect, useRef } from "react";
import { useGsap } from "@/components/motion/SmoothScroll";
import { getSoundOn } from "@/components/ui/SoundToggle";
import { ambient } from "@/lib/ambient";
import { prefersReducedMotion } from "@/lib/device";

const STANDS = [0, 1, 2, 3, 4, 5, 6];

/**
 * The Aarti finale: seven tiered lamps whose flames flicker with noise-driven
 * scale/opacity (GSAP, repeatRefresh with random values), plus a bell cue
 * when the section enters, if the visitor turned sound on. Reduced motion:
 * static flames, no cue.
 */
export default function AartiFlames() {
  const root = useRef<HTMLDivElement>(null);
  const g = useGsap();

  useEffect(() => {
    const el = root.current;
    if (!g || !el || prefersReducedMotion()) return;
    const ctx = g.gsap.context(() => {
      const flames = g.gsap.utils.toArray<SVGElement>(".aarti-flame", el);
      flames.forEach((f) => {
        g.gsap.to(f, {
          scaleY: () => 0.85 + Math.random() * 0.35,
          scaleX: () => 0.9 + Math.random() * 0.2,
          opacity: () => 0.75 + Math.random() * 0.25,
          x: () => (Math.random() - 0.5) * 1.5,
          duration: () => 0.12 + Math.random() * 0.2,
          ease: "sine.inOut",
          repeat: -1,
          repeatRefresh: true,
          transformOrigin: "50% 100%",
        });
      });
      g.ScrollTrigger.create({
        trigger: el,
        start: "top 70%",
        once: true,
        onEnter: () => {
          if (getSoundOn()) ambient.bell();
        },
      });
    }, el);
    return () => ctx.revert();
  }, [g]);

  return (
    <div ref={root} className="mx-auto flex max-w-4xl items-end justify-center gap-4 sm:gap-8" aria-hidden="true">
      {STANDS.map((i) => {
        const h = i === 3 ? 1 : i === 2 || i === 4 ? 0.88 : i === 1 || i === 5 ? 0.76 : 0.64;
        return (
          <svg key={i} viewBox="0 0 80 190" className="w-10 sm:w-16" style={{ height: `${190 * h * 0.6}px` }}>
            <rect x="37" y="60" width="6" height="130" fill="#5A3A2E" />
            {[0, 1, 2, 3].map((t) => (
              <g key={t} transform={`translate(40 ${150 - t * 34})`}>
                <path d={`M${-30 + t * 5} 0 q${30 - t * 5} 12 ${60 - t * 10} 0 l-5 8 q${-25 + t * 5} 6 ${-50 + t * 10} 0z`} fill="#8a4b2f" />
                {[-20 + t * 4, 0, 20 - t * 4].map((fx) => (
                  <path
                    key={fx}
                    className="aarti-flame"
                    d={`M${fx} -4 c4 -9 7 -13 7 -19 a7 7 0 0 1 -14 0 c0 -6 3 -10 7 -19z`}
                    fill="url(#aarti-flame-grad)"
                    style={{ transformBox: "fill-box", transformOrigin: "50% 100%" }}
                  />
                ))}
              </g>
            ))}
            {i === 3 && (
              <defs>
                <linearGradient id="aarti-flame-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#FFE7B0" />
                  <stop offset="0.6" stopColor="#F2A93B" />
                  <stop offset="1" stopColor="#E0782A" />
                </linearGradient>
              </defs>
            )}
          </svg>
        );
      })}
    </div>
  );
}
