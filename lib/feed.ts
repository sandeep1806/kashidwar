// RSS 2.0 feed of the guides (app/feed.xml, app/feed-hi.xml): lets readers follow the site in
// Chrome and feed readers. Newest change first, each item with its large photo (media:content).
import { guidePhoto, guides, localizeGuide } from "@/lib/guides";
import { AUTHOR_NAME, BRAND, SITE_URL, feedFor } from "@/lib/site";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const rfc822 = (d: string) => new Date(`${d}T00:00:00Z`).toUTCString();

export function guidesFeed(locale: "en" | "hi"): Response {
  const feed = feedFor(locale);
  const list = guides.slice().sort((a, b) => b.updated.localeCompare(a.updated) || b.published.localeCompare(a.published));
  const items = list.map((g) => {
    const l = localizeGuide(g, locale);
    const url = `${SITE_URL}/${locale}/guides/${g.slug}`;
    const photo = guidePhoto(g, locale);
    const image = photo
      ? `\n      <media:content url="${esc(`${SITE_URL}${photo.src}-${photo.widths.at(-1)}.webp`)}" medium="image" type="image/webp" width="${photo.width}" height="${photo.height}" />`
      : "";
    return `    <item>
      <title>${esc(l.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${rfc822(g.updated)}</pubDate>
      <dc:creator>${esc(AUTHOR_NAME)}</dc:creator>
      <description>${esc(l.description)}</description>${image}
    </item>`;
  });
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>${esc(feed.title)}</title>
    <link>${SITE_URL}/${locale}/guides</link>
    <atom:link href="${SITE_URL}${feed.url}" rel="self" type="application/rss+xml" />
    <description>${esc(locale === "hi" ? "वाराणसी (काशी) की यात्रा, त्योहारों और आयोजनों पर स्रोतों के साथ जाँची गई गाइड।" : "Guides to Varanasi (Kashi): visits, festivals and events, checked against the sources they cite.")}</description>
    <language>${locale === "hi" ? "hi-IN" : "en-IN"}</language>
    <lastBuildDate>${rfc822(list[0]?.updated ?? "2026-01-01")}</lastBuildDate>
    <image><url>${SITE_URL}/icon-512.png</url><title>${esc(feed.title)}</title><link>${SITE_URL}/${locale}/guides</link></image>
    <copyright>${esc(BRAND)}</copyright>
${items.join("\n")}
  </channel>
</rss>
`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
