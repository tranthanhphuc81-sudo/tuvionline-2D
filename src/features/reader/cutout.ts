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

/** Bộ phận để ảnh cử động: `upper` là ảnh gốc có lòng miệng tối dưới đường môi, `jaw` là riêng phần hàm dưới (cắt theo đường môi) đặt đè lên
    đúng chỗ cũ; hạ `jaw` xuống `drop` px là miệng mở. Mí mắt là hình bầu dục màu da cỡ `lid`, tâm ở `eyes` (đã nhích lên so với
    tâm mắt, xem LID_RAISE), mép dưới là hàng mi; hiện thoáng chốc là chớp mắt.
    Toạ độ theo khung ảnh tương ứng (đầu HEAD_W × HEAD_H hoặc người đứng CUT_W × CUT_H). */
export interface TalkRig { mouth: [number, number]; drop: number; eyes: [number, number][]; lid: [number, number]; skin: string; line: string }
export interface TalkParts { upper: string; jaw: string; rig: TalkRig }

type Pt = [number, number];
/** Khuôn mặt tìm được, toạ độ ảnh làm việc. */
interface FaceInfo { box: Box; eyes: Pt[]; mouth: Pt | null; tilt: number }

/** Vùng hàm dưới (0…1): nửa dưới hình bầu dục từ khe môi xuống cằm, mép hai bên mềm, mép trên cắt theo đường môi (`cutY` là độ
    cao đường môi ở cột x, cong theo môi thật). */
export function jawMask(x: number, y: number, cutY: number, mouth: Pt, rx: number, ry: number): number {
  if (y < cutY) return 0;
  const u = (x - mouth[0]) / rx, v = (y - mouth[1]) / ry;
  return 1 - smooth(0.78, 1, u * u + v * v);
}

/** Dò lại độ cao của mắt quanh điểm Face Detector đưa ra (điểm này có khi lệch lên xuống): trong một ô nhỏ quanh điểm, lấy trọng tâm
    các hàng tối hơn hẳn mức chung (lòng đen, hàng mi). Ô nhỏ để không lẫn lông mày; dịch tối đa 4% chiều cao mặt. */
export function refineEye(img: { data: ArrayLike<number>; width: number; height: number }, p: Pt, fw: number, fh: number): Pt {
  const { data: d, width: W, height: H } = img;
  const x0 = Math.max(0, Math.round(p[0] - fw * 0.07)), x1 = Math.min(W - 1, Math.round(p[0] + fw * 0.07));
  const y0 = Math.max(0, Math.round(p[1] - fh * 0.06)), y1 = Math.min(H - 1, Math.round(p[1] + fh * 0.06));
  const rows: [number, number][] = [];
  for (let y = y0; y <= y1; y++) {
    let sum = 0, n = 0;
    for (let x = x0; x <= x1; x++) {
      const i = (y * W + x) * 4;
      if (d[i + 3] < 200) continue;
      sum += 255 - (0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]); n++;
    }
    if (n) rows.push([y, sum / n]);
  }
  if (rows.length < 3) return p;
  const sorted = rows.map((r) => r[1]).sort((a, b) => a - b), base = sorted[Math.floor(sorted.length / 2)];
  let sw = 0, sy = 0;
  for (const [y, v] of rows) { const w = Math.max(0, v - base); sw += w; sy += w * y; }
  if (sw < 1) return p;
  const lim = fh * 0.04;
  return [p[0], p[1] + Math.max(-lim, Math.min(lim, sy / sw - p[1]))];
}

/** Khe miệng thật quanh điểm miệng của Face Detector: khe tối trên cùng trong dải giữa miệng (khe môi khi ngậm, khe giữa hai hàm
    răng khi cười nhe răng), kèm màu lòng miệng lấy ở đó. Điểm của mô hình có khi rơi giữa hàng răng trên; cắt ở đó thì răng bị
    chẻ đôi. Không thấy hàng nào tối hẳn thì giữ điểm cũ và màu lòng miệng mặc định. */
export function findMouthGap(img: { data: ArrayLike<number>; width: number; height: number }, p: Pt, fw: number, fh: number): { y: number; color: [number, number, number] } {
  const { data: d, width: W, height: H } = img;
  // dải hẹp giữa miệng: rộng quá thì lẫn má, khe miệng không còn đủ tương phản
  const x0 = Math.max(0, Math.round(p[0] - fw * 0.08)), x1 = Math.min(W - 1, Math.round(p[0] + fw * 0.08));
  const y0 = Math.max(0, Math.round(p[1] - fh * 0.06)), y1 = Math.min(H - 1, Math.round(p[1] + fh * 0.08));
  const rows: { y: number; lum: number; rgb: [number, number, number] }[] = [];
  for (let y = y0; y <= y1; y++) {
    let l = 0, r = 0, g = 0, b = 0, n = 0;
    for (let x = x0; x <= x1; x++) {
      const i = (y * W + x) * 4;
      if (d[i + 3] < 200) continue;
      l += 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]; r += d[i]; g += d[i + 1]; b += d[i + 2]; n++;
    }
    if (n) rows.push({ y, lum: l / n, rgb: [r / n, g / n, b / n] });
  }
  const fallback = { y: p[1], color: [59, 26, 23] as [number, number, number] };
  if (rows.length < 3) return fallback;
  // Mỗi hàng chấm theo tương phản cục bộ: tối hơn hàng sáng nhất sát bên (±3 hàng) bao nhiêu. Khe dưới hàng răng không tối hơn
  // hẳn mức chung nhưng nằm ngay dưới răng sáng nên nổi bật; vệt bóng dưới môi dưới tối hơn nhưng chỉ cạnh môi và cằm.
  const local = rows.map((r, k) => Math.max(...rows.slice(Math.max(0, k - 3), k + 4).map((q) => q.lum)) - r.lum);
  const best = Math.max(...local);
  if (best < 12) return fallback;
  // Khe miệng là khe TRÊN CÙNG đủ rõ (từ 55% hàng rõ nhất), không nhất thiết rõ nhất: chọn vệt bóng dưới môi dưới thì cả môi
  // dưới đứng yên khi nói.
  const isMin = (k: number) => (k === 0 || rows[k].lum <= rows[k - 1].lum) && (k === rows.length - 1 || rows[k].lum <= rows[k + 1].lum);
  const gap = rows.find((_, k) => local[k] >= best * 0.55 && isMin(k)) ?? rows[local.indexOf(best)];
  // lòng miệng tối hơn hàng đó một chút (hàng đó còn lẫn môi, răng)
  return { y: gap.y, color: gap.rgb.map((v) => v * 0.55) as [number, number, number] };
}

/** Đường môi (khe giữa hai môi, hay khe dưới hàng răng khi cười) theo từng cột: đi từ giữa miệng ra hai bên, mỗi cột lấy điểm tối
    nhất sát điểm của cột trước nên bám theo đường cong của môi (khoé miệng cười cong lên). Hết khe tối rõ là tới khoé miệng; ngoài
    khoé giữ độ cao ở khoé. Làm mượt cho khỏi răng cưa. Trả độ cao đường môi cho mọi cột và hai khoé miệng. */
export function mouthLine(img: { data: ArrayLike<number>; width: number; height: number }, center: Pt, fw: number, fh: number): { at: Float32Array; left: number; right: number } {
  const { data: d, width: W, height: H } = img;
  const lum = (x: number, y: number) => { const i = (y * W + x) * 4; return d[i + 3] < 200 ? null : 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]; };
  const cx = Math.round(center[0]), cy = Math.round(center[1]);
  const half = Math.round(fw * 0.3), step = Math.max(1, Math.round(fh * 0.015)), win = Math.round(fh * 0.06);
  const raw = new Map<number, number>([[cx, cy]]);
  let left = cx, right = cx;
  for (const dir of [-1, 1]) {
    let prev = cy, weak = 0;
    for (let x = cx + dir; Math.abs(x - cx) <= half && x >= 0 && x < W; x += dir) {
      // điểm tối nhất sát điểm cột trước, so với độ sáng chung của cột quanh miệng
      let best = prev, bestL = Infinity;
      for (let y = Math.max(0, prev - step); y <= Math.min(H - 1, prev + step); y++) { const l = lum(x, y); if (l !== null && l < bestL) { bestL = l; best = y; } }
      const col: number[] = [];
      for (let y = Math.max(0, cy - win); y <= Math.min(H - 1, cy + win); y++) { const l = lum(x, y); if (l !== null) col.push(l); }
      col.sort((a, b) => a - b);
      const med = col.length ? col[Math.floor(col.length / 2)] : 0;
      if (!col.length || med - bestL < 12) { if (++weak >= 3) break; } else weak = 0;
      raw.set(x, best); prev = best;
      if (dir < 0) left = x; else right = x;
    }
  }
  // Môi là một đường cong trơn: khớp parabol y = a + b·t + c·t² (t tính từ giữa miệng) qua các điểm dò được, nên ria mép hay nếp da
  // không làm đường cắt răng cưa. Ngoài khoé giữ độ cao ở khoé.
  const fit = fitParabola([...raw].filter(([x]) => x >= left && x <= right).map(([x, y]) => [x - cx, y]));
  const at = new Float32Array(W);
  for (let x = 0; x < W; x++) {
    const t = Math.max(left, Math.min(right, x)) - cx;
    at[x] = (fit ? fit[0] + fit[1] * t + fit[2] * t * t : cy) + 0.5;
  }
  return { at, left, right };
}

/** Khớp parabol y = a + b·t + c·t² theo bình phương nhỏ nhất; ít điểm quá hay suy biến thì null. */
function fitParabola(pts: number[][]): [number, number, number] | null {
  if (pts.length < 5) return null;
  let s0 = 0, s1 = 0, s2 = 0, s3 = 0, s4 = 0, y0 = 0, y1 = 0, y2 = 0;
  for (const [t, y] of pts) { const t2 = t * t; s0++; s1 += t; s2 += t2; s3 += t2 * t; s4 += t2 * t2; y0 += y; y1 += y * t; y2 += y * t2; }
  const det = (m: number[][]) => m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
  const A = [[s0, s1, s2], [s1, s2, s3], [s2, s3, s4]], D = det(A);
  if (Math.abs(D) < 1e-9) return null;
  const col = (k: number) => det(A.map((row, i) => row.map((v, j) => (j === k ? [y0, y1, y2][i] : v))));
  return [col(0) / D, col(1) / D, col(2) / D];
}

/** Ảnh có sẵn hàng răng trên ngay trên đường môi không (cười nhe răng), kèm màu răng: dải sát trên đường môi, phần giữa miệng, đủ
    nhiều điểm sáng và ít màu (răng) thì có; màu răng lấy trung bình các điểm đó. Không có thì màu ngà mặc định. */
export function upperTeeth(img: { data: ArrayLike<number>; width: number; height: number }, lip: { at: ArrayLike<number>; left: number; right: number }, fh: number): { shown: boolean; color: [number, number, number] } {
  const { data: d, width: W } = img;
  const span = lip.right - lip.left, x0 = Math.round(lip.left + span * 0.2), x1 = Math.round(lip.right - span * 0.2);
  const band = Math.max(2, Math.round(fh * 0.05));
  let n = 0, hit = 0, r = 0, g = 0, b = 0;
  for (let x = x0; x <= x1; x++) for (let y = Math.floor(lip.at[x]) - band; y < Math.floor(lip.at[x]); y++) {
    const i = (y * W + x) * 4;
    if (y < 0 || d[i + 3] < 200) continue;
    n++;
    const lum = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2], chroma = Math.max(d[i], d[i + 1], d[i + 2]) - Math.min(d[i], d[i + 1], d[i + 2]);
    if (lum > 165 && chroma < 60) { hit++; r += d[i]; g += d[i + 1]; b += d[i + 2]; }
  }
  return n && hit / n > 0.3 ? { shown: true, color: [r / hit, g / hit, b / hit] } : { shown: false, color: [233, 227, 213] };
}

/** Răng vẽ trong lòng miệng (0…1) tại điểm cách đường môi `rel` lần độ mở tối đa, `u` là vị trí ngang (−1…1 giữa hai khoé răng):
    răng dưới nằm ở đáy khe (lộ ra khi miệng mở rộng, như đỉnh răng nhô trên môi dưới); răng trên ở mép trên khe, chỉ khi ảnh chưa
    có sẵn răng trên. Hai đầu hàng răng thu lại trước khoé miệng. */
export function teethAt(rel: number, u: number, upperShown: boolean): number {
  const across = 1 - smooth(0.55, 1, u * u);
  const lower = smooth(0.6, 0.72, rel) * (1 - smooth(1.1, 1.2, rel));
  const upper = upperShown ? 0 : 1 - smooth(0.2, 0.32, rel);
  return Math.max(lower, upper) * across;
}

/** Chỗ đặt mí mắt (tâm hình bầu dục) so với tâm mắt: nhích lên để mí phủ cả bờ mi trên, mép dưới (hàng mi khi nhắm) nằm hơi dưới
    tâm mắt như mắt nhắm thật, không tràn xuống bọng mắt. Tính theo chiều cao mí. */
export const LID_RAISE = 0.22;

const hex = (r: number, g: number, b: number) => '#' + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
const round1 = (p: Pt): Pt => [Math.round(p[0] * 10) / 10, Math.round(p[1] * 10) / 10];

/** Tách hàm và lấy chỗ đặt mí mắt từ ảnh đã cắt. `fw`/`fh`: cỡ khuôn mặt trên ảnh này; mặt quá nhỏ thì không làm. */
function talkParts(c: HTMLCanvasElement, eyes: Pt[], kp: Pt, chinY: number, fw: number, fh: number): TalkParts | null {
  if (fw < 24 || eyes.length < 2) return null;
  // Điểm miệng của Face Detector hay lệch ngang; mặt nhìn thẳng thì tâm miệng nằm dưới giữa hai mắt.
  const W = c.width, H = c.height;
  const d = c.getContext('2d')!.getImageData(0, 0, W, H).data;
  const mx = (eyes[0][0] + eyes[1][0]) / 2;
  // cắt hàm đúng khe miệng thật (khe môi hoặc khe giữa hai hàm răng)
  const gap = findMouthGap({ data: d, width: W, height: H }, [mx, kp[1]], fw, fh);
  const mouth: Pt = [mx, gap.y + 0.5];
  // đường cắt cong theo môi thật, không thẳng băng
  const lip = mouthLine({ data: d, width: W, height: H }, [mx, gap.y], fw, fh);
  // màu da: trung bình hai mảng má cạnh mũi
  let r = 0, g = 0, b = 0, n = 0;
  const rad = Math.max(2, Math.round(fw * 0.05));
  for (const side of [-1, 1]) {
    const px = Math.round(mouth[0] + side * fw * 0.28), py = Math.round(mouth[1] - fh * 0.14);
    for (let y = py - rad; y <= py + rad; y++) for (let x = px - rad; x <= px + rad; x++) {
      if (x < 0 || y < 0 || x >= W || y >= H) continue;
      const i = (y * W + x) * 4;
      if (d[i + 3] < 200) continue;
      r += d[i]; g += d[i + 1]; b += d[i + 2]; n++;
    }
  }
  const [sr, sg, sb] = n ? [r / n, g / n, b / n] : [217, 168, 138];
  const rx = fw * 0.3, ry = Math.max(chinY - mouth[1], fh * 0.22) * 1.08;
  // Lúc ngậm, hàm đè lên phải trùng khít ảnh gốc: chỉ tô lòng miệng ở phần hàm đặc hẳn; ở mép mềm ảnh dưới giữ nguyên ảnh gốc,
  // nên trộn với hàm vẫn ra đúng ảnh gốc, không lộ đường viền. Ngoài lòng miệng cũng giữ ảnh gốc (không tô màu da phẳng): hạ hàm
  // xuống thì hai bên chỉ lộ thớ da thật, không thành một dải màu trơn.
  const up = new ImageData(new Uint8ClampedArray(d), W, H), jaw = new ImageData(new Uint8ClampedArray(d), W, H);
  // lòng miệng rộng đúng tới hai khoé miệng thật
  const hx = Math.max(fw * 0.15, (lip.right - lip.left) / 2 + 1), hy = fh * 0.1, [cr, cg, cb] = gap.color;
  const hcx = (lip.left + lip.right) / 2;
  // răng: răng dưới luôn vẽ ở đáy khe, răng trên chỉ vẽ khi ảnh chưa có (miệng ngậm); răng trong miệng tối hơn răng ngoài sáng
  const teeth = upperTeeth({ data: d, width: W, height: H }, lip, fh), drop = fh * 0.08;
  // ảnh chưa có răng thì lấy màu răng từ màu da sáng lên (ảnh tối, ảnh đen trắng thì răng cũng theo, không trắng chói)
  const base = teeth.shown ? teeth.color : [sr, sg, sb].map((v) => v + (255 - v) * 0.55);
  const [tr, tg, tb] = base.map((v, k) => v * 0.78 + gap.color[k] * 0.22);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const cut = lip.at[x];
    const m = jawMask(x, y, cut, mouth, rx, ry);
    const i = (y * W + x) * 4;
    jaw.data[i + 3] = Math.round(d[i + 3] * m);
    if (m < 0.999) continue;
    // lòng miệng ôm theo đường môi, đậm ở giữa, nhạt dần về hai khoé thành ảnh gốc
    const u = (x - hcx) / hx, v = (y - cut) / hy, t = 1 - smooth(0.45, 1, u * u + v * v);
    // chừa 1 px ngay dưới đường cắt: mép hàm khi phóng to bị làm mềm, vẽ gì ở đó cũng lộ thành vệt lúc ngậm
    if (t <= 0 || y - cut < 1) continue;
    const w = teethAt((y - cut) / drop, (x - hcx) / (hx * 0.85), teeth.shown);
    const fr = cr + (tr - cr) * w, fg = cg + (tg - cg) * w, fb = cb + (tb - cb) * w;
    up.data[i] += (fr - up.data[i]) * t; up.data[i + 1] += (fg - up.data[i + 1]) * t; up.data[i + 2] += (fb - up.data[i + 2]) * t;
  }
  const draw = (img: ImageData, quality?: number) => {
    const o = document.createElement('canvas');
    o.width = W; o.height = H;
    o.getContext('2d')!.putImageData(img, 0, 0);
    return encode(o, quality);
  };
  // mí mắt: dò lại tâm mắt trên ảnh gốc (trước khi tô), rồi nhích lên theo LID_RAISE
  const lid: Pt = [fw * 0.2, fh * 0.1];
  const lids = eyes.slice(0, 2).map((e) => { const [x, y] = refineEye({ data: d, width: W, height: H }, e, fw, fh); return round1([x, y - lid[1] * LID_RAISE]); });
  return {
    upper: draw(up), jaw: draw(jaw, 1),
    rig: { mouth: round1(mouth), drop: Math.round(drop * 10) / 10, eyes: lids, lid: round1(lid), skin: hex(sr, sg, sb), line: hex(sr * 0.6, sg * 0.55, sb * 0.55) },
  };
}

export interface ReaderCut { stand: string | null; head: string | null; standTalk: TalkParts | null; headTalk: TalkParts | null }

/** Cắt ảnh người dùng thành hai bản: người đứng tự do và cái đầu để ghép, kèm bộ phận cử động (hàm, mí mắt) nếu thấy rõ mặt.
    Ảnh là data URL WebP (máy không có WebP thì PNG; đều giữ nền trong suốt), bản nào không làm được thì null. */
export async function cutOutReader(bmp: ImageBitmap): Promise<ReaderCut> {
  const out: ReaderCut = { stand: null, head: null, standTalk: null, headTalk: null };
  const k = Math.min(1, WORK / Math.max(bmp.width, bmp.height));
  const w = Math.max(1, Math.round(bmp.width * k)), h = Math.max(1, Math.round(bmp.height * k));
  const work = document.createElement('canvas');
  work.width = w; work.height = h;
  const ctx = work.getContext('2d', { willReadFrequently: true });
  if (!ctx) return out;
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

  const face = await findFace(work).catch(() => null);
  if (alpha && box) {
    const src = box, st = standImage(pixels, alpha, src);
    out.stand = encode(st.canvas);
    if (face?.mouth) {
      const sx = st.dst.w / src.w, sy = st.dst.h / src.h;
      const map = (p: Pt): Pt => [st.dst.x + (p[0] - src.x) * sx, st.dst.y + (p[1] - src.y) * sy];
      out.standTalk = talkParts(st.canvas, face.eyes.map(map), map(face.mouth), map([0, face.box.y + face.box.h * CHIN_AT])[1], face.box.w * sx, face.box.h * sy);
    }
  }
  if (face) {
    const hd = headImage(pixels, alpha, face);
    out.head = encode(hd.canvas);
    if (face.mouth) out.headTalk = talkParts(hd.canvas, face.eyes.map(hd.map), hd.map(face.mouth), HEAD_CHIN, HEAD_FACE, (HEAD_FACE * face.box.h) / face.box.w);
  }
  return out;
}

/** `quality` 1 là WebP không mất dữ liệu: dùng cho ảnh hàm, để độ trong suốt ở mép khớp đúng ảnh dưới (nén có mất dữ liệu làm
    lộ đường viền quanh hàm lúc ngậm). */
function encode(c: HTMLCanvasElement, quality = 0.9): string {
  const url = c.toDataURL('image/webp', quality);
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

function standImage(pixels: ImageData, alpha: Uint8ClampedArray, src: Box): { canvas: HTMLCanvasElement; dst: Box } {
  const cut = withAlpha(pixels, (i) => alpha[i]);
  const dst = fitBox(src);
  const out = document.createElement('canvas');
  out.width = CUT_W; out.height = CUT_H;
  const o = out.getContext('2d')!;
  o.imageSmoothingQuality = 'high';
  o.drawImage(cut, src.x, src.y, src.w, src.h, dst.x, dst.y, dst.w, dst.h);
  return { canvas: out, dst };
}

/** Khuôn mặt lớn nhất trong ảnh, kèm hai mắt, miệng (điểm 0, 1, 3 của Face Detector) và độ nghiêng đầu theo hai mắt. */
async function findFace(work: HTMLCanvasElement): Promise<FaceInfo | null> {
  const faces = await loadFaces();
  const found = faces.detect(work).detections.filter((d) => d.boundingBox).sort((a, b) => b.boundingBox!.width * b.boundingBox!.height - a.boundingBox!.width * a.boundingBox!.height)[0];
  const bb = found?.boundingBox;
  if (!bb || bb.width < 24) return null;
  const px = (i: number): Pt | null => { const p = found.keypoints[i]; return p ? [p.x * work.width, p.y * work.height] : null; };
  const e0 = px(0), e1 = px(1);
  const angle = e0 && e1 ? Math.atan2(e1[1] - e0[1], e1[0] - e0[0]) : 0;
  return { box: { x: bb.originX, y: bb.originY, w: bb.width, h: bb.height }, eyes: e0 && e1 ? [e0, e1] : [], mouth: px(3), tilt: Math.abs(angle) < 0.6 ? angle : 0 };
}

function headImage(pixels: ImageData, alpha: Uint8ClampedArray | null, info: FaceInfo): { canvas: HTMLCanvasElement; map: (p: Pt) => Pt } {
  const w = pixels.width, face = info.box, tilt = info.tilt;
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
  // cùng phép biến đổi như trên, cho từng điểm (mắt, miệng)
  const c = Math.cos(tilt), sn = Math.sin(tilt);
  const map = (p: Pt): Pt => { const dx = p[0] - chinX, dy = p[1] - chinY; return [HEAD_CX + s * (dx * c + dy * sn), HEAD_CHIN + s * (-dx * sn + dy * c)]; };
  return { canvas: out, map };
}
