/* Hành trình vào đạo quán, phủ lên app khi mở (ARCHITECTURE.md mục 12.1, 12.2). Bản giữ chỗ: ảnh tự vẽ, chưa có âm thanh, chưa có nhân vật. */
import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { backStack } from '../../platform/back';
import { skipJourney, startJourney, stepJourney, type EntryPlan } from './plan';
import { SceneView } from './SceneEngine';
import { SCENES, preloadScene } from './scenes';
import s from './journey.module.css';

const FADE_MS = 400;
const SWIPE_PX = 40;
const COUNT = SCENES.length;

/** Bước tới trạm kế hoặc kết thúc. Tách riêng để nút trong trạm không bị tính thêm một lần chạm nền. */
export function Journey({ plan, onDone }: { plan: Exclude<EntryPlan, 'none'>; onDone(): void }) {
  const [st, setSt] = useState(() => startJourney(plan, COUNT));
  const startY = useRef<number | null>(null);
  const scene = SCENES[st.index];
  const animate = plan !== 'fade';
  const durationMs = plan === 'full' ? scene.durationMs.full : scene.durationMs.short;

  useEffect(() => backStack.register(() => { setSt((x) => skipJourney(x, COUNT)); return true; }), []);
  useEffect(() => { preloadScene(SCENES[st.index + 1]); }, [st.index]);
  useEffect(() => {
    if (st.done) return;
    const t = setTimeout(() => setSt((x) => stepJourney(x, COUNT)), plan === 'fade' ? FADE_MS : durationMs);
    return () => clearTimeout(t);
  }, [st, plan, durationMs]);
  useEffect(() => {
    if (!st.done) return;
    const t = setTimeout(onDone, FADE_MS);
    return () => clearTimeout(t);
  }, [st.done, onDone]);

  const step = () => setSt((x) => stepJourney(x, COUNT));
  const onUp = (e: PointerEvent) => {
    const dy = startY.current === null ? 0 : e.clientY - startY.current;
    startY.current = null;
    if (Math.abs(dy) < SWIPE_PX || dy < 0) step();
  };

  return (
    <div className={s.journey} data-done={st.done} role="dialog" aria-label="Lối vào đạo quán" onPointerDown={(e) => { startY.current = e.clientY; }} onPointerUp={onUp}>
      <SceneView key={scene.id} scene={scene} durationMs={durationMs} animate={animate} />
      <button type="button" className={s.skip} onPointerUp={(e) => e.stopPropagation()} onClick={() => setSt((x) => skipJourney(x, COUNT))}>Bỏ qua</button>
      <div className={s.foot} onPointerUp={(e) => e.stopPropagation()}>
        {scene.interaction === 'incense' && <button type="button" className={s.action} onClick={step}>Đi tiếp</button>}
        {scene.interaction === 'invite' && <button type="button" className={s.action} onClick={step}>Vào tĩnh thất</button>}
        {st.index === 0 && plan === 'full' && <p className={s.hint}>Vuốt lên hoặc chạm để bước tới</p>}
      </div>
    </div>
  );
}
