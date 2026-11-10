/* Phần xử lý ảnh dùng chung cho trang chấm và trang thử trên điện thoại. */
import { SIZE, type Pt } from './types';

/** Đưa ảnh về khung chuẩn bằng 3 điểm cố định: cổ tay, gốc ngón trỏ, gốc ngón út. Ba điểm này cũng tự lật tay trái và tay phải về một hướng. */
export const WRIST: Pt = { x: 0.5, y: 0.95 }, INDEX: Pt = { x: 0.2, y: 0.1 }, PINKY: Pt = { x: 0.85, y: 0.18 };

export function affine(src: Pt[], dst: Pt[]) {
  const [a, b, c] = src, [d, e, f] = dst;
  const det = (b.x - a.x) * (c.y - a.y) - (c.x - a.x) * (b.y - a.y);
  const m = {
    a: ((e.x - d.x) * (c.y - a.y) - (f.x - d.x) * (b.y - a.y)) / det,
    c: ((f.x - d.x) * (b.x - a.x) - (e.x - d.x) * (c.x - a.x)) / det,
    b: ((e.y - d.y) * (c.y - a.y) - (f.y - d.y) * (b.y - a.y)) / det,
    d: ((f.y - d.y) * (b.x - a.x) - (e.y - d.y) * (c.x - a.x)) / det,
    e: 0, f: 0,
  };
  m.e = d.x - m.a * a.x - m.c * a.y;
  m.f = d.y - m.b * a.x - m.d * a.y;
  return m;
}

/* Khung chuẩn ép 3 điểm khớp về vị trí cố định nên làm méo bàn tay: chỉ dùng để máy dò đường.
   Khung xem chỉ xoay, thu phóng và lật, giữ nguyên hình dáng bàn tay. Người dùng kéo nét và mọi số đo sau chỉnh đều nằm trên khung này. */
export function viewMatrix(wrist: Pt, middle: Pt, index: Pt, pinky: Pt, wristY = 0.93, middleY = 0.27) {
  const len = Math.hypot(middle.x - wrist.x, middle.y - wrist.y);
  const u = { x: (middle.x - wrist.x) / len, y: (middle.y - wrist.y) / len }, n = { x: -u.y, y: u.x };
  const side = (p: Pt) => (p.x - wrist.x) * n.x + (p.y - wrist.y) * n.y;
  const flip = side(index) < side(pinky) ? 1 : -1; // luôn để ngón trỏ bên trái, ngón cái bên trái
  const k = ((wristY - middleY) * SIZE) / len;
  const a = flip * k * n.x, c = flip * k * n.y, b = -k * u.x, d = -k * u.y;
  return { a, b, c, d, e: SIZE / 2 - a * wrist.x - c * wrist.y, f: wristY * SIZE - b * wrist.x - d * wrist.y };
}
export type Matrix = ReturnType<typeof viewMatrix>;
export const apply = (m: Matrix, p: Pt): Pt => ({ x: m.a * p.x + m.c * p.y + m.e, y: m.b * p.x + m.d * p.y + m.f });
export function invert(m: Matrix): Matrix {
  const det = m.a * m.d - m.b * m.c;
  const r = { a: m.d / det, b: -m.b / det, c: -m.c / det, d: m.a / det, e: 0, f: 0 };
  r.e = -(r.a * m.e + r.c * m.f);
  r.f = -(r.b * m.e + r.d * m.f);
  return r;
}

export function palmMask(ctx: CanvasRenderingContext2D, pts: Pt[]): Uint8Array {
  const c = new OffscreenCanvas(SIZE, SIZE), g = c.getContext('2d', { willReadFrequently: true })!;
  g.fillStyle = '#fff';
  g.beginPath();
  pts.forEach((p, i) => (i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y)));
  g.closePath();
  g.fill();
  const data = g.getImageData(0, 0, SIZE, SIZE).data, raw = new Uint8Array(SIZE * SIZE);
  for (let i = 0; i < raw.length; i++) raw[i] = data[i * 4 + 3] > 128 ? 1 : 0;
  void ctx;
  // Co vào 10px để mép bàn tay không bị nhầm là đường chỉ
  const out = new Uint8Array(raw.length), r = 10;
  for (let y = r; y < SIZE - r; y++) for (let x = r; x < SIZE - r; x++) {
    let all = 1;
    for (const [dx, dy] of [[r, 0], [-r, 0], [0, r], [0, -r], [7, 7], [-7, 7], [7, -7], [-7, -7]]) if (!raw[(y + dy) * SIZE + x + dx]) { all = 0; break; }
    out[y * SIZE + x] = all;
  }
  return out;
}

export async function loadBitmap(src: Blob): Promise<ImageBitmap> {
  const raw = await createImageBitmap(src, { imageOrientation: 'from-image' });
  const k = Math.min(1, 1600 / Math.max(raw.width, raw.height));
  return k === 1 ? raw : createImageBitmap(raw, { resizeWidth: Math.round(raw.width * k), resizeHeight: Math.round(raw.height * k), resizeQuality: 'high' });
}

