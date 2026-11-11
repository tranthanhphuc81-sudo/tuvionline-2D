import { useEffect, useRef } from 'react';
import type { AnimationItem } from 'lottie-web';
import { HEAD_CHIN, HEAD_CX, HEAD_FACE, HEAD_H, HEAD_W } from './cutout';

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

/** Chỗ đặt cái đầu ảnh thật trên thân vẽ sẵn (toạ độ khung 200 × 224 của file Lottie): cằm ở dưới mặt vẽ, mặt rộng như mặt vẽ. */
const FACE_AT = { x: 102, y: 109, w: 50 };

/** Ghép cái đầu cắt từ ảnh người dùng (cutout.ts) lên thân nhân vật: bỏ hết nét vẽ trong lớp `đầu` (mặt, tóc, râu, mũ) và
    thêm một lớp ảnh gắn vào lớp đó, nên đầu ảnh nghiêng, gật theo đúng chuyển động của nhân vật. Không có lớp `đầu` thì để nguyên. */
export function withFace<T extends Lottie>(data: T, head: string): T {
  const layers = data.layers ?? [];
  const at = layers.findIndex((l) => l.nm === 'đầu');
  if (at < 0) return data;
  const parent = layers[at];
  const k = (FACE_AT.w / HEAD_FACE) * 100;
  const face = {
    ddd: 0, ind: 90, ty: 2, nm: 'mặt người dùng', refId: 'userHead', parent: parent.ind, sr: 1, ao: 0, bm: 0, ip: 0, op: data.op ?? parent.op, st: 0,
    ks: { o: { a: 0, k: 100 }, r: { a: 0, k: 0 }, p: { a: 0, k: [FACE_AT.x, FACE_AT.y, 0] }, a: { a: 0, k: [HEAD_CX, HEAD_CHIN, 0] }, s: { a: 0, k: [k, k, 100] } },
  };
  const out = [...layers];
  out.splice(at, 1, face, { ...parent, shapes: [] });
  return { ...data, assets: [...(data.assets ?? []), { id: 'userHead', w: HEAD_W, h: HEAD_H, u: '', p: head, e: 1 }], layers: out };
}

export function Character({ name, state, className, robe, face }: { name: string; state: CharacterState; className?: string; robe?: readonly [string, string, string]; face?: string | null }) {
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
        anim.current = lottie.default.loadAnimation({ container: box.current, renderer: 'svg', loop: true, autoplay: false, animationData: face ? withFace(colored, face) : colored });
        show(wanted.current);
      })
      .catch(() => { /* chỉ là trang trí */ });
    return () => { dead = true; anim.current?.destroy(); anim.current = null; };
  }, [name, robe?.join(), face]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { show(state); }, [state]); // eslint-disable-line react-hooks/exhaustive-deps

  return <div ref={box} className={className} aria-hidden="true" />;
}
