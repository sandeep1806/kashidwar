"use client";

import { useEffect, useRef } from "react";
import { isTouchDevice, prefersReducedMotion } from "@/lib/device";

interface Puff {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  r: number;
  seed: number;
}

/**
 * Desktop-only incense-smoke cursor trail (DESIGN.md → Cursor). A fixed
 * canvas below the UI; puffs are emitted as the pointer moves, drift upward
 * with a slow sway, blur out, and the loop sleeps when nothing is alive.
 * Never mounted on touch devices or under reduced motion.
 */
export default function IncenseCursor() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isTouchDevice() || prefersReducedMotion() || !window.matchMedia("(pointer: fine)").matches) return;
    const el = canvas.current;
    if (!el) return;
    const ctx = el.getContext("2d");
    if (!ctx) return;

    let dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      el.width = Math.floor(window.innerWidth * dpr);
      el.height = Math.floor(window.innerHeight * dpr);
      el.style.width = `${window.innerWidth}px`;
      el.style.height = `${window.innerHeight}px`;
    };
    resize();
    window.addEventListener("resize", resize);

    const puffs: Puff[] = [];
    let raf = 0;
    let last = 0;
    let lastX = -1;
    let lastY = -1;

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      ctx.clearRect(0, 0, el.width, el.height);
      for (let i = puffs.length - 1; i >= 0; i--) {
        const p = puffs[i];
        p.life += dt;
        if (p.life >= p.max) {
          puffs.splice(i, 1);
          continue;
        }
        const t = p.life / p.max;
        p.vy -= 18 * dt; // rises
        p.vx += Math.sin(now / 900 + p.seed) * 6 * dt; // sway
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        const r = (p.r + t * 26) * dpr;
        const alpha = 0.16 * (1 - t) * (t < 0.15 ? t / 0.15 : 1);
        const g = ctx.createRadialGradient(p.x * dpr, p.y * dpr, 0, p.x * dpr, p.y * dpr, r);
        g.addColorStop(0, `rgba(217, 212, 199, ${alpha})`);
        g.addColorStop(1, "rgba(217, 212, 199, 0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x * dpr, p.y * dpr, r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = puffs.length ? requestAnimationFrame(tick) : 0;
    };

    const onMove = (e: PointerEvent) => {
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      if (lastX >= 0 && dx * dx + dy * dy < 36) return; // emit every ~6px
      lastX = e.clientX;
      lastY = e.clientY;
      if (puffs.length > 60) puffs.shift();
      puffs.push({
        x: e.clientX + (Math.random() - 0.5) * 6,
        y: e.clientY + 4,
        vx: (Math.random() - 0.5) * 14,
        vy: -8 - Math.random() * 10,
        life: 0,
        max: 1.6 + Math.random() * 1.2,
        r: 4 + Math.random() * 4,
        seed: Math.random() * 10,
      });
      if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", resize);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return <canvas ref={canvas} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[70]" />;
}
