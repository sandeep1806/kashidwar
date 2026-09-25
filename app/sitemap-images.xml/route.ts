import { INDEXED_LOCALES } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";
import { PHOTOS, sitemapPages } from "@/lib/sitemapEntries";

/** Image sitemap: every page in the indexed locales with the self-hosted photos it shows. */
export const dynamic = "force-static";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function GET() {
  const urls = sitemapPages()
    .filter((p) => p.photoKeys.length)
    .flatMap((page) =>
      INDEXED_LOCALES.map((l) => {
        const images = page.photoKeys
          .map((k) => PHOTOS[k])
          .filter(Boolean)
          .map((p) => `    <image:image><image:loc>${esc(`${SITE_URL}${p.src}-${p.widths.at(-1)}.webp`)}</image:loc></image:image>`)
          .join("\n");
        return `  <url>\n    <loc>${esc(`${SITE_URL}/${l}${page.path}`)}</loc>\n${images}\n  </url>`;
      }),
    );
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urls.join("\n")}\n</urlset>\n`;
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
}
