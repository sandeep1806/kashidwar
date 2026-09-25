#!/usr/bin/env node
/**
 * Downloads every picked photo, grades and resizes it, and writes the
 * self-hosted AVIF + WebP set plus the metadata the site reads.
 *
 *   node scripts/optimize-images.mjs            # all picks
 *   node scripts/optimize-images.mjs places     # one group
 *   node scripts/optimize-images.mjs --force    # re-encode photos that already exist
 *
 * Inputs
 *   scripts/image-picks.json   [{ key: "places/assi-ghat", title: "File:…", alt: { en, hi }, crop?: [x, y, w, h], author?: "…",
 *                               elsewhere?: "photo" | "art" }]
 *                              (crop is in fractions of the original, e.g. to cut off a watermark)
 *   content/i18n/alt-<locale>.json  { key: alt } for the regional locales (optional)
 *   raw/<group>/<id>.(jpg|jpeg|png|webp)  owner photos override Commons (no credit line needed)
 *
 * Outputs
 *   public/media/photos/<group>/<id>-<width>.(avif|webp)
 *   content/photos.json   { key: { src, widths, width, height, blur, alt: { locale: text } } }
 *   content/credits.json  [{ key, file, title, author, license, licenseUrl, source }]
 *
 * Originals are cached in scripts/.images/originals/ (gitignored). Nothing is
 * hotlinked: the site only ever serves the files written here.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const root = join(import.meta.dirname, "..");
const UA = "KashiSite/1.0 (https://kashidwar.com; photo sourcing script)";
const cacheDir = join(root, "scripts/.images/originals");
const outDir = join(root, "public/media/photos");
mkdirSync(cacheDir, { recursive: true });

/** Widths and byte budgets per group (budget applies to the largest AVIF and WebP). */
const PROFILES = {
  places: { widths: [480, 960], budget: 150_000 },
  festivals: { widths: [480, 960], budget: 150_000 },
  food: { widths: [480, 960], budget: 150_000 },
  projects: { widths: [480, 960], budget: 150_000 },
  scenes: { widths: [640, 960, 1600], budget: 140_000 },
  hero: { widths: [640], budget: 200_000 },
};
/** The dimmer groups sit behind text, so they are graded darker. */
const GRADE = {
  default: { brightness: 0.9, saturation: 0.92, warm: [1.04, 1.0, 0.92], lift: [3, 1, -4] },
  scenes: { brightness: 0.78, saturation: 0.88, warm: [1.06, 1.0, 0.9], lift: [2, 0, -2] },
  hero: { brightness: 0.72, saturation: 0.9, warm: [1.06, 1.0, 0.9], lift: [2, 0, -2] },
};

const LOCALES = ["hi", "en", "ta", "te", "kn", "ml", "bn", "or", "as", "mr", "gu", "pa", "sa"];
const strip = (h = "") => h.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

async function commonsInfo(title) {
  const q = new URLSearchParams({
    format: "json", action: "query", prop: "imageinfo", titles: title,
    iiprop: "url|size|mime|extmetadata", iiurlwidth: "2400",
  });
  const r = await fetch("https://commons.wikimedia.org/w/api.php?" + q, { headers: { "User-Agent": UA } });
  const page = Object.values((await r.json()).query.pages)[0];
  const ii = page.imageinfo?.[0];
  if (!ii) throw new Error(`Commons has no file ${title}`);
  const m = ii.extmetadata ?? {};
  const license = m.LicenseShortName?.value ?? "";
  if (!/^(cc0|cc[- ]?by(-sa)?[- ]?\d(\.\d)?|public domain|pd)/i.test(license) || /\b(nc|nd)\b/i.test(license)) {
    throw new Error(`${title}: licence "${license}" is not allowed`);
  }
  return {
    // Commons' own 2400px rendition when the original is larger; the original otherwise.
    download: ii.width > 2400 && ii.thumburl ? ii.thumburl : ii.url,
    license,
    licenseUrl: m.LicenseUrl?.value ?? (/cc0/i.test(license) ? "https://creativecommons.org/publicdomain/zero/1.0/" : ""),
    author: strip(m.Artist?.value) || "Unknown",
    source: ii.descriptionurl,
  };
}

async function original(key, title) {
  const [group, id] = key.split("/");
  for (const ext of ["jpg", "jpeg", "png", "webp"]) {
    const p = join(root, "raw", group, `${id}.${ext}`);
    if (existsSync(p)) return { file: p, credit: null };
  }
  const info = await commonsInfo(title);
  const file = join(cacheDir, key.replace("/", "--") + ".img");
  if (!existsSync(file)) {
    const r = await fetch(info.download, { headers: { "User-Agent": UA } });
    if (!r.ok) throw new Error(`${title}: HTTP ${r.status}`);
    writeFileSync(file, Buffer.from(await r.arrayBuffer()));
    await new Promise((res) => setTimeout(res, 400)); // be gentle with upload.wikimedia.org
  }
  return { file, credit: info };
}

async function cropped(input, crop) {
  if (!crop) return input;
  const { width, height } = await sharp(input).rotate().metadata();
  const [x, y, w, h] = crop;
  return sharp(input).rotate()
    .extract({ left: Math.round(x * width), top: Math.round(y * height), width: Math.round(w * width), height: Math.round(h * height) })
    .toBuffer();
}

function graded(input, group) {
  const g = GRADE[group] ?? GRADE.default;
  return sharp(input, { failOn: "none" })
    .rotate()
    .modulate({ brightness: g.brightness, saturation: g.saturation })
    .linear(g.warm, g.lift)
    .toColourspace("srgb");
}

async function encode(base, width, format, budget) {
  // Step quality down until the file fits the budget.
  const steps = format === "avif" ? [52, 46, 40, 34, 28, 22] : [74, 66, 58, 50, 42, 34, 26];
  let buf;
  for (const quality of steps) {
    const img = base.clone().resize({ width, withoutEnlargement: true });
    buf = await (format === "avif" ? img.avif({ quality, effort: 4 }) : img.webp({ quality, effort: 4 })).toBuffer();
    if (buf.length <= budget) break;
  }
  return buf;
}

const picks = JSON.parse(readFileSync(join(root, "scripts/image-picks.json"), "utf8"));
const force = process.argv.includes("--force");
const only = process.argv.slice(2).find((a) => !a.startsWith("--"));
const altFiles = Object.fromEntries(
  readdirSync(join(root, "content/i18n"))
    .filter((f) => /^alt-[a-z]{2}\.json$/.test(f))
    .map((f) => [f.slice(4, 6), JSON.parse(readFileSync(join(root, "content/i18n", f), "utf8"))]),
);

const photosPath = join(root, "content/photos.json");
const creditsPath = join(root, "content/credits.json");
const photos = existsSync(photosPath) ? JSON.parse(readFileSync(photosPath, "utf8")) : {};
const creditList = existsSync(creditsPath) ? JSON.parse(readFileSync(creditsPath, "utf8")) : [];
const credits = new Map(creditList.map((c) => [c.key, c]));
const report = [];

function save() {
  const ordered = Object.fromEntries(Object.entries(photos).sort(([a], [b]) => a.localeCompare(b)));
  writeFileSync(photosPath, JSON.stringify(ordered, null, 1) + "\n");
  writeFileSync(creditsPath, JSON.stringify([...credits.values()].sort((a, b) => a.key.localeCompare(b.key)), null, 2) + "\n");
}

for (const pick of picks) {
  const [group, id] = pick.key.split("/");
  if (only && group !== only) continue;
  const profile = PROFILES[group];
  const { file, credit } = await original(pick.key, pick.title);
  const input = await cropped(readFileSync(file), pick.crop);
  const base = graded(input, group);
  const meta = await sharp(input).rotate().metadata();
  const dir = join(outDir, group);
  mkdirSync(dir, { recursive: true });

  const widths = profile.widths.filter((w, i) => i === 0 || w <= meta.width);
  const done = !force && photos[pick.key]?.widths?.join() === widths.join() &&
    JSON.stringify(photos[pick.key]?.crop ?? null) === JSON.stringify(pick.crop ?? null) &&
    widths.every((w) => existsSync(join(dir, `${id}-${w}.avif`)) && existsSync(join(dir, `${id}-${w}.webp`)));
  const sizes = {};
  for (const w of done ? [] : widths) {
    const top = w === widths.at(-1);
    for (const fmt of ["avif", "webp"]) {
      const buf = await encode(base, w, fmt, top ? profile.budget : profile.budget * 0.6);
      writeFileSync(join(dir, `${id}-${w}.${fmt}`), buf);
      sizes[`${w}.${fmt}`] = buf.length;
    }
  }
  const largest = widths.at(-1);
  const height = Math.round((meta.height / meta.width) * Math.min(largest, meta.width));
  // 8px-wide WebP, blurred by the browser's upscaling: ~100 bytes inline.
  const blur = await base.clone().resize({ width: 8 }).webp({ quality: 40 }).toBuffer();

  const alt = { ...pick.alt };
  for (const loc of LOCALES) if (!alt[loc] && altFiles[loc]?.[pick.key]) alt[loc] = altFiles[loc][pick.key];
  photos[pick.key] = {
    src: `/media/photos/${group}/${id}`,
    widths,
    width: Math.min(largest, meta.width),
    height,
    blur: `data:image/webp;base64,${blur.toString("base64")}`,
    ...(pick.crop ? { crop: pick.crop } : {}),
    // "photo" | "art": taken (or made) outside Varanasi; the site shows a label.
    ...(pick.elsewhere ? { elsewhere: pick.elsewhere } : {}),
    alt,
  };
  if (credit) {
    credits.set(pick.key, {
      key: pick.key,
      file: `${photos[pick.key].src}-${largest}.webp`,
      title: pick.title.replace(/^File:/, "").replace(/\.[a-z]+$/i, ""),
      author: pick.author ?? credit.author,
      license: credit.license,
      licenseUrl: credit.licenseUrl,
      source: credit.source,
    });
  } else credits.delete(pick.key);
  report.push([pick.key, done ? "(kept)" : "", ...Object.entries(sizes).map(([k, v]) => `${k}=${Math.round(v / 1024)}k`)].join(" "));
  console.log(report.at(-1));
  save();
}
save();
console.log(`\n${report.length} photos · ${credits.size} credits`);
