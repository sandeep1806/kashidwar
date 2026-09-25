import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import credits from "@/content/credits.json";
import { alternatesFor } from "@/lib/pages";
import { photoAlt } from "@/lib/photos";

export interface Credit {
  key: string;
  file: string;
  title: string;
  author: string;
  license: string;
  licenseUrl: string;
  source: string;
}

export async function generateMetadata({ params }: PageProps<"/[locale]/credits">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "credits" });
  return { title: t("title"), description: t("intro"), alternates: alternatesFor(locale, "/credits") };
}

/** Every photograph with author, licence and source (CC BY-SA requires author + licence link). */
export default async function CreditsPage({ params }: PageProps<"/[locale]/credits">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("credits");
  const list = credits as Credit[];
  return (
    <main id="content" className="container-kashi min-h-dvh pb-24 pt-32">
      <h1 className="text-h2 text-glow">{t("title")}</h1>
      <p className="mt-6 max-w-2xl text-lg text-kashi-ash/90">{t("intro")}</p>
      <p className="mt-3 max-w-2xl text-kashi-ash/80">{t("changes")}</p>
      <h2 className="mt-12 text-h3 text-kashi-white">{t("photos")}</h2>
      {list.length === 0 ? (
        <p className="mt-4 text-kashi-ash/70">{t("none")}</p>
      ) : (
        <ul className="mt-6 grid gap-4 md:grid-cols-2">
          {list.map((c) => (
            <li key={c.key} className="rounded-kashi border border-kashi-rudraksha/50 bg-kashi-indigo/40 p-4 text-sm">
              <p className="text-kashi-white">{photoAlt(c.key, locale) ?? c.title}</p>
              <p className="mt-1 text-kashi-ash/80">
                <a href={c.source} target="_blank" rel="noopener noreferrer" className="underline decoration-kashi-diya/40 underline-offset-2 hover:text-kashi-diya">{c.title}</a>
                {" — "}
                {c.author}
                {" · "}
                {c.licenseUrl ? (
                  <a href={c.licenseUrl} target="_blank" rel="noopener noreferrer license" className="underline decoration-kashi-diya/40 underline-offset-2 hover:text-kashi-diya">{c.license}</a>
                ) : (
                  c.license
                )}
              </p>
            </li>
          ))}
        </ul>
      )}
      <h2 className="mt-12 text-h3 text-kashi-white">{t("other")}</h2>
      <ul className="mt-4 space-y-2 text-kashi-ash/85">
        <li>{t("map")}</li>
        <li>{t("fonts")}</li>
        <li>{t("data")}</li>
      </ul>
      <p className="mt-12"><a href={`/${locale}`} className="text-kashi-diya underline decoration-kashi-diya/40 underline-offset-4">{t("back")}</a></p>
    </main>
  );
}
