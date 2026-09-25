"use client";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import type { Place } from "@/lib/contentTypes";

const CENTER: [number, number] = [25.305, 83.01];

/**
 * Tiles. DESIGN.md asks for CartoDB Dark Matter, but CARTO's public endpoint
 * now requires an API key (tiles come back watermarked "API KEY REQUIRED").
 * Default: OpenStreetMap raster tiles darkened with a CSS filter (see
 * .map-dark in globals.css). Set these in .env to switch providers:
 *   NEXT_PUBLIC_MAP_TILE_URL="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png?api_key=…"
 *   NEXT_PUBLIC_MAP_ATTRIBUTION='&copy; OpenStreetMap contributors &copy; CARTO'
 *   NEXT_PUBLIC_MAP_TILES_ARE_DARK=1   (skips the CSS darkening)
 */
const TILE_URL =
  process.env.NEXT_PUBLIC_MAP_TILE_URL || "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const TILE_ATTRIBUTION =
  process.env.NEXT_PUBLIC_MAP_ATTRIBUTION ||
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const TILES_ARE_DARK = process.env.NEXT_PUBLIC_MAP_TILES_ARE_DARK === "1";
const PIN_SVG =
  '<svg viewBox="0 0 28 36" width="28" height="36" xmlns="http://www.w3.org/2000/svg"><path d="M14 1C7 1 2 6.3 2 13c0 8.5 12 22 12 22s12-13.5 12-22C26 6.3 21 1 14 1z" fill="#0B0A14" stroke="#FFD27A" stroke-width="1.5"/><circle cx="14" cy="13" r="4.5" fill="#FFD27A"/></svg>';

const pinIcon = L.divIcon({
  className: "kashi-pin",
  html: PIN_SVG,
  iconSize: [28, 36],
  iconAnchor: [14, 34],
});

function clusterIcon(count: number, label: string) {
  return L.divIcon({
    className: "kashi-cluster",
    html: `<span title="${label}">${count}</span>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
}

interface Cluster {
  key: string;
  lat: number;
  lng: number;
  places: Place[];
}

/** Grid clustering in screen space: places whose pins would land in the same 64px cell merge. */
function buildClusters(map: L.Map, places: Place[], cell = 64): Cluster[] {
  const zoom = map.getZoom();
  const grid = new Map<string, Cluster>();
  for (const p of places) {
    const pt = map.project([p.lat, p.lng], zoom);
    const key = `${Math.floor(pt.x / cell)}:${Math.floor(pt.y / cell)}`;
    const c = grid.get(key);
    if (c) {
      c.places.push(p);
      c.lat += (p.lat - c.lat) / c.places.length;
      c.lng += (p.lng - c.lng) / c.places.length;
    } else {
      grid.set(key, { key, lat: p.lat, lng: p.lng, places: [p] });
    }
  }
  return Array.from(grid.values());
}

function ClusteredMarkers({
  places,
  onSelect,
  clusterLabel,
}: {
  places: Place[];
  onSelect: (p: Place) => void;
  clusterLabel: (n: number) => string;
}) {
  const map = useMap();
  const [zoom, setZoom] = useState(() => map.getZoom());
  useMapEvents({ zoomend: () => setZoom(map.getZoom()) });
  const clusters = useMemo(() => {
    void zoom;
    return buildClusters(map, places);
  }, [map, places, zoom]);

  return (
    <>
      {clusters.map((c) =>
        c.places.length === 1 ? (
          <Marker
            key={c.places[0].id}
            position={[c.places[0].lat, c.places[0].lng]}
            icon={pinIcon}
            title={c.places[0].name_en}
            eventHandlers={{ click: () => onSelect(c.places[0]) }}
          />
        ) : (
          <Marker
            key={c.key}
            position={[c.lat, c.lng]}
            icon={clusterIcon(c.places.length, clusterLabel(c.places.length))}
            eventHandlers={{
              click: () => {
                const b = L.latLngBounds(c.places.map((p) => [p.lat, p.lng] as [number, number]));
                map.flyToBounds(b.pad(0.4), { maxZoom: Math.min(map.getZoom() + 3, 17), duration: 0.8 });
              },
            }}
          />
        ),
      )}
    </>
  );
}

/** Keep the view on the current filter's places; fly to a focused place. */
function ViewController({ places, focus }: { places: Place[]; focus: Place | null }) {
  const map = useMap();
  useEffect(() => {
    if (focus) {
      map.flyTo([focus.lat, focus.lng], 16, { duration: 1 });
      return;
    }
    if (!places.length) return;
    const b = L.latLngBounds(places.map((p) => [p.lat, p.lng] as [number, number]));
    map.flyToBounds(b.pad(0.15), { maxZoom: 14, duration: 0.8 });
  }, [map, places, focus]);
  return null;
}

export default function KashiMap({
  places,
  focus,
  onSelect,
  clusterLabel,
}: {
  places: Place[];
  focus: Place | null;
  onSelect: (p: Place) => void;
  clusterLabel: (n: number) => string;
}) {
  return (
    <MapContainer
      center={CENTER}
      zoom={12}
      minZoom={10}
      maxZoom={18}
      scrollWheelZoom={false}
      className={`h-full w-full ${TILES_ARE_DARK ? "" : "map-dark"}`}
      attributionControl
    >
      <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} maxZoom={19} />
      <ClusteredMarkers places={places} onSelect={onSelect} clusterLabel={clusterLabel} />
      <ViewController places={places} focus={focus} />
    </MapContainer>
  );
}
