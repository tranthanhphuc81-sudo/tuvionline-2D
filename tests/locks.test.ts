/* Khoá các "bẫy khi gộp code" (ARCHITECTURE.md mục 5.3) và Mệnh Quái — phải xanh với engine JS gốc,
   và giữ xanh sau khi gộp/chuyển sang TypeScript. */
import { describe, it, expect } from 'vitest';
import { TuViEngine, BatTuEngine, LucHaoEngine, PhongThuyEngine } from '../src/core';

describe('Mệnh Quái (Bát Trạch) so với công thức độc lập, 2 giới × 100 năm', () => {
  const NAME: Record<number, string> = { 1: 'Khảm', 2: 'Khôn', 3: 'Chấn', 4: 'Tốn', 6: 'Càn', 7: 'Đoài', 8: 'Cấn', 9: 'Ly' };
  const ref = (year: number, g: 'M' | 'F') => {
    let n = g === 'M' ? (11 - (year % 9)) % 9 : ((year % 9) + 4) % 9;
    if (n === 0) n = 9;
    if (n === 5) return g === 'M' ? 'Khôn' : 'Cấn';
    return NAME[n];
  };
  it('1950–2049', () => {
    const bad: string[] = [];
    for (let y = 1950; y <= 2049; y++) {
      for (const g of ['M', 'F'] as const) {
        const got = PhongThuyEngine.menhQuai(y, g);
        if (got !== ref(y, g)) bad.push(`${y} ${g}: ${got} ≠ ${ref(y, g)}`);
      }
    }
    expect(bad).toEqual([]);
  });
});

describe('Thứ tự Ngũ Hành khác nhau giữa Bát Tự và Lục Hào (mục 5.3 điểm 2)', () => {
  it('Bát Tự: HANH5 = Mộc, Hoả, Thổ, Kim, Thuỷ', () => {
    expect(BatTuEngine.HANH5).toEqual(['Mộc', 'Hoả', 'Thổ', 'Kim', 'Thuỷ']);
  });
  it('Lục Hào: HANH5 = Kim, Thuỷ, Mộc, Hoả, Thổ', () => {
    expect(LucHaoEngine.HANH5).toEqual(['Kim', 'Thuỷ', 'Mộc', 'Hoả', 'Thổ']);
  });
  it('hai bảng chỉ số cho cùng hành của 12 Chi khi đổi ra tên', () => {
    const bt = (BatTuEngine.CHI_HANH as number[]).map((i) => BatTuEngine.HANH5[i]);
    const lh = (LucHaoEngine.CHI_HANH_IDX as number[]).map((i) => LucHaoEngine.HANH5[i]);
    expect(bt).toEqual(lh);
    expect(bt).toEqual(['Thuỷ', 'Thổ', 'Mộc', 'Mộc', 'Thổ', 'Hoả', 'Hoả', 'Thổ', 'Kim', 'Kim', 'Thổ', 'Thuỷ']);
  });
  it('Can Giáp là Mộc trong Bát Tự', () => {
    expect(BatTuEngine.HANH5[BatTuEngine.CAN_HANH[0]]).toBe('Mộc');
  });
});

describe('Mốc Lập Xuân (mục 5.3 điểm 3 & 4)', () => {
  const HOUR_OFFSET_FROM_NOON = [-12, -10, -8, -6, -4, -2, 0, 2, 4, 6, 8, 10];
  it('Bát Tự tìm Lập Xuân với UTC+7 cố định, kể cả trước 1968, và cộng độ lệch giờ sinh', () => {
    const bad: string[] = [];
    for (let yy = 1900; yy <= 2030; yy++) {
      const lx7 = PhongThuyEngine.lapXuanJD(yy, 7);
      for (const dd of [3, 4, 5]) {
        for (let h = 0; h < 12; h++) {
          const jd = TuViEngine.jdFromDate(dd, 2, yy) + HOUR_OFFSET_FROM_NOON[h] / 24;
          const want = jd >= lx7 ? yy : yy - 1;
          const got = BatTuEngine.calcChart({ gender: 'M', dd, mm: 2, yy, hourChiIdx: h }).tietYear;
          if (got !== want) bad.push(`${dd}/2/${yy} h${h}: ${got} ≠ ${want}`);
        }
      }
    }
    expect(bad.slice(0, 10)).toEqual([]);
  });
  it('Bát Trạch so ngày sinh theo JD giữa trưa, không có giờ', () => {
    for (let yy = 1900; yy <= 2100; yy += 7) {
      for (const tz of [7, 8]) {
        const lx = PhongThuyEngine.lapXuanJD(yy, tz);
        for (const dd of [3, 4, 5]) {
          const before = TuViEngine.jdFromDate(dd, 2, yy) < lx;
          expect(PhongThuyEngine.lySoYear(dd, 2, yy, tz)).toEqual({ year: before ? yy - 1 : yy, beforeLapXuan: before });
        }
      }
    }
  });
  it('vì vậy hai hệ có thể lệch nhau đúng ngày Lập Xuân: 4/2/2024 giờ Hợi', () => {
    expect(BatTuEngine.calcChart({ gender: 'M', dd: 4, mm: 2, yy: 2024, hourChiIdx: 11 }).tietYear).toBe(2024);
    expect(PhongThuyEngine.lySoYear(4, 2, 2024, 7).year).toBe(2023);
  });
});
