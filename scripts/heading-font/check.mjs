#!/usr/bin/env node
/**
 * Build gate: every Devanagari character that the site shows in the display
 * face (headings, names, verses, switcher labels) must exist in the subset
 * font lib/fonts/tiro-devanagari-headings.woff2. Runs before `next build`.
 *
 * It reads the font's own cmap (WOFF2 → Brotli → cmap format 4/12), so it
 * checks the file that ships, not a list that could drift from it.
 * Fix a failure by rebuilding the subset: see scripts/heading-font/crawl-corpus.mjs.
 */
import { readFileSync } from "node:fs";
import { brotliDecompressSync } from "node:zlib";

const root = new URL("../../", import.meta.url);
const read = (p) => readFileSync(new URL(p, root));
const json = (p) => JSON.parse(read(p).toString("utf8"));

// ---- WOFF2 → cmap codepoints ------------------------------------------------
const KNOWN_TAGS = ["cmap", "head", "hhea", "hmtx", "maxp", "name", "OS/2", "post", "cvt ", "fpgm", "glyf", "loca", "prep", "CFF ", "VORG", "EBDT", "EBLC", "gasp", "hdmx", "kern", "LTSH", "PCLT", "VDMX", "vhea", "vmtx", "BASE", "GDEF", "GPOS", "GSUB", "EBSC", "JSTF", "MATH", "CBDT", "CBLC", "COLR", "CPAL", "SVG ", "sbix", "acnt", "avar", "bdat", "bloc", "bsln", "cvar", "fdsc", "feat", "fmtx", "fvar", "gvar", "hsty", "just", "lcar", "mort", "morx", "opbd", "prop", "trak", "Zapf", "Silf", "Glat", "Gloc", "Feat", "Sill"];

function woff2Cmap(buf) {
  if (buf.toString("latin1", 0, 4) !== "wOF2") throw new Error("not a WOFF2 file");
  const numTables = buf.readUInt16BE(12);
  const compressedSize = buf.readUInt32BE(20);
  let off = 48;
  const base128 = () => {
    let v = 0;
    for (let i = 0; i < 5; i++) {
      const b = buf[off++];
      v = v * 128 + (b & 0x7f);
      if (!(b & 0x80)) return v;
    }
    throw new Error("bad UIntBase128");
  };
  const tables = [];
  for (let i = 0; i < numTables; i++) {
    const flags = buf[off++];
    const tag = (flags & 0x3f) === 63 ? buf.toString("latin1", off, (off += 4)) : KNOWN_TAGS[flags & 0x3f];
    const version = flags >> 6;
    const origLength = base128();
    const transformed = tag === "glyf" || tag === "loca" ? version !== 3 : version !== 0;
    const length = transformed ? base128() : origLength;
    tables.push({ tag, length });
  }
  const data = brotliDecompressSync(buf.subarray(off, off + compressedSize));
  let pos = 0;
  for (const t of tables) {
    if (t.tag === "cmap") return parseCmap(data.subarray(pos, pos + t.length));
    pos += t.length;
  }
  throw new Error("font has no cmap");
}

function parseCmap(c) {
  const cps = new Set();
  const n = c.readUInt16BE(2);
  for (let i = 0; i < n; i++) {
    const sub = c.readUInt32BE(4 + i * 8 + 4);
    const format = c.readUInt16BE(sub);
    if (format === 4) {
      const segX2 = c.readUInt16BE(sub + 6);
      const ends = sub + 14, starts = ends + segX2 + 2, deltas = starts + segX2, ranges = deltas + segX2;
      for (let s = 0; s < segX2; s += 2) {
        const end = c.readUInt16BE(ends + s), start = c.readUInt16BE(starts + s);
        const delta = c.readInt16BE(deltas + s), range = c.readUInt16BE(ranges + s);
        for (let cp = start; cp <= end && cp !== 0xffff; cp++) {
          let g;
          if (range === 0) g = (cp + delta) & 0xffff;
          else {
            const gi = ranges + s + range + (cp - start) * 2;
            g = c.readUInt16BE(gi);
            if (g) g = (g + delta) & 0xffff;
          }
          if (g) cps.add(cp);
        }
      }
    } else if (format === 12) {
      const groups = c.readUInt32BE(sub + 12);
      for (let g = 0; g < groups; g++) {
        const o = sub + 16 + g * 12;
        for (let cp = c.readUInt32BE(o); cp <= c.readUInt32BE(o + 4); cp++) cps.add(cp);
      }
    }
  }
  return cps;
}

// ---- Strings shown in the display face --------------------------------------
const DEVA = /[ऀ-ॿ꣠-ꣿ᳐-᳿]/;
const strings = []; // [where, text]
const push = (where, v) => typeof v === "string" && DEVA.test(v) && strings.push([where, v]);
const walk = (where, o, keyRe, k = "") => {
  if (typeof o === "string") { if (keyRe.test(k)) push(where + "." + k, o); }
  else if (Array.isArray(o)) o.forEach((v) => walk(where, v, keyRe, k));
  else if (o && typeof o === "object") for (const [kk, v] of Object.entries(o)) walk(where, v, keyRe, kk);
};

// Headings and labels in the Devanagari locales (section titles, page h2s, verses…).
const HEADING_KEYS = /title|closing|brand|name|cta|tabs|sample|nativeName/i;
for (const l of ["hi", "mr", "sa"]) {
  const m = json(`messages/${l}.json`);
  walk(`messages/${l}`, m, HEADING_KEYS);
  // detail-page block headings are h2s in the display face
  for (const k of ["howToReach", "related", "festivalsHere", "onMap", "reachVaranasi", "otherItineraries", "itineraryDays", "prev", "next"]) push(`messages/${l}.page.${k}`, m.page?.[k]);
  for (const k of ["tips"]) push(`messages/${l}.places.${k}`, m.places?.[k]);
  for (const k of ["timeline"]) push(`messages/${l}.projects.${k}`, m.projects?.[k]);
  push(`messages/${l}.itineraries.day`, m.itineraries?.day);
}
// Hindi names show in every locale (as the primary or secondary line).
for (const f of ["places", "projects", "festivals", "food"]) for (const x of json(`content/${f}.json`)) push(`content/${f}:${x.id}.name_hi`, x.name_hi);
for (const it of json("content/itineraries.json")) {
  push(`content/itineraries:${it.id}.title_hi`, it.title_hi);
  for (const l of ["hi", "mr", "sa"]) for (const d of it.plan) {
    push(`content/itineraries:${it.id}.day${d.day}.theme.${l}`, d.i18n?.[l]?.theme);
    for (const s of d.stops) push(`content/itineraries:${it.id}.stop.${l}`, s.i18n?.[l]?.title);
  }
}
walk("content/faiths", json("content/faiths.json"), HEADING_KEYS);
for (const v of json("content/faiths.json")) push(`content/faiths:${v.id}.verse`, v.verse?.original);
const locTs = read("lib/i18n/locales.ts").toString("utf8");
for (const m of locTs.matchAll(/(?:nativeName|sample): "([^"]+)"/g)) push("lib/i18n/locales.ts", m[1]);

// ---- Compare ------------------------------------------------------------------
const font = "lib/fonts/tiro-devanagari-headings.woff2";
const have = woff2Cmap(read(font));
const missing = new Map(); // char → first place it appears
for (const [where, text] of strings) for (const ch of text) {
  const cp = ch.codePointAt(0);
  if (DEVA.test(ch) && !have.has(cp) && !missing.has(ch)) missing.set(ch, where);
}
if (missing.size) {
  console.error(`\n✖ ${font} is missing ${missing.size} Devanagari character(s) used in headings or names:`);
  for (const [ch, where] of missing) console.error(`   ${ch}  U+${ch.codePointAt(0).toString(16).toUpperCase().padStart(4, "0")}  first used in ${where}`);
  console.error(`\n  Rebuild the heading-font subset: follow the steps at the top of scripts/heading-font/crawl-corpus.mjs\n`);
  process.exit(1);
}
console.log(`✓ heading font covers all ${new Set(strings.flatMap(([, t]) => [...t].filter((c) => DEVA.test(c)))).size} Devanagari characters in ${strings.length} heading/name strings`);
