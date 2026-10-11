import type { ReactNode } from "react";

/**
 * Line icons for the visual blocks (fact strips, glance tiles, distance cards,
 * gallery): 24×24, 1.5 px stroke, `currentColor` (DESIGN.md → Iconography:
 * gold as glow, so the colour comes from the parent). Rendered once as a
 * sprite in the layout, like FaithGlyphSprite; each <Icon> references a symbol.
 */
export type IconName =
  | "clock" | "calendar" | "ticket" | "hourglass" | "people" | "camera" | "camera-off" | "dress"
  | "walk" | "train" | "plane" | "car" | "pin" | "sunrise" | "leaf" | "boat" | "info" | "tip"
  | "chevron" | "arrow-left" | "arrow-right" | "expand" | "close" | "photos" | "shield";

const PATHS: Record<IconName, ReactNode> = {
  clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
  calendar: <><rect x="3.5" y="5" width="17" height="15" rx="2" /><path d="M3.5 10h17M8 3v4M16 3v4" /></>,
  ticket: <><path d="M4 8.5a2.5 2.5 0 0 0 0 5V17a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3.5a2.5 2.5 0 0 1 0-5V7a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1z" /><path d="M14 6v12" strokeDasharray="2 2.2" /></>,
  hourglass: <><path d="M7 3.5h10M7 20.5h10M8 3.5v3.2c0 2.3 4 3.8 4 5.3s-4 3-4 5.3v3.2M16 3.5v3.2c0 2.3-4 3.8-4 5.3s4 3 4 5.3v3.2" /></>,
  people: <><circle cx="9" cy="8" r="3" /><path d="M3.5 19c0-3 2.5-5.2 5.5-5.2s5.5 2.2 5.5 5.2" /><circle cx="16.5" cy="9" r="2.4" /><path d="M16.2 13.6c2.5.2 4.3 2.1 4.3 4.6" /></>,
  camera: <><path d="M4 8.5h3.2l1.3-2.5h7l1.3 2.5H20a1 1 0 0 1 1 1V18a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5a1 1 0 0 1 1-1z" /><circle cx="12" cy="13.5" r="3.2" /></>,
  "camera-off": <><path d="M4 8.5h3.2l1.3-2.5h7l1.3 2.5H20a1 1 0 0 1 1 1V18a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5a1 1 0 0 1 1-1z" /><circle cx="12" cy="13.5" r="3.2" /><path d="M4 4l16 16" /></>,
  dress: <><path d="M9 3.5c0 1.7 1.3 3 3 3s3-1.3 3-3M9 3.5L5 6l1.5 3.5 2-1V20.5h7V8.5l2 1L19 6l-4-2.5" /></>,
  walk: <><circle cx="13" cy="4.5" r="1.8" /><path d="M10.5 21l1.8-6.5-2.3-1.5v-3.5l3-1.5 2.5 3 2.5 1M10 13.5l-2.2 2-1.3 5.5M15 15l1.5 2 1.5 4" /></>,
  train: <><rect x="5" y="3.5" width="14" height="14" rx="3" /><path d="M5 10h14M9 17.5l-2 3M15 17.5l2 3M9.5 14h.01M14.5 14h.01" /></>,
  plane: <><path d="M10.5 13.5L4 11.3V9.8l6.5.9 4.6-5.4c.7-.8 1.9-.9 2.6-.2.7.7.6 1.9-.2 2.6L12.1 12l1 6.5-1.5 1.5-2.2-6-3 1.3-1.2 2.7L4 18.5l1.3-3.2 5.2-1.8z" /></>,
  car: <><path d="M5 13.5l1.6-4.3A2 2 0 0 1 8.5 8h7a2 2 0 0 1 1.9 1.2L19 13.5M4 13.5h16v4.5a1 1 0 0 1-1 1h-1.5a1 1 0 0 1-1-1V17h-9v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" /><path d="M7.5 15.5h.01M16.5 15.5h.01" /></>,
  pin: <><path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z" /><circle cx="12" cy="10" r="2.3" /></>,
  sunrise: <><path d="M4 17.5h16M6.5 14a5.5 5.5 0 0 1 11 0M12 3.5v3M4.5 9l2 2M19.5 9l-2 2M9.5 20.5h5" /></>,
  leaf: <><path d="M5 19c0-8 5-13 14-13-1 9-5 13-12.5 13H5z" /><path d="M5 19c3-4 6-7 10-9" /></>,
  boat: <><path d="M4 15.5l1.5 3.5h13l1.5-3.5zM6 15.5V9a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6.5M12 8V3.5l4 3" /></>,
  info: <><circle cx="12" cy="12" r="8.5" /><path d="M12 11v5M12 8h.01" /></>,
  tip: <><path d="M9 18.5h6M10 21h4M8 12.5a4.5 4.5 0 1 1 8 0c0 1.6-1 2.3-1.5 3.5h-5C9 14.8 8 14.1 8 12.5z" /><path d="M12 3.5V5M5 7l1 1M19 7l-1 1" /></>,
  chevron: <path d="M9 6l6 6-6 6" />,
  "arrow-left": <path d="M19 12H5M11 6l-6 6 6 6" />,
  "arrow-right": <path d="M5 12h14M13 6l6 6-6 6" />,
  expand: <path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  photos: <><rect x="3.5" y="6.5" width="14" height="12" rx="1.5" /><path d="M7.5 3.5h13v12M3.5 15l4-3.5 3 2.5 3.5-3.5 3.5 3.5" /></>,
  shield: <><path d="M12 3.5l7 3v5.5c0 4.5-3 7.5-7 8.5-4-1-7-4-7-8.5V6.5z" /><path d="M9 12l2 2 4-4" /></>,
};

/** Rendered once in the layout. */
export function IconSprite() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden="true" focusable="false">
      <defs>
        {(Object.keys(PATHS) as IconName[]).map((n) => (
          <symbol key={n} id={`icon-${n}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            {PATHS[n]}
          </symbol>
        ))}
      </defs>
    </svg>
  );
}

export default function Icon({ name, className = "h-5 w-5" }: { name: IconName; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
      <use href={`#icon-${name}`} />
    </svg>
  );
}
