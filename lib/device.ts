/**
 * Capability detection for the hero and motion system.
 * Everything here is client-only and returns the conservative answer on the server.
 */
export type HeroMode = "full" | "fallback";

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function isTouchDevice(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(pointer: coarse)").matches;
}

/**
 * Decide whether to mount the R3F hero. Anything doubtful gets the static
 * fallback: reduced motion, touch/narrow screens, ≤4 cores, ≤4 GB memory,
 * data-saver, no WebGL2, or a software renderer.
 */
export function detectHeroMode(): HeroMode {
  if (typeof window === "undefined") return "fallback";
  // QA override: ?hero=full | ?hero=fallback
  const forced = new URLSearchParams(window.location.search).get("hero");
  if (forced === "full" || forced === "fallback") return forced;
  if (prefersReducedMotion()) return "fallback";
  if (isTouchDevice() || window.innerWidth < 768) return "fallback";

  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean };
  };
  if ((nav.hardwareConcurrency ?? 8) <= 4) return "fallback";
  if ((nav.deviceMemory ?? 8) <= 4) return "fallback";
  if (nav.connection?.saveData) return "fallback";

  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2");
    if (!gl) return "fallback";
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = info
      ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL))
      : "";
    if (/swiftshader|llvmpipe|software|microsoft basic/i.test(renderer)) {
      return "fallback";
    }
    gl.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    return "fallback";
  }
  return "full";
}
