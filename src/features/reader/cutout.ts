/* Tách người ra khỏi nền ảnh người đọc bằng MediaPipe Selfie Segmenter, chạy hoàn toàn trên máy (mô hình ~250 KB, Apache 2.0,
   Google, nằm ở public/palm/ cạnh phần chạy WASM dùng chung với chỉ tay). Ra ảnh nền trong suốt để người đứng tự do ở Tĩnh thất
   như nhân vật vẽ sẵn. Tách không được (không thấy người, lỗi nạp mô hình) thì trả null và app giữ khung tròn. */
import type { ImageSegmenter } from '@mediapipe/tasks-vision';

/** Khung ảnh ra, cùng tỉ lệ ô nhân vật ở Tĩnh thất (180 × 198). */
export const CUT_W = 300;
export const CUT_H = 330;
/** Ảnh đưa vào mô hình thu về cạnh dài này cho nhanh. */
const WORK = 512;

let loading: Promise<ImageSegmenter> | null = null;

function loadSegmenter(): Promise<ImageSegmenter> {
  loading ??= (async () => {
    const { FilesetResolver, ImageSegmenter } = await import('@mediapipe/tasks-vision');
    const dir = new URL('palm', document.baseURI).pathname.replace(/\/$/, '');
    const vision = await FilesetResolver.forVisionTasks(dir);
    return ImageSegmenter.createFromOptions(vision, {
      baseOptions: { modelAssetPath: `${dir}/selfie_segmenter.tflite`, delegate: 'CPU' },
      runningMode: 'IMAGE', outputConfidenceMasks: true, outputCategoryMask: false,
    });
  })().catch((e) => { loading = null; throw e; });
  return loading;
}

export interface Box { x: number; y: number; w: number; h: number }

/** Từ độ tin cậy "là người" (0…1 mỗi điểm) ra độ trong suốt 0…255: mép mềm, chỉ giữ mảng người lớn nhất (bỏ đốm lẻ ngoài nền),
    kèm khung bao quanh người. Người chiếm quá ít ảnh thì coi như không thấy người, trả null. */
export function maskToAlpha(conf: ArrayLike<number>, w: number, h: number): { alpha: Uint8ClampedArray; box: Box } | null {
  const n = w * h;
  const solid = new Uint8Array(n);
  for (let i = 0; i < n; i++) solid[i] = conf[i] >= 0.5 ? 1 : 0;

  // Mảng liền nhau lớn nhất (4 hướng).
  const label = new Int32Array(n);
  const stack = new Int32Array(n);
  let best = 0, bestSize = 0, next = 0;
  for (let i = 0; i < n; i++) {
    if (!solid[i] || label[i]) continue;
    const id = ++next;
    let top = 0, size = 0;
    stack[top++] = i; label[i] = id;
    while (top) {
      const p = stack[--top]; size++;
      const x = p % w;
      if (x > 0 && solid[p - 1] && !label[p - 1]) { label[p - 1] = id; stack[top++] = p - 1; }
      if (x < w - 1 && solid[p + 1] && !label[p + 1]) { label[p + 1] = id; stack[top++] = p + 1; }
      if (p >= w && solid[p - w] && !label[p - w]) { label[p - w] = id; stack[top++] = p - w; }
      if (p < n - w && solid[p + w] && !label[p + w]) { label[p + w] = id; stack[top++] = p + w; }
    }
    if (size > bestSize) { bestSize = size; best = id; }
  }
  if (bestSize < n * 0.03) return null;

  // Giữ mảng lớn nhất cùng phần mép mềm sát nó; các mảng khác bỏ hẳn.
  const alpha = new Uint8ClampedArray(n);
  let x0 = w, y0 = h, x1 = -1, y1 = -1;
  for (let i = 0; i < n; i++) {
    if (solid[i] && label[i] !== best) continue;
    const t = Math.min(1, Math.max(0, (conf[i] - 0.25) / 0.5));
    const a = Math.round(t * t * (3 - 2 * t) * 255);
    if (!a) continue;
    if (!solid[i]) {
      // mép mềm: chỉ nhận khi kề một điểm của mảng chính
      const x = i % w;
      const near = (x > 0 && label[i - 1] === best) || (x < w - 1 && label[i + 1] === best) || (i >= w && label[i - w] === best) || (i < n - w && label[i + w] === best);
      if (!near) continue;
    }
    alpha[i] = a;
    if (label[i] === best) {
      const x = i % w, y = (i - x) / w;
      if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
    }
  }
  const pad = Math.round(Math.max(x1 - x0, y1 - y0) * 0.02);
  x0 = Math.max(0, x0 - pad); y0 = Math.max(0, y0 - pad); x1 = Math.min(w - 1, x1 + pad); y1 = Math.min(h - 1, y1 + pad);
  return { alpha, box: { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 } };
}

/** Đặt người vào khung CUT_W × CUT_H: vừa khít, chạm đáy, giữa ngang (đứng sau án thư như nhân vật vẽ sẵn). */
export function fitBox(box: Box): Box {
  const k = Math.min(CUT_W / box.w, CUT_H / box.h);
  const w = Math.round(box.w * k), h = Math.round(box.h * k);
  return { x: Math.round((CUT_W - w) / 2), y: CUT_H - h, w, h };
}

/** Ảnh người đã tách nền (data URL WebP, máy không có WebP thì PNG; đều giữ nền trong suốt), hoặc null nếu không tách được. */
export async function cutOutPerson(bmp: ImageBitmap): Promise<string | null> {
  const k = Math.min(1, WORK / Math.max(bmp.width, bmp.height));
  const w = Math.max(1, Math.round(bmp.width * k)), h = Math.max(1, Math.round(bmp.height * k));
  const work = document.createElement('canvas');
  work.width = w; work.height = h;
  const ctx = work.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(bmp, 0, 0, w, h);

  let conf: Float32Array, mw: number, mh: number;
  try {
    const seg = await loadSegmenter();
    const res = seg.segment(work);
    const mask = res.confidenceMasks?.[0];
    if (!mask) { res.close(); return null; }
    conf = mask.getAsFloat32Array().slice(); mw = mask.width; mh = mask.height;
    res.close();
  } catch { return null; }

  const cut = maskToAlpha(conf, mw, mh);
  if (!cut) return null;
  const img = ctx.getImageData(0, 0, w, h);
  for (let y = 0; y < h; y++) {
    const my = Math.min(mh - 1, Math.floor((y * mh) / h));
    for (let x = 0; x < w; x++) img.data[(y * w + x) * 4 + 3] = cut.alpha[my * mw + Math.min(mw - 1, Math.floor((x * mw) / w))];
  }
  ctx.putImageData(img, 0, 0);

  const sx = w / mw, sy = h / mh;
  const src = { x: cut.box.x * sx, y: cut.box.y * sy, w: cut.box.w * sx, h: cut.box.h * sy };
  const dst = fitBox(src);
  const out = document.createElement('canvas');
  out.width = CUT_W; out.height = CUT_H;
  const o = out.getContext('2d');
  if (!o) return null;
  o.imageSmoothingQuality = 'high';
  o.drawImage(work, src.x, src.y, src.w, src.h, dst.x, dst.y, dst.w, dst.h);
  const url = out.toDataURL('image/webp', 0.9);
  return url.startsWith('data:image/webp') ? url : out.toDataURL('image/png');
}
