/** Canonical site origin. Set NEXT_PUBLIC_SITE_URL in wrangler.jsonc `vars` (injected into the build by scripts/cf-build.mjs). */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://kashidwar.com").replace(/\/$/, "");
