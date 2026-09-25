"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import StaggerCards from "@/components/motion/StaggerCards";
import FaithGlyph from "@/components/ui/FaithGlyph";

import PlaceCard, { type PlaceLabels } from "@/components/ui/PlaceCard";
import { PLACE_FILTERS, placeMatches, type Faith, type Place, type PlaceFilter } from "@/lib/contentTypes";

const KashiMap = dynamic(() => import("@/components/ui/KashiMap"), { ssr: false });
// The modal brings `motion` with it; fetch it on first open, not on page load.
const Modal = dynamic(() => import("@/components/ui/Modal"), { ssr: false });

export interface ExplorerPlace {
  place: Place;
  primaryName: string;
  secondaryName: string;
  hasImage: boolean;
}

export interface ExplorerLabels extends PlaceLabels {
  filters: Record<PlaceFilter, string>;
  /** ICU-style templates with a `{count}` placeholder (formatted here, not on the server) */
  results: string;
  tips: string;
  sources: string;
  showOnMap: string;
  close: string;
  mapTitle: string;
  mapLoading: string;
  approxCoords: string;
  cluster: string;
}

const withCount = (template: string, n: number) => template.replace("{count}", String(n));

/** `#places/jain` style hash → filter id, so faith tiles can deep-link into the grid. */
function readHashFilter(): PlaceFilter | null {
  const m = /^#places\/([a-z]+)$/.exec(window.location.hash);
  const f = m?.[1];
  return f && (PLACE_FILTERS as readonly string[]).includes(f) ? (f as PlaceFilter) : null;
}
function subscribeHash(cb: () => void) {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
}

export default function PlacesExplorer({
  items,
  labels,
}: {
  items: ExplorerPlace[];
  labels: ExplorerLabels;
}) {
  const hashFilter = useSyncExternalStore(subscribeHash, readHashFilter, () => null);
  const [picked, setPicked] = useState<PlaceFilter | null>(null);
  const filter: PlaceFilter = picked ?? hashFilter ?? "all";

  const [selected, setSelected] = useState<ExplorerPlace | null>(null);
  const [focus, setFocus] = useState<Place | null>(null);
  const [mapWanted, setMapWanted] = useState(false);
  const mapHost = useRef<HTMLDivElement>(null);

  // Load Leaflet only once the map area approaches the viewport.
  useEffect(() => {
    const el = mapHost.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setMapWanted(true);
          io.disconnect();
        }
      },
      { rootMargin: "600px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const visible = useMemo(() => items.filter((i) => placeMatches(i.place, filter)), [items, filter]);
  const visiblePlaces = useMemo(() => visible.map((i) => i.place), [visible]);
  const byId = useMemo(() => new Map(items.map((i) => [i.place.id, i])), [items]);

  const choose = (f: PlaceFilter) => {
    setPicked(f);
    setFocus(null);
    history.replaceState(null, "", f === "all" ? "#places" : `#places/${f}`);
  };
  const openPlace = useCallback((p: Place) => setSelected(byId.get(p.id) ?? null), [byId]);
  const close = useCallback(() => setSelected(null), []);
  const showOnMap = () => {
    if (!selected) return;
    setFocus(selected.place);
    setMapWanted(true);
    setSelected(null);
    mapHost.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const sel = selected?.place;
  const selFaiths: Faith[] = sel ? (sel.faith.length ? sel.faith : ["secular"]) : [];

  return (
    <div className="container-kashi">
      <div role="group" aria-label={labels.filters.all} className="flex flex-wrap justify-center gap-2">
        {PLACE_FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => choose(f)}
            aria-pressed={filter === f}
            className={`rounded-full border px-4 py-1.5 text-sm transition-colors duration-300 ${
              filter === f
                ? "border-kashi-saffron bg-kashi-saffron/15 text-kashi-white"
                : "border-kashi-ash/25 text-kashi-ash/80 hover:border-kashi-marigold/70 hover:text-kashi-white"
            }`}
          >
            {labels.filters[f]}
          </button>
        ))}
      </div>
      <p className="mt-4 text-center text-sm text-kashi-ash/60" aria-live="polite">
        {withCount(labels.results, visible.length)}
      </p>

      <StaggerCards className="mt-10 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {visible.map((item) => (
          <PlaceCard
            key={item.place.id}
            place={item.place}
            primaryName={item.primaryName}
            secondaryName={item.secondaryName}
            hasImage={item.hasImage}
            labels={labels}
            onOpen={openPlace}
          />
        ))}
      </StaggerCards>

      <div
        ref={mapHost}
        className="relative mt-16 h-[70vh] min-h-[420px] overflow-hidden rounded-kashi border border-kashi-rudraksha/60"
        aria-label={labels.mapTitle}
        role="region"
      >
        {mapWanted ? (
          <KashiMap places={visiblePlaces} focus={focus} onSelect={openPlace} clusterLabel={(n) => withCount(labels.cluster, n)} />
        ) : (
          <div className="flex h-full items-center justify-center bg-kashi-indigo/40 text-sm text-kashi-ash/60">
            {labels.mapLoading}
          </div>
        )}
      </div>

      <Modal open={!!selected} onClose={close} labelledBy="place-modal-title" closeLabel={labels.close}>
        {selected && sel && (
          <div className="p-6 sm:p-10">
            <p className="mb-2 flex flex-wrap items-center gap-2 text-xs text-kashi-diya">
              {selFaiths.map((f) => (
                <span key={f} className="inline-flex items-center gap-1 rounded-full border border-kashi-diya/40 px-2 py-0.5">
                  <FaithGlyph faith={f} className="h-3.5 w-3.5" />
                  {labels.faiths[f]}
                </span>
              ))}
              <span className="rounded-full bg-kashi-rudraksha/50 px-2 py-0.5 text-kashi-ash/80">{labels.types[sel.type]}</span>
            </p>
            <h3 id="place-modal-title" className="text-h2 leading-tight text-kashi-white">
              {selected.primaryName}
              <span className="mt-1 block font-body text-base tracking-normal text-kashi-ash/70">{selected.secondaryName}</span>
            </h3>
            <p className="mt-6 text-lg leading-relaxed text-kashi-ash">{sel.summary}</p>
            {sel.story && <p className="mt-4 border-l-2 border-kashi-diya/50 pl-4 italic text-kashi-ash/85">{sel.story}</p>}
            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-[0.18em] text-kashi-diya">{labels.bestTime}</dt>
                <dd className="mt-1 text-kashi-ash/90">{sel.bestTime}</dd>
              </div>
              {sel.tips?.length ? (
                <div>
                  <dt className="text-xs uppercase tracking-[0.18em] text-kashi-diya">{labels.tips}</dt>
                  <dd className="mt-1">
                    <ul className="list-disc space-y-1 pl-4 text-kashi-ash/90">
                      {sel.tips.map((t) => (
                        <li key={t}>{t}</li>
                      ))}
                    </ul>
                  </dd>
                </div>
              ) : null}
            </dl>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={showOnMap}
                className="inline-flex items-center gap-2 rounded-kashi bg-kashi-saffron px-5 py-2.5 text-sm font-medium text-kashi-night transition-colors hover:bg-kashi-marigold"
              >
                {labels.showOnMap}
              </button>
              {sel.coordsVerified === false && <span className="text-xs text-kashi-ash/60">{labels.approxCoords}</span>}
            </div>
            {sel.sources.length > 0 && (
              <p className="mt-6 text-xs text-kashi-ash/60">
                {labels.sources}:{" "}
                {sel.sources.map((s, i) => (
                  <span key={s.url}>
                    {i > 0 && " · "}
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline decoration-kashi-diya/40 underline-offset-2 hover:text-kashi-diya">
                      {s.title}
                    </a>
                  </span>
                ))}
              </p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
