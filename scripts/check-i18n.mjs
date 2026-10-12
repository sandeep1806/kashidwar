#!/usr/bin/env node
/**
 * Translation coverage for the 11 regional locales.
 *   node scripts/check-i18n.mjs            → report untranslated strings per locale (exit 1 if any)
 *   node scripts/check-i18n.mjs <dir>      → also write them as chunk files <dir>/<locale>/<chunk>.json
 *                                            ({ key: { en, hi? } }) for translators; merge the
 *                                            translated out-<chunk>.json files back with the merge script
 *                                            described in TRANSLATION_REVIEW.md.
 * Covers places, festivals, projects, food, itineraries, FAQs, About, UI strings, photo alt text
 * and the guides (content/guides/i18n/<locale>.json).
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
const ROOT = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const OUT = process.argv[2] ?? null; // null: report only
const J = (p) => JSON.parse(readFileSync(`${ROOT}/${p}`, "utf8"));
const LOCALES = ["ta", "te", "kn", "ml", "bn", "or", "as", "mr", "gu", "pa", "sa"];
const report = [];
const places = J("content/places.json"), festivals = J("content/festivals.json"), projects = J("content/projects.json"), food = J("content/food.json"), itins = J("content/itineraries.json");
const faqs = J("content/faqs.json"), about = J("content/about.json"), photos = J("content/photos.json");
const en = J("messages/en.json"), hi = J("messages/hi.json");
const flat = (o, p = "") => Object.entries(o).flatMap(([k, v]) => (v && typeof v === "object" && !Array.isArray(v) ? flat(v, p + k + ".") : [[p + k, v]]));
const guides = readdirSync(`${ROOT}/content/guides`).filter((f) => f.endsWith(".json")).map((f) => J(`content/guides/${f}`));
for (const L of LOCALES) {
  const dir = OUT ? `${OUT}/${L}` : null; if (dir) mkdirSync(dir, { recursive: true });
  const chunks = { places: {}, other: {}, faqs: {}, alt: {} };
  const add = (c, key, enV, hiV) => { if (enV !== undefined && enV !== null && String(enV).trim()) chunks[c][key] = hiV ? { en: enV, hi: hiV } : { en: enV }; };
  for (const p of places) {
    const have = p.i18n?.[L] ?? {}, h = p.i18n?.hi ?? {};
    for (const f of ["summary", "bestTime", "story"]) if (!have[f]) add("places", `places|${p.id}|${f}`, p[f], h[f]);
    if (!have.tips) (p.tips ?? []).forEach((t, i) => add("places", `places|${p.id}|tips|${i}`, t, h.tips?.[i]));
    for (const f of ["timings", "entry", "duration", "season"]) if (!have.glance?.[f]) add("places", `places|${p.id}|glance|${f}`, p.glance?.[f], h.glance?.[f]);
  }
  for (const f of festivals) { const have = f.i18n?.[L] ?? {}, h = f.i18n?.hi ?? {}; for (const k of ["summary", "when", "where"]) if (!have[k]) add("other", `festivals|${f.id}|${k}`, f[k], h[k]); }
  for (const p of projects) { const have = p.i18n?.[L] ?? {}, h = p.i18n?.hi ?? {}; for (const k of ["summary", "timeline", "agency", "cost"]) if (!have[k]) add("other", `projects|${p.id}|${k}`, p[k], h[k]); }
  for (const d of food) {
    const have = d.i18n?.[L] ?? {}, h = d.i18n?.hi ?? {};
    for (const k of ["summary", "season", "price"]) if (!have[k]) add("other", `food|${d.id}|${k}`, d[k], h[k]);
    if (!have.where) (d.where ?? []).forEach((w, i) => add("other", `food|${d.id}|where|${i}`, w, h.where?.[i]));
  }
  for (const it of itins) {
    if (!it.i18n?.[L]?.summary) add("other", `itin|${it.id}|summary`, it.summary, it.i18n?.hi?.summary);
    it.plan.forEach((d, di) => {
      if (!d.i18n?.[L]?.theme) add("other", `itin|${it.id}|plan|${di}|theme`, d.theme, d.i18n?.hi?.theme);
      d.stops.forEach((s, si) => { for (const k of ["title", "note"]) if (!s.i18n?.[L]?.[k]) add("other", `itin|${it.id}|plan|${di}|stops|${si}|${k}`, s[k], s.i18n?.hi?.[k]); });
    });
  }
  const msgL = (() => { try { return J(`messages/${L}.json`); } catch { return {}; } })();
  const haveUi = new Set(flat(msgL).map((x) => x[0]));
  const hiFlat = Object.fromEntries(flat(hi));
  for (const [k, v] of flat(en)) if (!haveUi.has(k) && typeof v === "string") add("other", `ui|${k}`, v, hiFlat[k]);
  for (const [kind, block] of Object.entries(faqs)) if (kind !== "_note") block.items.forEach((it, i) => { if (!it[`q_${L}`]) add("faqs", `faqs|${kind}|${i}|q`, it.q_en, it.q_hi); if (!it[`a_${L}`]) add("faqs", `faqs|${kind}|${i}|a`, it.a_en, it.a_hi); });
  if (!about[L]) {
    add("faqs", "about|lead", about.en.lead, about.hi.lead);
    about.en.sections.forEach((s, i) => { const hs = about.hi.sections[i]; add("faqs", `about|sections|${i}|heading`, s.heading, hs?.heading); s.body.forEach((b, j) => add("faqs", `about|sections|${i}|body|${j}`, b, hs?.body?.[j])); (s.list ?? []).forEach((b, j) => add("faqs", `about|sections|${i}|list|${j}`, b, hs?.list?.[j])); });
    about.en.contact.forEach((c, i) => add("faqs", `about|contact|${i}`, c, about.hi.contact[i]));
  }
  const altL = (() => { try { return J(`content/i18n/alt-${L}.json`); } catch { return {}; } })();
  for (const [k, p] of Object.entries(photos)) if (!altL[k] && !p.alt?.[L]) add("alt", `alt|${k}`, p.alt?.en, p.alt?.hi);
  const gtr = (() => { try { return J(`content/guides/i18n/${L}.json`); } catch { return {}; } })();
  let guideMissing = 0;
  for (const g of guides) {
    if (gtr[g.slug]) continue;
    guideMissing++;
    const c = {};
    const a = (key, e, h) => { if (e && String(e).trim()) c[key] = h ? { en: e, hi: h } : { en: e }; };
    a("title", g.title_en, g.title_hi); a("description", g.description_en, g.description_hi); a("lead", g.lead_en, g.lead_hi);
    (g.facts ?? []).forEach((f, i) => { a(`facts|${i}|label`, f.label_en, f.label_hi); a(`facts|${i}|value`, f.value_en, f.value_hi); });
    g.sections.forEach((s, i) => { a(`sections|${i}|heading`, s.heading_en, s.heading_hi); s.body_en.forEach((b, j) => a(`sections|${i}|body|${j}`, b, s.body_hi?.[j])); (s.list_en ?? []).forEach((b, j) => a(`sections|${i}|list|${j}`, b, s.list_hi?.[j])); });
    g.faq.forEach((f, i) => { a(`faq|${i}|q`, f.q_en, f.q_hi); a(`faq|${i}|a`, f.a_en, f.a_hi); });
    if (dir) writeFileSync(`${dir}/guide-${g.slug}.json`, JSON.stringify(c, null, 1));
  }
  if (dir) for (const [name, c] of Object.entries(chunks)) if (Object.keys(c).length) writeFileSync(`${dir}/${name}.json`, JSON.stringify(c, null, 1));
  const n = Object.values(chunks).reduce((a, c) => a + Object.keys(c).length, 0);
  report.push([L, n, guideMissing]);
}
for (const [L, n, gm] of report) console.log(`${L}: ${n ? `${n} strings untranslated` : "complete"}${gm ? `, ${gm} guides untranslated` : ""}`);
process.exitCode = report.some(([, n, gm]) => n || gm) ? 1 : 0;
