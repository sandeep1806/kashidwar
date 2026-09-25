"use client";

import { useEffect, useRef, useState } from "react";

/**
 * True once the element comes within `rootMargin` of the viewport. Used to
 * defer heavy section bodies until they are needed. There is deliberately no
 * idle/timer fallback: mounting everything at idle just moves the work into
 * the time-to-interactive window on slow devices. Search engines that render
 * JS expand the viewport to trigger IntersectionObserver content, so the
 * sections are still indexed; the JSON-LD on the page lists the places too.
 */
export function useApproach<T extends HTMLElement = HTMLElement>(rootMargin = "1200px 0px") {
  const ref = useRef<T>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || ready) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setReady(true);
          io.disconnect();
        }
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ready, rootMargin]);
  return { ref, ready };
}
