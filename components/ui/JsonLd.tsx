import { places } from "@/lib/content";
import { LOCALES, type Locale } from "@/lib/i18n/locales";
import { SITE_URL } from "@/lib/site";

/**
 * schema.org TouristDestination for Kashi with its TouristAttractions
 * (the 22 places, with geo), per locale. Rendered as a JSON-LD script.
 */
export default function JsonLd({
  locale,
  name,
  description,
}: {
  locale: Locale;
  name: string;
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
      "@id": `${SITE_URL}/${locale}#${p.id}`,
      name: devanagari ? p.name_hi : p.name_en,
      alternateName: devanagari ? p.name_en : p.name_hi,
      geo: { "@type": "GeoCoordinates", latitude: p.lat, longitude: p.lng },
      isAccessibleForFree: true,
      sameAs: p.sources[0]?.url,
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
