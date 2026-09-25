"use client";

import Image, { type StaticImageData } from "next/image";
import { useEffect, useRef } from "react";
import Reveal from "@/components/motion/Reveal";
import { useGsap } from "@/components/motion/SmoothScroll";
import DiyaGlyph from "@/components/ui/DiyaGlyph";
import { prefersReducedMotion } from "@/lib/device";
import { useMediaQuery, useReducedMotionPref } from "@/lib/hooks";
import type { Script } from "@/lib/i18n/locales";

export interface DayScene {
  id: "dawn" | "noon" | "dusk";
  time: string;
  place: string;
  title: string;
  caption: string;
  /** Static SVG/AVIF backdrop from public/media */
  art: StaticImageData;
}

const LAMP_MARKS = [0.02, 0.5, 0.97];

/**
 * Pinned horizontal scrub through dawn → noon → dusk on wide screens with
 * motion allowed. Lamps under the track ignite as progress passes each mark;
 * scene titles reveal with SplitText inside the container animation.
 * Everything else (mobile, reduced motion, before GSAP loads) gets the same
 * three scenes stacked vertically.
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
          },
        },
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

  if (!horizontal) {
    return (
      <div ref={root} className="flex flex-col">
        {scenes.map((scene, i) => (
          <article
            key={scene.id}
            className="cv-auto relative isolate flex min-h-[80vh] items-end overflow-hidden"
          >
            <Image src={scene.art} alt="" fill sizes="100vw" unoptimized className="-z-10 object-cover" />
            <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-kashi-night/90 via-kashi-night/40 to-transparent" />
            <Reveal className="container-kashi relative pb-16 pt-32" delay={0.1 * i}>
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
            className="relative isolate flex h-full w-screen shrink-0 items-end overflow-hidden"
          >
            <Image src={scene.art} alt="" fill sizes="100vw" unoptimized className="-z-10 object-cover" />
            <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-kashi-night/90 via-kashi-night/40 to-transparent" />
            <div className={`container-kashi relative pb-20 ${i % 2 ? "text-right" : ""}`}>
              <SceneCopy scene={scene} split />
            </div>
          </article>
        ))}
      </div>

      {/* Lamps ignite as the day advances (top edge, clear of the captions) */}
      <div className="pointer-events-none absolute inset-x-0 top-6 flex flex-col items-center gap-3">
        <div className="flex items-end gap-10">
          {scenes.map((scene) => (
            <div key={scene.id} data-lamp className="lamp flex flex-col items-center gap-2">
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
        {lit && <DiyaGlyph className="ml-1 h-5 w-5" />}
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
