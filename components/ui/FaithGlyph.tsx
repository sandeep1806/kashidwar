import type { Faith } from "@/lib/contentTypes";

/**
 * Line glyphs, 1.5px stroke, gold (DESIGN.md → Iconography). One per faith,
 * equal in weight; the diya stands for shared heritage.
 */
const PATHS: Record<Faith, React.ReactNode> = {
  // trishul
  hindu: (
    <>
      <path d="M12 21V9" />
      <path d="M12 9c-3 0-5-2.5-5-6 2 1 3.5 3 5 3s3-2 5-3c0 3.5-2 6-5 6z" />
      <path d="M8.5 13h7" />
    </>
  ),
  // dharma chakra
  buddhist: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="2" />
      <path d="M12 4v6M12 14v6M4 12h6M14 12h6M6.3 6.3l4.3 4.3M13.4 13.4l4.3 4.3M6.3 17.7l4.3-4.3M13.4 10.6l4.3-4.3" />
    </>
  ),
  // lotus
  jain: (
    <>
      <path d="M12 20c-4 0-7-3-7-7 3 0 5 1.5 7 4 2-2.5 4-4 7-4 0 4-3 7-7 7z" />
      <path d="M12 17c-1.5-3-1.5-8 0-12 1.5 4 1.5 9 0 12z" />
      <path d="M7 10c1-3 3-5 5-6M17 10c-1-3-3-5-5-6" />
    </>
  ),
  // khanda
  sikh: (
    <>
      <circle cx="12" cy="12" r="5.5" />
      <path d="M12 3v18M9 20l1.5-3M15 20l-1.5-3" />
      <path d="M5 6c-1.5 3-1.5 9 0 12M19 6c1.5 3 1.5 9 0 12" />
    </>
  ),
  // crescent + star
  islamic: (
    <>
      <path d="M15 3.5a8.5 8.5 0 1 0 0 17 7 7 0 1 1 0-17z" />
      <path d="M17.5 9l.9 1.9 2.1.3-1.5 1.5.4 2.1-1.9-1-1.9 1 .4-2.1-1.5-1.5 2.1-.3z" />
    </>
  ),
  // cross
  christian: (
    <>
      <path d="M12 3v18M6 9h12" />
    </>
  ),
  // ektara
  bhakti: (
    <>
      <circle cx="12" cy="17" r="4" />
      <path d="M12 13V3M9.5 3h5M10 5.5h4" />
    </>
  ),
  // diya
  secular: (
    <>
      <path d="M12 4c2 3 3 4.5 3 6.5a3 3 0 0 1-6 0c0-2 1-3.5 3-6.5z" />
      <path d="M4 16c5 2 11 2 16 0-1 3-4 4.5-8 4.5S5 19 4 16z" />
    </>
  ),
};

/** Rendered once in the layout; every FaithGlyph then references a symbol instead of repeating paths. */
export function FaithGlyphSprite() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden="true" focusable="false">
      <defs>
        {(Object.keys(PATHS) as Faith[]).map((f) => (
          <symbol key={f} id={`glyph-${f}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            {PATHS[f]}
          </symbol>
        ))}
      </defs>
    </svg>
  );
}

export default function FaithGlyph({
  faith,
  className = "h-5 w-5",
}: {
  faith: Faith;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
      <use href={`#glyph-${faith}`} />
    </svg>
  );
}
