"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { detectHeroMode, type HeroMode } from "@/lib/device";

// The three.js bundle is only fetched when the device qualifies.
const HeroCanvas = dynamic(() => import("./HeroCanvas"), { ssr: false });

/**
 * Decides at runtime whether to mount the 3D scene, fades it in once the first
 * frame exists, and pauses the render loop when the hero scrolls out of view.
 */
export default function HeroScene() {
  const [mode, setMode] = useState<HeroMode | null>(null);
  const [ready, setReady] = useState(false);
  const [inView, setInView] = useState(true);
  const wrapper = useRef<HTMLDivElement>(null);

  // Probe after hydration has committed so the WebGL check never delays paint.
  useEffect(() => {
    const id = requestAnimationFrame(() => setMode(detectHeroMode()));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const el = wrapper.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.02 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [mode]);

  if (mode !== "full") return null;

  return (
    <div
      ref={wrapper}
      aria-hidden="true"
      className="absolute inset-0 transition-opacity duration-[1600ms] ease-out"
      style={{ opacity: ready ? 1 : 0 }}
    >
      <HeroCanvas active={inView} onReady={() => setReady(true)} />
    </div>
  );
}
