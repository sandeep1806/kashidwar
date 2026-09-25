"use client";

import { useRef } from "react";
import type { Script } from "@/lib/i18n/locales";
import { useRevealOnEnter } from "./useRevealOnEnter";

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
  const pieces = useRef<Element[]>([]);
  const byChar = script === "latin";
  // Split only when the heading approaches (SplitText measures lines, which
  // would force layout of every skipped section if done for all at once).
  useRevealOnEnter(
    ref,
    (g, el) => {
      g.SplitText.create(el, {
        type: byChar ? "chars,words" : "words",
        aria: "none", // the sr-only twin carries the accessible text
        onSplit: (self) => {
          pieces.current = byChar ? self.chars : self.words;
          g.gsap.set(pieces.current, { yPercent: 60, opacity: 0, filter: "blur(6px)" });
        },
      });
    },
    (g) => {
      g.gsap.to(pieces.current, { yPercent: 0, opacity: 1, filter: "blur(0px)", stagger: byChar ? 0.02 : 0.06, duration: 0.8, ease: "power3.out" });
    },
    [byChar],
  );

  return (
    <>
      <span className="sr-only">{text}</span>
      <span ref={ref} className={className} aria-hidden="true">
        {text}
      </span>
    </>
  );
}
