/* Đối chiếu câu chữ Tử Vi của app (src/content/tuvi) với trang legacy chạy trong jsdom: "Giải thích chỉ số", "Tổng kết",
   "Đọc nhanh năm", ghi chú. Bảo đảm yêu cầu "chuyển nguyên văn, không viết lại" (ARCHITECTURE.md mục 5.4). */
import { describe, it, expect, beforeAll } from 'vitest';
import { resolveBirth, tuViChart, tuViYear } from '../../src/core';
import { sectionPlainText, type Section } from '../../src/content/rich';
import { tuViExplain, tuViNotes } from '../../src/content/tuvi/explain';
import { tuViTongKet } from '../../src/content/tuvi/tongket';
import { tuViYearSections } from '../../src/content/tuvi/year';
import { FIXED_NOW, firstDiff, loadLegacy, lookupYear, squash, submitTuVi, text, type TvInput } from './legacy';

const NOW_YEAR = FIXED_NOW.getFullYear();
const all = (ss: Section[]) => ss.map((s) => sectionPlainText(s)).join('\n');

const base: TvInput = { gender: 'M', calendar: 'solar', day: 15, month: 6, year: 1996, leapMonth: false, hourIdx: 6, lateTy: false };
const CASES: [string, TvInput][] = [
  ['mặc định 15/6/1996 Ngọ', base],
  ['Chương 10: Nam, 12/7/1979 âm, giờ Thìn', { ...base, calendar: 'lunar', day: 12, month: 7, year: 1979, hourIdx: 4 }],
  ['Nữ, âm lịch tháng nhuận 1/2/2023', { ...base, gender: 'F', calendar: 'lunar', day: 1, month: 2, year: 2023, leapMonth: true, hourIdx: 0 }],
  ['trước 1968: 2/2/1965', { ...base, day: 2, month: 2, year: 1965, hourIdx: 9 }],
  ['trước Tết: Nữ 20/1/1990', { ...base, gender: 'F', day: 20, month: 1, year: 1990, hourIdx: 3 }],
  ['Tý muộn qua năm: 31/12/1999', { ...base, day: 31, month: 12, year: 1999, hourIdx: 0, lateTy: true }],
  ['người lớn tuổi 1940', { ...base, gender: 'F', day: 8, month: 3, year: 1940, hourIdx: 11 }],
  ['trẻ nhỏ 2024', { ...base, day: 10, month: 2, year: 2024, hourIdx: 2 }],
  ['sinh năm sau năm nay (2027)', { ...base, day: 1, month: 3, year: 2027, hourIdx: 5 }],
  ['Nữ 1988 giờ Hợi', { ...base, gender: 'F', day: 29, month: 2, year: 1988, hourIdx: 11 }],
];
// Thêm 40 ca rải đều để phủ nhiều tổ hợp sao, Tứ Hoá, Vô Chính Diệu, Đại hạn
for (let i = 0; i < 40; i++) {
  const year = 1930 + ((i * 37) % 95), month = 1 + ((i * 5) % 12), day = 1 + ((i * 11) % 28);
  CASES.push([`rải ${i}: ${day}/${month}/${year}`, { ...base, gender: i % 2 ? 'F' : 'M', calendar: i % 3 === 0 ? 'lunar' : 'solar', day, month, year, hourIdx: (i * 7) % 12, lateTy: i % 12 === 0 }]);
}

describe('Đối chiếu legacy — Tử Vi', () => {
  let doc: Document;
  let errors: string[];
  beforeAll(() => { ({ doc, errors } = loadLegacy()); });

  it('trang legacy chạy không lỗi trong jsdom', () => { expect(errors).toEqual([]); });

  for (const [name, input] of CASES) {
    it(name, () => {
      const r = resolveBirth(input);
      if (!r.ok) throw new Error('hồ sơ mẫu không hợp lệ: ' + name);
      const ch = tuViChart(r.input);
      submitTuVi(doc, input);
      const checks: [string, string, string][] = [
        ['Giải thích chỉ số', text(doc, 'tv-explain'), all(tuViExplain(ch))],
        ['Tổng kết', text(doc, 'tv-tongket'), all(tuViTongKet(ch, NOW_YEAR))],
        ['Đọc nhanh năm nay', text(doc, 'tv-yearReading'), all(tuViYearSections(ch, tuViYear(ch, NOW_YEAR)))],
        ['Ghi chú', text(doc, 'tv-notes'), sectionPlainText(tuViNotes())],
      ];
      for (const y of [r.lunar.year - 1, r.lunar.year + 12, NOW_YEAR + 5]) {
        lookupYear(doc, y);
        checks.push([`Đọc nhanh năm ${y}`, text(doc, 'tv-yearReading'), all(tuViYearSections(ch, tuViYear(ch, y)))]);
      }
      for (const [label, legacy, app] of checks) {
        expect(firstDiff(squash(legacy), squash(app)), label).toBeNull();
      }
    });
  }
});
