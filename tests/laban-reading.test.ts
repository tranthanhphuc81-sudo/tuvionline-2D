/* Phần tính toán La Bàn (src/core/laban/reading.ts). Câu chữ kiểm ở tests/parity/laban.test.ts. */
import { describe, it, expect } from 'vitest';
import { angleFromCenter, batTrachReading, compassTrust, laBanSectors, normDeg, sectorOf, smoothHeading } from '../src/core';

const gap = (a: number, b: number) => { const d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; };

describe('cung la bàn', () => {
  const sectors = laBanSectors(null);
  it('8 cung, mỗi cung cách 45°, đúng Hậu Thiên', () => {
    expect(sectors.map((s) => s.bearing)).toEqual([0, 45, 90, 135, 180, 225, 270, 315]);
    expect(sectors.map((s) => s.quai)).toEqual(['Khảm', 'Cấn', 'Chấn', 'Tốn', 'Ly', 'Khôn', 'Đoài', 'Càn']);
  });
  it('biên cung và mốc 360°', () => {
    expect(sectorOf(22, sectors).huong).toBe('Bắc');
    expect(sectorOf(23, sectors).huong).toBe('Đông Bắc');
    expect(sectorOf(337, sectors).huong).toBe('Tây Bắc');
    expect(sectorOf(338, sectors).huong).toBe('Bắc');
    expect(sectorOf(359.9, sectors).huong).toBe('Bắc');
    expect(sectorOf(-10, sectors).huong).toBe('Bắc');
  });
  it('có Mệnh Quái thì đủ 8 sao, 4 tốt 4 xấu', () => {
    const s = laBanSectors(batTrachReading({ dd: 15, mm: 6, yy: 1988 }, 'M').dn);
    expect(s.filter((x) => x.star?.good).length).toBe(4);
    expect(s.filter((x) => x.star && !x.star.good).length).toBe(4);
  });
});

describe('góc chạm', () => {
  it('trên 0°, phải 90°, dưới 180°, trái 270°', () => {
    expect([angleFromCenter(0, -1), angleFromCenter(1, 0), angleFromCenter(0, 1), angleFromCenter(-1, 0)]).toEqual([0, 90, 180, 270]);
  });
});

describe('lọc nhiễu', () => {
  it('lần đầu lấy nguyên giá trị', () => { expect(smoothHeading(null, 370)).toBe(10); });
  it('đi đường ngắn qua 0°, không quay ngược qua 180°', () => {
    const v = smoothHeading(350, 10);
    expect(gap(v, 355)).toBeLessThan(0.1);
  });
  it('hội tụ về giá trị mới trong khoảng 1 giây ở 15 lần/giây', () => {
    let h: number | null = 0;
    for (let i = 0; i < 15; i++) h = smoothHeading(h, 90);
    expect(gap(h!, 90)).toBeLessThan(5);
  });
  it('dập nhiễu ±5° còn dưới ±2°', () => {
    let h: number | null = 100;
    let max = 0;
    for (let i = 0; i < 200; i++) { h = smoothHeading(h, 100 + (i % 2 ? 5 : -5)); max = Math.max(max, gap(h, 100)); }
    expect(max).toBeLessThan(2);
  });
  it('normDeg đưa về 0…360', () => { expect([normDeg(-1), normDeg(361), normDeg(720)]).toEqual([359, 1, 0]); });
});

describe('độ tin cậy', () => {
  it('không biết thì coi là ổn; thấp hoặc sai số lớn thì cần hiệu chỉnh', () => {
    expect(compassTrust(null, null)).toBe('ok');
    expect(compassTrust(3, 5)).toBe('ok');
    expect(compassTrust(2, null)).toBe('ok');
    expect(compassTrust(1, null)).toBe('calibrate');
    expect(compassTrust(0, 1)).toBe('calibrate');
    expect(compassTrust(-1, null)).toBe('calibrate');
    expect(compassTrust(3, 20)).toBe('calibrate');
  });

  it('từ trường bất thường: báo nhiễu dù cảm biến tự báo độ tin cậy cao', () => {
    expect(compassTrust(3, 2, 45)).toBe('ok');
    expect(compassTrust(3, 2, 25)).toBe('ok');
    expect(compassTrust(3, 2, 65)).toBe('ok');
    expect(compassTrust(3, 2, 66)).toBe('interference');
    expect(compassTrust(3, 2, 24)).toBe('interference');
    expect(compassTrust(3, null, 300)).toBe('interference');
    expect(compassTrust(0, 20, 300)).toBe('interference');
  });
});
