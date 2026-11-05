import { useEffect, useRef } from 'react';
import type { AnimationItem } from 'lottie-web';

export type CharacterState = 'idle' | 'talk' | 'point' | 'turnPage' | 'nod';
interface Marker { tm: number; dr: number; cm: string }
interface Lottie { markers?: Marker[] }

const files = import.meta.glob<{ default: Lottie }>('../../assets/journey/character/*.json');
const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

/** Nhân vật Lottie (ARCHITECTURE.md mục 12.4). Mỗi trạng thái là một marker trong file, nên thay tranh không phải đổi code.
    Chỉ là hình trang trí: lỗi tải thì không hiện, app vẫn dùng bình thường. */
export function Character({ name, state, className }: { name: 'thay' | 'daodong'; state: CharacterState; className?: string }) {
  const box = useRef<HTMLDivElement>(null);
  const anim = useRef<AnimationItem | null>(null);
  const markers = useRef<Marker[]>([]);
  const wanted = useRef(state);
  wanted.current = state;

  const show = (s: CharacterState) => {
    const m = markers.current.find((x) => x.cm === s), a = anim.current;
    if (!a || !m) return;
    if (reducedMotion()) a.goToAndStop(m.tm, true);
    else a.playSegments([m.tm, m.tm + m.dr], true);
  };

  useEffect(() => {
    if (import.meta.env.MODE === 'test') return; // jsdom không có canvas, SVG của Lottie không chạy được
    let dead = false;
    void Promise.all([import('lottie-web/build/player/lottie_light'), files[`../../assets/journey/character/${name}.json`]()])
      .then(([lottie, data]) => {
        if (dead || !box.current) return;
        markers.current = data.default.markers ?? [];
        anim.current = lottie.default.loadAnimation({ container: box.current, renderer: 'svg', loop: true, autoplay: false, animationData: data.default });
        show(wanted.current);
      })
      .catch(() => { /* chỉ là trang trí */ });
    return () => { dead = true; anim.current?.destroy(); anim.current = null; };
  }, [name]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { show(state); }, [state]); // eslint-disable-line react-hooks/exhaustive-deps

  return <div ref={box} className={className} aria-hidden="true" />;
}
