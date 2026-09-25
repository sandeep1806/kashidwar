"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { ambient, SOUND_KEY } from "@/lib/ambient";

// Tiny store so other components (the aarti finale) can ask whether sound is on.
let on = false;
const listeners = new Set<() => void>();
const setOn = (v: boolean) => {
  on = v;
  listeners.forEach((l) => l());
};
/** Non-reactive read for callbacks (GSAP onEnter etc.). */
export const getSoundOn = () => on;

export function useSoundOn(): boolean {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => {
        listeners.delete(cb);
      };
    },
    () => on,
    () => false,
  );
}

/**
 * Floating bell toggle, bottom-right (DESIGN.md → Sound). Muted by default;
 * the choice persists in localStorage, but audio still only starts after a
 * gesture on this button (browser autoplay rules), so a remembered "on"
 * shows the bell lit and waits for the first tap.
 */
export default function SoundToggle({ labels }: { labels: { on: string; off: string } }) {
  const active = useSoundOn();
  const [remembered, setRemembered] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      try {
        setRemembered(localStorage.getItem(SOUND_KEY) === "1");
      } catch {
        /* ignore */
      }
    });
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const stopOnHide = () => {
      if (document.hidden && ambient.isRunning) {
        ambient.stop();
        setOn(false);
      }
    };
    document.addEventListener("visibilitychange", stopOnHide);
    return () => document.removeEventListener("visibilitychange", stopOnHide);
  }, []);

  const toggle = async () => {
    if (active) {
      ambient.stop();
      setOn(false);
      setRemembered(false);
      try {
        localStorage.setItem(SOUND_KEY, "0");
      } catch {
        /* ignore */
      }
      return;
    }
    await ambient.start();
    setOn(ambient.isRunning);
    setRemembered(true);
    try {
      localStorage.setItem(SOUND_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  const lit = active || remembered;
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={active}
      aria-label={active ? labels.on : labels.off}
      title={active ? labels.on : labels.off}
      className={`fixed bottom-5 right-5 z-[80] grid h-12 w-12 place-items-center rounded-full border bg-kashi-night/70 backdrop-blur-md transition-[border-color,box-shadow,color] duration-500 ease-enter sm:bottom-6 sm:right-6 ${
        lit ? "border-kashi-diya text-kashi-diya shadow-glow" : "border-kashi-ash/30 text-kashi-ash/70 hover:border-kashi-marigold hover:text-kashi-white"
      }`}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 3v2M7 10a5 5 0 0 1 10 0v4l1.5 2.5H5.5L7 14z" />
        <path d="M10 19a2 2 0 0 0 4 0" />
        {!active && <path d="M4 4l16 16" />}
      </svg>
      {active && <span aria-hidden="true" className="sound-ring absolute inset-0 rounded-full border border-kashi-diya/60" />}
    </button>
  );
}
