#!/usr/bin/env node
/**
 * SEO checks over the prerendered HTML in .next/server/app (run after `next build`):
 *   - every page: <title>, meta description, self canonical
 *   - indexed locales (lib/seo.ts INDEXED_LOCALES): robots "index, follow", hreflang
 *     for each indexed locale + x-default → /en; other locales: "noindex, follow", no hreflang
 *   - sitemap.xml and sitemap-images.xml list indexed locales only
 *   - festival dates: Event JSON-LD startDate must be shown visibly (data-event-date
 *     + <time>); a title mentioning the festival year must have a verified visible date;
 *     every festival page shows a date line
 *   - image frames: every element with the `arch` class contains an <img> or the
 *     ArtFallback placeholder (data-art-fallback); an empty arch fails
 *   - titles and descriptions unique within each locale
 *   - JSON-LD parses; Google rich-result rules for Event and BreadcrumbList
 *     (developers.google.com/search/docs/appearance/structured-data), and
 *     schema.org basics for TouristAttraction, TouristTrip, WebSite
 * Exits 1 with a list of problems.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const dir = new URL("../.next/server/app/", import.meta.url).pathname;
const seoTs = readFileSync(new URL("../lib/seo.ts", import.meta.url), "utf8");
const YEAR = readFileSync(new URL("../lib/festivalDates.ts", import.meta.url), "utf8").match(/FESTIVAL_YEAR = (\d{4})/)[1];
const INDEXED = JSON.parse(seoTs.match(/INDEXED_LOCALES = (\[[^\]]*\])/)[1].replace(/'/g, '"'));
const files = [];
(function walk(d) {
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (f.endsWith(".html") && !/_not-found|_global-error|global-not-found/.test(p)) files.push(p);
  }
})(dir);

const problems = [];

/** Arch frames (class token "arch") that contain neither an <img> nor data-art-fallback. */
const VOID = new Set(["img", "source", "br", "hr", "input", "meta", "link", "wbr", "area", "base", "col", "embed", "track"]);
function emptyArches(html) {
  const body = html.replace(/<script\b[\s\S]*?<\/script>/gi, "").replace(/<style\b[\s\S]*?<\/style>/gi, "");
  const stack = []; // { tag, arch, filled }
  let empty = 0, total = 0;
  for (const m of body.matchAll(/<(\/?)([a-zA-Z][\w:-]*)([^>]*?)(\/?)>/g)) {
    const [, close, rawTag, attrs, selfClose] = m;
    const tag = rawTag.toLowerCase();
    if (close) {
      // pop to the matching tag (tolerates sloppy nesting)
      for (let i = stack.length - 1; i >= 0; i--) {
        if (stack[i].tag !== tag) continue;
        const [el] = stack.splice(i, stack.length - i).slice(0, 1);
        if (el.arch) { total++; if (!el.filled) empty++; }
        break;
      }
      continue;
    }
    const filling = tag === "img" || /\bdata-art-fallback\b/.test(attrs);
    if (filling) for (const s of stack) s.filled = true;
    if (VOID.has(tag) || selfClose) continue;
    const cls = attrs.match(/\bclass="([^"]*)"/)?.[1] ?? "";
    stack.push({ tag, arch: cls.split(/\s+/).includes("arch"), filled: filling });
  }
  return { empty, total };
}
const bad = (file, msg) => problems.push(`${relative(dir, file)}: ${msg}`);
const titles = new Map(), descs = new Map();
let archTotal = 0;
const isoDate = /^\d{4}-\d{2}-\d{2}(T[\d:.+-Z]+)?$/;
const absUrl = (u) => typeof u === "string" && /^https:\/\//.test(u);
const counts = {};

function checkLd(file, o) {
  const type = o["@type"];
  counts[type] = (counts[type] ?? 0) + 1;
  if (o["@context"] !== "https://schema.org") bad(file, `${type}: @context must be https://schema.org`);
  switch (type) {
    case "Event": {
      if (!o.name) bad(file, "Event: missing name");
      if (!isoDate.test(o.startDate ?? "")) bad(file, "Event: startDate must be ISO 8601");
      if (o.endDate && !isoDate.test(o.endDate)) bad(file, "Event: endDate must be ISO 8601");
      if (o.endDate && o.endDate < o.startDate) bad(file, "Event: endDate before startDate");
      const loc = o.location;
      if (!loc || loc["@type"] !== "Place" || !loc.name || !loc.address) bad(file, "Event: location must be a Place with name and address");
      else if (!loc.address.addressLocality || !loc.address.addressCountry) bad(file, "Event: location.address needs addressLocality and addressCountry");
      for (const k of ["description", "image", "eventStatus", "endDate"]) if (!o[k]) bad(file, `Event: recommended property ${k} missing`);
      if (o.eventStatus && !o.eventStatus.startsWith("https://schema.org/")) bad(file, "Event: eventStatus must be a schema.org URL");
      break;
    }
    case "BreadcrumbList": {
      const items = o.itemListElement ?? [];
      if (items.length < 2) bad(file, "BreadcrumbList: needs at least two ListItems");
      items.forEach((it, i) => {
        if (it["@type"] !== "ListItem") bad(file, `BreadcrumbList[${i}]: not a ListItem`);
        if (it.position !== i + 1) bad(file, `BreadcrumbList[${i}]: position should be ${i + 1}`);
        if (!it.name) bad(file, `BreadcrumbList[${i}]: missing name`);
        if (i < items.length - 1 && !absUrl(it.item)) bad(file, `BreadcrumbList[${i}]: item must be an absolute URL`);
      });
      break;
    }
    case "TouristAttraction": {
      if (!o.name) bad(file, "TouristAttraction: missing name");
      if (typeof o.geo?.latitude !== "number" || typeof o.geo?.longitude !== "number") bad(file, "TouristAttraction: geo latitude/longitude must be numbers");
      if (!absUrl(o.url)) bad(file, "TouristAttraction: url must be absolute");
      break;
    }
    case "TouristTrip":
      if (!o.name || !o.itinerary?.itemListElement?.length) bad(file, "TouristTrip: needs name and itinerary");
      break;
    case "WebSite":
      if (!o.name || !absUrl(o.url)) bad(file, "WebSite: needs name and absolute url");
      break;
    case "TouristDestination":
      if (!o.name || !o.geo) bad(file, "TouristDestination: needs name and geo");
      break;
    default:
      bad(file, `unexpected JSON-LD type ${type}`);
  }
}

for (const file of files) {
  const html = readFileSync(file, "utf8");
  const title = html.match(/<title>(.*?)<\/title>/)?.[1];
  const desc = html.match(/<meta name="description" content="(.*?)"/)?.[1];
  const canonical = html.match(/<link rel="canonical" href="(.*?)"/)?.[1];
  const alts = [...html.matchAll(/<link rel="alternate" hrefLang="(.*?)" href="(.*?)"/g)];
  if (!title) bad(file, "no <title>");
  if (!desc) bad(file, "no meta description");
  else if (desc.length > 320) bad(file, `description is ${desc.length} characters`);
  const loc0 = relative(dir, file).split(/[/.]/)[0];
  const robots = html.match(/<meta name="robots" content="(.*?)"/)?.[1];
  if (!canonical) bad(file, "no canonical");
  else if (!new URL(canonical).pathname.startsWith(`/${loc0}`)) bad(file, `canonical ${canonical} is not this page`);
  if (INDEXED.includes(loc0)) {
    if (robots !== "index, follow") bad(file, `robots is "${robots}" (expected "index, follow")`);
    if (alts.length !== INDEXED.length + 1) bad(file, `${alts.length} hreflang links (expected ${INDEXED.length + 1})`);
    if (alts.some((a) => a[1] !== "x-default" && !INDEXED.some((l) => new URL(a[2]).pathname.split("/")[1] === l))) bad(file, "hreflang points at a noindexed locale");
    const xd = alts.find((a) => a[1] === "x-default")?.[2];
    if (!xd || !/\/en(\/|$)/.test(new URL(xd).pathname + "/")) bad(file, `x-default is ${xd}`);
    if (canonical && !alts.some((a) => a[2] === canonical)) bad(file, "canonical is not among its hreflang alternates");
  } else {
    if (robots !== "noindex, follow") bad(file, `robots is "${robots}" (expected "noindex, follow")`);
    if (alts.length) bad(file, `noindexed page has ${alts.length} hreflang links`);
  }
  // Unique within a locale; the same words in two languages (e.g. mr/sa) are hreflang siblings.
  const loc = relative(dir, file).split(/[/.]/)[0];
  if (title) titles.set(loc + "|" + title, [...(titles.get(loc + "|" + title) ?? []), file]);
  if (desc) descs.set(loc + "|" + desc, [...(descs.get(loc + "|" + desc) ?? []), file]);
  const arches = emptyArches(html);
  if (arches.empty) bad(file, `${arches.empty} of ${arches.total} image frames are empty (no photo and no ArtFallback)`);
  archTotal += arches.total;
  const events = [];
  for (const m of html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)) {
    let data;
    try { data = JSON.parse(m[1]); } catch { bad(file, "JSON-LD does not parse"); continue; }
    for (const o of [data].flat()) { checkLd(file, o); if (o["@type"] === "Event") events.push(o); }
  }
  // Visible dates: <p data-event-date="YYYY-MM-DD|tbc">…<time dateTime="…">label</time></p>
  const shown = [...html.matchAll(/data-event-date="([^"]+)"[^>]*>.*?<time(?: dateTime="([^"]*)")?>([^<]+)<\/time>/gs)].map((m) => ({ iso: m[1], dt: m[2], label: m[3].trim() }));
  for (const s of shown) {
    if (!s.label) bad(file, "empty festival date label");
    if (s.iso !== "tbc" && s.dt !== s.iso) bad(file, `date line ${s.iso} has <time dateTime="${s.dt}">`);
  }
  for (const e of events) if (!shown.some((s) => s.iso === e.startDate)) bad(file, `Event startDate ${e.startDate} is not shown on the page`);
  const isFestival = /\/festivals\//.test(relative(dir, file));
  if (isFestival && !shown.length) bad(file, "festival page shows no date line");
  if (title?.includes(YEAR) && !shown.some((s) => s.iso !== "tbc")) bad(file, `title mentions ${YEAR} but the page shows no verified date`);
  if (isFestival && shown.some((s) => s.iso !== "tbc") !== events.length > 0) bad(file, "visible verified date and Event JSON-LD disagree");
}
// Sitemaps: indexed locales only.
for (const [name, re] of [["sitemap.xml.body", /<loc>([^<]+)<\/loc>/g], ["sitemap-images.xml.body", /<loc>([^<]+)<\/loc>/g]]) {
  let body;
  try { body = readFileSync(join(dir, name), "utf8"); } catch { problems.push(`${name}: not found in the build`); continue; }
  const locs = [...body.matchAll(re)].map((m) => new URL(m[1]).pathname.split("/")[1]);
  const stray = [...new Set(locs.filter((l) => !INDEXED.includes(l)))];
  if (stray.length) problems.push(`${name}: lists noindexed locales ${stray.join(", ")}`);
  const hl = [...body.matchAll(/hreflang="([^"]+)" href="([^"]+)"/g)].filter((m) => m[1] !== "x-default" && !INDEXED.includes(new URL(m[2]).pathname.split("/")[1]));
  if (hl.length) problems.push(`${name}: ${hl.length} hreflang alternates point at noindexed locales`);
  console.log(`${name}: ${locs.length} URLs`);
}
for (const [t, fs] of titles) if (fs.length > 1) problems.push(`duplicate title "${t}" on ${fs.length} pages: ${fs.slice(0, 3).map((f) => relative(dir, f)).join(", ")}`);
for (const [d, fs] of descs) if (fs.length > 1) problems.push(`duplicate description on ${fs.length} pages: ${fs.slice(0, 3).map((f) => relative(dir, f)).join(", ")} — "${d.slice(0, 60)}…"`);

console.log(`${archTotal} image frames checked`);
console.log(`${files.length} pages · JSON-LD: ${Object.entries(counts).map(([k, v]) => `${k} ${v}`).join(", ")}`);
if (problems.length) {
  console.error(`\n✖ ${problems.length} problem(s):\n  ` + problems.slice(0, 60).join("\n  "));
  process.exit(1);
}
console.log("✓ titles, descriptions, canonicals, hreflang and JSON-LD all pass");
