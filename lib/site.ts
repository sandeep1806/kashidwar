/** Canonical site origin. Set NEXT_PUBLIC_SITE_URL in wrangler.jsonc `vars` (injected into the build by scripts/cf-build.mjs). */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://kashidwar.com").replace(/\/$/, "");

/** The publisher's name in structured data, the footer and the About page. */
export const BRAND = "Kashidwar";

/**
 * Contact address shown on the About page (and in Organization JSON-LD).
 * PLACEHOLDER: replace with the real address before relying on it. With
 * Cloudflare Email Routing, contact@kashidwar.com can forward to any inbox.
 */
export const CONTACT_EMAIL = "contact@kashidwar.com";

/**
 * Official social profiles for Organization.sameAs, e.g.
 *   "https://www.instagram.com/kashidwar", "https://x.com/kashidwar", "https://www.youtube.com/@kashidwar"
 * PLACEHOLDER: empty until the profiles exist (an empty list emits no sameAs).
 */
export const SOCIAL_PROFILES: string[] = [];

/** schema.org Organization for kashidwar.com (referenced as publisher by the WebSite and Articles). */
export const organizationLd = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: BRAND,
  url: SITE_URL,
  logo: { "@type": "ImageObject", url: `${SITE_URL}/icon-512.png`, width: 512, height: 512 },
  email: CONTACT_EMAIL,
  ...(SOCIAL_PROFILES.length ? { sameAs: SOCIAL_PROFILES } : {}),
});
