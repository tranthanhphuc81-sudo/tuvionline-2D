import { describe, it, expect } from 'vitest';
import { lineStrength, minorDensity } from './ridgeStats';

const N = 64;
const grid = () => new Float32Array(N * N);
const lm = Array.from({ length: 21 }, () => ({ x: 32, y: 32 }));
// Lòng bàn tay là hình vuông 4…60: khớp 0, 1 ở hai góc dưới, 5, 9, 13, 17 dọc cạnh trên
Object.assign(lm, { 0: { x: 60, y: 60 }, 1: { x: 4, y: 60 }, 5: { x: 4, y: 4 }, 9: { x: 24, y: 4 }, 13: { x: 40, y: 4 }, 17: { x: 60, y: 4 } });

describe('Số đo từ bản đồ rãnh', () => {
  it('độ đậm nét: lấy chỗ rõ nhất quanh mỗi điểm, chạm lệch 1 px vẫn đúng', () => {
    const r = grid();
    for (let x = 0; x < N; x++) r[20 * N + x] = 0.8;
    expect(lineStrength(r, [{ x: 10, y: 20 }, { x: 30, y: 21 }], N)).toBeCloseTo(0.8);
    expect(lineStrength(r, [{ x: 10, y: 40 }], N)).toBe(0);
    expect(lineStrength(r, [], N)).toBe(0);
  });

  it('mật độ chỉ nhỏ: không tính quanh đường chính và mép tay', () => {
    const opts = { level: 0.35, around: 4, edge: 3 };
    const r = grid();
    expect(minorDensity(r, lm, [], N, opts)).toBe(0);
    // Một vạch rãnh ngang giữa lòng bàn tay
    for (let x = 0; x < N; x++) r[30 * N + x] = 0.9;
    const some = minorDensity(r, lm, [], N, opts);
    expect(some).toBeGreaterThan(0);
    // Vạch đó chính là một đường chính đã chạm → không còn tính
    expect(minorDensity(r, lm, Array.from({ length: N }, (_, x) => ({ x, y: 30 })), N, opts)).toBe(0);
    r.fill(0.9);
    expect(minorDensity(r, lm, [], N, opts)).toBe(1);
  });
});
