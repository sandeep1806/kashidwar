"use client";

import { useEffect } from "react";
import { useGsap } from "@/components/motion/SmoothScroll";
import { getSoundOn } from "@/components/ui/SoundToggle";
import { ambient } from "@/lib/ambient";
import { prefersReducedMotion } from "@/lib/device";

/** Stands light from the centre outward. */
const ORDER = [3, 2, 4, 1, 5, 0, 6];
const EMBERS = 26;

/**
 * The Aarti finale's motion island. When the section arrives, the seven lamps
 * of <AartiLamps> ignite one by one from the centre, each from its lowest tier
 * up, while the warm glow behind them builds; then embers rise and the flames
 * flicker with noise-driven scale/opacity (GSAP, repeatRefresh) for as long as
 * the lamps are on screen. A bell cue plays on arrival if the visitor turned
 * sound on. If the section is already on screen when this loads, the lamps are
 * simply lit. Reduced motion: static lit lamps, no embers, no cue.
 * Renders nothing itself; the lamp markup is static, the embers are added here.
 */
export default function AartiFlames() {
  const g = useGsap();

  useEffect(() => {
    const el = document.getElementById("aarti-lamps");
    const section = el?.closest<HTMLElement>(".aarti");
    if (!g || !el || !section || prefersReducedMotion()) return;
    const { gsap } = g;

    // Embers: transform/opacity CSS animations with per-ember variables.
    const embers = document.createElement("div");
    embers.className = "aarti-embers";
    embers.setAttribute("aria-hidden", "true");
    for (let i = 0; i < EMBERS; i++) {
      const s = document.createElement("span");
      s.className = "ember";
      const v: Record<string, string> = {
        left: `${8 + Math.random() * 84}%`,
        "--s": `${2 + Math.random() * 3}px`,
        "--dur": `${4 + Math.random() * 4}s`,
        "--delay": `${-Math.random() * 8}s`,
        "--drift": `${(Math.random() - 0.5) * 80}px`,
        "--rise": `${220 + Math.random() * 260}px`,
      };
      for (const [k, val] of Object.entries(v)) s.style.setProperty(k, val);
      embers.appendChild(s);
    }
    // Beside the glow, inside the section's unhydrated markup, positioned against the section.
    const glow = section.querySelector(".aarti-glow");
    if (glow) glow.after(embers);
    else section.prepend(embers);

    const stands = Array.from(el.querySelectorAll<SVGSVGElement>(":scope > svg:not(.absolute)"));
    let flicker: gsap.core.Tween[] = [];
    let ignite: gsap.core.Timeline | null = null;
    // Not seen yet (below the fold): start dark and light them on arrival.
    const waiting = el.getBoundingClientRect().top > window.innerHeight * 0.88;

    const ctx = gsap.context(() => {
      flicker = gsap.utils.toArray<SVGElement>(".aarti-flame", el).map((f) =>
        gsap.to(f, {
          scaleY: () => 0.85 + Math.random() * 0.35,
          scaleX: () => 0.9 + Math.random() * 0.2,
          opacity: () => 0.75 + Math.random() * 0.25,
          x: () => (Math.random() - 0.5) * 1.5,
          duration: () => 0.12 + Math.random() * 0.2,
          ease: "sine.inOut",
          repeat: -1,
          repeatRefresh: true,
          transformOrigin: "50% 100%",
          paused: true,
        }),
      );
      if (!waiting) return;
      section.classList.add("is-igniting");
      gsap.set(el.querySelectorAll(".aarti-flame"), { scale: 0.2, opacity: 0, transformOrigin: "50% 100%" });
      gsap.set(el.querySelectorAll("ellipse"), { opacity: 0 });
      ignite = gsap.timeline({ paused: true, onComplete: () => flicker.forEach((t) => t.play()) });
      ORDER.forEach((i, n) => {
        const stand = stands[i];
        if (!stand) return;
        const at = n * 0.32;
        ignite!
          .to(stand.querySelectorAll(".aarti-flame"), { scale: 1, opacity: 1, duration: 0.55, ease: "back.out(2.2)", stagger: 0.09 }, at)
          .to(stand.querySelector("ellipse"), { opacity: 1, duration: 1.2, ease: "power2.out" }, at);
      });
    }, el);

    let arrived = !waiting;
    let rang = false;
    if (arrived) section.classList.add("embers-on");
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !arrived) {
          arrived = true;
          section.classList.add("is-lit");
          ignite?.play();
          window.setTimeout(() => section.classList.add("embers-on"), 1200);
        } else if (arrived) {
          section.classList.toggle("embers-on", e.isIntersecting);
          if (!ignite || ignite.progress() === 1) flicker.forEach((t) => (e.isIntersecting ? t.play() : t.pause()));
        }
        if (e.isIntersecting && !rang) {
          rang = true;
          if (getSoundOn()) ambient.bell();
        }
      },
      { rootMargin: "0px 0px -25% 0px" },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      ctx.revert();
      embers.remove();
      section.classList.remove("is-igniting", "is-lit", "embers-on");
    };
  }, [g]);

  return null;
}
