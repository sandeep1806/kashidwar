// Folds content/i18n/<locale>.json (translated summaries) into the
// i18n.<locale> blocks of content/places.json and content/festivals.json.
// Re-runnable: existing keys for that locale are overwritten by the file.
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");
const dir = join(root, "content/i18n");
const targets = { places: "content/places.json", festivals: "content/festivals.json" };
const data = Object.fromEntries(
  Object.entries(targets).map(([k, f]) => [k, JSON.parse(readFileSync(join(root, f), "utf8"))]),
);

for (const file of readdirSync(dir).filter((f) => /^[a-z]{2}\.json$/.test(f))) {
  const locale = file.slice(0, 2);
  const tr = JSON.parse(readFileSync(join(dir, file), "utf8"));
  for (const [group, list] of Object.entries(data)) {
    const byId = new Map(list.map((e) => [e.id, e]));
    for (const [id, fields] of Object.entries(tr[group] ?? {})) {
      const entry = byId.get(id);
      if (!entry) throw new Error(`${file}: unknown ${group} id ${id}`);
      entry.i18n ??= {};
      entry.i18n[locale] = { ...entry.i18n[locale], ...fields };
    }
    const missing = list.filter((e) => !tr[group]?.[e.id]).map((e) => e.id);
    if (missing.length) console.warn(`${locale}: no ${group} translation for ${missing.join(", ")}`);
  }
  console.log(`merged ${locale}`);
}
for (const [k, f] of Object.entries(targets)) writeFileSync(join(root, f), JSON.stringify(data[k], null, 2) + "\n");
