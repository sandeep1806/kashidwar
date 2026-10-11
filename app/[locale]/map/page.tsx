import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import ListingShell from "@/components/pages/ListingShell";
import PageMap from "@/components/pages/PageMap";
import Icon from "@/components/ui/Icon";
import { LOCALES, type Locale } from "@/lib/i18n/locales";
import { HUBS, alternatesFor, km, pageUrl } from "@/lib/pages";
import { getPlacesProps } from "@/lib/sectionProps";

/**
 * /map — "Varanasi tourist map": every listed place on one map, plus a table
 * of straight-line distances from Godowlia and the station so the page answers
 * "ghats map with distance" before the map has loaded.
 */
export async function generateMetadata({ params }: PageProps<"/[locale]/map">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "map" });
  const meta = await getTranslations({ locale, namespace: "meta" });
  return { title: meta("mapTitle"), description: t("intro"), alternates: alternatesFor(locale, "/map") };
}

export default async function MapPage({ params }: PageProps<"/[locale]/map">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const loc = locale as Locale;
  const [{ items, labels }, t, tpage, tp, nav] = await Promise.all([
    getPlacesProps(loc),
    getTranslations({ locale, namespace: "map" }),
    getTranslations({ locale, namespace: "page" }),
    getTranslations({ locale, namespace: "places" }),
    getTranslations({ locale, namespace: "nav" }),
  ]);
  const other = await getTranslations({ locale: LOCALES[loc].script === "devanagari" ? "en" : "hi", namespace: "map" });
  const nf = new Intl.NumberFormat(LOCALES[loc].bcp47, { maximumFractionDigits: 1 });
  const godowlia = HUBS.find((h) => h.key === "hubGodowlia")!;
  const junction = HUBS.find((h) => h.key === "hubJunction")!;
  const dist = (d: number) => tpage("glance.km", { km: nf.format(Math.max(0.1, Math.round(d * 10) / 10)) });
  const rows = items.map((it) => ({ it, g: km(it.place, godowlia), j: km(it.place, junction) })).sort((a, b) => a.g - b.g);
  return (
    <ListingShell
      locale={loc}
      path="/map"
      sectionId="map"
      crumbs={[{ name: tpage("home"), href: `/${locale}` }, { name: tp("allTitle"), href: `/${locale}/places` }, { name: t("title"), href: `/${locale}/map` }]}
      title={t("title")}
      secondary={other("title")}
      intro={<p>{t("intro")}</p>}
      island={
        <PageMap
          tall
          title={tp("mapTitle")}
          loading={tp("mapLoading")}
          places={items.map((it) => it.place)}
          hrefs={Object.fromEntries(items.map((it) => [it.place.id, pageUrl(loc, "places", it.place.id)]))}
          clusterTemplate={tp.raw("cluster") as string}
        />
      }
    >
      <div className="container-kashi mt-12">
        <h2 className="text-h3 text-kashi-white">{t("distances")}</h2>
        <p className="mt-2 text-sm text-kashi-ash/70">{tpage("straightLine")}</p>
        <div className="mt-6 overflow-x-auto rounded-kashi border border-kashi-rudraksha/60 bg-kashi-indigo/40">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.16em] text-kashi-diya/85">
                <th scope="col" className="px-4 py-3">{nav("places")}</th>
                <th scope="col" className="px-4 py-3">{t("type")}</th>
                <th scope="col" className="whitespace-nowrap px-4 py-3 text-right"><Icon name="car" className="mr-1 inline h-4 w-4 align-[-3px]" />{tpage("hubGodowlia").split(",")[0]}</th>
                <th scope="col" className="whitespace-nowrap px-4 py-3 text-right"><Icon name="train" className="mr-1 inline h-4 w-4 align-[-3px]" />{tpage("hubJunction").split(" (")[0]}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-kashi-diya/10">
              {rows.map(({ it, g, j }) => (
                <tr key={it.place.id}>
                  <td className="px-4 py-2.5"><a href={pageUrl(loc, "places", it.place.id)} className="text-kashi-white underline decoration-kashi-diya/30 underline-offset-4 hover:text-kashi-marigold">{it.primaryName}</a></td>
                  <td className="px-4 py-2.5 text-kashi-ash/70">{labels.types[it.place.type]}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-kashi-ash/90">{dist(g)}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-kashi-ash/90">{dist(j)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ListingShell>
  );
}
