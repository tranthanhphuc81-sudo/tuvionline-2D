/* Ảnh người đọc do người dùng tự đưa lên (Cài đặt → Người đọc → Ảnh của bạn). Chỉ lưu trên máy ở khoá riêng, không nằm trong
   `lyso.state` nên không vào file sao lưu; "Xoá toàn bộ dữ liệu" xoá luôn. Lưu hai bản, đều thu nhỏ cho nhẹ:
   - `lyso.reader.photo`: ảnh vuông cắt giữa (JPEG), dùng cho khung tròn;
   - `lyso.reader.cutout`: người đã tách nền (nền trong suốt, cutout.ts), để đứng tự do như nhân vật vẽ sẵn. Không tách được thì không có. */
import { preferencesKV, type KV } from '../../platform/storage';
import { cutOutPerson } from './cutout';

export const READER_PHOTO_KEY = 'lyso.reader.photo';
export const READER_CUTOUT_KEY = 'lyso.reader.cutout';
const SIZE = 320;

export interface ReaderPhoto { photo: string | null; cutout: string | null }
const EMPTY: ReaderPhoto = { photo: null, cutout: null };

let current: ReaderPhoto = EMPTY;
let loaded = false;
const subs = new Set<() => void>();
const set = (v: ReaderPhoto) => { current = v; subs.forEach((f) => f()); };

export const subscribeReaderPhoto = (f: () => void) => { subs.add(f); return () => { subs.delete(f); }; };
export const readerPhoto = () => current;

export async function loadReaderPhoto(kv: KV = preferencesKV): Promise<void> {
  if (loaded) return;
  loaded = true;
  const get = async (k: string) => { try { return await kv.get(k); } catch { return null; } };
  const [photo, cutout] = await Promise.all([get(READER_PHOTO_KEY), get(READER_CUTOUT_KEY)]);
  set({ photo, cutout: photo ? cutout : null });
}

/** Cắt ảnh thành hình vuông ở giữa, thu về SIZE px, lưu dạng JPEG; thử tách nền để có thêm bản đứng tự do.
    Trả về có tách nền được hay không. */
export async function saveReaderPhoto(file: Blob, kv: KV = preferencesKV): Promise<{ cutout: boolean }> {
  const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' });
  let photo: string, cutout: string | null;
  try {
    const side = Math.min(bmp.width, bmp.height);
    const c = document.createElement('canvas');
    c.width = c.height = SIZE;
    c.getContext('2d')!.drawImage(bmp, (bmp.width - side) / 2, (bmp.height - side) / 2, side, side, 0, 0, SIZE, SIZE);
    photo = c.toDataURL('image/jpeg', 0.85);
    cutout = await cutOutPerson(bmp);
  } finally { bmp.close(); }
  await kv.set(READER_PHOTO_KEY, photo);
  if (cutout) await kv.set(READER_CUTOUT_KEY, cutout);
  else await kv.remove(READER_CUTOUT_KEY);
  loaded = true;
  set({ photo, cutout });
  return { cutout: !!cutout };
}

export async function removeReaderPhoto(kv: KV = preferencesKV): Promise<void> {
  await Promise.all([kv.remove(READER_PHOTO_KEY), kv.remove(READER_CUTOUT_KEY)]);
  set(EMPTY);
}
