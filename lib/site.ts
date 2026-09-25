/** Canonical site origin. Set NEXT_PUBLIC_SITE_URL in Vercel (Production) to the real domain. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://kashidwar.vercel.app").replace(/\/$/, "");
