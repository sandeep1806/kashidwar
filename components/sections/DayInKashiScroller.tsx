"use client";

import Image, { type StaticImageData } from "next/image";
import { useEffect, useRef } from "react";
import Reveal from "@/components/motion/Reveal";
import { useGsap } from "@/components/motion/SmoothScroll";
import DiyaGlyph from "@/components/ui/DiyaGlyph";
import LazyPhoto from "@/components/ui/LazyPhoto";
import { prefersReducedMotion } from "@/lib/device";
import { useMediaQuery, useReducedMotionPref } from "@/lib/hooks";
import type { PhotoData } from "@/lib/contentTypes";
import type { Script } from "@/lib/i18n/locales";

export interface DayScene {
  id: "dawn" | "noon" | "dusk";
  time: string;
  place: string;
  title: string;
  caption: string;
  /** Static SVG/AVIF backdrop from public/media */
  art: StaticImageData;
  photo: PhotoData | null;
}

const LAMP_MARKS = [0.02, 0.5, 0.97];

/** 0 → 1 as t goes from a to b (smoothstep). */
const ramp = (t: number, a: number, b: number) => {
  const x = Math.min(1, Math.max(0, (t - a) / (b - a)));
  return x * x * (3 - 2 * x);
};

/**
 * Pinned horizontal scrub through dawn → noon → dusk on wide screens with
 * motion allowed (DESIGN.md → Day-in-Kashi timeline). The sky tint shifts
 * with progress (dawn rose → noon amber → dusk indigo and vermilion, three
 * stacked layers crossfaded by opacity), backdrops drift against the track,
 * lamps ignite as progress passes each mark, and titles and captions reveal
 * inside the container animation.
 *
 * Phones and tablets get a lighter version of the same three scenes stacked
 * vertically: backdrops move with a slow parallax, each scene's sky warms in
 * and its lamp lights as it arrives. Reduced motion (and before GSAP loads):
 * the static stacked panels, lamps lit.
 */
export default function DayInKashiScroller({
  scenes,
  script,
  hint,
}: {
  scenes: DayScene[];
  script: Script;
  hint: string;
}) {
  const g = useGsap();
  const wide = useMediaQuery("(min-width: 1024px)");
  const reduced = useReducedMotionPref();
  const horizontal = wide && !reduced && !!g;
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!g || !horizontal || !el || prefersReducedMotion()) return;
    const splits: { revert: () => void }[] = [];

    const ctx = g.gsap.context(() => {
      const track = el.querySelector<HTMLElement>("[data-track]");
      if (!track) return;
      const panels = g.gsap.utils.toArray<HTMLElement>("[data-panel]", el);
      const lamps = g.gsap.utils.toArray<HTMLElement>("[data-lamp]", el);
      const bar = el.querySelector<HTMLElement>("[data-progress]");
      const [skyDawn, skyNoon, skyDusk] = ["dawn", "noon", "dusk"].map((id) => el.querySelector<HTMLElement>(`[data-sky="${id}"]`));
      const paintSky = (p: number) => {
        if (skyDawn) skyDawn.style.opacity = String(1 - ramp(p, 0.1, 0.45));
        if (skyNoon) skyNoon.style.opacity = String(ramp(p, 0.1, 0.45) * (1 - ramp(p, 0.55, 0.9)));
        if (skyDusk) skyDusk.style.opacity = String(ramp(p, 0.55, 0.9));
      };
      paintSky(0);
      const distance = () => track.scrollWidth - window.innerWidth;

      const tween = g.gsap.to(track, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: el,
          pin: true,
          scrub: 1,
          start: "top top",
          end: () => "+=" + distance(),
          invalidateOnRefresh: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            lamps.forEach((lamp, i) =>
              lamp.classList.toggle("is-lit", self.progress >= LAMP_MARKS[i]),
            );
            if (bar) bar.style.transform = `scaleX(${self.progress})`;
            paintSky(self.progress);
          },
        },
      });

      // Backdrops drift against the track (parallax), transform only.
      panels.forEach((panel) => {
        const back = panel.querySelector<HTMLElement>("[data-backdrop]");
        if (!back) return;
        g.gsap.fromTo(back, { xPercent: -5 }, {
          xPercent: 5,
          ease: "none",
          scrollTrigger: { trigger: panel, containerAnimation: tween, start: "left right", end: "right left", scrub: true },
        });
      });

      panels.forEach((panel) => {
        const title = panel.querySelector<HTMLElement>("[data-title]");
        const caption = panel.querySelector<HTMLElement>("[data-caption]");
        const meta = panel.querySelector<HTMLElement>("[data-meta]");
        const byChar = script === "latin";
        if (title) {
          splits.push(
            g.SplitText.create(title, {
              type: byChar ? "chars,words" : "words",
              autoSplit: true,
              aria: "none", // the sr-only twin carries the accessible text
              onSplit: (self) =>
                g.gsap.from(byChar ? self.chars : self.words, {
                  yPercent: 70,
                  opacity: 0,
                  filter: "blur(6px)",
                  stagger: byChar ? 0.02 : 0.06,
                  duration: 0.8,
                  ease: "power3.out",
                  scrollTrigger: {
                    trigger: panel,
                    containerAnimation: tween,
                    start: "left 70%",
                    toggleActions: "play none none reverse",
                  },
                }),
            }),
          );
        }
        g.gsap.from([meta, caption].filter(Boolean), {
          y: 30,
          opacity: 0,
          duration: 0.9,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: panel,
            containerAnimation: tween,
            start: "left 60%",
            toggleActions: "play none none reverse",
          },
        });
      });
    }, el);

    return () => {
      splits.forEach((s) => s.revert());
      ctx.revert();
    };
  }, [g, horizontal, script]);

  // Phones and tablets: parallax backdrops, sky warming in, lamps lighting.
  // Created when the section comes within a viewport, so ScrollTrigger never
  // measures it while content-visibility is still skipping it.
  useEffect(() => {
    const el = root.current;
    if (!g || horizontal || !el || prefersReducedMotion()) return;
    let ctx: gsap.Context | null = null;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        ctx = g.gsap.context(() => {
          g.gsap.utils.toArray<HTMLElement>("[data-scene]", el).forEach((scene) => {
            const back = scene.querySelector("[data-backdrop]");
            if (back) {
              g.gsap.fromTo(back, { yPercent: -6 }, {
                yPercent: 6,
                ease: "none",
                scrollTrigger: { trigger: scene, start: "top bottom", end: "bottom top", scrub: true },
              });
            }
            const sky = scene.querySelector("[data-sky]");
            if (sky) {
              g.gsap.fromTo(sky, { opacity: 0 }, {
                opacity: 1,
                ease: "none",
                scrollTrigger: { trigger: scene, start: "top 95%", end: "top 35%", scrub: true },
              });
            }
            const lamp = scene.querySelector("[data-lamp]");
            if (lamp) g.ScrollTrigger.create({ trigger: scene, start: "top 60%", end: "max", toggleClass: { targets: lamp, className: "is-lit" } });
          });
        }, el);
      },
      { rootMargin: "100% 0px" },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      ctx?.revert();
    };
  }, [g, horizontal]);

  if (!horizontal) {
    return (
      <div ref={root} className="flex flex-col">
        {scenes.map((scene, i) => (
          <article
            key={scene.id}
            data-scene
            className={`cv-auto day-scene day-scene-${scene.id} relative isolate flex min-h-[70vh] items-end overflow-hidden`}
          >
            <SceneBackdrop scene={scene} layout="stacked" />
            <div data-sky className={`day-sky day-sky-${scene.id}`} aria-hidden="true" />
            <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-kashi-night/90 via-kashi-night/40 to-transparent" />
            <Reveal className="container-kashi relative pb-12 pt-24" delay={0.1 * i}>
              <SceneCopy scene={scene} lit />
            </Reveal>
          </article>
        ))}
      </div>
    );
  }

  return (
    <div ref={root} className="relative h-dvh overflow-hidden">
      <div data-track className="flex h-full will-change-transform">
        {scenes.map((scene, i) => (
          <article
            key={scene.id}
            data-panel
            className={`day-scene day-scene-${scene.id} relative isolate flex h-full w-screen shrink-0 items-end overflow-hidden`}
          >
            <SceneBackdrop scene={scene} layout="pinned" />
            <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-kashi-night/90 via-kashi-night/40 to-transparent" />
            <div className={`container-kashi relative pb-20 ${i % 2 ? "text-right" : ""}`}>
              <SceneCopy scene={scene} split />
            </div>
          </article>
        ))}
      </div>

      {/* The sky over the whole pinned view: three tints crossfaded by progress */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div data-sky="dawn" className="day-sky day-sky-dawn" />
        <div data-sky="noon" className="day-sky day-sky-noon opacity-0" />
        <div data-sky="dusk" className="day-sky day-sky-dusk opacity-0" />
      </div>

      {/* Lamps ignite as the day advances (top edge, clear of the captions) */}
      <div className="pointer-events-none absolute inset-x-0 top-6 flex flex-col items-center gap-3">
        <div className="flex items-end gap-10">
          {scenes.map((scene) => (
            <div key={scene.id} data-lamp className="lamp relative flex flex-col items-center gap-2">
              <span aria-hidden="true" className="lamp-burst" />
              <DiyaGlyph className="h-9 w-9" flameClassName="lamp-flame" />
              <span className="font-display-latin text-xs tracking-[0.2em] text-kashi-diya/80">
                {scene.time}
              </span>
            </div>
          ))}
        </div>
        <div className="h-px w-64 overflow-hidden bg-kashi-ash/15">
          <div data-progress className="h-full w-full origin-left scale-x-0 bg-kashi-diya/80" />
        </div>
        <p className="text-xs text-kashi-ash/60">{hint}</p>
      </div>
    </div>
  );
}

function SceneCopy({
  scene,
  split = false,
  lit = false,
}: {
  scene: DayScene;
  split?: boolean;
  lit?: boolean;
}) {
  return (
    <div className="max-w-xl [.text-right_&]:ml-auto">
      <p data-meta className="mb-3 flex items-center gap-3 text-sm text-kashi-diya [.text-right_&]:justify-end">
        <span className="font-display-latin tracking-[0.2em]">{scene.time}</span>
        <span aria-hidden="true" className="h-px w-8 bg-kashi-diya/60" />
        <span>{scene.place}</span>
        {lit && (
          // Lit in the markup (reduced motion, no JS); the phone parallax
          // effect relights it as the scene arrives.
          <span data-lamp className="lamp is-lit relative ml-1 inline-flex">
            <span aria-hidden="true" className="lamp-burst" />
            <DiyaGlyph className="h-5 w-5" flameClassName="lamp-flame" />
          </span>
        )}
      </p>
      <h3 className="text-h2 leading-tight text-glow">
        {split ? (
          <>
            <span className="sr-only">{scene.title}</span>
            <span data-title aria-hidden="true">
              {scene.title}
            </span>
          </>
        ) : (
          scene.title
        )}
      </h3>
      <p data-caption className="mt-5 text-lg text-kashi-ash/90">
        {scene.caption}
      </p>
    </div>
  );
}

/**
 * The scene's photograph (or drawn fallback) in an oversized frame, so the
 * parallax never shows an edge: 110% wide on the pinned track, 112% tall when
 * stacked. `sizes` accounts for object-fit: cover in that frame.
 */
function SceneBackdrop({ scene, layout }: { scene: DayScene; layout: "pinned" | "stacked" }) {
  const frame = layout === "pinned" ? "absolute inset-y-0 -left-[5%] -right-[5%] -z-10" : "absolute inset-x-0 -top-[6%] -bottom-[6%] -z-10";
  const r = scene.photo ? scene.photo.width / scene.photo.height : 1.5;
  const sizes = layout === "pinned" ? `max(110vw, ${Math.round(r * 100)}vh)` : `max(100vw, ${Math.round(r * 84)}vh)`;
  return (
    <div data-backdrop className={frame}>
      {scene.photo ? (
        <LazyPhoto photo={scene.photo} sizes={sizes} photoClassName="ken-burns" />
      ) : (
        <Image src={scene.art} alt="" fill sizes="100vw" unoptimized className="object-cover" />
      )}
    </div>
  );
}
