#!/usr/bin/env node
/**
 * Checks every source URL in content/*.json and content/guides/*.json.
 * Used by the content review (scripts/content-review.sh → .claude/content-review.md, check 5)
 * so the agent spends one command, not dozens of turns, on link checking.
 *
 *   node scripts/check-links.mjs            # report broken links (exit 0)
 *   node scripts/check-links.mjs --all      # also list blocked (403/429) ones
 *
 * HEAD first, GET on failure; 20 s timeout; 12 at a time. "Broken" = no response twice or a
 * 4xx/5xx other than 401/403/429 (sites that refuse bots are "blocked", not broken).
 * No dependencies: Node's own fetch.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");
const files = [
  ...readdirSync(join(root, "content")).filter((f) => f.endsWith(".json")).map((f) => `content/${f}`),
  ...readdirSync(join(root, "content/guides")).filter((f) => f.endsWith(".json")).map((f) => `content/guides/${f}`),
];

/** url → Set of files it appears in */
const urls = new Map();
const walk = (v, file) => {
  if (typeof v === "string") {
    if (/^https?:\/\//.test(v)) (urls.get(v) ?? urls.set(v, new Set()).get(v)).add(file);
  } else if (Array.isArray(v)) v.forEach((x) => walk(x, file));
  else if (v && typeof v === "object") Object.values(v).forEach((x) => walk(x, file));
};
for (const f of files) walk(JSON.parse(readFileSync(join(root, f), "utf8")), f);

const UA = "Mozilla/5.0 (compatible; KashidwarLinkCheck/1.0; +https://kashidwar.com)";
async function status(url) {
  for (const method of ["HEAD", "GET"]) {
    try {
      const r = await fetch(url, { method, redirect: "follow", signal: AbortSignal.timeout(20_000), headers: { "user-agent": UA } });
      if (r.ok || method === "GET") return r.status;
    } catch {
      if (method === "GET") return 0;
    }
  }
  return 0;
}

const list = [...urls.keys()];
const results = [];
let next = 0;
await Promise.all(
  Array.from({ length: 12 }, async () => {
    while (next < list.length) {
      const url = list[next++];
      let s = await status(url);
      if (s === 0) s = await status(url); // retry once
      results.push({ url, status: s, files: [...urls.get(url)] });
    }
  }),
);

const blocked = (s) => s === 401 || s === 403 || s === 429;
const broken = results.filter((r) => r.status === 0 || (r.status >= 400 && !blocked(r.status)));
const refused = results.filter((r) => blocked(r.status));
console.log(`${list.length} unique URLs in ${files.length} files · ${broken.length} broken · ${refused.length} blocked (bot protection, not counted as broken)`);
for (const r of broken) console.log(`BROKEN ${r.status || "no-response"}  ${r.url}  [${r.files.join(", ")}]`);
if (process.argv.includes("--all")) for (const r of refused) console.log(`BLOCKED ${r.status}  ${r.url}  [${r.files.join(", ")}]`);
