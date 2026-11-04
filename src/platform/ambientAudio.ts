/* Âm thanh nền của hành trình bằng Web Audio. Bản GIỮ CHỖ: tiếng được tổng hợp từ nhiễu và sóng sin; danh sách file thu thật ở docs/ART-BRIEF.md.
   Phát trên kênh media nên không tự tắt theo chế độ im lặng: nơi gọi phải kiểm `soundAllowed()` trước (src/platform/device.ts). */
export type AmbientTrack = 'wind' | 'stream' | 'bird' | 'chime' | 'lamp';
export type AmbientMix = Partial<Record<AmbientTrack, number>>;

const FADE_S = 1.2;
const NOISE_TRACKS = { wind: { type: 'lowpass', hz: 420 }, stream: { type: 'bandpass', hz: 1300 } } as const;
/** Mỗi loại tiếng ngắt quãng: khoảng cách giữa hai tiếng (giây) và tần số cơ bản. */
const PULSES = { bird: { every: 2.2, hz: 2600, sweep: 900, dur: 0.14 }, chime: { every: 4.5, hz: 1760, sweep: 0, dur: 1.4 }, lamp: { every: 0.7, hz: 900, sweep: -400, dur: 0.03 } } as const;

export interface AmbientPlayer {
  /** Chuyển dần sang bộ tiếng mới; thiếu loại nào thì loại đó nhỏ dần về 0. */
  mix(m: AmbientMix): void;
  bell(): void;
  /** Gọi trong sự kiện chạm: trình duyệt chỉ cho phát sau thao tác của người dùng. */
  unlock(): void;
  suspend(): void;
  resume(): void;
  /** Nhỏ dần rồi đóng hẳn. */
  stop(): void;
}

function tone(ctx: AudioContext, dest: AudioNode, hz: number, sweep: number, dur: number, peak: number): void {
  const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain();
  o.frequency.setValueAtTime(hz, t);
  if (sweep) o.frequency.linearRampToValueAtTime(hz + sweep, t + dur);
  g.gain.setValueAtTime(peak, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(dest);
  o.start(t);
  o.stop(t + dur);
}

/** Trả null nếu máy không có Web Audio; hành trình vẫn chạy, chỉ không có tiếng. */
export function createAmbientPlayer(Ctx: typeof AudioContext | undefined = window.AudioContext): AmbientPlayer | null {
  if (!Ctx) return null;
  const ctx = new Ctx();
  const master = ctx.createGain();
  master.connect(ctx.destination);

  const noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const data = noise.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

  const gains = {} as Record<AmbientTrack, GainNode>;
  const sources: AudioScheduledSourceNode[] = [];
  for (const [id, f] of Object.entries(NOISE_TRACKS) as [keyof typeof NOISE_TRACKS, (typeof NOISE_TRACKS)[keyof typeof NOISE_TRACKS]][]) {
    const src = ctx.createBufferSource(), filter = ctx.createBiquadFilter(), g = ctx.createGain();
    src.buffer = noise; src.loop = true;
    filter.type = f.type; filter.frequency.value = f.hz;
    g.gain.value = 0;
    src.connect(filter).connect(g).connect(master);
    src.start();
    sources.push(src);
    gains[id] = g;
  }
  const timers = (Object.keys(PULSES) as (keyof typeof PULSES)[]).map((id) => {
    const p = PULSES[id], g = ctx.createGain();
    g.gain.value = 0;
    g.connect(master);
    gains[id] = g;
    return setInterval(() => { if (ctx.state === 'running' && g.gain.value > 0.01) tone(ctx, g, p.hz * (0.9 + Math.random() * 0.2), p.sweep, p.dur, 0.5); }, p.every * 1000);
  });

  return {
    mix(m) {
      const t = ctx.currentTime;
      for (const id of Object.keys(gains) as AmbientTrack[]) {
        gains[id].gain.cancelScheduledValues(t);
        gains[id].gain.setValueAtTime(gains[id].gain.value, t);
        gains[id].gain.linearRampToValueAtTime(m[id] ?? 0, t + FADE_S);
      }
    },
    bell() { tone(ctx, master, 523, 0, 3, 0.35); },
    unlock() { if (ctx.state === 'suspended') void ctx.resume(); },
    suspend() { void ctx.suspend(); },
    resume() { void ctx.resume(); },
    stop() {
      timers.forEach(clearInterval);
      const t = ctx.currentTime;
      master.gain.setValueAtTime(master.gain.value, t);
      master.gain.linearRampToValueAtTime(0, t + 0.4);
      setTimeout(() => { sources.forEach((s) => s.stop()); void ctx.close(); }, 450);
    },
  };
}
