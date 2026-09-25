import type { Script } from "@/lib/i18n/locales";

/**
 * Heading text reveal (DESIGN.md → Section enter): SplitText pieces rise from
 * below with a slight blur → sharp, 0.8 s power3.out, once, on scroll.
 * Latin splits into characters; Indic scripts split into words only, so
 * conjuncts and matras are never broken apart. A server component:
 * <RevealController> does the splitting and animation.
 */
export default function TextReveal({ text, script, className }: { text: string; script: Script; className?: string }) {
  return (
    <>
      <span className="sr-only">{text}</span>
      <span data-split={script === "latin" ? "chars" : "words"} className={className} aria-hidden="true">
        {text}
      </span>
    </>
  );
}
