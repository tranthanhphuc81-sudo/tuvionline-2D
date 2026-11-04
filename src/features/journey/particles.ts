/* Hạt của hành trình: khói, lá, đom đóm, gợn nước. Phần tính là hàm thuần để test; vẽ canvas ở ParticleLayer.tsx. */
export type ParticleKind = 'smoke' | 'leaf' | 'firefly' | 'ripple';

export interface Particle { kind: ParticleKind; x: number; y: number; vx: number; vy: number; life: number; size: number }

/** Dưới 50 fps thì giảm 30% số hạt, tối thiểu còn 2. */
export const MIN_FPS = 50;
export function adaptCount(count: number, fps: number): number {
  return fps >= MIN_FPS ? count : Math.max(2, Math.floor(count * 0.7));
}

export function spawnParticle(kind: ParticleKind, w: number, h: number, r: () => number = Math.random): Particle {
  const base = { kind, life: r(), size: 2 + r() * 3 };
  switch (kind) {
    case 'smoke': return { ...base, x: w * (0.3 + r() * 0.4), y: h * (0.55 + r() * 0.1), vx: (r() - 0.5) * 6, vy: -8 - r() * 8, size: 6 + r() * 10 };
    case 'leaf': return { ...base, x: r() * w, y: r() * h * 0.5, vx: 8 + r() * 10, vy: 14 + r() * 14 };
    case 'firefly': return { ...base, x: r() * w, y: h * (0.35 + r() * 0.4), vx: (r() - 0.5) * 10, vy: (r() - 0.5) * 10 };
    case 'ripple': return { ...base, x: r() * w, y: h * (0.6 + r() * 0.3), vx: 0, vy: 0, size: 3 };
  }
}

const LIFE_SECONDS: Record<ParticleKind, number> = { smoke: 6, leaf: 8, firefly: 5, ripple: 3 };

/** Tiến một bước `dt` giây. Hết đời hoặc ra khỏi khung thì sinh lại. */
export function stepParticle(p: Particle, dt: number, w: number, h: number, r?: () => number): Particle {
  const life = p.life + dt / LIFE_SECONDS[p.kind];
  const x = p.x + p.vx * dt, y = p.y + p.vy * dt;
  if (life >= 1 || x < -20 || x > w + 20 || y < -20 || y > h + 20) return { ...spawnParticle(p.kind, w, h, r), life: 0 };
  return { ...p, x, y, life };
}

/** Độ đậm theo đời hạt: hiện dần, tan dần. */
export const particleAlpha = (life: number): number => Math.sin(Math.PI * Math.min(1, Math.max(0, life)));
