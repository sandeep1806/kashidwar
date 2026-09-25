"use client";

import { useId, useState } from "react";
import type { Itinerary } from "@/lib/contentTypes";

export interface ItineraryLabels {
  tabs: string[];
  /** e.g. "Day {n}" */
  dayTemplate: string;
  sunrise: string;
  sunset: string;
  openPage: string;
  /** Page URL of each itinerary, same order as `itineraries` */
  pageHrefs: string[];
}

function SunGlyph({ set = false, className = "h-4 w-4" }: { set?: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <path d="M3 17h18M6 17a6 6 0 0 1 12 0" />
      <path d={set ? "M12 3v5m-3-2 3 3 3-3" : "M12 8V3m-3 2 3-3 3 3"} />
      <path d="M4.5 11.5l1.5 1M19.5 11.5l-1.5 1" />
    </svg>
  );
}

/** 1 / 2 / 3-day tabs with a vertical timeline; sunrise/sunset stops are marked (DESIGN.md → Itinerary strips). */
export default function ItineraryTabs({
  itineraries,
  labels,
  placeNames,
}: {
  itineraries: Itinerary[];
  labels: ItineraryLabels;
  placeNames: Record<string, string>;
}) {
  const [active, setActive] = useState(0);
  const id = useId();
  const current = itineraries[active];

  return (
    <div className="container-kashi">
      <div role="tablist" aria-label={labels.tabs.join(" / ")} className="flex justify-center gap-2">
        {itineraries.map((it, i) => (
          <button
            key={it.id}
            role="tab"
            id={`${id}-tab-${i}`}
            aria-selected={active === i}
            aria-controls={`${id}-panel-${i}`}
            tabIndex={active === i ? 0 : -1}
            onClick={() => setActive(i)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") setActive((a) => (a + 1) % itineraries.length);
              if (e.key === "ArrowLeft") setActive((a) => (a - 1 + itineraries.length) % itineraries.length);
            }}
            className={`rounded-full border px-5 py-2 text-sm transition-colors duration-300 ${
              active === i ? "border-kashi-saffron bg-kashi-saffron/15 text-kashi-white" : "border-kashi-ash/25 text-kashi-ash/80 hover:border-kashi-marigold/70"
            }`}
          >
            {labels.tabs[i]}
          </button>
        ))}
      </div>

      <div role="tabpanel" id={`${id}-panel-${active}`} aria-labelledby={`${id}-tab-${active}`} className="mx-auto mt-10 max-w-3xl">
        <p className="text-center text-lg text-kashi-ash/90">{current.summary}</p>
        <p className="mt-3 text-center text-sm">
          <a href={labels.pageHrefs[active]} className="text-kashi-diya underline decoration-kashi-diya/40 underline-offset-4 hover:text-kashi-marigold">
            {labels.openPage} →
          </a>
        </p>
        {current.plan.map((day) => (
          <div key={day.day} className="mt-10">
            <h3 className="flex items-center gap-4 text-h3 text-kashi-white">
              <span>{labels.dayTemplate.replace("{n}", String(day.day))}</span>
              <span className="text-base font-normal text-kashi-ash/70">{day.theme}</span>
            </h3>
            <ol className="relative mt-6 border-l border-kashi-diya/30 pl-8">
              {day.stops.map((s) => (
                <li key={s.time + s.title} className="relative pb-7 last:pb-0">
                  <span
                    aria-hidden="true"
                    className={`absolute -left-[2.35rem] top-1 grid h-7 w-7 place-items-center rounded-full border ${
                      s.marker ? "border-kashi-diya bg-kashi-night text-kashi-diya shadow-glow" : "border-kashi-rudraksha bg-kashi-night"
                    }`}
                  >
                    {s.marker === "sunrise" && <SunGlyph />}
                    {s.marker === "sunset" && <SunGlyph set />}
                    {!s.marker && <span className="h-1.5 w-1.5 rounded-full bg-kashi-ash/60" />}
                  </span>
                  <p className="flex flex-wrap items-baseline gap-x-3 text-sm text-kashi-diya">
                    <span className="font-display-latin tracking-[0.2em]">{s.time}</span>
                    {s.marker && <span className="text-xs uppercase tracking-[0.15em] text-kashi-diya/70">{s.marker === "sunrise" ? labels.sunrise : labels.sunset}</span>}
                  </p>
                  <h4 className="mt-1 text-lg text-kashi-white">
                    {s.placeId ? (
                      <a href="#places" className="underline decoration-kashi-diya/30 underline-offset-4 hover:text-kashi-diya">
                        {placeNames[s.placeId] ?? s.title}
                      </a>
                    ) : (
                      s.title
                    )}
                  </h4>
                  <p className="mt-1 text-sm text-kashi-ash/80">{s.note}</p>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </div>
  );
}
