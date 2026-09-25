"use client";

import { useEffect } from "react";

/**
 * Attaches the next/font variable classes to <html> after first paint.
 *
 * Why: a family is only downloaded once an element uses it, so deferring the
 * body classes keeps those files (~100 KB) off the LCP critical path while
 * the display faces the hero paints with are applied at once. To avoid one relayout per arriving file, the files are fetched
 * first with `document.fonts.load()` (no element, so no style or layout
 * work); once all have arrived the classes move to <html> — a single swap, at
 * idle, under the page loader on first visits. Repeat visits get the classes from the inline
 * snippet in the layout before paint (files are cached), so nothing swaps.
 */
export default function DeferredFonts({ classes, fonts, sample }: { classes: string; fonts: string[]; sample: string }) {
  useEffect(() => {
    const list = classes.split(" ").filter(Boolean);
    if (!list.length || document.documentElement.classList.contains(list[0])) return;
    let cancelled = false;
    const warm = () => {
      // Latin + Devanagari + the locale's own script, so every unicode-range
      // slice the page will use is fetched before the swap.
      const text = `Kashi काशी ${sample}`;
      Promise.all(fonts.map((f) => document.fonts.load(f, text).catch(() => [])))
        .then(() => {
          if (!cancelled) document.documentElement.classList.add(...list);
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
    };
  }, [classes, fonts, sample]);
  return null;
}
