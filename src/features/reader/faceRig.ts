/* Ghép cái đầu cắt từ ảnh người dùng (cutout.ts) lên thân nhân vật Lottie vẽ sẵn, và cho nó cử động:
   - bỏ hết nét vẽ trong lớp `đầu` (mặt, tóc, râu, mũ), thêm lớp ảnh gắn (parent) vào lớp đó → đầu ảnh nghiêng, gật theo nhân vật;
   - có bộ phận cử động thì thêm lớp hàm dưới hạ lên hạ xuống trong các đoạn đang đọc (mọi marker trừ `idle`) và hai mí mắt
     chớp vài lần mỗi vòng. Tất cả là khung hình trong file Lottie, nên "giảm chuyển động" của máy vẫn dừng hình như nhân vật vẽ sẵn. */
import { HEAD_CHIN, HEAD_CX, HEAD_FACE, HEAD_H, HEAD_W, type TalkParts } from './cutout';

type Layer = Record<string, unknown>;
interface Marker { tm: number; dr: number; cm: string }
interface Lottie { markers?: Marker[]; op?: number; assets?: unknown[]; layers?: Layer[] }

/** Chỗ đặt cái đầu ảnh thật trên thân vẽ sẵn (toạ độ khung 200 × 224 của file Lottie): cằm ở dưới mặt vẽ, mặt rộng như mặt vẽ. */
export const FACE_AT = { x: 102, y: 109, w: 50 };
/** Độ mở miệng (0…1) mỗi 4 khung hình trong một đoạn đang đọc; đầu và cuối khép lại để vòng lặp liền. */
export const FLAP = [0, 0.9, 0.2, 0.7, 0, 1, 0.4, 0.8, 0.1, 0.6, 0, 0.9, 0.3, 0.7, 0];
const FLAP_STEP = 4;
/** Lúc chớp mắt trong vòng 360 khung hình (12 giây), co giãn theo độ dài file. */
const BLINKS = [38, 96, 146, 206, 262, 328];

/* Lottie ghi thẳng vào dữ liệu lúc dựng hình, nên mỗi chỗ dùng phải là object mới, không dùng chung một object. */
const ease = () => ({ i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] } });
const still = (k: unknown) => ({ a: 0, k });
const rgb = (hex: string) => [1, 3, 5].map((i) => Math.round((parseInt(hex.slice(i, i + 2), 16) / 255) * 1000) / 1000).concat(1);
const tr = () => ({ ty: 'tr', p: still([0, 0]), a: still([0, 0]), s: still([100, 100]), r: still(0), o: still(100), sk: still(0), sa: still(0) });

/** Khung hình của hàm dưới: đứng yên lúc `idle`, mấp máy trong các đoạn khác. `open` là toạ độ khi mở hết. */
export function jawKeys(markers: Marker[], op: number, closed: number[], open: number[]) {
  const at = (v: number) => closed.map((c, i) => c + (open[i] - c) * v);
  const keys: { t: number; s: number[] }[] = [{ t: 0, s: [...closed] }];
  for (const m of [...markers].sort((a, b) => a.tm - b.tm)) {
    if (m.cm === 'idle') continue;
    for (let j = 0; j < FLAP.length && j * FLAP_STEP < m.dr; j++) keys.push({ t: m.tm + j * FLAP_STEP, s: at(FLAP[j]) });
    keys.push({ t: m.tm + m.dr, s: [...closed] });
  }
  keys.push({ t: op, s: [...closed] });
  // bỏ khung trùng thời điểm (giữ cái sau), sắp theo thời gian
  const byT = new Map(keys.map((k) => [k.t, k]));
  const out = [...byT.values()].filter((k) => k.t <= op).sort((a, b) => a.t - b.t);
  return out.map((k, i) => (i < out.length - 1 ? { ...k, ...ease() } : k));
}

/** Khung hình độ đục của mí mắt: 0 hầu hết thời gian, hiện thoáng chốc ở mỗi lần chớp. */
export function blinkKeys(op: number) {
  const keys: { t: number; s: number[] }[] = [{ t: 0, s: [0] }];
  for (const b of BLINKS.map((x) => Math.round((x * op) / 360))) keys.push({ t: b, s: [0] }, { t: b + 2, s: [100] }, { t: b + 4, s: [100] }, { t: b + 6, s: [0] });
  keys.push({ t: op, s: [0] });
  return keys.map((k, i) => (i < keys.length - 1 ? { ...k, ...ease() } : k));
}

export function withFace<T extends Lottie>(data: T, head: string, talk?: TalkParts | null): T {
  const layers = data.layers ?? [];
  const at = layers.findIndex((l) => l.nm === 'đầu');
  if (at < 0) return data;
  const parent = layers[at];
  const op = (data.op ?? parent.op ?? 360) as number;
  const k = (FACE_AT.w / HEAD_FACE) * 100;
  const base = { ddd: 0, parent: parent.ind, sr: 1, ao: 0, bm: 0, ip: 0, op, st: 0 };
  const pos = [FACE_AT.x, FACE_AT.y, 0];
  const imageLayer = (ind: number, nm: string, refId: string, p: unknown) => ({
    ...base, ind, ty: 2, nm, refId,
    ks: { o: still(100), r: still(0), p, a: still([HEAD_CX, HEAD_CHIN, 0]), s: still([k, k, 100]) },
  });
  const assets = [...(data.assets ?? []), { id: 'userHead', w: HEAD_W, h: HEAD_H, u: '', p: talk ? talk.upper : head, e: 1 }];
  const added: Layer[] = [];
  if (talk) {
    const toComp = (x: number, y: number) => [FACE_AT.x + ((x - HEAD_CX) * k) / 100, FACE_AT.y + ((y - HEAD_CHIN) * k) / 100];
    const [lw, lh] = talk.rig.lid.map((v) => (v * k) / 100);
    const lid = (ind: number, [ex, ey]: [number, number]) => {
      const [x, y] = toComp(ex, ey);
      return {
        ...base, ind, ty: 4, nm: 'mí mắt',
        ks: { o: { a: 1, k: blinkKeys(op) }, r: still(0), p: still([0, 0, 0]), a: still([0, 0, 0]), s: still([100, 100, 100]) },
        shapes: [
          { ty: 'gr', it: [{ ty: 'sh', ks: still({ v: [[x - lw * 0.45, y + lh * 0.22], [x, y + lh * 0.46], [x + lw * 0.45, y + lh * 0.22]], i: [[0, 0], [-lw * 0.25, 0], [0, 0]], o: [[0, 0], [lw * 0.25, 0], [0, 0]], c: false }) },
            { ty: 'st', c: still(rgb(talk.rig.line)), o: still(100), w: still(0.6), lc: 2, lj: 2 }, tr()] },
          { ty: 'gr', it: [{ ty: 'el', p: still([x, y]), s: still([lw, lh]) }, { ty: 'fl', c: still(rgb(talk.rig.skin)), o: still(100), r: 1 }, tr()] },
        ],
      };
    };
    assets.push({ id: 'userJaw', w: HEAD_W, h: HEAD_H, u: '', p: talk.jaw, e: 1 });
    const drop = (talk.rig.drop * k) / 100;
    added.push(
      ...talk.rig.eyes.slice(0, 2).map((e, i) => lid(91 + i, e)),
      imageLayer(93, 'hàm người dùng', 'userJaw', { a: 1, k: jawKeys(data.markers ?? [], op, pos, [pos[0], pos[1] + drop, 0]) }),
    );
  }
  added.push(imageLayer(90, 'mặt người dùng', 'userHead', still([...pos])));
  const out = [...layers];
  out.splice(at, 1, ...added, { ...parent, shapes: [] });
  return { ...data, assets, layers: out };
}
