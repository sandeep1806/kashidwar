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
    <div ref={root} className="relative mx-auto flex max-w-5xl items-end justify-center gap-3 sm:gap-6 lg:gap-10" aria-hidden="true">
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="aarti-flame-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFF1CC" />
            <stop offset="0.55" stopColor="#FFD27A" />
            <stop offset="1" stopColor="#E0782A" />
          </linearGradient>
          <radialGradient id="aarti-halo">
            <stop offset="0" stopColor="#FFD27A" stopOpacity="0.55" />
            <stop offset="0.5" stopColor="#E0782A" stopOpacity="0.18" />
            <stop offset="1" stopColor="#E0782A" stopOpacity="0" />
          </radialGradient>
          {[0, 1, 2, 3].map((t) => (
            <symbol key={t} id={`aarti-tier-${t}`} viewBox="-40 -30 80 40" overflow="visible">
              <path d={`M${-30 + t * 5} 0 q${30 - t * 5} 12 ${60 - t * 10} 0 l-5 8 q${-25 + t * 5} 6 ${-50 + t * 10} 0z`} fill="#9a5a36" />
              {[-20 + t * 4, 0, 20 - t * 4].map((fx) => (
                <path key={fx} d={`M${fx} -4 c4 -9 7 -13 7 -19 a7 7 0 0 1 -14 0 c0 -6 3 -10 7 -19z`} fill="url(#aarti-flame-grad)" />
              ))}
            </symbol>
          ))}
        </defs>
      </svg>
      {STANDS.map((i) => {
        const h = i === 3 ? 1 : i === 2 || i === 4 ? 0.88 : i === 1 || i === 5 ? 0.76 : 0.64;
        return (
          <svg key={i} viewBox="-10 -10 100 210" className="h-auto w-10 overflow-visible sm:w-16 lg:w-24" style={{ transform: `scale(${h})`, transformOrigin: "50% 100%" }}>
            <ellipse cx="40" cy="70" rx="60" ry="80" fill="url(#aarti-halo)" />
            <rect x="37" y="60" width="6" height="130" rx="2" fill="#5A3A2E" />
            <rect x="24" y="186" width="32" height="6" rx="3" fill="#5A3A2E" />
            {[0, 1, 2, 3].map((t) => (
              <use
                key={t}
                href={`#aarti-tier-${t}`}
                className="aarti-flame"
                x="0"
                y={150 - t * 34 - 30}
                width="80"
                height="40"
                style={{ transformBox: "fill-box", transformOrigin: "50% 100%" }}
              />
            ))}
          </svg>
        );
      })}
    </div>
  );
}
