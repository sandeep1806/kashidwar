import { defineCloudflareConfig } from "@opennextjs/cloudflare";

/**
 * Cloudflare Workers via OpenNext. Every page, the sitemap, robots and the
 * OpenGraph images are prerendered at build and served from the Worker's
 * static assets; the Worker itself only runs the locale proxy (redirects) and
 * the 404/error fallbacks. No incremental cache is needed (no ISR, no
 * dynamic routes), so the default in-memory config is used.
 */
export default defineCloudflareConfig({});
