/* Bản đồ rãnh: chỗ nào trên ảnh là một nét tối mảnh như đường chỉ tay. Chép từ bản thử đã kiểm chứng (spike/chitay/lines.ts), bỏ phần máy tự dò đường. */

function blur(src: Float32Array, n: number, r: number): Float32Array {
  const a = src.slice(), b = new Float32Array(src.length);
  const w = 2 * r + 1;
  for (let pass = 0; pass < 3; pass++) {
    for (let y = 0; y < n; y++) {
      let s = 0;
      for (let x = -r; x <= r; x++) s += a[y * n + Math.min(n - 1, Math.max(0, x))];
      for (let x = 0; x < n; x++) {
        b[y * n + x] = s / w;
        s += a[y * n + Math.min(n - 1, x + r + 1)] - a[y * n + Math.max(0, x - r)];
      }
    }
    for (let x = 0; x < n; x++) {
      let s = 0;
      for (let y = -r; y <= r; y++) s += b[Math.min(n - 1, Math.max(0, y)) * n + x];
      for (let y = 0; y < n; y++) {
        a[y * n + x] = s / w;
        s += b[Math.min(n - 1, y + r + 1) * n + x] - b[Math.max(0, y - r) * n + x];
      }
    }
  }
  return a;
}

function percentile(values: number[], p: number): number {
  if (!values.length) return 1;
  const s = values.slice().sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.floor(s.length * p))];
}

/** Đường chỉ là rãnh tối: đo độ cong lớn nhất của độ sáng ở nhiều bề rộng. Kênh xanh lá cho rãnh tương phản tốt nhất trên da. */
export function ridgeMap(gray: Float32Array, mask: Uint8Array, n: number): Float32Array {
  const out = new Float32Array(n * n);
  const scales: readonly (readonly [number, number])[] = [[2, 3], [3, 5], [4, 7]];
  for (const [r, h] of scales) {
    const g = blur(gray, n, r);
    for (let y = h; y < n - h; y++) for (let x = h; x < n - h; x++) {
      if (!mask[y * n + x]) continue;
      const c = g[y * n + x], l = g[y * n + x - h], rr = g[y * n + x + h], u = g[(y - h) * n + x], d = g[(y + h) * n + x];
      const xx = l + rr - 2 * c, yy = u + d - 2 * c;
      const xy = (g[(y + h) * n + x + h] + g[(y - h) * n + x - h] - g[(y + h) * n + x - h] - g[(y - h) * n + x + h]) / 4;
      const v = 0.5 * (xx + yy + Math.sqrt((xx - yy) ** 2 + 4 * xy * xy));
      if (v > out[y * n + x]) {
        out[y * n + x] = v;
      }
    }
  }
  const sample: number[] = [];
  for (let i = 0; i < out.length; i += 3) if (mask[i]) sample.push(out[i]);
  const top = percentile(sample, 0.99) || 1;
  for (let i = 0; i < out.length; i++) out[i] = Math.min(1, out[i] / top);
  return out;
}
