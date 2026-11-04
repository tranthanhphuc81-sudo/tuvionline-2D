import { useEffect, useRef } from 'react';
import { adaptCount, particleAlpha, spawnParticle, stepParticle, type Particle } from './particles';
import type { ParticleSpec } from './scenes';
import s from './journey.module.css';

const COLOR = { smoke: '236,230,214', leaf: '200,150,70', firefly: '245,225,130', ripple: '180,200,225' } as const;
/** Giới hạn độ phân giải canvas để máy yếu không phải vẽ quá nhiều điểm ảnh. */
const MAX_DPR = 1.5;

function draw(ctx: CanvasRenderingContext2D, p: Particle) {
  const a = particleAlpha(p.life);
  ctx.beginPath();
  if (p.kind === 'ripple') {
    ctx.strokeStyle = `rgba(${COLOR.ripple},${a * 0.5})`;
    ctx.ellipse(p.x, p.y, 4 + p.life * 26, 1.5 + p.life * 7, 0, 0, Math.PI * 2);
    ctx.stroke();
    return;
  }
  ctx.fillStyle = `rgba(${COLOR[p.kind]},${a * (p.kind === 'smoke' ? 0.12 : 0.8)})`;
  ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
  ctx.fill();
}

/** Lớp hạt canvas 2D; tự giảm số hạt khi fps dưới 50. Máy không có canvas thì bỏ qua, không ảnh hưởng hành trình. */
export function ParticleLayer({ specs }: { specs: readonly ParticleSpec[] }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current, ctx = c?.getContext?.('2d');
    if (!c || !ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    const w = c.clientWidth || 360, h = c.clientHeight || 640;
    c.width = w * dpr; c.height = h * dpr;
    ctx.scale(dpr, dpr);
    let list: Particle[] = specs.flatMap((x) => Array.from({ length: x.count }, () => spawnParticle(x.kind, w, h)));
    let raf = 0, last = performance.now(), frames = 0, windowStart = last;
    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      frames++;
      if (now - windowStart >= 1000) {
        const fps = (frames * 1000) / (now - windowStart);
        list = list.slice(0, adaptCount(list.length, fps));
        frames = 0; windowStart = now;
      }
      ctx.clearRect(0, 0, w, h);
      list = list.map((p) => stepParticle(p, dt, w, h));
      list.forEach((p) => draw(ctx, p));
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [specs]);
  return <canvas ref={ref} className={s.particles} aria-hidden="true" />;
}
