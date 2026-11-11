/* Tách người đọc ra khỏi ảnh người dùng, chạy hoàn toàn trên máy bằng MediaPipe (mô hình Apache 2.0 của Google nằm ở public/palm/,
   dùng chung phần chạy WASM với chỉ tay):
   - Selfie Segmenter (~250 KB) tách người khỏi nền → ảnh nền trong suốt để người đứng tự do ở Tĩnh thất như nhân vật vẽ sẵn;
   - Face Detector (~230 KB) tìm khuôn mặt → cắt riêng cái đầu (mặt và tóc, bỏ cổ vai) để ghép lên thân nhân vật vẽ sẵn (Character.tsx).
   Phần nào không làm được (không thấy người, không thấy mặt, lỗi nạp mô hình) thì trả null và app dùng cách hiện khác. */
import type { FaceDetector, ImageSegmenter } from '@mediapipe/tasks-vision';

/** Khung ảnh đứng tự do, cùng tỉ lệ ô nhân vật ở Tĩnh thất (180 × 198). */
export const CUT_W = 300;
export const CUT_H = 330;
/** Khung ảnh cái đầu: khuôn mặt luôn rộng HEAD_FACE px, cằm đặt ở (HEAD_CX, HEAD_CHIN), thẳng hàng hai mắt. */
export const HEAD_W = 200;
export const HEAD_H = 240;
export const HEAD_FACE = 90;
export const HEAD_CX = 100;
export const HEAD_CHIN = 200;
/** Ảnh đưa vào mô hình thu về cạnh dài này cho nhanh. */
const WORK = 512;

type Fileset = Parameters<typeof FaceDetector.createFromOptions>[0];
let vision: Promise<{ dir: string; fileset: Fileset }> | null = null;
let segLoading: Promise<ImageSegmenter> | null = null;
let faceLoading: Promise<FaceDetector> | null = null;

function loadVision() {
  vision ??= (async () => {
    const { FilesetResolver } = await import('@mediapipe/tasks-vision');
    const dir = new URL('palm', document.baseURI).pathname.replace(/\/$/, '');
    return { dir, fileset: await FilesetResolver.forVisionTasks(dir) };
  })().catch((e) => { vision = null; throw e; });
  return vision;
}

function loadSegmenter(): Promise<ImageSegmenter> {
  segLoading ??= (async () => {
    const [{ ImageSegmenter }, { dir, fileset }] = await Promise.all([import('@mediapipe/tasks-vision'), loadVision()]);
    return ImageSegmenter.createFromOptions(fileset, {
      baseOptions: { modelAssetPath: `${dir}/selfie_segmenter.tflite`, delegate: 'CPU' },
      runningMode: 'IMAGE', outputConfidenceMasks: true, outputCategoryMask: false,
    });
  })().catch((e) => { segLoading = null; throw e; });
  return segLoading;
}

function loadFaces(): Promise<FaceDetector> {
  faceLoading ??= (async () => {
    const [{ FaceDetector }, { dir, fileset }] = await Promise.all([import('@mediapipe/tasks-vision'), loadVision()]);
    return FaceDetector.createFromOptions(fileset, {
      baseOptions: { modelAssetPath: `${dir}/blaze_face_short_range.tflite`, delegate: 'CPU' },
      runningMode: 'IMAGE', minDetectionConfidence: 0.5,
    });
  })().catch((e) => { faceLoading = null; throw e; });
  return faceLoading;
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

/** Cằm nằm ở đâu so với khung mặt của Face Detector (tính từ mép trên, theo chiều cao khung). */
const CHIN_AT = 1.0;

const smooth = (a: number, b: number, v: number) => { const t = Math.min(1, Math.max(0, (v - a) / (b - a))); return t * t * (3 - 2 * t); };

/** Phần giữ lại quanh khuôn mặt (0…1) tại điểm (x, y), toạ độ đã xoay thẳng mắt. `face` là khung mặt của Face Detector.
    Nửa dưới cắt theo hình bầu dục ôm cằm (bỏ cổ và vai); nửa trên để rộng cho tóc. Khi có mặt nạ người thì tóc theo mặt nạ;
    không có thì cắt hẳn thành hình bầu dục cả trên lẫn dưới. */
export function headClip(x: number, y: number, face: Box, withMask: boolean): number {
  const cx = face.x + face.w / 2, cy = face.y + face.h * 0.45, chin = face.y + face.h * CHIN_AT;
  const u = (x - cx) / (face.w * 0.6);
  if (y >= cy) {
    const v = (y - cy) / (chin - cy);
    return 1 - smooth(0.8, 1, u * u + v * v);
  }
  if (withMask) return 1 - smooth(1.5, 1.8, Math.abs(u));
  const v = (cy - y) / (face.h * 0.95);
  return 1 - smooth(0.82, 1, u * u + v * v);
}

/** Cắt ảnh người dùng thành hai bản: người đứng tự do và cái đầu để ghép. Data URL WebP (máy không có WebP thì PNG; đều giữ nền
    trong suốt), bản nào không làm được thì null. */
export async function cutOutReader(bmp: ImageBitmap): Promise<{ stand: string | null; head: string | null }> {
  const k = Math.min(1, WORK / Math.max(bmp.width, bmp.height));
  const w = Math.max(1, Math.round(bmp.width * k)), h = Math.max(1, Math.round(bmp.height * k));
  const work = document.createElement('canvas');
  work.width = w; work.height = h;
  const ctx = work.getContext('2d', { willReadFrequently: true });
  if (!ctx) return { stand: null, head: null };
  ctx.drawImage(bmp, 0, 0, w, h);
  const pixels = ctx.getImageData(0, 0, w, h);

  // Mặt nạ người, cùng kích thước ảnh làm việc.
  let alpha: Uint8ClampedArray | null = null, box: Box | null = null;
  try {
    const seg = await loadSegmenter();
    const res = seg.segment(work);
    const mask = res.confidenceMasks?.[0];
    if (mask) {
      const conf = mask.getAsFloat32Array().slice(), mw = mask.width, mh = mask.height;
      const cut = maskToAlpha(conf, mw, mh);
      if (cut) {
        alpha = new Uint8ClampedArray(w * h);
        for (let y = 0; y < h; y++) {
          const my = Math.min(mh - 1, Math.floor((y * mh) / h));
          for (let x = 0; x < w; x++) alpha[y * w + x] = cut.alpha[my * mw + Math.min(mw - 1, Math.floor((x * mw) / w))];
        }
        box = { x: (cut.box.x * w) / mw, y: (cut.box.y * h) / mh, w: (cut.box.w * w) / mw, h: (cut.box.h * h) / mh };
      }
    }
    res.close();
  } catch { /* không tách được nền: vẫn thử cắt đầu hình bầu dục */ }

  return { stand: alpha && box ? standImage(pixels, alpha, box) : null, head: await headImage(work, pixels, alpha).catch(() => null) };
}

function encode(c: HTMLCanvasElement): string {
  const url = c.toDataURL('image/webp', 0.9);
  return url.startsWith('data:image/webp') ? url : c.toDataURL('image/png');
}

function withAlpha(pixels: ImageData, alpha: (i: number) => number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = pixels.width; c.height = pixels.height;
  const img = new ImageData(new Uint8ClampedArray(pixels.data), pixels.width, pixels.height);
  for (let i = 0, n = pixels.width * pixels.height; i < n; i++) img.data[i * 4 + 3] = alpha(i);
  c.getContext('2d')!.putImageData(img, 0, 0);
  return c;
}

function standImage(pixels: ImageData, alpha: Uint8ClampedArray, src: Box): string {
  const cut = withAlpha(pixels, (i) => alpha[i]);
  const dst = fitBox(src);
  const out = document.createElement('canvas');
  out.width = CUT_W; out.height = CUT_H;
  const o = out.getContext('2d')!;
  o.imageSmoothingQuality = 'high';
  o.drawImage(cut, src.x, src.y, src.w, src.h, dst.x, dst.y, dst.w, dst.h);
  return encode(out);
}

async function headImage(work: HTMLCanvasElement, pixels: ImageData, alpha: Uint8ClampedArray | null): Promise<string | null> {
  const faces = await loadFaces();
  const found = faces.detect(work).detections.filter((d) => d.boundingBox).sort((a, b) => b.boundingBox!.width * b.boundingBox!.height - a.boundingBox!.width * a.boundingBox!.height)[0];
  const bb = found?.boundingBox;
  if (!bb || bb.width < 24) return null;
  const w = pixels.width;
  const face: Box = { x: bb.originX, y: bb.originY, w: bb.width, h: bb.height };
  // Nghiêng đầu theo đường nối hai mắt (điểm 0 và 1, toạ độ 0…1).
  const [e0, e1] = found.keypoints;
  const angle = e0 && e1 ? Math.atan2((e1.y - e0.y) * pixels.height, (e1.x - e0.x) * w) : 0;
  const tilt = Math.abs(angle) < 0.6 ? angle : 0;
  const cx = face.x + face.w / 2, cy = face.y + face.h / 2, cos = Math.cos(-tilt), sin = Math.sin(-tilt);
  const cut = withAlpha(pixels, (i) => {
    const x = i % w, y = (i - x) / w;
    // xoay ngược quanh tâm mặt để đo theo hướng thẳng mắt
    const rx = cx + (x - cx) * cos - (y - cy) * sin, ry = cy + (x - cx) * sin + (y - cy) * cos;
    return Math.round((alpha ? alpha[i] : 255) * headClip(rx, ry, face, !!alpha));
  });
  // cằm trên ảnh gốc: điểm dưới tâm mặt, xoay theo độ nghiêng của đầu
  const s = HEAD_FACE / face.w, d = face.y + face.h * CHIN_AT - cy;
  const chinX = cx - d * Math.sin(tilt), chinY = cy + d * Math.cos(tilt);
  const out = document.createElement('canvas');
  out.width = HEAD_W; out.height = HEAD_H;
  const o = out.getContext('2d')!;
  o.imageSmoothingQuality = 'high';
  o.translate(HEAD_CX, HEAD_CHIN); o.scale(s, s); o.rotate(-tilt);
  o.drawImage(cut, -chinX, -chinY);
  return encode(out);
}
