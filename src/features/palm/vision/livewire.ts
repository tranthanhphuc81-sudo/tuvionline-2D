/* Bám rãnh giữa hai điểm người dùng chạm: tìm đường đi rẻ nhất trên bản đồ rãnh, rãnh càng rõ đi càng rẻ.
   Người chỉ ra đầu, cuối và chỗ khó; máy lo phần bám theo nét ở giữa. */
import { ridgeMap } from './ridge';
import { SIZE, type Pt } from './types';

/** Các hệ số bám rãnh, để thử trên đường chuẩn (`window.__tap`). */
export const TAP = { base: 0.08, k: 1, pow: 2, margin: 0.35, minMargin: 28 };

/** Bản đồ rãnh của ảnh đang hiện (khung xem), 0…1. */
export function viewRidge(canvas: HTMLCanvasElement): Float32Array {
  const img = canvas.getContext('2d', { willReadFrequently: true })!.getImageData(0, 0, SIZE, SIZE);
  const gray = new Float32Array(SIZE * SIZE);
  for (let i = 0; i < gray.length; i++) gray[i] = img.data[i * 4 + 1];
  return ridgeMap(gray, new Uint8Array(SIZE * SIZE).fill(1), SIZE);
}

/** Lưới thô hơn ảnh một nửa: đủ bám rãnh mà nhanh gấp 4 lần, cần cho điện thoại. */
const CELL = 2;

/** Đường rẻ nhất từ a tới b (Dijkstra 8 hướng trên lưới CELL px), chỉ tìm trong khung quanh hai điểm cho nhanh. */
export function route(ridge: Float32Array, a: Pt, b: Pt): Pt[] {
  const n = SIZE, g = n / CELL;
  const len = Math.hypot(b.x - a.x, b.y - a.y);
  const pad = Math.max(TAP.minMargin, len * TAP.margin) / CELL;
  const ax = a.x / CELL, ay = a.y / CELL, bx = b.x / CELL, by = b.y / CELL;
  const x0 = Math.max(0, Math.floor(Math.min(ax, bx) - pad)), x1 = Math.min(g - 1, Math.ceil(Math.max(ax, bx) + pad));
  const y0 = Math.max(0, Math.floor(Math.min(ay, by) - pad)), y1 = Math.min(g - 1, Math.ceil(Math.max(ay, by) + pad));
  const w = x1 - x0 + 1, h = y1 - y0 + 1, size = w * h;
  const cell = (x: number, y: number) => (Math.min(y1, Math.max(y0, Math.round(y))) - y0) * w + (Math.min(x1, Math.max(x0, Math.round(x))) - x0);
  const start = cell(ax, ay), goal = cell(bx, by);
  // Giá mỗi ô: lấy rãnh rõ nhất trong ô CELL×CELL
  const cost = new Float32Array(size);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let r = 0;
    for (let dy = 0; dy < CELL; dy++) for (let dx = 0; dx < CELL; dx++) r = Math.max(r, ridge[((y0 + y) * CELL + dy) * n + (x0 + x) * CELL + dx]);
    cost[y * w + x] = TAP.base + TAP.k * (1 - r) ** TAP.pow;
  }
  // Float64: lưu khoảng cách bằng Float32 bị làm tròn, khiến một ô bị bỏ qua hoặc xét lại mãi và chạy rất chậm
  const dist = new Float64Array(size).fill(Infinity), prev = new Int32Array(size).fill(-1);
  // Đống nhị phân trên mảng số, không tạo đối tượng mới, để chạy nhanh trên điện thoại
  let cap = 1 << 14, heapD = new Float64Array(cap), heapI = new Int32Array(cap), count = 0;
  const push = (d: number, i: number) => {
    if (count === cap) { cap *= 2; const nd = new Float64Array(cap); nd.set(heapD); heapD = nd; const ni = new Int32Array(cap); ni.set(heapI); heapI = ni; }
    let k = count++;
    while (k > 0) {
      const p = (k - 1) >> 1;
      if (heapD[p] <= d) break;
      heapD[k] = heapD[p]; heapI[k] = heapI[p]; k = p;
    }
    heapD[k] = d; heapI[k] = i;
  };
  const pop = () => {
    const top = heapI[0];
    const d = heapD[--count], i = heapI[count];
    let k = 0;
    for (;;) {
      let c = 2 * k + 1;
      if (c >= count) break;
      if (c + 1 < count && heapD[c + 1] < heapD[c]) c++;
      if (heapD[c] >= d) break;
      heapD[k] = heapD[c]; heapI[k] = heapI[c]; k = c;
    }
    heapD[k] = d; heapI[k] = i;
    return top;
  };
  dist[start] = 0;
  push(0, start);
  const DX = [1, -1, 0, 0, 1, 1, -1, -1], DY = [0, 0, 1, -1, 1, -1, 1, -1], STEP = [1, 1, 1, 1, Math.SQRT2, Math.SQRT2, Math.SQRT2, Math.SQRT2];
  while (count) {
    const d = heapD[0], i = pop();
    if (d > dist[i]) continue;
    if (i === goal) break;
    const x = i % w, y = (i - x) / w;
    for (let m = 0; m < 8; m++) {
      const nx = x + DX[m], ny = y + DY[m];
      if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
      const j = ny * w + nx, nd = d + STEP[m] * cost[j];
      if (nd < dist[j]) { dist[j] = nd; prev[j] = i; push(nd, j); }
    }
  }
  const out: Pt[] = [];
  for (let i = goal; i >= 0; i = prev[i]) {
    out.push({ x: (x0 + (i % w)) * CELL + CELL / 2, y: (y0 + Math.floor(i / w)) * CELL + CELL / 2 });
    if (i === start) break;
  }
  out.reverse();
  // Giữ đúng điểm người chạm ở hai đầu
  return [a, ...out.slice(1, -1), b];
}

/** Bộ bám có nhớ, để vẽ lại không phải tính lại các đoạn không đổi. */
export function makeRouter(ridge: Float32Array): (a: Pt, b: Pt) => Pt[] {
  const memo = new Map<string, Pt[]>();
  return (a, b) => {
    const key = `${Math.round(a.x)},${Math.round(a.y)},${Math.round(b.x)},${Math.round(b.y)}`;
    let r = memo.get(key);
    if (!r) {
      r = route(ridge, a, b);
      if (memo.size > 400) memo.clear();
      memo.set(key, r);
    }
    return r;
  };
}
