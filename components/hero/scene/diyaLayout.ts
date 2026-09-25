/** Deterministic diya layout + the shared wave function (JS mirror of the GLSL). */
export interface DiyaSpec {
  x: number;
  z: number;
  seed: number;
  scale: number;
}

function mulberry32(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * `count` lamps across the whole river plus ~20% more clustered along the far
 * bank (checkpoint-1 feedback), so the distance reads as a lit shoreline.
 */
export function makeDiyas(count: number, seed = 108): DiyaSpec[] {
  const rnd = mulberry32(seed);
  const out: DiyaSpec[] = [];
  const place = (n: number, zMin: number, zMax: number, minGap: number) => {
    let guard = 0;
    let placed = 0;
    while (placed < n && guard++ < n * 60) {
      const x = (rnd() * 2 - 1) * 11.5;
      const z = zMin + rnd() * (zMax - zMin);
      // Keep a quieter lane down the middle so the title stays legible.
      if (Math.abs(x) < 2.4 && z > -4 && rnd() < 0.75) continue;
      if (out.some((d) => Math.hypot(d.x - x, d.z - z) < minGap)) continue;
      out.push({ x, z, seed: rnd() * 1000, scale: 0.75 + rnd() * 0.55 });
      placed++;
    }
  };
  place(count, -10, 3, 0.75);
  place(Math.round(count * 0.2), -11.5, -6.5, 0.55);
  return out;
}

/** Must match `wave()` in Water.tsx exactly. */
export function waveHeight(x: number, z: number, t: number): number {
  return (
    Math.sin(x * 0.8 + t * 0.9) * 0.06 +
    Math.sin(z * 1.3 - t * 0.7) * 0.05 +
    Math.sin((x + z) * 0.5 + t * 0.5) * 0.04
  );
}

export const WAVE_GLSL = /* glsl */ `
float wave(vec2 p, float t) {
  return sin(p.x * 0.8 + t * 0.9) * 0.06
       + sin(p.y * 1.3 - t * 0.7) * 0.05
       + sin((p.x + p.y) * 0.5 + t * 0.5) * 0.04;
}
`;
