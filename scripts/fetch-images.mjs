#!/usr/bin/env node
/**
 * Photo sourcing, step 1: gather CANDIDATES (never picks automatically).
 *
 * Priority (per the brief):
 *   1. ./raw/<group>/<id>.(jpg|png|webp) — the owner's own photos, used as-is.
 *   2. Wikimedia Commons — CC0 / CC BY / CC BY-SA / public domain only.
 *      Places also get a geosearch around their lat/lng; each candidate records
 *      title, description, categories and geotag distance for human review.
 *   3. Unsplash / Pexels — only if UNSPLASH_ACCESS_KEY / PEXELS_API_KEY are set
 *      (not implemented here: neither key was present when this was built).
 *
 * Output: scripts/.images/candidates.json and 480px review thumbnails in
 * scripts/.images/thumbs/. A person reviews them (contact sheets), writes the
 * chosen file titles into scripts/image-picks.json, then runs
 * `node scripts/optimize-images.mjs` to download, grade and encode the picks.
 *
 * Usage: node scripts/fetch-images.mjs [group ...]
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { SUBJECTS } from "./image-subjects.mjs";

const UA = "KashiSite/1.0 (https://kashidwar.com; photo sourcing script)";
const API = "https://commons.wikimedia.org/w/api.php";
const OUT = new URL("./.images/", import.meta.url);
const THUMBS = new URL("./thumbs/", OUT);
mkdirSync(THUMBS, { recursive: true });

const OK_LICENSE = /^(cc0|cc[- ]?by(-sa)?[- ]?\d(\.\d)?|cc[- ]?by(-sa)?|public domain|pd)/i;
const BAD = /\b(nc|nd)\b|non-?commercial|no ?deriv|fair use|copyrighted/i;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const strip = (h = "") => h.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

async function api(params) {
  const url = `${API}?${new URLSearchParams({ format: "json", origin: "*", ...params })}`;
  for (let i = 0; i < 4; i++) {
    const r = await fetch(url, { headers: { "User-Agent": UA } });
    if (r.ok) return r.json();
    await sleep(1500 * (i + 1));
  }
  throw new Error(`Commons API failed: ${url}`);
}

function haversine(a, b) {
  const R = 6371e3, t = (x) => (x * Math.PI) / 180;
  const d1 = t(b.lat - a.lat), d2 = t(b.lng - a.lng);
  const h = Math.sin(d1 / 2) ** 2 + Math.cos(t(a.lat)) * Math.cos(t(b.lat)) * Math.sin(d2 / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(h)));
}

async function infoFor(titles, origin) {
  if (!titles.length) return [];
  const res = [];
  for (let i = 0; i < titles.length; i += 40) {
    const j = await api({
      action: "query", prop: "imageinfo|categories|coordinates", titles: titles.slice(i, i + 40).join("|"),
      iiprop: "url|size|mime|extmetadata", iiurlwidth: "480", cllimit: "max", clshow: "!hidden", colimit: "max",
    });
    for (const p of Object.values(j.query?.pages ?? {})) {
      const ii = p.imageinfo?.[0];
      if (!ii) continue;
      const m = ii.extmetadata ?? {};
      const license = m.LicenseShortName?.value ?? "";
      if (!OK_LICENSE.test(license) || BAD.test(license) || BAD.test(m.UsageTerms?.value ?? "")) continue;
      if (!/image\/(jpeg|png|webp)/.test(ii.mime) || ii.width < 1000) continue;
      const geo = p.coordinates?.[0];
      res.push({
        title: p.title,
        url: ii.url, thumb: ii.thumburl, width: ii.width, height: ii.height,
        license, licenseUrl: m.LicenseUrl?.value ?? "",
        author: strip(m.Artist?.value) || "Unknown",
        description: strip(m.ImageDescription?.value).slice(0, 300),
        categories: (p.categories ?? []).map((c) => c.title.replace(/^Category:/, "")),
        date: strip(m.DateTimeOriginal?.value ?? m.DateTime?.value ?? ""),
        source: `https://commons.wikimedia.org/wiki/${encodeURIComponent(p.title.replace(/ /g, "_"))}`,
        distance: origin && geo ? haversine(origin, { lat: geo.lat, lng: geo.lon }) : null,
      });
    }
    await sleep(300);
  }
  return res;
}

async function candidates(spec, origin) {
  const titles = new Set();
  if (origin && spec.geo) {
    const g = await api({ action: "query", list: "geosearch", gscoord: `${origin.lat}|${origin.lng}`, gsradius: String(spec.geo), gsnamespace: "6", gslimit: "40" });
    for (const x of g.query?.geosearch ?? []) titles.add(x.title);
  }
  for (const q of spec.q) {
    const s = await api({ action: "query", list: "search", srsearch: q, srnamespace: "6", srlimit: "15" });
    for (const x of s.query?.search ?? []) titles.add(x.title);
    await sleep(250);
  }
  const list = await infoFor([...titles], origin);
  // Prefer landscape-ish, large, geotag-close files
  list.sort((a, b) => (a.distance ?? 9e9) - (b.distance ?? 9e9) || b.width - a.width);
  return list.slice(0, 16);
}

const places = JSON.parse(readFileSync(new URL("../content/places.json", import.meta.url), "utf8"));
const byId = Object.fromEntries(places.map((p) => [p.id, p]));
for (const key of ["UNSPLASH_ACCESS_KEY", "PEXELS_API_KEY"]) {
  console.log(process.env[key] ? `${key} is set, but that provider is not implemented yet; skipping it.` : `${key} not set; skipping that provider.`);
}
const groups = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(SUBJECTS);
const outFile = new URL("./candidates.json", OUT);
const all = existsSync(outFile) ? JSON.parse(readFileSync(outFile, "utf8")) : {};

for (const group of groups) {
  all[group] ??= {};
  for (const [id, spec] of Object.entries(SUBJECTS[group])) {
    const own = ["jpg", "jpeg", "png", "webp"].map((e) => `raw/${group}/${id}.${e}`).find((f) => existsSync(f));
    if (own) { all[group][id] = [{ title: own, own: true }]; console.log(`${group}/${id}: own photo ${own}`); continue; }
    const origin = group === "places" && byId[id] ? { lat: byId[id].lat, lng: byId[id].lng } : null;
    const list = await candidates(spec, origin);
    all[group][id] = list;
    // review thumbnails
    await Promise.all(list.map(async (c, i) => {
      const f = new URL(`${group}--${id}--${i}.jpg`, THUMBS);
      if (existsSync(f)) return;
      const r = await fetch(c.thumb, { headers: { "User-Agent": UA } });
      if (r.ok) writeFileSync(f, Buffer.from(await r.arrayBuffer()));
    }));
    console.log(`${group}/${id}: ${list.length} candidates`);
    writeFileSync(outFile, JSON.stringify(all, null, 2));
  }
}
console.log("wrote", outFile.pathname);
