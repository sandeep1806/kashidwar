#!/usr/bin/env node
/**
 * Opening day for the Varanasi ropeway: swaps the pre-written "now open" text in
 * content/playbooks/varanasi-ropeway-open.json into the ropeway guide (English, Hindi and the
 * 11 regional translations, positionally) and marks the project completed.
 *
 *   node scripts/apply-ropeway-open.mjs --date 2026-11-24 --hours "07:00–21:00" \
 *     --source-url https://… --source-title "Amar Ujala: Ropeway opens to passengers (24 Nov 2026)" \
 *     [--fare-min ₹10 --fare-full ₹50 [--fares-official]] [--dry-run]
 *
 * --date, --hours and the source are required (wait for them; do not guess). Fares are optional:
 * without them the fare fact and FAQ keep their current text; with them but without
 * --fares-official they are worded as "reported". The script refuses to run twice.
 *
 * Still by hand afterwards (it prints this list): the `fares` section once the operator publishes
 * a fare table; the project's summary, timeline and bestTime (en, hi, content/i18n/entries/*);
 * then npm run build, node scripts/check-i18n.mjs, node scripts/check-seo.mjs.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");
const SLUG = "varanasi-ropeway";
const LOCALES = ["ta", "te", "kn", "ml", "bn", "or", "as", "mr", "gu", "pa", "sa"];

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, all) => {
    if (!a.startsWith("--")) return acc;
    const next = all[i + 1];
    acc.push([a.slice(2), next && !next.startsWith("--") ? next : true]);
    return acc;
  }, []),
);
const need = (k) => {
  if (!args[k] || args[k] === true) throw new Error(`--${k} is required`);
  return String(args[k]);
};
const date = need("date");
if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error("--date must be YYYY-MM-DD");
const hours = need("hours");
const source = { title: need("source-title"), url: need("source-url"), accessed: new Date().toISOString().slice(0, 10) };
const fareMin = args["fare-min"] ? String(args["fare-min"]) : null;
const fareFull = args["fare-full"] ? String(args["fare-full"]) : null;
if (!!fareMin !== !!fareFull) throw new Error("give both --fare-min and --fare-full, or neither");
const fares = !!fareMin;
const official = !!args["fares-official"];
const dry = !!args["dry-run"];

const readJson = (p) => JSON.parse(readFileSync(join(root, p), "utf8"));
const writeJson = (p, data) => {
  const raw = readFileSync(join(root, p), "utf8");
  const indent = /^[[{]\n {2}\S/.test(raw) ? 2 : 1;
  if (!dry) writeFileSync(join(root, p), JSON.stringify(data, null, indent) + "\n");
};

const book = readJson("content/playbooks/varanasi-ropeway-open.json");
const [y, m, d] = date.split("-").map(Number);
const fill = (L, s) => {
  if (typeof s !== "string") throw new Error(`${L}: missing playbook string`);
  const months = book[L].months;
  const out = s
    .replaceAll("{DATE}", `${d} ${months[m - 1]} ${y}`)
    .replaceAll("{HOURS}", hours)
    .replaceAll("{FARE_MIN}", fareMin ?? "")
    .replaceAll("{FARE_FULL}", fareFull ?? "");
  if (/\{[A-Z_]+\}/.test(out)) throw new Error(`${L}: unfilled placeholder in "${out}"`);
  return out;
};
/** Every string a locale needs, filled. */
const text = (L) => {
  const b = book[L];
  const f = (k) => fill(L, b[k]);
  return {
    title: fares ? f("title") : f("titleNoFare"),
    description: fares ? f("description") : f("descriptionNoFare"),
    lead: f("lead"),
    factStatus: f("factStatus"),
    factFare: fares ? (official ? f("factFare") : f("factFareReported")) : null,
    factHours: f("factHours"),
    status: { heading: f("statusHeading"), body: b.statusBody.map((s) => fill(L, s)) },
    ride: { heading: f("rideHeading"), body: b.rideBody.map((s) => fill(L, s)) },
    faqOpen: { q: f("faqOpenQ"), a: f("faqOpenA") },
    faqFareA: fares ? (official ? f("faqFareA") : f("faqFareReportedA")) : null,
    added: [
      { q: f("faqHoursQ"), a: f("faqHoursA") },
      { q: f("faqBoardQ"), a: f("faqBoardA") },
    ],
  };
};
// Fill everything first, so a gap in any locale stops the run before a file is written.
const all = Object.fromEntries(["en", "hi", ...LOCALES].map((L) => [L, text(L)]));

const gPath = `content/guides/${SLUG}.json`;
const g = readJson(gPath);
const si = g.sections.findIndex((s) => s.id === "status-2026");
const ri = g.sections.findIndex((s) => s.id === "until-it-opens");
if (si < 0 || ri < 0) throw new Error("status-2026 / until-it-opens section not found");
if (g.sections[si].heading_en === all.en.status.heading) throw new Error("already applied");
const factIdx = (re) => {
  const i = g.facts.findIndex((x) => re.test(x.label_en));
  if (i < 0) throw new Error(`fact ${re} not found`);
  return i;
};
const [fStatus, fFare, fHours] = [factIdx(/^Status/), factIdx(/^Fare/), factIdx(/^Hours/)];
const faqFare = g.faq.findIndex((x) => /fare/i.test(x.q_en));

const today = source.accessed;
g.updated = today;
g.sources.push(source);
const src = g.sources.length - 1;
for (const L of ["en", "hi"]) {
  const t = all[L];
  g[`title_${L}`] = t.title;
  g[`description_${L}`] = t.description;
  g[`lead_${L}`] = t.lead;
  g.facts[fStatus][`value_${L}`] = t.factStatus;
  g.facts[fHours][`value_${L}`] = t.factHours;
  if (t.factFare) g.facts[fFare][`value_${L}`] = t.factFare;
  g.sections[si][`heading_${L}`] = t.status.heading;
  g.sections[si][`body_${L}`] = t.status.body;
  g.sections[ri][`heading_${L}`] = t.ride.heading;
  g.sections[ri][`body_${L}`] = t.ride.body;
  g.faq[0][`q_${L}`] = t.faqOpen.q;
  g.faq[0][`a_${L}`] = t.faqOpen.a;
  if (t.faqFareA && faqFare >= 0) g.faq[faqFare][`a_${L}`] = t.faqFareA;
}
if (fares && official) g.facts[fFare].label_en = "Fare";
for (const i of [si, ri]) {
  g.sections[i].unconfirmed = false;
  g.sections[i].sources = [...new Set([src, ...(g.sections[i].sources ?? [])])];
}
// Appended FAQs (regional translations below get the same two, keeping positions aligned)
g.faq.push(...all.en.added.map((x, k) => ({ q_en: x.q, a_en: x.a, q_hi: all.hi.added[k].q, a_hi: all.hi.added[k].a })));
g.notes = `${g.notes ?? ""} OPENED ${date} (applied ${today} with scripts/apply-ropeway-open.mjs; hours ${hours}; fares ${fares ? `${fareMin}–${fareFull}${official ? " official" : " reported"}` : "unchanged"}; source ${source.url}).`.trim();
writeJson(gPath, g);

for (const L of LOCALES) {
  const p = `content/guides/i18n/${L}.json`;
  const file = readJson(p);
  const tr = file[SLUG];
  if (!tr) throw new Error(`${L}: no translation of ${SLUG}`);
  const t = all[L];
  tr.title = t.title;
  tr.description = t.description;
  tr.lead = t.lead;
  if (tr.facts?.[fStatus]) tr.facts[fStatus].value = t.factStatus;
  if (tr.facts?.[fHours]) tr.facts[fHours].value = t.factHours;
  if (t.factFare && tr.facts?.[fFare]) tr.facts[fFare].value = t.factFare;
  tr.sections[si] = { heading: t.status.heading, body: t.status.body };
  tr.sections[ri] = { heading: t.ride.heading, body: t.ride.body };
  tr.faq[0] = t.faqOpen;
  if (t.faqFareA && faqFare >= 0 && tr.faq[faqFare]) tr.faq[faqFare].a = t.faqFareA;
  tr.faq.push(...t.added);
  writeJson(p, file);
}

const pPath = "content/projects.json";
const projects = readJson(pPath);
const proj = projects.find((x) => x.id === SLUG);
proj.status = "completed";
proj.lastVerified = today;
proj.sources = [...(proj.sources ?? []), source];
writeJson(pPath, projects);

console.log(`${dry ? "[dry run] would apply" : "Applied"}: ${all.en.title}`);
for (const L of ["hi", ...LOCALES]) console.log(`  ${L}: ${all[L].title}`);
console.log(`
Still to do by hand:
  - fares section${official ? ": rewrite it from the operator's fare table and set unconfirmed: false" : ": unchanged until the operator publishes a fare table"}
  - project ${SLUG}: summary, timeline and bestTime (en; i18n.hi; content/i18n/entries/<locale>.json)
  - npm run build && node scripts/check-i18n.mjs && node scripts/check-seo.mjs`);
