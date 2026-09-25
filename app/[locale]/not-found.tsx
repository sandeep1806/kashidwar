import { getTranslations } from "next-intl/server";
import DiyaGlyph from "@/components/ui/DiyaGlyph";

export default async function NotFound() {
  const t = await getTranslations("errors");
  return (
    <main id="content" className="grain relative flex min-h-dvh flex-col items-center justify-center bg-kashi-night text-center">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse 60% 45% at 50% 62%, color-mix(in oklab, var(--kashi-diya) 12%, transparent), transparent 70%)" }} />
      <div className="container-kashi relative z-10">
        <DiyaGlyph className="mx-auto h-16 w-16 drop-shadow-[0_0_18px_rgba(255,210,122,0.5)]" />
        <p className="mt-6 font-display-latin text-sm tracking-[0.3em] text-kashi-diya">404</p>
        <h1 className="mt-3 text-h2 text-glow">{t("notFoundTitle")}</h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-kashi-ash/90">{t("notFoundText")}</p>
        <a href="./" className="mt-10 inline-flex items-center gap-3 rounded-kashi bg-kashi-saffron px-7 py-3.5 text-kashi-night transition-colors hover:bg-kashi-marigold">
          {t("back")}
        </a>
      </div>
    </main>
  );
}
