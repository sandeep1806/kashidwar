/**
 * Kashi Dwar — all client JS in one tiny file (< 4KB, no libraries).
 * Reveal-on-scroll, Ganga flow line, saffron page sweep, ambient bell.
 * Re-initialised after Astro view transitions via astro:page-load.
 */
const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- reveal on scroll ---------- */
function initReveal() {
  const els = document.querySelectorAll('.reveal:not(.is-visible)');
  if (!els.length) return;
  if (REDUCED || !('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('is-visible'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
  );
  els.forEach((el) => io.observe(el));
}

/* ---------- golden Ganga flow line (scroll progress) ---------- */
let flowTicking = false;
function updateFlow() {
  const doc = document.documentElement;
  const max = doc.scrollHeight - doc.clientHeight;
  const p = max > 0 ? Math.min(1, doc.scrollTop / max) : 0;
  doc.style.setProperty('--scroll-progress', p.toFixed(4));
  flowTicking = false;
}

function initFlow() {
  if (REDUCED) return;
  updateFlow();
  window.addEventListener(
    'scroll',
    () => {
      if (!flowTicking) {
        flowTicking = true;
        requestAnimationFrame(updateFlow);
      }
    },
    { passive: true }
  );
}

/* ---------- hero parallax (sky / temples / water at different speeds) ---------- */
function initParallax() {
  if (REDUCED) return;
  const layers = document.querySelectorAll('[data-parallax]');
  if (!layers.length) return;
  let ticking = false;
  const apply = () => {
    const y = window.scrollY;
    if (y < window.innerHeight * 1.2) {
      layers.forEach((el) => {
        el.style.transform = `translate3d(0, ${(y * parseFloat(el.dataset.parallax)).toFixed(1)}px, 0)`;
      });
    }
    ticking = false;
  };
  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(apply);
      }
    },
    { passive: true }
  );
}

/* ---------- saffron sweep on view transitions ---------- */
function initSweep() {
  document.addEventListener('astro:before-swap', () => {
    document.documentElement.classList.add('is-transitioning');
  });
  document.addEventListener('astro:page-load', () => {
    setTimeout(() => document.documentElement.classList.remove('is-transitioning'), 650);
  });
}

/* ---------- ambient temple bell (user-initiated only, never autoplay) ---------- */
let audioCtx = null;
let bellOn = false;
let bellTimer = null;

function ringBell() {
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  // A temple bell ≈ a few inharmonic partials with long decay
  [392, 523.25, 784, 1046.5].forEach((freq, i) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq * (1 + i * 0.002);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.07 / (i + 1), now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 6 - i * 0.7);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 6);
  });
}

function initBell() {
  const btn = document.getElementById('bell-toggle');
  if (!btn) return;
  btn.addEventListener('click', () => {
    bellOn = !bellOn;
    btn.setAttribute('aria-pressed', String(bellOn));
    btn.classList.toggle('is-on', bellOn);
    if (bellOn) {
      if (!audioCtx) {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return;
        audioCtx = new Ctx();
      }
      if (audioCtx.state === 'suspended') audioCtx.resume();
      ringBell();
      bellTimer = setInterval(ringBell, 11000);
    } else {
      clearInterval(bellTimer);
    }
  });
}

/* ---------- boot (and re-boot after view transitions) ---------- */
function init() {
  initReveal();
  initFlow();
  initParallax();
  initBell();
}

initSweep();
document.addEventListener('astro:page-load', init);
// astro:page-load also fires on first load when ClientRouter is present,
// but fall back for safety:
if (document.readyState !== 'loading') init();
else document.addEventListener('DOMContentLoaded', init, { once: true });
