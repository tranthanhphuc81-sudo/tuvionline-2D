/* Đối chiếu câu chữ Tử Vi của app (src/content/tuvi) với trang legacy chạy trong jsdom: "Giải thích chỉ số", "Tổng kết",
   "Đọc nhanh năm", ghi chú. Bảo đảm yêu cầu "chuyển nguyên văn, không viết lại" (ARCHITECTURE.md mục 5.4). */
import { describe, it, expect, beforeAll } from 'vitest';
import { resolveBirth, tuViChart, tuViYear } from '../../src/core';
import { sectionPlainText, type Section } from '../../src/content/rich';
import { tuViExplain, tuViNotes } from '../../src/content/tuvi/explain';
import { tuViTongKet } from '../../src/content/tuvi/tongket';
import { tuViYearSections } from '../../src/content/tuvi/year';
import { FIXED_NOW, firstDiff, loadLegacy, lookupYear, sampleProfiles, squash, submitTuVi, text } from './legacy';

const NOW_YEAR = FIXED_NOW.getFullYear();
const all = (ss: Section[]) => ss.map((s) => sectionPlainText(s)).join('\n');

describe('Đối chiếu legacy — Tử Vi', () => {
  let doc: Document;
  let errors: string[];
  beforeAll(() => { ({ doc, errors } = loadLegacy()); });

  it('trang legacy chạy không lỗi trong jsdom', () => { expect(errors).toEqual([]); });

  for (const [name, input] of sampleProfiles()) {
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
