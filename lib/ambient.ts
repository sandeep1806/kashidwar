/**
 * Ambient sound layer, synthesised with the Web Audio API (no audio files):
 *   - river: brown noise through a slow-moving low-pass filter
 *   - distant temple bells: FM-ish struck tones at random intervals
 *   - faint conch: a slow low sweep every minute or so
 * Master gain never exceeds -18 dBFS (≈ 0.126). Starts only from a user
 * gesture (the sound toggle), fades in over 2 s, fades out on stop.
 */
const MAX_GAIN = 0.126; // -18 dB

class Ambient {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private timers: number[] = [];
  private running = false;

  get isRunning() {
    return this.running;
  }

  async start(): Promise<void> {
    if (this.running) return;
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    this.ctx ??= new Ctx();
    if (this.ctx.state === "suspended") await this.ctx.resume();
    const ctx = this.ctx;

    this.master = ctx.createGain();
    this.master.gain.setValueAtTime(0.0001, ctx.currentTime);
    this.master.gain.exponentialRampToValueAtTime(MAX_GAIN, ctx.currentTime + 2);
    this.master.connect(ctx.destination);

    this.river(ctx, this.master);
    this.running = true;
    this.scheduleBell();
    this.scheduleConch();
  }

  stop(): void {
    if (!this.running || !this.ctx || !this.master) return;
    const ctx = this.ctx;
    const master = this.master;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
    master.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);
    this.timers.forEach((t) => window.clearTimeout(t));
    this.timers = [];
    window.setTimeout(() => {
      master.disconnect();
    }, 1400);
    this.running = false;
  }

  /** One clear bell, used as the aarti cue. Safe to call when stopped (no-op). */
  bell(): void {
    if (!this.running || !this.ctx || !this.master) return;
    this.strike(this.ctx, this.master, 0.9);
  }

  private river(ctx: AudioContext, out: AudioNode) {
    const len = ctx.sampleRate * 4;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.5;
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 420;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.07;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 180;
    lfo.connect(lfoGain).connect(lp.frequency);
    const g = ctx.createGain();
    g.gain.value = 0.55;
    src.connect(lp).connect(g).connect(out);
    src.start();
    lfo.start();
  }

  private strike(ctx: AudioContext, out: AudioNode, level: number) {
    const t = ctx.currentTime;
    const base = 520 + Math.random() * 260;
    const partials = [1, 2.01, 2.74, 3.99];
    partials.forEach((ratio, i) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = base * ratio;
      const g = ctx.createGain();
      const peak = (level * 0.35) / (i + 1);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(peak, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 2.8 - i * 0.4);
      osc.connect(g).connect(out);
      osc.start(t);
      osc.stop(t + 3);
    });
  }

  private conch(ctx: AudioContext, out: AudioNode) {
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(170, t);
    osc.frequency.linearRampToValueAtTime(215, t + 2.5);
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 900;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.18, t + 1.2);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 4.5);
    osc.connect(lp).connect(g).connect(out);
    osc.start(t);
    osc.stop(t + 4.6);
  }

  private scheduleBell() {
    const delay = 6000 + Math.random() * 12000;
    this.timers.push(
      window.setTimeout(() => {
        if (!this.running || !this.ctx || !this.master) return;
        this.strike(this.ctx, this.master, 0.4 + Math.random() * 0.4);
        this.scheduleBell();
      }, delay),
    );
  }

  private scheduleConch() {
    const delay = 40000 + Math.random() * 50000;
    this.timers.push(
      window.setTimeout(() => {
        if (!this.running || !this.ctx || !this.master) return;
        this.conch(this.ctx, this.master);
        this.scheduleConch();
      }, delay),
    );
  }
}

export const ambient = new Ambient();
export const SOUND_KEY = "kashi:sound";
