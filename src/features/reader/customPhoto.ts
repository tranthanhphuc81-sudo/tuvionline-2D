/* Ảnh người đọc do người dùng tự đưa lên (Cài đặt → Người đọc → Ảnh của bạn). Chỉ lưu trên máy ở khoá riêng, không nằm trong
   `lyso.state` nên không vào file sao lưu; "Xoá toàn bộ dữ liệu" xoá luôn. Ảnh được thu nhỏ trước khi lưu cho nhẹ. */
import { preferencesKV, type KV } from '../../platform/storage';

export const READER_PHOTO_KEY = 'lyso.reader.photo';
const SIZE = 320;

let photo: string | null = null;
let loaded = false;
const subs = new Set<() => void>();
const emit = () => subs.forEach((f) => f());

export const subscribeReaderPhoto = (f: () => void) => { subs.add(f); return () => { subs.delete(f); }; };
export const readerPhoto = () => photo;

export async function loadReaderPhoto(kv: KV = preferencesKV): Promise<void> {
  if (loaded) return;
  loaded = true;
  try { photo = await kv.get(READER_PHOTO_KEY); } catch { photo = null; }
  emit();
}

/** Cắt ảnh thành hình vuông ở giữa, thu về SIZE px, lưu dạng JPEG. */
export async function saveReaderPhoto(file: Blob, kv: KV = preferencesKV): Promise<void> {
  const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' });
  const side = Math.min(bmp.width, bmp.height);
  const c = document.createElement('canvas');
  c.width = c.height = SIZE;
  c.getContext('2d')!.drawImage(bmp, (bmp.width - side) / 2, (bmp.height - side) / 2, side, side, 0, 0, SIZE, SIZE);
  bmp.close();
  const url = c.toDataURL('image/jpeg', 0.85);
  await kv.set(READER_PHOTO_KEY, url);
  photo = url;
  loaded = true;
  emit();
}

export async function removeReaderPhoto(kv: KV = preferencesKV): Promise<void> {
  await kv.remove(READER_PHOTO_KEY);
  photo = null;
  emit();
}
