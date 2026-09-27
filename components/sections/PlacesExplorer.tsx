"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type MouseEvent, type ReactNode } from "react";
import { URL_EVENT, writeHash } from "@/components/motion/HashLinks";
import { scrollToElement } from "@/components/motion/SmoothScroll";
import EnglishNote from "@/components/ui/EnglishNote";
import FaithGlyph from "@/components/ui/FaithGlyph";

import Photo from "@/components/ui/Photo";
import type { PlaceLabels } from "@/components/ui/PlaceCard";
import { PLACE_FILTERS, placeMatches, type Faith, type PhotoData, type PlaceDetail, type PlaceFilter, type PlaceLite as Place } from "@/lib/contentTypes";

const KashiMap = dynamic(() => import("@/components/ui/KashiMap"), { ssr: false });
// The modal brings `motion` with it; fetch it on first open, not on page load.
const Modal = dynamic(() => import("@/components/ui/Modal"), { ssr: false });

/** One fetch per page: the modal prose for every place in this locale. */
let detailsPromise: Promise<Record<string, PlaceDetail>> | null = null;
function loadDetails(url: string) {
  detailsPromise ??= fetch(url)
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
    .catch((e) => {
      detailsPromise = null;
      throw e;
    });
  return detailsPromise;
}

export interface ExplorerPlace {
  place: Place;
  primaryName: string;
  secondaryName: string;
  photo: PhotoData | null;
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
  share: string;
  openPage: string;
  linkCopied: string;
  /** "Show all {count}" under the first 8 cards on phones and tablets */
  showAll: string;
  englishNote: string | null;
}

const withCount = (template: string, n: number) => template.replace("{count}", String(n));
/** Cards shown below lg before "Show all" */
const COLLAPSED = 8;

/**
 * `#places/jain` style hash → filter id, so faith tiles can deep-link into the
 * grid (the click and the scroll are handled by <HashLinks>). A bare
 * `#places` reads as "all".
 */
function readHashFilter(): PlaceFilter | null {
  const { hash } = window.location;
  if (hash === "#places") return "all";
  const f = /^#places\/([a-z]+)$/.exec(hash)?.[1];
  return f && (PLACE_FILTERS as readonly string[]).includes(f) ? (f as PlaceFilter) : null;
}
const filterHash = (f: PlaceFilter) => (f === "all" ? "#places" : `#places/${f}`);

/*
 * Shareable place links: `?place=<id>` opens that place's modal. The URL is
 * the single source of truth — opening/closing rewrites it (replaceState plus
 * a local event), and the component reads it back through a store, so a
 * pasted link, a reload and the back button all behave the same.
 */
function readPlaceParam(): string | null {
  return new URLSearchParams(window.location.search).get("place");
}
function subscribeUrl(cb: () => void) {
  window.addEventListener("popstate", cb);
  window.addEventListener("hashchange", cb);
  window.addEventListener(URL_EVENT, cb);
  return () => {
    window.removeEventListener("popstate", cb);
    window.removeEventListener("hashchange", cb);
    window.removeEventListener(URL_EVENT, cb);
  };
}
/** Open/close a place, keeping the active filter in the hash either way. */
function writePlaceParam(id: string | null, filter: PlaceFilter) {
  const url = new URL(window.location.href);
  if (id) url.searchParams.set("place", id);
  else url.searchParams.delete("place");
  if (!url.hash.startsWith("#places/")) url.hash = filterHash(filter);
  history.replaceState(history.state, "", url.pathname + url.search + url.hash);
  window.dispatchEvent(new Event(URL_EVENT));
}

export default function PlacesExplorer({
  items,
  labels,
  detailsUrl,
  pageBase,
  grid,
}: {
  items: ExplorerPlace[];
  labels: ExplorerLabels;
  /**
   * The card grid, server-rendered inside <Static> (not hydrated). Cards carry
   * data-place-open / data-type / data-faith; this island filters them by
   * toggling `hidden` and opens places through one delegated click handler.
   */
  grid: ReactNode;
  /** Prerendered JSON with each place's summary, story, tips and sources */
  detailsUrl: string;
  /** e.g. "/hi/places/": each place has a page at pageBase + id */
  pageBase: string;
}) {
  // The hash sets the filter; a hash that names no filter (another section,
  // none at all) leaves the last one in place.
  const hashFilter = useSyncExternalStore(subscribeUrl, readHashFilter, () => null);
  const [filter, setFilter] = useState<PlaceFilter>("all");
  if (hashFilter && hashFilter !== filter) setFilter(hashFilter);

  const placeParam = useSyncExternalStore(subscribeUrl, readPlaceParam, () => null);
  // The map's focused place belongs to the filter it was chosen under.
  const [focused, setFocused] = useState<{ place: Place; filter: PlaceFilter } | null>(null);
  const focus = focused?.filter === filter ? focused.place : null;
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
  const visiblePlaces = useMemo(() => {
    const list = visible.map((i) => i.place);
    return focus && !list.includes(focus) ? [...list, focus] : list;
  }, [visible, focus]);
  const byId = useMemo(() => new Map(items.map((i) => [i.place.id, i])), [items]);

  const choose = (f: PlaceFilter) => {
    setFilter(f);
    writeHash(filterHash(f));
  };
  const selected = placeParam ? (byId.get(placeParam) ?? null) : null;
  const openPlace = useCallback((p: Place) => writePlaceParam(p.id, filter), [filter]);
  const close = useCallback(() => writePlaceParam(null, filter), [filter]);
  const [copied, setCopied] = useState(false);
  const share = async () => {
    if (!selected) return;
    const url = new URL(pageBase + selected.place.id, window.location.origin).href;
    try {
      if (navigator.share) {
        await navigator.share({ title: selected.primaryName, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* dismissed */
    }
  };

  // Arriving from a shared ?place= link: bring the section into view once.
  useEffect(() => {
    if (readPlaceParam()) document.getElementById("places")?.scrollIntoView({ block: "start" });
  }, []);

  const showOnMap = () => {
    if (!selected) return;
    setFocused({ place: selected.place, filter });
    setMapWanted(true);
    close();
    // Wait for the modal to let go of the page (body overflow, Lenis stop)
    // before scrolling; the whole map ends up in view, centred.
    window.setTimeout(() => {
      if (mapHost.current) scrollToElement(mapHost.current, { block: "center" });
    }, 80);
  };

  const [details, setDetails] = useState<Record<string, PlaceDetail> | null>(null);
  const prefetch = useCallback(() => {
    loadDetails(detailsUrl).then(setDetails, () => {});
  }, [detailsUrl]);
  useEffect(() => {
    if (selected && !details) prefetch();
  }, [selected, details, prefetch]);

  // Filter the static cards in place. Below lg only the first COLLAPSED
  // matching cards show (CSS: [data-collapsed] [data-extra]) until "Show all".
  const gridHost = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  useEffect(() => {
    let shown = 0;
    gridHost.current?.querySelectorAll<HTMLElement>("[data-place-card]").forEach((card) => {
      const place = { type: card.dataset.type as Place["type"], faith: (card.dataset.faith ?? "").split(" ").filter(Boolean) as Faith[] };
      const on = placeMatches(place, filter);
      card.hidden = !on;
      card.toggleAttribute("data-extra", on && ++shown > COLLAPSED);
    });
  }, [filter]);
  const onGridClick = (e: MouseEvent<HTMLDivElement>) => {
    // Modified clicks (new tab, etc.) follow the link to the place page.
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const id = (e.target as Element).closest<HTMLElement>("[data-place-open]")?.dataset.placeOpen;
    if (!id) return;
    e.preventDefault();
    writePlaceParam(id, filter);
  };

  const sel = selected?.place;
  const detail = sel ? details?.[sel.id] : undefined;
  const selFaiths: Faith[] = sel ? (sel.faith.length ? sel.faith : ["secular"]) : [];

  return (
    <div className="container-kashi">
      <div data-hash-target="" role="group" aria-label={labels.filters.all} className="flex flex-wrap justify-center gap-2">
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

      <div ref={gridHost} data-collapsed={expanded ? undefined : ""} onClick={onGridClick} onPointerOver={prefetch} onFocusCapture={prefetch}>
        {grid}
      </div>
      {!expanded && visible.length > COLLAPSED && (
        <p className="see-all-sm mt-6 text-center">
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-kashi-diya/40 px-5 text-sm text-kashi-diya transition-colors hover:border-kashi-marigold hover:text-kashi-marigold"
          >
            {withCount(labels.showAll, visible.length)}
            <span aria-hidden="true">↓</span>
          </button>
        </p>
      )}

      <div
        ref={mapHost}
        className="relative mt-16 h-[70vh] min-h-[420px] overflow-hidden rounded-kashi border border-kashi-rudraksha/60"
        aria-label={labels.mapTitle}
        role="region"
      >
        {mapWanted ? (
          <KashiMap places={visiblePlaces} focus={focus} focusLabel={focus ? byId.get(focus.id)?.primaryName : undefined} onSelect={openPlace} clusterLabel={(n) => withCount(labels.cluster, n)} />
        ) : (
          <div className="flex h-full items-center justify-center bg-kashi-indigo/40 text-sm text-kashi-ash/60">
            {labels.mapLoading}
          </div>
        )}
      </div>

      <Modal open={!!selected} onClose={close} labelledBy="place-modal-title" closeLabel={labels.close}>
        {selected && sel && (
          <>
          {selected.photo && (
            <div className="arch relative mx-4 mt-4 aspect-[16/9] overflow-hidden sm:mx-6 sm:mt-6">
              <Photo photo={selected.photo} sizes={[["(min-width: 768px)", "720px", 16 / 9], [null, "92vw", 16 / 9]]} />
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-kashi-night/70 to-transparent" />
            </div>
          )}
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
            {detail ? (
              <p className="mt-6 text-lg leading-relaxed text-kashi-ash">{detail.summary}</p>
            ) : (
              <div aria-hidden="true" className="mt-6 space-y-3">
                <div className="h-4 w-full animate-pulse rounded bg-kashi-ash/10" />
                <div className="h-4 w-11/12 animate-pulse rounded bg-kashi-ash/10" />
                <div className="h-4 w-4/5 animate-pulse rounded bg-kashi-ash/10" />
              </div>
            )}
            {labels.englishNote && <EnglishNote text={labels.englishNote} className="mt-4" />}
            {detail?.story && <p className="mt-4 border-l-2 border-kashi-diya/50 pl-4 italic text-kashi-ash/85">{detail.story}</p>}
            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-[0.18em] text-kashi-diya">{labels.bestTime}</dt>
                <dd className="mt-1 text-kashi-ash/90">{sel.bestTime}</dd>
              </div>
              {detail?.tips?.length ? (
                <div>
                  <dt className="text-xs uppercase tracking-[0.18em] text-kashi-diya">{labels.tips}</dt>
                  <dd className="mt-1">
                    <ul className="list-disc space-y-1 pl-4 text-kashi-ash/90">
                      {detail.tips.map((t) => (
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
              <button
                type="button"
                onClick={share}
                className="inline-flex items-center gap-2 rounded-kashi border border-kashi-diya/40 px-5 py-2.5 text-sm text-kashi-diya transition-colors hover:border-kashi-marigold hover:text-kashi-marigold"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v14" />
                </svg>
                {copied ? labels.linkCopied : labels.share}
              </button>
              <a href={pageBase + sel.id} className="inline-flex items-center gap-2 rounded-full border border-kashi-diya/40 px-4 py-2 text-sm text-kashi-diya transition-colors hover:border-kashi-marigold hover:text-kashi-marigold">
                {labels.openPage}
                <span aria-hidden="true">→</span>
              </a>
              {sel.coordsVerified === false && <span className="text-xs text-kashi-ash/60">{labels.approxCoords}</span>}
            </div>
            {detail && detail.sources.length > 0 && (
              <p className="mt-6 text-xs text-kashi-ash/60">
                {labels.sources}:{" "}
                {detail.sources.map((s, i) => (
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
          </>
        )}
      </Modal>
    </div>
  );
}
