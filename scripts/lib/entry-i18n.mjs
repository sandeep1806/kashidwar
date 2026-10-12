// Regional entry translations live in content/i18n/entries/<locale>.json (one file per
// locale, keyed by kind and id) so the shared content files stay small in the Worker bundle.
// The scripts work on the inline `i18n.<locale>` shape: `inflate` attaches the files to the
// loaded content, `deflate` moves them back out and writes the per-locale files.
import { readFileSync, writeFileSync, existsSync } from "node:fs";

export const REGIONAL = ["ta", "te", "kn", "ml", "bn", "or", "as", "mr", "gu", "pa", "sa"];
const KINDS = ["places", "festivals", "projects", "food"];
const path = (root, L) => `${root}/content/i18n/entries/${L}.json`;
const set = (o, L, v) => { if (v && Object.keys(v).length) { o.i18n ??= {}; o.i18n[L] = v; } };

/** data: { places, festivals, projects, food, itineraries } arrays as loaded from content/. */
export function inflate(root, data) {
  for (const L of REGIONAL) {
    if (!existsSync(path(root, L))) continue;
    const t = JSON.parse(readFileSync(path(root, L), "utf8"));
    for (const k of KINDS) for (const e of data[k]) set(e, L, t[k]?.[e.id]);
    for (const it of data.itineraries) {
      const o = t.itineraries?.[it.id];
      if (!o) continue;
      const { plan, ...top } = o;
      set(it, L, top);
      plan?.forEach((d, i) => {
        const day = it.plan[i]; if (!day || !d) return;
        const { stops, ...dt } = d;
        set(day, L, dt);
        stops?.forEach((s, j) => day.stops[j] && set(day.stops[j], L, s));
      });
    }
  }
  return data;
}

/** Removes every regional `i18n.<locale>` from data (in place) and writes the per-locale files. */
export function deflate(root, data) {
  const take = (o, L) => { const v = o.i18n?.[L]; if (o.i18n) { delete o.i18n[L]; if (!Object.keys(o.i18n).length) delete o.i18n; } return v; };
  for (const L of REGIONAL) {
    const out = { places: {}, festivals: {}, projects: {}, food: {}, itineraries: {} };
    for (const k of KINDS) for (const e of data[k]) { const v = take(e, L); if (v) out[k][e.id] = v; }
    for (const it of data.itineraries) {
      const top = take(it, L) ?? {};
      const plan = it.plan.map((d) => ({ ...(take(d, L) ?? {}), stops: d.stops.map((s) => take(s, L) ?? {}) }));
      const hasPlan = plan.some((d) => Object.keys(d).length > 1 || d.stops.some((s) => Object.keys(s).length));
      const o = { ...top, ...(hasPlan ? { plan } : {}) };
      if (Object.keys(o).length) out.itineraries[it.id] = o;
    }
    writeFileSync(path(root, L), JSON.stringify(out, null, 1) + "\n");
  }
  return data;
}
