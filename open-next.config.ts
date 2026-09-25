import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

/**
 * Cloudflare Workers via OpenNext. Every locale page, the sitemap and robots
 * are prerendered at build time. The static-assets incremental cache serves
 * that prerendered output straight from the Worker's assets (read-only, no
 * revalidation), so pages are not re-rendered per request, and unknown
 * locales fall through to a real 404 (`dynamicParams = false`).
 */
export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
  enableCacheInterception: true,
});
