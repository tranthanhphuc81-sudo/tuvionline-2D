import { useEffect, useRef } from 'react';
import type { AnimationItem } from 'lottie-web';
import type { TalkParts } from './cutout';
import { withFace } from './faceRig';

export type CharacterState = 'idle' | 'talk' | 'point' | 'turnPage' | 'nod';
interface Marker { tm: number; dr: number; cm: string }
interface Lottie { markers?: Marker[]; op?: number; assets?: unknown[]; layers?: Record<string, unknown>[] }

const files = import.meta.glob<{ default: Lottie }>('../../assets/journey/character/*.json');
const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

/** Nhân vật Lottie (ARCHITECTURE.md mục 12.4). Mỗi trạng thái là một marker trong file, nên thay tranh không phải đổi code.
    Chỉ là hình trang trí: lỗi tải thì không hiện, app vẫn dùng bình thường. */
/** Đổi màu áo lúc chạy: các lớp màu trong file có tên `robe`, `robeHi`, `robeFold` (scripts/characters-personas.mjs). */
export function recolorRobe<T>(data: T, colors: readonly [string, string, string]): T {
  const rgb = (hex: string) => [1, 3, 5].map((i) => Math.round((parseInt(hex.slice(i, i + 2), 16) / 255) * 1000) / 1000).concat(1);
  const map: Record<string, number[]> = { robe: rgb(colors[0]), robeHi: rgb(colors[1]), robeFold: rgb(colors[2]) };
  const walk = (v: unknown): unknown => {
    if (Array.isArray(v)) return v.map(walk);
    if (!v || typeof v !== 'object') return v;
    const o = v as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const [k, x] of Object.entries(o)) out[k] = walk(x);
    if ((o.ty === 'fl' || o.ty === 'st') && typeof o.nm === 'string' && map[o.nm]) out.c = { a: 0, k: map[o.nm] };
    return out;
  };
  return walk(data) as T;
}

export function Character({ name, state, className, robe, face, talk }: { name: string; state: CharacterState; className?: string; robe?: readonly [string, string, string]; face?: string | null; talk?: TalkParts | null }) {
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
    const file = files[`../../assets/journey/character/${name}.json`] ?? files['../../assets/journey/character/thay.json'];
    void Promise.all([import('lottie-web/build/player/lottie_light'), file()])
      .then(([lottie, data]) => {
        if (dead || !box.current) return;
        markers.current = data.default.markers ?? [];
        const colored = robe ? recolorRobe(data.default, robe) : data.default;
        anim.current = lottie.default.loadAnimation({ container: box.current, renderer: 'svg', loop: true, autoplay: false, animationData: face ? withFace(colored, face, talk) : colored });
        show(wanted.current);
      })
      .catch((e) => { if (import.meta.env.DEV) console.warn('Character', e); /* chỉ là trang trí */ });
    return () => { dead = true; anim.current?.destroy(); anim.current = null; };
  }, [name, robe?.join(), face, talk?.upper]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { show(state); }, [state]); // eslint-disable-line react-hooks/exhaustive-deps

  return <div ref={box} className={className} aria-hidden="true" />;
}
