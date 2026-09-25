"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/device";
import type { Script } from "@/lib/i18n/locales";
import { useGsap } from "./SmoothScroll";

/**
 * Heading text reveal (DESIGN.md → Section enter): SplitText pieces rise from
 * below with a slight blur → sharp, 0.8 s power3.out, once, on scroll.
 * Latin splits into characters; Indic scripts split into words only, so
 * conjuncts and matras are never broken apart.
 */
export default function TextReveal({
  text,
  script,
  className,
}: {
  text: string;
  script: Script;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const g = useGsap();

  useEffect(() => {
    const el = ref.current;
    if (!g || !el || prefersReducedMotion()) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.85) return;
    const byChar = script === "latin";
    const split = g.SplitText.create(el, {
      type: byChar ? "chars,words" : "words",
      autoSplit: true,
      aria: "none", // the sr-only twin carries the accessible text
      onSplit: (self) =>
        g.gsap.from(byChar ? self.chars : self.words, {
          yPercent: 60,
          opacity: 0,
          filter: "blur(6px)",
          stagger: byChar ? 0.02 : 0.06,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
        }),
    });
    return () => split.revert();
  }, [g, script]);

  return (
    <>
      <span className="sr-only">{text}</span>
      <span ref={ref} className={className} aria-hidden="true">
        {text}
      </span>
    </>
  );
}
