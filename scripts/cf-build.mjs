// Builds the Worker with the public vars from wrangler.jsonc visible to `next build`.
// NEXT_PUBLIC_* values are inlined at build time, and the pages are prerendered,
// so the canonical origin must be known when Next runs — not only at runtime.
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const raw = readFileSync(new URL("../wrangler.jsonc", import.meta.url), "utf8");
const json = raw.replace(/^\s*\/\/.*$/gm, "").replace(/,(\s*[}\]])/g, "$1");
const vars = JSON.parse(json).vars ?? {};
const env = { ...process.env };
for (const [k, v] of Object.entries(vars)) if (env[k] === undefined) env[k] = String(v);
console.log(`[cf-build] NEXT_PUBLIC_SITE_URL=${env.NEXT_PUBLIC_SITE_URL}`);
const r = spawnSync("npx", ["opennextjs-cloudflare", "build"], { stdio: "inherit", env, shell: process.platform === "win32" });
process.exit(r.status ?? 1);
