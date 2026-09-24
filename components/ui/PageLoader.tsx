"use client";

import { useEffect, useRef, useState, type AnimationEvent } from "react";
import { useLenis } from "@/components/motion/SmoothScroll";
import DiyaGlyph from "./DiyaGlyph";

const SESSION_KEY = "kashi:loader";

/**
 * Black → one diya ignites → light spreads → reveal. ≤ 1.8 s, skippable,
 * once per session. Pure CSS keyframes (see globals.css → "Page loader"), so
 * it starts on first paint without waiting for any JS; under reduced motion
 * the media query swaps it for a single 300 ms fade.
 *
 * SSR renders the overlay so the page never flashes before it. On repeat
 * visits an inline script in the layout hides it instantly and this component
 * unmounts itself right after hydration.
 */
/**
 * Strings arrive as props from the server layout so this client component does
 * not need next-intl's client runtime or the message bundle in the browser.
 */
export default function PageLoader({
  labels,
}: {
  labels: { loading: string; skip: string };
}) {
  const [done, setDone] = useState(false);
  const [skipped, setSkipped] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const lenis = useLenis();

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
      /* storage unavailable: play the loader */
    }
    if (!seen) return;
    // Already hidden by the inline script; unmount on the next frame.
    const id = requestAnimationFrame(() => setDone(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Hold the page still while the lamp is lit.
  useEffect(() => {
    if (!lenis || done) return;
    lenis.stop();
    return () => lenis.start();
  }, [lenis, done]);

  const finish = () => {
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      /* ignore */
    }
    document.documentElement.setAttribute("data-loader", "done");
    setDone(true);
  };

  const onAnimationEnd = (e: AnimationEvent<HTMLDivElement>) => {
    if (e.target === root.current && e.animationName.startsWith("loader-out")) {
      finish();
    }
  };

  if (done) return null;

  return (
    <div
      ref={root}
      onAnimationEnd={onAnimationEnd}
      // Keep every Tailwind class inside a plain string literal: the scanner
      // does not see a class that is glued to a `${}` interpolation.
      className={["page-loader fixed inset-0 z-[100]", skipped ? "is-skipped" : ""]
        .join(" ")
        .trim()}
      role="status"
      aria-live="polite"
      aria-label={labels.loading}
    >
      <div
        className="loader-spread absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle at 50% 55%, var(--kashi-indigo) 0%, var(--kashi-night) 65%)",
        }}
      />
      <div
        className="loader-glow absolute left-1/2 top-1/2 h-[70vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, color-mix(in oklab, var(--kashi-diya) 55%, transparent) 0%, color-mix(in oklab, var(--kashi-saffron) 18%, transparent) 35%, transparent 68%)",
        }}
      />
      <DiyaGlyph className="loader-flame absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_0_24px_rgba(255,210,122,0.55)]" />
      <button
        type="button"
        onClick={() => setSkipped(true)}
        className="absolute bottom-8 right-8 rounded-kashi border border-kashi-ash/30 px-4 py-2 text-sm text-kashi-ash/80 transition-colors hover:border-kashi-marigold hover:text-kashi-white"
      >
        {labels.skip}
      </button>
    </div>
  );
}
