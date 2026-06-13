/**
 * Kashi Darshan Map — pan/zoom + legend filter. Vanilla, no deps (~3KB).
 * Re-initialised after Astro view transitions via astro:page-load.
 *
 * Pan: pointer drag (mouse + touch). Zoom: wheel, +/- buttons, two-finger pinch.
 * Everything is a CSS transform on the inner SVG wrapper, clamped so the art
 * stays in view. prefers-reduced-motion only affects ambient drift (CSS), not
 * usability — pan/zoom always work.
 */
function initKashiMap() {
  const frame = document.querySelector('[data-map-frame]');
  if (!frame || frame.dataset.bound === '1') return;
  frame.dataset.bound = '1';

  const stage = frame.querySelector('[data-map-stage]');
  let scale = 1,
    tx = 0,
    ty = 0;
  const MIN = 1,
    MAX = 4;

  const apply = () => {
    stage.style.transform = `translate(${tx.toFixed(1)}px, ${ty.toFixed(1)}px) scale(${scale.toFixed(3)})`;
  };
  const clamp = () => {
    // keep panning within bounds proportional to how far we've zoomed in
    const maxX = (frame.clientWidth * (scale - 1)) / 2;
    const maxY = (frame.clientHeight * (scale - 1)) / 2;
    tx = Math.max(-maxX, Math.min(maxX, tx));
    ty = Math.max(-maxY, Math.min(maxY, ty));
  };
  const zoomTo = (next) => {
    scale = Math.max(MIN, Math.min(MAX, next));
    if (scale === 1) {
      tx = 0;
      ty = 0;
    }
    clamp();
    apply();
    frame.classList.toggle('is-zoomed', scale > 1.01);
  };

  // --- drag to pan ---
  let dragging = false,
    sx = 0,
    sy = 0;
  frame.addEventListener('pointerdown', (e) => {
    if (e.target.closest('a, button')) return; // let hotspots/chips work
    dragging = true;
    sx = e.clientX - tx;
    sy = e.clientY - ty;
    frame.setPointerCapture(e.pointerId);
    frame.classList.add('is-grabbing');
  });
  frame.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    tx = e.clientX - sx;
    ty = e.clientY - sy;
    clamp();
    apply();
  });
  const endDrag = () => {
    dragging = false;
    frame.classList.remove('is-grabbing');
  };
  frame.addEventListener('pointerup', endDrag);
  frame.addEventListener('pointercancel', endDrag);

  // --- wheel zoom ---
  frame.addEventListener(
    'wheel',
    (e) => {
      if (!e.ctrlKey && Math.abs(e.deltaY) < 2) return;
      e.preventDefault();
      zoomTo(scale * (e.deltaY < 0 ? 1.12 : 0.89));
    },
    { passive: false }
  );

  // --- pinch zoom ---
  const pts = new Map();
  let pinchStart = 0,
    scaleStart = 1;
  frame.addEventListener('pointerdown', (e) => pts.set(e.pointerId, e));
  frame.addEventListener('pointermove', (e) => {
    if (!pts.has(e.pointerId)) return;
    pts.set(e.pointerId, e);
    if (pts.size === 2) {
      const [a, b] = [...pts.values()];
      const d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      if (!pinchStart) {
        pinchStart = d;
        scaleStart = scale;
      } else {
        zoomTo(scaleStart * (d / pinchStart));
      }
    }
  });
  const dropPt = (e) => {
    pts.delete(e.pointerId);
    if (pts.size < 2) pinchStart = 0;
  };
  frame.addEventListener('pointerup', dropPt);
  frame.addEventListener('pointercancel', dropPt);

  // --- zoom buttons ---
  frame.querySelector('[data-zoom-in]')?.addEventListener('click', () => zoomTo(scale * 1.3));
  frame.querySelector('[data-zoom-out]')?.addEventListener('click', () => zoomTo(scale / 1.3));
  frame.querySelector('[data-zoom-reset]')?.addEventListener('click', () => zoomTo(1));

  // --- legend category filter ---
  const chips = frame.parentElement.querySelectorAll('[data-cat-chip]');
  const setFilter = (cat) => {
    frame.setAttribute('data-filter', cat);
    chips.forEach((c) => {
      const on = c.dataset.catChip === cat;
      c.setAttribute('aria-pressed', String(on));
      c.classList.toggle('is-active', on);
    });
  };
  chips.forEach((c) => c.addEventListener('click', () => setFilter(c.dataset.catChip)));
}

document.addEventListener('astro:page-load', initKashiMap);
if (document.readyState !== 'loading') initKashiMap();
else document.addEventListener('DOMContentLoaded', initKashiMap, { once: true });
