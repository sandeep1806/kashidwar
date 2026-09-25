/**
 * Static hero art: pre-dawn sky, a hazy far bank, and a scatter of diyas on
 * dark water. Server-rendered SVG, so it paints with the first HTML and is the
 * LCP background on every device. On capable desktops the R3F canvas fades in
 * on top of it; on mobile / reduced-motion / low-end GPUs this is the hero.
 */
const DIYAS: { x: number; y: number; r: number; d: number }[] = [
  { x: 120, y: 585, r: 3.5, d: 0.2 },
  { x: 250, y: 650, r: 5.5, d: 1.1 },
  { x: 340, y: 575, r: 3, d: 0.6 },
  { x: 430, y: 735, r: 8, d: 1.9 },
  { x: 545, y: 610, r: 4.5, d: 0.9 },
  { x: 640, y: 845, r: 11, d: 2.3 },
  { x: 760, y: 700, r: 6, d: 2.9 },
  { x: 890, y: 572, r: 2.8, d: 1.5 },
  { x: 985, y: 800, r: 9.5, d: 0.4 },
  { x: 1085, y: 630, r: 5, d: 2.7 },
  { x: 1200, y: 720, r: 6.5, d: 1.3 },
  { x: 1320, y: 590, r: 3.5, d: 0.1 },
  { x: 1430, y: 675, r: 6, d: 2.0 },
  { x: 1545, y: 810, r: 9, d: 1.7 },
  { x: 40, y: 770, r: 7.5, d: 2.5 },
  { x: 205, y: 860, r: 10, d: 0.8 },
  { x: 1160, y: 870, r: 10.5, d: 2.2 },
  { x: 700, y: 595, r: 3.2, d: 1.0 },
  { x: 610, y: 566, r: 2.4, d: 0.5 },
  { x: 990, y: 568, r: 2.6, d: 1.4 },
  { x: 1500, y: 572, r: 2.8, d: 2.1 },
  { x: 215, y: 574, r: 2.5, d: 0.3 },
];

export default function HeroFallback() {
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
      <svg
        viewBox="0 0 1600 900"
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full"
      >
        <defs>
          <linearGradient id="hf-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0B0A14" />
            <stop offset="0.55" stopColor="#141328" />
            <stop offset="0.86" stopColor="#2A2350" />
            <stop offset="1" stopColor="#4A2E4E" />
          </linearGradient>
          <linearGradient id="hf-water" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#222A4C" />
            <stop offset="0.3" stopColor="#171B38" />
            <stop offset="1" stopColor="#0B0A14" />
          </linearGradient>
          <linearGradient id="hf-bank" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0B0A14" stopOpacity="0" />
            <stop offset="0.5" stopColor="#0B0A14" stopOpacity="0.55" />
            <stop offset="1" stopColor="#0B0A14" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="hf-glow">
            <stop offset="0" stopColor="#FFD27A" stopOpacity="0.95" />
            <stop offset="0.4" stopColor="#E0782A" stopOpacity="0.32" />
            <stop offset="1" stopColor="#E0782A" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="hf-horizon">
            <stop offset="0" stopColor="#8A4230" stopOpacity="0.6" />
            <stop offset="0.6" stopColor="#5A2E3E" stopOpacity="0.2" />
            <stop offset="1" stopColor="#5A2E3E" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="hf-reflect" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#F2A93B" stopOpacity="0.6" />
            <stop offset="1" stopColor="#F2A93B" stopOpacity="0" />
          </linearGradient>
        </defs>

        <rect width="1600" height="545" fill="url(#hf-sky)" />
        <rect y="545" width="1600" height="355" fill="url(#hf-water)" />
        {/* warm haze where sky meets river */}
        <ellipse cx="800" cy="545" rx="1000" ry="150" fill="url(#hf-horizon)" />
        {/* far bank as a soft band, not a hard line */}
        <rect y="533" width="1600" height="24" fill="url(#hf-bank)" />
        {/* reflected haze in the water */}
        <ellipse cx="800" cy="600" rx="900" ry="120" fill="url(#hf-horizon)" opacity="0.35" />

        {DIYAS.map((p, i) => (
          <g
            key={i}
            className={p.r >= 6 ? "hf-diya" : undefined}
            style={p.r >= 6 ? { animationDelay: `${p.d}s` } : undefined}
          >
            <rect
              x={p.x - p.r * 0.6}
              y={p.y + p.r}
              width={p.r * 1.2}
              height={p.r * 14}
              fill="url(#hf-reflect)"
              opacity="0.65"
            />
            <ellipse
              cx={p.x}
              cy={p.y}
              rx={p.r * 4}
              ry={p.r * 2.4}
              fill="url(#hf-glow)"
              opacity="0.6"
            />
            <ellipse
              cx={p.x}
              cy={p.y}
              rx={p.r * 0.65}
              ry={p.r * 0.85}
              fill="#FFE7B0"
            />
          </g>
        ))}
      </svg>
    </div>
  );
}
