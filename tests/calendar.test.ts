/* Lịch âm — test khoá hành vi trước khi gộp các bản sao hàm lịch (Phase 1.2, ARCHITECTURE.md mục 5.3 & 10).
   Phải xanh với engine JS gốc và giữ xanh sau khi chuyển sang TypeScript. */
import { describe, it, expect } from 'vitest';
import { LySoUtil, TuViEngine, BatTuEngine, PhongThuyEngine } from '../src/core';

function addDays(dd: number, mm: number, yy: number, n: number): [number, number, number] {
  const t = new Date(Date.UTC(yy, mm - 1, dd + n));
  return [t.getUTCDate(), t.getUTCMonth() + 1, t.getUTCFullYear()];
}

describe('Đổi dương → âm → dương', () => {
  it('khớp nhau mọi ngày 1900–2100 (mẫu mỗi 7 ngày, cùng một múi giờ cho hai chiều)', () => {
    const bad: string[] = [];
    let n = 0;
    for (let d: [number, number, number] = [1, 1, 1900]; d[2] <= 2100; d = addDays(...d, 7)) {
      const [dd, mm, yy] = d;
      const tz = LySoUtil.lunarTzForSolarYear(yy);
      const [ld, lm, ly, leap] = TuViEngine.convertSolar2Lunar(dd, mm, yy, tz);
      const back = TuViEngine.convertLunar2Solar(ld, lm, ly, leap, tz);
      if (back[0] !== dd || back[1] !== mm || back[2] !== yy) bad.push(`${dd}/${mm}/${yy} → ${back.join('/')}`);
      n++;
    }
    expect(n).toBeGreaterThan(10_000);
    expect(bad.slice(0, 10)).toEqual([]);
  });
});

describe('Tết Nguyên Đán 2000–2030 (lịch chính thức Việt Nam, UTC+7)', () => {
  // Mùng 1 tháng Giêng theo lịch Việt Nam. Lưu ý 2007 (17/2) và 2030 (2/2) khác lịch Trung Quốc (18/2, 3/2).
  const TET: Record<number, [number, number]> = {
    2000: [5, 2], 2001: [24, 1], 2002: [12, 2], 2003: [1, 2], 2004: [22, 1], 2005: [9, 2], 2006: [29, 1],
    2007: [17, 2], 2008: [7, 2], 2009: [26, 1], 2010: [14, 2], 2011: [3, 2], 2012: [23, 1], 2013: [10, 2],
    2014: [31, 1], 2015: [19, 2], 2016: [8, 2], 2017: [28, 1], 2018: [16, 2], 2019: [5, 2], 2020: [25, 1],
    2021: [12, 2], 2022: [1, 2], 2023: [22, 1], 2024: [10, 2], 2025: [29, 1], 2026: [17, 2], 2027: [6, 2],
    2028: [26, 1], 2029: [13, 2], 2030: [2, 2],
  };
  for (const [y, [dd, mm]] of Object.entries(TET).map(([k, v]) => [Number(k), v] as const)) {
    it(`Tết ${y}: ${dd}/${mm}/${y}`, () => {
      expect(TuViEngine.convertSolar2Lunar(dd, mm, y, 7)).toEqual([1, 1, y, 0]);
      expect(TuViEngine.convertLunar2Solar(1, 1, y, 0, 7)).toEqual([dd, mm, y]);
      const [pd, pm, py] = addDays(dd, mm, y, -1);
      expect(TuViEngine.convertSolar2Lunar(pd, pm, py, 7).slice(1, 3)).toEqual([12, y - 1]);
    });
  }
});

describe('Tử Vi: tham số tz tuỳ chọn của calcChart (mục 5.3 điểm 5)', () => {
  const base = { gender: 'M' as const, dd: 21, mm: 1, yy: 1985, hourBranchIdx: 3 };
  it('mặc định dùng lunarTzForSolarYear: 21/1/1985 là mùng 1 Tết Ất Sửu (UTC+7)', () => {
    expect(TuViEngine.calcChart(base).lunar).toEqual({ day: 1, month: 1, year: 1985, leap: 0 });
  });
  it('tz: 8 cho lịch khác (21/1/1985 là 1/12 năm Giáp Tý theo UTC+8)', () => {
    expect(TuViEngine.calcChart({ ...base, tz: 8 }).lunar).toEqual({ day: 1, month: 12, year: 1984, leap: 0 });
  });
  it('tz: 0 bị coi như không truyền (giữ đúng `input.tz || …` của bản gốc)', () => {
    expect(TuViEngine.calcChart({ ...base, tz: 0 }).lunar).toEqual(TuViEngine.calcChart(base).lunar);
  });
  it('trước 1968 mặc định UTC+8', () => {
    const d = { gender: 'F' as const, dd: 2, mm: 2, yy: 1965, hourBranchIdx: 0 };
    expect(TuViEngine.calcChart(d).lunar).toEqual(TuViEngine.calcChart({ ...d, tz: 8 }).lunar);
  });
});

describe('Hai biến thể jdToDate (mục 5.3 điểm 1)', () => {
  it('bản Bát Trạch làm tròn JD lẻ', () => {
    expect(PhongThuyEngine.jdToDate(2451544.6)).toEqual({ dd: 1, mm: 1, yy: 2000 });
    expect(PhongThuyEngine.jdToDate(2451545.4)).toEqual({ dd: 1, mm: 1, yy: 2000 });
    expect(PhongThuyEngine.jdToDate(2415020.5)).toEqual({ dd: 1, mm: 1, yy: 1900 });
  });
  it('bản Bát Trạch dùng lịch Gregory cho cả trước 15/10/1582 (không chuyển sang lịch Julius)', () => {
    expect(PhongThuyEngine.jdToDate(2299161)).toEqual({ dd: 15, mm: 10, yy: 1582 });
    expect(PhongThuyEngine.jdToDate(2299160)).toEqual({ dd: 14, mm: 10, yy: 1582 });
    expect(PhongThuyEngine.jdToDate(2299150)).toEqual({ dd: 4, mm: 10, yy: 1582 });
  });
  it('bản lịch âm (Tử Vi/Bát Tự) trả mảng [ngày, tháng, năm] — kiểm qua convertLunar2Solar', () => {
    expect(TuViEngine.convertLunar2Solar(1, 1, 2024, 0, 7)).toEqual([10, 2, 2024]);
    expect(BatTuEngine.convertLunar2Solar(1, 1, 2024, 0, 7)).toEqual([10, 2, 2024]);
  });
});

describe('validLunar — đổi qua lại để kiểm tra ngày âm', () => {
  it('nhận ngày có thật, trả ngày dương tương ứng', () => {
    expect(LySoUtil.validLunar(1, 1, 2024, false)).toEqual([10, 2, 2024]);
    expect(LySoUtil.validLunar(29, 1, 2024, false)).toEqual([9, 3, 2024]);
    expect(LySoUtil.validLunar(1, 2, 2023, true)).toEqual([22, 3, 2023]);
  });
  it('loại 30 của tháng thiếu, tháng nhuận không có, giá trị ngoài miền', () => {
    expect(LySoUtil.validLunar(30, 1, 2024, false)).toBeNull();
    expect(LySoUtil.validLunar(1, 3, 2023, true)).toBeNull();
    expect(LySoUtil.validLunar(0, 1, 2024, false)).toBeNull();
    expect(LySoUtil.validLunar(1, 13, 2024, false)).toBeNull();
    expect(LySoUtil.validLunar(1.5, 1, 2024, false)).toBeNull();
  });
  it('trước 1968 mặc định UTC+8: mùng 1 Tết Ất Tỵ là 2/2/1965', () => {
    expect(LySoUtil.validLunar(1, 1, 1965, false)).toEqual([2, 2, 1965]);
  });
});
