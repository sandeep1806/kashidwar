"use client";

import { useEffect } from "react";

/** Sets the tab title after mount, for routes that cannot export metadata (the locale not-found page). */
export default function DocumentTitle({ title }: { title: string }) {
  useEffect(() => {
    const previous = document.title;
    document.title = title;
    return () => {
      document.title = previous;
    };
  }, [title]);
  return null;
}
