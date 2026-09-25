"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { PlacesProps } from "@/lib/sectionProps";
import { useApproach } from "@/lib/useApproach";

// The grid, filters, modal and map hydrate only once the section is near or
// the browser is idle; their data comes from the prerendered JSON endpoint so
// the page HTML carries only the heading and intro.
const PlacesExplorer = dynamic(() => import("./PlacesExplorer"), { ssr: false });

export default function PlacesBody({ locale, loadingLabel }: { locale: string; loadingLabel: string }) {
  const { ref, ready } = useApproach<HTMLDivElement>();
  const [data, setData] = useState<PlacesProps | null>(null);
  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    fetch(`/${locale}/data/places`)
      .then((r) => r.json())
      .then((d: PlacesProps) => {
        if (!cancelled) setData(d);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [ready, locale]);
  return (
    <div ref={ref} className="min-h-[60vh]" aria-busy={ready && !data}>
      {data ? <PlacesExplorer items={data.items} labels={data.labels} /> : ready ? <p className="text-center text-sm text-kashi-ash/50">{loadingLabel}</p> : null}
    </div>
  );
}
