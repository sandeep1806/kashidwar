"use client";

import { useEffect, useState } from "react";

/**
 * Subtle position indicator for wide screens: one dot per section on the
 * right edge; the current section's dot glows, hovering shows its name.
 */
export default function SectionDots({ label, items }: { label: string; items: { id: string; label: string }[] }) {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    const els = items.map((s) => document.getElementById(s.id)).filter((e): e is HTMLElement => !!e);
    if (!els.length) return;
    // Active = the last section whose top has passed 45% of the viewport. At the
    // end of the page (footer in view, or scrolled to the bottom) it is the last
    // section. Measuring a section element itself does not force layout of its
    // content-visibility: auto contents.
    let frame = 0;
    const update = () => {
      frame = 0;
      const line = window.innerHeight * 0.45;
      const footer = document.getElementById("site-footer");
      const atEnd =
        window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4 ||
        (footer ? footer.getBoundingClientRect().top < window.innerHeight * 0.6 : false);
      let current: string | null = null;
      if (atEnd) current = els[els.length - 1].id;
      else for (const el of els) if (el.getBoundingClientRect().top <= line) current = el.id;
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [items]);

  return (
    <nav aria-label={label} className="fixed right-5 top-1/2 z-[60] hidden -translate-y-1/2 lg:block">
      <ul className="flex flex-col items-end gap-3">
        {items.map((s) => {
          const on = s.id === active;
          return (
            <li key={s.id}>
              <a href={`#${s.id}`} aria-current={on ? "true" : undefined} className="group flex items-center gap-3">
                <span className={`pointer-events-none rounded-full bg-kashi-night/80 px-2 py-0.5 text-xs text-kashi-ash opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 ${on ? "text-kashi-diya" : ""}`}>
                  {s.label}
                </span>
                <span className={`block rounded-full transition-all duration-500 ${on ? "h-2.5 w-2.5 bg-kashi-diya shadow-glow" : "h-1.5 w-1.5 bg-kashi-ash/40 group-hover:bg-kashi-marigold"}`} />
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
