"use client";

import dynamic from "next/dynamic";
import type { PlaceLite } from "@/lib/contentTypes";
import { useApproach } from "@/lib/useApproach";

const KashiMap = dynamic(() => import("@/components/ui/KashiMap"), { ssr: false });

/**
 * Map island for a detail page: the page's own pin (focused) plus related
 * places. Leaflet loads only when the block approaches; clicking another pin
 * opens that place's page.
 */
export default function PageMap({
  title,
  loading,
  places,
  focusId,
  hrefs,
  clusterTemplate,
}: {
  title: string;
  loading: string;
  places: PlaceLite[];
  focusId?: string;
  hrefs: Record<string, string>;
  clusterTemplate: string;
}) {
  const { ref, ready } = useApproach<HTMLDivElement>("400px 0px");
  const focus = places.find((p) => p.id === focusId) ?? null;
  return (
    <section className="container-kashi mt-12">
      <h2 className="text-h3 text-kashi-white">{title}</h2>
      <div ref={ref} role="region" aria-label={title} className="relative mt-6 h-[55vh] min-h-[340px] overflow-hidden rounded-kashi border border-kashi-rudraksha/60">
        {ready ? (
          <KashiMap
            places={places}
            focus={focus}
            onSelect={(p) => {
              if (hrefs[p.id] && p.id !== focusId) window.location.assign(hrefs[p.id]);
            }}
            clusterLabel={(n) => clusterTemplate.replace("{count}", String(n))}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-kashi-indigo/40 text-sm text-kashi-ash/60">{loading}</div>
        )}
      </div>
    </section>
  );
}
