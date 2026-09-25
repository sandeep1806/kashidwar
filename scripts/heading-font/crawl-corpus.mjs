// Heading-font corpus, step 1: every text node the site renders in the
// Devanagari display face (computed font-family includes Tiro), across all 13
// locales and their credits pages, with each itinerary tab opened. Plus the
// Hindi/Marathi/Sanskrit heading strings and every name_hi, as a margin.
//
//   npm run build && npx next start -p 3999 &
//   npm i --no-save puppeteer-core harfbuzzjs     # tools, not app dependencies
//   node scripts/heading-font/crawl-corpus.mjs    # → scripts/heading-font/corpus.txt
//   node scripts/heading-font/shape.mjs scripts/heading-font/TiroDevanagariHindi-Regular.ttf scripts/heading-font/corpus.txt /tmp/shaped.json
//   python3 scripts/heading-font/subset.py        # needs fonttools + brotli
//
// Re-run after changing headings, names or verses. Text outside the corpus
// still renders (the subset keeps every Devanagari letter the corpus uses),
// but a conjunct the corpus never formed would fall back to half-forms.
import puppeteer from "puppeteer-core";
import { readFileSync, writeFileSync } from "node:fs";
const LOCALES = ["hi","en","ta","te","kn","ml","bn","or","as","mr","gu","pa","sa"];
const browser = await puppeteer.launch({ executablePath: "/usr/bin/google-chrome", headless: true, args: ["--no-sandbox"] });
const texts = new Set();
const grab = (p) => p.evaluate(() => {
  const out = [];
  for (const el of document.querySelectorAll("body *")) {
    const ff = getComputedStyle(el).fontFamily;
    if (!/Tiro/i.test(ff)) continue;
    for (const n of el.childNodes) if (n.nodeType === 3 && n.textContent.trim()) out.push(n.textContent);
  }
  return out;
});
for (const loc of LOCALES) {
  for (const path of [`/${loc}`, `/${loc}/credits`]) {
    const p = await browser.newPage(); await p.setViewport({ width: 1280, height: 900 });
    await p.goto("http://localhost:3999" + path, { waitUntil: "load" });
    // apply the deferred font classes now, as the idle swap would
        await p.waitForFunction(() => document.documentElement.className.split(" ").length >= 4, { timeout: 15000 }).catch(() => {});
    await p.evaluate(() => document.querySelectorAll("section, footer").forEach((s) => (s.style.contentVisibility = "visible")));
    (await grab(p)).forEach((t) => texts.add(t));
    const tabs = await p.$$("#itineraries [role=tab]");
    for (let i = 0; i < tabs.length; i++) { await p.evaluate((i) => document.querySelectorAll("#itineraries [role=tab]")[i].click(), i); await new Promise(r => setTimeout(r, 200)); (await grab(p)).forEach((t) => texts.add(t)); }
    await p.close();
  }
  process.stdout.write(loc + " ");
}
const extra = [];
const walk = (o, k = "") => { if (typeof o === "string") { if (/title|closing|brand|name|cta|tabs|sample|nativeName/i.test(k)) extra.push(o); } else if (o && typeof o === "object") for (const [kk, v] of Object.entries(o)) walk(v, kk); };
const json = (f) => JSON.parse(readFileSync(new URL("../../" + f, import.meta.url), "utf8"));
for (const l of ["hi", "mr", "sa"]) walk(json(`messages/${l}.json`));
for (const f of ["places", "projects", "festivals", "food"]) for (const x of json(`content/${f}.json`)) extra.push(x.name_hi);
walk(json("content/faiths.json"));
// Language switcher: native names and greetings (shown in the display face).
const locTs = readFileSync(new URL("../../lib/i18n/locales.ts", import.meta.url), "utf8");
for (const m of locTs.matchAll(/(?:nativeName|sample): "([^"]+)"/g)) extra.push(m[1]);
const all = [...texts, ...extra].join("\n");
writeFileSync(process.argv[2] ?? new URL("./corpus.txt", import.meta.url), all);
const deva = [...new Set([...all].filter((c) => /[ऀ-ॿ꣠-ꣿ᳐-᳿]/.test(c)))];
console.log("\nstrings", texts.size, "chars", all.length, "distinct Devanagari codepoints", deva.length);
await browser.close();
