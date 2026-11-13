import { useEffect, useMemo, useRef } from 'react';
import type { Ambience } from './ambience';
import { ParticleLayer } from './ParticleLayer';
import { activeLayers, activeParticles, type Scene } from './scenes';
import s from './journey.module.css';

/** Hiệu ứng "bước tới": lớp gần phóng to và trôi nhanh hơn lớp xa. Chỉ đổi transform nên không gây vẽ lại bố cục. */
export function layerTransform(depth: number, progress: number): string {
  return `translate3d(0,${(-36 * depth * progress).toFixed(2)}px,0) scale(${(1 + 0.14 * depth * progress).toFixed(4)})`;
}

/** Vẽ một trạm trong `durationMs`. Ghi thẳng vào style qua requestAnimationFrame, không render lại React mỗi khung hình. */
export function SceneView({ scene, ambience, durationMs, animate, hideLayers = false }: { scene: Scene; ambience: Ambience; durationMs: number; animate: boolean; /** video nền đang phát: thôi vẽ lớp tranh, giữ màu giờ và hạt */ hideLayers?: boolean }) {
  const refs = useRef<(HTMLImageElement | null)[]>([]);
  const layers = useMemo(() => activeLayers(scene, ambience), [scene, ambience]);
  const particles = useMemo(() => activeParticles(scene, ambience), [scene, ambience]);
  useEffect(() => {
    if (!animate) return;
    let raf = 0;
    const start = performance.now();
    const loop = (now: number) => {
      const p = Math.min((now - start) / durationMs, 1);
      layers.forEach((l, i) => { const el = refs.current[i]; if (el) el.style.transform = layerTransform(l.depth, p); });
      if (p < 1) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [layers, durationMs, animate]);
  return (
    <div className={s.scene} data-scene={scene.id}>
      {!hideLayers && layers.map((l, i) => <img key={l.src} ref={(el) => { refs.current[i] = el; }} className={s.layer} src={l.src} alt="" draggable={false} />)}
      <div className={s.tint} data-time={ambience.timeOfDay} />
      {animate && <ParticleLayer specs={particles} />}
    </div>
  );
}
