// Merge translated chunks (<dir>/<locale>/out-<chunk>.json, written by translators from the
// chunks that scripts/check-i18n.mjs <dir> extracts) into the project content.
// Usage: node scripts/merge-translations.mjs <trDir> [locale ...]   (default: every locale that has out files)
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { inflate, deflate } from "./lib/entry-i18n.mjs";
const ROOT = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const TR = process.argv[2];
const only = process.argv.slice(3);
const J = (p) => JSON.parse(readFileSync(`${ROOT}/${p}`, "utf8"));
const W = (p, o) => writeFileSync(`${ROOT}/${p}`, JSON.stringify(o, null, 2) + "\n");
const files = { places: "content/places.json", festivals: "content/festivals.json", projects: "content/projects.json", food: "content/food.json", itin: "content/itineraries.json" };
const data = Object.fromEntries(Object.entries(files).map(([k, p]) => [k, J(p)]));
inflate(ROOT, { ...data, itineraries: data.itin });
const faqs = J("content/faqs.json"), about = J("content/about.json");
const byId = (k, id) => data[k].find((x) => x.id === id) ?? (() => { throw new Error(`${k}: unknown id ${id}`); })();
const report = [];
for (const L of readdirSync(TR).filter((d) => (!only.length || only.includes(d)) && existsSync(`${TR}/${d}`))) {
  const outs = readdirSync(`${TR}/${L}`).filter((f) => f.startsWith("out-") && f.endsWith(".json"));
  if (!outs.length) continue;
  let n = 0, missing = 0;
  const msgs = J(`messages/${L}.json`);
  const altPath = `content/i18n/alt-${L}.json`; const alt = existsSync(`${ROOT}/${altPath}`) ? J(altPath) : {};
  const gPath = `content/guides/i18n/${L}.json`; const gtr = existsSync(`${ROOT}/${gPath}`) ? J(gPath) : {};
  const aboutL = about[L] ?? JSON.parse(JSON.stringify(about.en));
  let aboutTouched = false;
  for (const f of outs) {
    const src = JSON.parse(readFileSync(`${TR}/${L}/${f.slice(4)}`, "utf8"));
    const out = JSON.parse(readFileSync(`${TR}/${L}/${f}`, "utf8"));
    for (const k of Object.keys(src)) if (!out[k] || !String(out[k]).trim()) { missing++; }
    if (f.startsWith("out-guide-")) {
      const slug = f.slice("out-guide-".length, -5);
      const g = J(`content/guides/${slug}.json`);
      const t = { title: out.title, description: out.description, lead: out.lead, facts: (g.facts ?? []).map((_, i) => ({ label: out[`facts|${i}|label`], value: out[`facts|${i}|value`] })), sections: g.sections.map((s, i) => ({ heading: out[`sections|${i}|heading`], body: s.body_en.map((_, j) => out[`sections|${i}|body|${j}`]), ...(s.list_en?.length ? { list: s.list_en.map((_, j) => out[`sections|${i}|list|${j}`]) } : {}) })), faq: g.faq.map((_, i) => ({ q: out[`faq|${i}|q`], a: out[`faq|${i}|a`] })) };
      gtr[slug] = t; n += Object.keys(out).length; continue;
    }
    for (const [key, val] of Object.entries(out)) {
      if (!val) continue; n++;
      const parts = key.split("|");
      const [kind] = parts;
      if (kind === "places" || kind === "festivals" || kind === "projects" || kind === "food") {
        const e = byId(kind, parts[1]); e.i18n ??= {}; const t = (e.i18n[L] ??= {});
        if (parts[2] === "tips" || parts[2] === "where") { (t[parts[2]] ??= []); t[parts[2]][Number(parts[3])] = val; }
        else if (parts[2] === "glance") { (t.glance ??= {})[parts[3]] = val; }
        else t[parts[2]] = val;
      } else if (kind === "itin") {
        const it = byId("itin", parts[1]);
        if (parts[2] === "summary") { it.i18n ??= {}; (it.i18n[L] ??= {}).summary = val; }
        else { const d = it.plan[Number(parts[3])]; if (parts[4] === "theme") { d.i18n ??= {}; (d.i18n[L] ??= {}).theme = val; } else { const s = d.stops[Number(parts[5])]; s.i18n ??= {}; (s.i18n[L] ??= {})[parts[6]] = val; } }
      } else if (kind === "ui") {
        const path = parts[1].split("."); let o = msgs; for (const p of path.slice(0, -1)) o = (o[p] ??= {}); o[path.at(-1)] = val;
      } else if (kind === "faqs") {
        faqs[parts[1]].items[Number(parts[2])][`${parts[3]}_${L}`] = val;
      } else if (kind === "about") {
        aboutTouched = true;
        if (parts[1] === "lead") aboutL.lead = val;
        else if (parts[1] === "contact") aboutL.contact[Number(parts[2])] = val;
        else { const s = aboutL.sections[Number(parts[2])]; if (parts[3] === "heading") s.heading = val; else s[parts[3]][Number(parts[4])] = val; }
      } else if (kind === "alt") { alt[parts.slice(1).join("|")] = val; }
      else throw new Error("unknown key " + key);
    }
  }
  if (aboutTouched) about[L] = aboutL;
  W(`messages/${L}.json`, msgs); W(altPath, alt); W(gPath, gtr);
  report.push(`${L}: ${outs.length} files, ${n} strings merged, ${missing} missing`);
}
deflate(ROOT, { ...data, itineraries: data.itin });
for (const [k, p] of Object.entries(files)) W(p, data[k]);
W("content/faqs.json", faqs); W("content/about.json", about);
console.log(report.join("\n"));
