// Worker entry: the OpenNext-generated Next.js worker, plus a weekly cron.
//
// Festival pages compute "next occurrence" at build time (lib/festivalDates.ts),
// so the site must be rebuilt regularly for dates to roll over. The cron below
// (wrangler.jsonc → triggers.crons) POSTs to a Workers Builds Deploy Hook,
// which rebuilds and redeploys the `redesign` branch.
//
// Setup (once): Workers & Pages → kashidwar → Settings → Builds → Deploy Hooks
// → create a hook for branch `redesign`, then store its URL as a secret:
//   npx wrangler secret put DEPLOY_HOOK_URL
// Without the secret the cron only logs a warning.
import handler from "./.open-next/worker.js";

export { DOQueueHandler, DOShardedTagCache, BucketCachePurge } from "./.open-next/worker.js";

const worker = {
  fetch: handler.fetch,

  async scheduled(controller, env, ctx) {
    if (!env.DEPLOY_HOOK_URL) {
      console.warn("[rebuild] DEPLOY_HOOK_URL is not set; skipping the scheduled rebuild");
      return;
    }
    ctx.waitUntil(
      fetch(env.DEPLOY_HOOK_URL, { method: "POST" }).then(
        (r) => console.log(`[rebuild] deploy hook → ${r.status} (cron ${controller.cron})`),
        (e) => console.error("[rebuild] deploy hook failed", e),
      ),
    );
  },
};

export default worker;
