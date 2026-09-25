import { places } from "@/lib/content";
import { LOCALES, type Locale } from "@/lib/i18n/locales";
import { SITE_URL } from "@/lib/site";

/**
 * schema.org TouristDestination for Kashi with its TouristAttractions
 * (every place, with geo and its page URL) plus the WebSite, per locale.
 */
export default function JsonLd({
  locale,
  name,
  description,
  siteName,
}: {
  locale: Locale;
  name: string;
  /** WebSite name (meta.siteName) */
  siteName: string;
  description: string;
}) {
  const devanagari = LOCALES[locale].script === "devanagari";
  const data = {
    "@context": "https://schema.org",
    "@type": "TouristDestination",
    "@id": `${SITE_URL}/${locale}#destination`,
    name,
    alternateName: ["Varanasi", "Banaras", "काशी", "वाराणसी"],
    description,
    url: `${SITE_URL}/${locale}`,
    inLanguage: LOCALES[locale].bcp47,
    geo: { "@type": "GeoCoordinates", latitude: 25.3176, longitude: 83.0062 },
    address: { "@type": "PostalAddress", addressLocality: "Varanasi", addressRegion: "Uttar Pradesh", addressCountry: "IN" },
    touristType: ["Pilgrims", "Heritage travellers", "Buddhist pilgrims", "Photographers"],
    includesAttraction: places.map((p) => ({
      "@type": "TouristAttraction",
      "@id": `${SITE_URL}/${locale}/places/${p.id}#place`,
      url: `${SITE_URL}/${locale}/places/${p.id}`,
      name: devanagari ? p.name_hi : p.name_en,
      alternateName: devanagari ? p.name_en : p.name_hi,
      geo: { "@type": "GeoCoordinates", latitude: p.lat, longitude: p.lng },
      isAccessibleForFree: true,
      sameAs: p.sources[0]?.url,
    })),
  };
  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: siteName,
    alternateName: ["Kashidwar", "Kashi (Varanasi) travel guide"],
    url: `${SITE_URL}/${locale}`,
    inLanguage: LOCALES[locale].bcp47,
    about: { "@id": `${SITE_URL}/${locale}#destination` },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify([website, data]).replace(/</g, "\\u003c") }}
    />
  );
}
