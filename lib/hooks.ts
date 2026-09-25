"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Media query as an external store: false on the server and during hydration,
 * then the live value. No setState-in-effect, no hydration mismatch.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (cb: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", cb);
      return () => mql.removeEventListener("change", cb);
    },
    [query],
  );
  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

export function useReducedMotionPref(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}
