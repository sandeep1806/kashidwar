"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Compact fixed header. Transparent over the hero, a translucent night bar
 * once the page has scrolled; slides away on scroll-down and returns on
 * scroll-up (or when anything inside it has focus / an open menu), so it never
 * sits on top of content the visitor is reading — the phone-width overlap of
 * the old floating language pill.
 */
export default function SiteHeader({ brand, homeHref, children }: { brand: string; homeHref: string; children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const active = ref.current?.contains(document.activeElement) || ref.current?.querySelector('[aria-expanded="true"]');
        setScrolled(y > 24);
        if (active || y < 120) setHidden(false);
        else if (y > lastY + 6) setHidden(true);
        else if (y < lastY - 6) setHidden(false);
        lastY = y;
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      ref={ref}
      onFocus={() => setHidden(false)}
      className={[
        "site-header fixed inset-x-0 top-0 z-[80] transition-[transform,background-color,border-color] duration-500 ease-enter",
        hidden ? "-translate-y-full" : "translate-y-0",
        scrolled ? "border-b border-kashi-diya/15 bg-kashi-night/80 backdrop-blur-md" : "border-b border-transparent bg-transparent",
      ].join(" ")}
    >
      <div className="container-kashi flex h-14 items-center justify-between gap-3">
        <a href={homeHref} className="font-display text-lg text-kashi-white text-glow">
          {brand}
        </a>
        <div className="flex items-center gap-2">{children}</div>
      </div>
    </header>
  );
}
