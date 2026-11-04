/* Đối chiếu câu chữ Lục Hào của app (src/content/luchao) với trang legacy chạy trong jsdom:
   "Luận đoán", "Giải thích chỉ số", "Tổng kết", ghi chú — với mọi loại "Hỏi về việc gì". */
import { describe, it, expect, beforeAll } from 'vitest';
import { castContext, castHexagram, DUNG_THAN_KEYS } from '../../src/core';
import { sectionPlainText, type Section } from '../../src/content/rich';
import { lucHaoExplain, lucHaoNotes, lucHaoVerdict } from '../../src/content/luchao/explain';
import { lucHaoTongKet } from '../../src/content/luchao/tongket';
import { firstDiff, loadLegacy, squash, submitLucHao, text } from './legacy';

const all = (ss: Section[]) => ss.map((s) => sectionPlainText(s)).join('\n');

// 31 tổ hợp gieo: ví dụ Chương 10 + 30 tổ hợp rải đều trong 4096 (có cả quẻ không hào động và quẻ 6 hào động)
const TOSSES: number[][] = [[7, 7, 9, 8, 6, 8], [7, 8, 7, 8, 7, 8], [6, 6, 6, 9, 9, 9]];
for (let n = 5; TOSSES.length < 31; n += 137) {
  const t: number[] = [];
  for (let i = 0, x = n % 4096; i < 6; i++, x >>= 2) t.push(6 + (x & 3));
  TOSSES.push(t);
}
const DATES: [number, number, number][] = [[6, 2, 2021], [15, 6, 2026], [4, 2, 2024], [21, 12, 1999], [8, 8, 2030], [1, 11, 1975]];

describe('Đối chiếu legacy — Lục Hào', () => {
  let doc: Document;
  let errors: string[];
  beforeAll(() => { ({ doc, errors } = loadLegacy()); });

  it('trang legacy chạy không lỗi trong jsdom', () => { expect(errors).toEqual([]); });

  TOSSES.forEach((tosses, i) => {
    const date = DATES[i % DATES.length];
    it(`${tosses.join('')} ngày ${date.join('/')} — 7 loại việc hỏi`, () => {
      const r = castHexagram(tosses);
      const ctx = castContext(...date);
      for (const key of DUNG_THAN_KEYS) {
        submitLucHao(doc, date, tosses, key);
        const checks: [string, string, string][] = [
          ['Luận đoán', text(doc, 'kd-verdictCard'), sectionPlainText(lucHaoVerdict(r, ctx, key))],
          ['Giải thích chỉ số', text(doc, 'kd-explain'), all(lucHaoExplain(r, key))],
          ['Tổng kết', text(doc, 'kd-tongket'), all(lucHaoTongKet(r, ctx, key))],
          ['Ghi chú', text(doc, 'kd-notes'), sectionPlainText(lucHaoNotes())],
        ];
        for (const [label, legacy, app] of checks) expect(firstDiff(squash(legacy), squash(app)), `${label} (${key})`).toBeNull();
      }
    });
  });
});
