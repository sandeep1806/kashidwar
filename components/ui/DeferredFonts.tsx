"use client";

import { useEffect } from "react";

/**
 * Attaches the next/font variable classes to <html> after first paint.
 *
 * Why: a family is only downloaded once an element uses it, so deferring the
 * body classes keeps those files (~100 KB) off the LCP critical path while
 * the display faces the hero paints with are applied at once. To avoid one relayout per arriving file, the classes are first put on
 * a hidden probe that mentions each family; once `document.fonts.ready`
 * resolves, the classes move to <html> — a single swap, at idle, under the
 * page loader on first visits. Repeat visits get the classes from the inline
 * snippet in the layout before paint (files are cached), so nothing swaps.
 */
export default function DeferredFonts({ classes, sample }: { classes: string; sample: string }) {
  useEffect(() => {
    const list = classes.split(" ").filter(Boolean);
    if (document.documentElement.classList.contains(list[0])) return;
    let cancelled = false;
    let probe: HTMLDivElement | null = null;
    const warm = () => {
      probe = document.createElement("div");
      probe.className = list.join(" ");
      probe.setAttribute("aria-hidden", "true");
      probe.style.cssText = "position:absolute;left:-9999px;top:0;width:1px;height:1px;overflow:hidden;visibility:hidden";
      // one span per family stack the CSS will use
      probe.innerHTML =
        '<span style="font-family:var(--font-body-latin)">Kashi</span>' +
        `<span style="font-family:var(--font-regional)">${sample}</span>`;
      document.body.appendChild(probe);
      document.fonts.ready.then(() => {
        if (cancelled) return;
        document.documentElement.classList.add(...list);
        probe?.remove();
        probe = null;
      });
    };
    let cancel: () => void;
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(warm);
      cancel = () => window.cancelIdleCallback(id);
    } else {
      const id = window.setTimeout(warm, 1200);
      cancel = () => window.clearTimeout(id);
    }
    return () => {
      cancelled = true;
      cancel();
      probe?.remove();
    };
  }, [classes, sample]);
  return null;
}
