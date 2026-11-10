/* Số đo lấy từ bản đồ rãnh của ảnh, cho các câu máy tự trả lời được: nét Sinh đạo rõ hay mờ (Q18), bàn tay ít hay nhiều chỉ nhỏ (Q32).
   Hàm thuần trên mảng số (không cần canvas) để kiểm thử được. Ngưỡng đánh giá nằm ở src/core/palm/measure.ts. */
import { SIZE, type Pt } from './types';

/** Độ đậm trung bình của rãnh dọc một nét, lấy chỗ rõ nhất trong ô 3×3 quanh mỗi điểm vì điểm chạm có thể lệch 1 px. */
export function lineStrength(ridge: Float32Array, pts: readonly Pt[], n = SIZE): number {
  if (!pts.length) return 0;
  let sum = 0;
  for (const p of pts) {
    const x = Math.round(p.x), y = Math.round(p.y);
    let best = 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const xx = x + dx, yy = y + dy;
      if (xx >= 0 && yy >= 0 && xx < n && yy < n) best = Math.max(best, ridge[yy * n + xx]);
    }
    sum += best;
  }
  return sum / pts.length;
}

const inside = (poly: readonly Pt[], x: number, y: number) => {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i], b = poly[j];
    if ((a.y > y) !== (b.y > y) && x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x) c = !c;
  }
  return c;
};

/** Mức rãnh rõ của chính lòng bàn tay (phân vị 98 trong vùng lòng bàn tay): ảnh mờ hay nét, nền vải hay nền trơn đều so được với nhau.
    Không dùng mức của cả ảnh vì nền và mép tay thường có rãnh mạnh hơn đường chỉ. */
export function palmScale(ridge: Float32Array, landmarks: readonly Pt[], n = SIZE): number {
  const poly = [0, 1, 5, 9, 13, 17].map((i) => landmarks[i]);
  const xs = poly.map((p) => p.x), ys = poly.map((p) => p.y), v: number[] = [];
  for (let y = Math.max(0, Math.floor(Math.min(...ys))); y < Math.min(n, Math.ceil(Math.max(...ys))); y += 2) {
    for (let x = Math.max(0, Math.floor(Math.min(...xs))); x < Math.min(n, Math.ceil(Math.max(...xs))); x += 2) if (inside(poly, x, y)) v.push(ridge[y * n + x]);
  }
  if (!v.length) return 1;
  v.sort((a, b) => a - b);
  return v[Math.floor(v.length * 0.98)] || 1;
}

/** Tỉ lệ điểm ảnh có rãnh nhỏ trong lòng bàn tay, không tính dải quanh 4 đường chính và mép bàn tay.
    `landmarks`: 21 điểm khớp; vùng lòng bàn tay là đa giác qua các khớp 0, 1, 5, 9, 13, 17, co vào `edge` px. */
export function minorDensity(ridge: Float32Array, landmarks: readonly Pt[], lines: readonly Pt[], n = SIZE, opts = { level: 0.35, around: 10, edge: 14 }): number {
  const poly = [0, 1, 5, 9, 13, 17].map((i) => landmarks[i]);
  const near = new Uint8Array(n * n);
  const r = opts.around;
  for (const p of lines) {
    const x0 = Math.round(p.x), y0 = Math.round(p.y);
    for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
      const x = x0 + dx, y = y0 + dy;
      if (dx * dx + dy * dy <= r * r && x >= 0 && y >= 0 && x < n && y < n) near[y * n + x] = 1;
    }
  }
  const distEdge = (x: number, y: number) => {
    let m = Infinity;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const a = poly[j], b = poly[i], vx = b.x - a.x, vy = b.y - a.y, l2 = vx * vx + vy * vy || 1;
      const t = Math.max(0, Math.min(1, ((x - a.x) * vx + (y - a.y) * vy) / l2));
      m = Math.min(m, Math.hypot(x - a.x - t * vx, y - a.y - t * vy));
    }
    return m;
  };
  const xs = poly.map((p) => p.x), ys = poly.map((p) => p.y);
  let total = 0, hit = 0;
  // Lấy mẫu cách 2 px cho nhanh
  for (let y = Math.max(0, Math.floor(Math.min(...ys))); y < Math.min(n, Math.ceil(Math.max(...ys))); y += 2) {
    for (let x = Math.max(0, Math.floor(Math.min(...xs))); x < Math.min(n, Math.ceil(Math.max(...xs))); x += 2) {
      if (near[y * n + x] || !inside(poly, x, y) || distEdge(x, y) < opts.edge) continue;
      total++;
      if (ridge[y * n + x] >= opts.level) hit++;
    }
  }
  return total ? hit / total : 0;
}
