import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

/**
 * 404 for URLs that match no route at all — e.g. `/anything.txt`. The root
 * layout lives under `[locale]`, so without this file such requests had no
 * layout to render into and the Worker answered 500.
 * Bilingual (Hindi + English) because no locale is known here.
 */
export const metadata: Metadata = {
  title: "404 · काशी · Kashi",
  robots: { index: false },
};

export default function GlobalNotFound() {
  return (
    <html lang="hi">
      <body className="flex min-h-dvh items-center justify-center bg-kashi-night p-6 text-center text-kashi-ash">
        <main>
          <p className="text-sm tracking-[0.3em] text-kashi-diya">404</p>
          <h1 className="mt-3 text-4xl text-kashi-white">यह गली कहीं नहीं जाती</h1>
          <p className="mt-2 text-lg text-kashi-diya">This lane leads nowhere</p>
          <p className="mt-6">
            <Link href="/hi" className="underline decoration-kashi-diya/50 underline-offset-4">घाटों पर लौटें</Link>
            {" · "}
            <Link href="/en" className="underline decoration-kashi-diya/50 underline-offset-4">Back to the ghats</Link>
          </p>
        </main>
      </body>
    </html>
  );
}
