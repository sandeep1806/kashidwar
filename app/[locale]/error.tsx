"use client";

import { useEffect } from "react";
import DiyaGlyph from "@/components/ui/DiyaGlyph";

/**
 * Locale-level error boundary. It renders inside the locale layout, so fonts,
 * tokens and the sky are still there. Copy is passed through the HTML lang
 * hint only (client boundaries cannot await translations), so it stays
 * bilingual: Hindi + English.
 */
export default function LocaleError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <main id="content" className="grain relative flex min-h-dvh flex-col items-center justify-center bg-kashi-night text-center">
      <div className="container-kashi relative z-10">
        <DiyaGlyph className="mx-auto h-16 w-16 opacity-80" />
        <h1 className="mt-6 text-h2 text-glow">
          दीया बुझ गया
          <span className="bilingual-secondary">The lamp went out</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-kashi-ash/90">कुछ गड़बड़ हो गई। फिर से कोशिश करें। · Something went wrong. Please try again.</p>
        {error.digest && <p className="mt-2 text-xs text-kashi-ash/50">{error.digest}</p>}
        <button type="button" onClick={reset} className="mt-10 inline-flex items-center gap-3 rounded-kashi bg-kashi-saffron px-7 py-3.5 text-kashi-night transition-colors hover:bg-kashi-marigold">
          फिर से जलाएँ · Light it again
        </button>
      </div>
    </main>
  );
}
