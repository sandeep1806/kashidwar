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

/* ---------- ambient temple ghanta (user-initiated only, never autoplay) ----------
   Synthesized bronze bell: a low "hum" note an octave under the strike,
   inharmonic upper partials (bell ratios), each as a slightly detuned pair
   so the tail shimmers/beats like real bell metal, plus a brief strike
   transient and a generated-impulse reverb for temple air. No audio file. */
let audioCtx = null;
let bellBus = null;
let bellOn = false;
let bellTimer = null;

// [ratio to strike note, gain, decay seconds] — classic bell partial ratios
const GHANTA_PARTIALS = [
  [0.5, 0.55, 9.5], // hum — the long "om" that carries
  [1.0, 1.0, 7.0], // prime (strike note)
  [1.183, 0.42, 5.0], // tierce
  [1.506, 0.28, 4.2], // quint
  [2.0, 0.32, 3.2], // nominal
  [2.514, 0.13, 2.4],
  [2.662, 0.11, 2.2],
  [3.011, 0.06, 1.6],
  [4.166, 0.035, 1.1],
];

function buildBellBus() {
  // dry + soft generated reverb (no IR file: shaped noise burst)
  const out = audioCtx.createGain();
  out.gain.value = 1;
  const seconds = 2.6;
  const len = Math.floor(audioCtx.sampleRate * seconds);
  const ir = audioCtx.createBuffer(2, len, audioCtx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = ir.getChannelData(ch);
    for (let i = 0; i < len; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2);
    }
  }
  const reverb = audioCtx.createConvolver();
  reverb.buffer = ir;
  const wet = audioCtx.createGain();
  wet.gain.value = 0.35;
  out.connect(audioCtx.destination);
  out.connect(reverb);
  reverb.connect(wet);
  wet.connect(audioCtx.destination);
  return out;
}

function ringBell(velocity = 1) {
  if (!audioCtx || !bellBus) return;
  const now = audioCtx.currentTime;
  const f0 = 232; // deep mandir ghanta, not a hand-bell

  GHANTA_PARTIALS.forEach(([ratio, gain, decay]) => {
    [-0.7, 0.7].forEach((detune) => {
      const osc = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.value = f0 * ratio + detune;
      const peak = (0.085 * gain * velocity) / 2;
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(peak, now + 0.006);
      g.gain.exponentialRampToValueAtTime(0.00006, now + decay);
      osc.connect(g).connect(bellBus);
      osc.start(now);
      osc.stop(now + decay + 0.1);
    });
  });

  // strike transient: 45ms of bandpassed noise = the clapper's "tnn"
  const nLen = Math.floor(audioCtx.sampleRate * 0.045);
  const noise = audioCtx.createBuffer(1, nLen, audioCtx.sampleRate);
  const nd = noise.getChannelData(0);
  for (let i = 0; i < nLen; i++) nd[i] = (Math.random() * 2 - 1) * (1 - i / nLen);
  const src = audioCtx.createBufferSource();
  src.buffer = noise;
  const bp = audioCtx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = f0 * 2.6;
  bp.Q.value = 1.1;
  const ng = audioCtx.createGain();
  ng.gain.setValueAtTime(0.12 * velocity, now);
  ng.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
  src.connect(bp).connect(ng).connect(bellBus);
  src.start(now);
}

function scheduleNextRing() {
  if (!bellOn) return;
  // unhurried, slightly irregular — like a far courtyard, not an alarm
  const delay = 12000 + Math.random() * 8000;
  bellTimer = setTimeout(() => {
    ringBell(0.75 + Math.random() * 0.25);
    scheduleNextRing();
  }, delay);
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
        bellBus = buildBellBus();
      }
      if (audioCtx.state === 'suspended') audioCtx.resume();
      ringBell(1);
      scheduleNextRing();
    } else {
      clearTimeout(bellTimer);
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
