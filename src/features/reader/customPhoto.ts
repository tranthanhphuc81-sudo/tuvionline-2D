/* Ảnh người đọc do người dùng tự đưa lên (Cài đặt → Người đọc → Ảnh của bạn). Chỉ lưu trên máy ở khoá riêng, không nằm trong
   `lyso.state` nên không vào file sao lưu; "Xoá toàn bộ dữ liệu" xoá luôn. Lưu các bản sau, đều thu nhỏ cho nhẹ:
   - `lyso.reader.photo`: ảnh vuông cắt giữa (JPEG), dùng cho khung tròn;
   - `lyso.reader.cutout`: người đã tách nền (nền trong suốt, cutout.ts), để đứng tự do như nhân vật vẽ sẵn;
   - `lyso.reader.head`: riêng cái đầu (mặt và tóc), để ghép lên thân nhân vật vẽ sẵn;
   - `lyso.reader.anim`: bộ phận cử động (hàm dưới, mí mắt) của hai bản trên, dạng JSON. Không có thì ảnh đứng yên như cũ.
   Bản nào không làm được thì không có. */
import { preferencesKV, type KV } from '../../platform/storage';
import { cutOutReader, type TalkParts } from './cutout';

export const READER_PHOTO_KEY = 'lyso.reader.photo';
export const READER_CUTOUT_KEY = 'lyso.reader.cutout';
export const READER_HEAD_KEY = 'lyso.reader.head';
export const READER_ANIM_KEY = 'lyso.reader.anim';
export const READER_PHOTO_KEYS = [READER_PHOTO_KEY, READER_CUTOUT_KEY, READER_HEAD_KEY, READER_ANIM_KEY];
const SIZE = 320;

export interface ReaderAnim { stand?: TalkParts; head?: TalkParts }
export interface ReaderPhoto { photo: string | null; cutout: string | null; head: string | null; anim: ReaderAnim }
const EMPTY: ReaderPhoto = { photo: null, cutout: null, head: null, anim: {} };

let current: ReaderPhoto = EMPTY;
let loaded = false;
const subs = new Set<() => void>();
const set = (v: ReaderPhoto) => { current = v; subs.forEach((f) => f()); };

export const subscribeReaderPhoto = (f: () => void) => { subs.add(f); return () => { subs.delete(f); }; };
export const readerPhoto = () => current;

const isParts = (v: unknown): v is TalkParts => {
  const p = v as TalkParts | null;
  return !!p && typeof p.upper === 'string' && typeof p.jaw === 'string' && !!p.rig && Array.isArray(p.rig.mouth) && Array.isArray(p.rig.eyes) && typeof p.rig.drop === 'number';
};
/** Đọc JSON bộ phận cử động; hỏng hay sai dạng thì bỏ qua phần đó (ảnh vẫn hiện, chỉ không cử động). */
export function parseAnim(raw: string | null): ReaderAnim {
  if (!raw) return {};
  try {
    const v = JSON.parse(raw) as Record<string, unknown>;
    return { ...(isParts(v.stand) ? { stand: v.stand } : {}), ...(isParts(v.head) ? { head: v.head } : {}) };
  } catch { return {}; }
}

export async function loadReaderPhoto(kv: KV = preferencesKV): Promise<void> {
  if (loaded) return;
  loaded = true;
  const get = async (k: string) => { try { return await kv.get(k); } catch { return null; } };
  const [photo, cutout, head, anim] = await Promise.all(READER_PHOTO_KEYS.map(get));
  set(photo ? { photo, cutout, head, anim: parseAnim(anim) } : EMPTY);
}

/** Cắt ảnh thành hình vuông ở giữa, thu về SIZE px, lưu dạng JPEG; thử tách nền, cắt riêng cái đầu và tách hàm, mí mắt để có thêm
    các cách hiện có cử động. Trả về làm được bản nào. */
export async function saveReaderPhoto(file: Blob, kv: KV = preferencesKV): Promise<{ cutout: boolean; head: boolean }> {
  const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' });
  let photo: string, cut: Awaited<ReturnType<typeof cutOutReader>>;
  try {
    const side = Math.min(bmp.width, bmp.height);
    const c = document.createElement('canvas');
    c.width = c.height = SIZE;
    c.getContext('2d')!.drawImage(bmp, (bmp.width - side) / 2, (bmp.height - side) / 2, side, side, 0, 0, SIZE, SIZE);
    photo = c.toDataURL('image/jpeg', 0.85);
    cut = await cutOutReader(bmp);
  } finally { bmp.close(); }
  const anim: ReaderAnim = { ...(cut.standTalk ? { stand: cut.standTalk } : {}), ...(cut.headTalk ? { head: cut.headTalk } : {}) };
  const animRaw = anim.stand || anim.head ? JSON.stringify(anim) : null;
  await kv.set(READER_PHOTO_KEY, photo);
  for (const [k, v] of [[READER_CUTOUT_KEY, cut.stand], [READER_HEAD_KEY, cut.head], [READER_ANIM_KEY, animRaw]] as const) await (v ? kv.set(k, v) : kv.remove(k));
  loaded = true;
  set({ photo, cutout: cut.stand, head: cut.head, anim });
  return { cutout: !!cut.stand, head: !!cut.head };
}

export async function removeReaderPhoto(kv: KV = preferencesKV): Promise<void> {
  await Promise.all(READER_PHOTO_KEYS.map((k) => kv.remove(k)));
  set(EMPTY);
}
