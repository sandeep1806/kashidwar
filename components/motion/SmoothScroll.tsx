"use client";

import type Lenis from "lenis";
import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { prefersReducedMotion } from "@/lib/device";

type GsapModule = typeof import("@/lib/gsap");

/**
 * Tiny external stores so consumers can subscribe to the live Lenis instance
 * and the lazily-loaded GSAP module without any setState-in-effect.
 */
function createStore<T>(initial: T) {
  let value = initial;
  const listeners = new Set<() => void>();
  return {
    subscribe(cb: () => void) {
      listeners.add(cb);
      return () => {
        listeners.delete(cb);
      };
    },
    get: () => value,
    set(next: T) {
      value = next;
      listeners.forEach((cb) => cb());
    },
  };
}

const lenisStore = createStore<Lenis | null>(null);
const gsapStore = createStore<GsapModule | null>(null);

/** The live Lenis instance, or null under reduced motion / before it loads. */
export function useLenis(): Lenis | null {
  return useSyncExternalStore(lenisStore.subscribe, lenisStore.get, () => null);
}

/**
 * GSAP + ScrollTrigger + SplitText, registered, once the bundle has loaded
 * after hydration. Null before that. Animate in an effect keyed on the result:
 *
 *   const g = useGsap();
 *   useEffect(() => { if (!g) return; const ctx = g.gsap.context(...); return () => ctx.revert(); }, [g]);
 */
export function useGsap(): GsapModule | null {
  return useSyncExternalStore(gsapStore.subscribe, gsapStore.get, () => null);
}

/**
 * Layout-level motion provider. GSAP and Lenis are imported after hydration so
 * they never sit on the first-paint critical path. Lenis is driven by GSAP's
 * ticker so ScrollTrigger and Lenis share one clock (no pinned-section jitter).
 * Under reduced motion Lenis is skipped entirely; native scrolling takes over.
 */
function whenIdle(cb: () => void, timeout = 1500): () => void {
  if (typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(cb, { timeout });
    return () => window.cancelIdleCallback(id);
  }
  const id = window.setTimeout(cb, 200);
  return () => window.clearTimeout(id);
}

export default function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    let cancelled = false;
    let cleanup: (() => void) | undefined;

    // Wait for an idle moment (or 1.5 s) so the motion bundle never competes
    // with hydration and first input.
    const cancelIdle = whenIdle(async () => {
      const g = await import("@/lib/gsap");
      if (cancelled) return;
      g.registerGsap();
      gsapStore.set(g);

      if (prefersReducedMotion()) return;

      const { default: LenisCtor } = await import("lenis");
      if (cancelled) return;

      const instance = new LenisCtor({
        lerp: 0.1,
        smoothWheel: true,
        syncTouch: false,
        autoRaf: false,
        anchors: { offset: 0 },
      });
      const tick = (time: number) => instance.raf(time * 1000);
      g.gsap.ticker.add(tick);
      g.gsap.ticker.lagSmoothing(0);
      const unsubscribe = instance.on("scroll", g.ScrollTrigger.update);
      lenisStore.set(instance);

      cleanup = () => {
        unsubscribe();
        g.gsap.ticker.remove(tick);
        instance.destroy();
        lenisStore.set(null);
      };
    });

    return () => {
      cancelled = true;
      cancelIdle();
      cleanup?.();
    };
  }, []);

  return children;
}
