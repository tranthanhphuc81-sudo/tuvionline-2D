/* Đối chiếu câu chữ Bát Trạch của app (src/content/battrach) với trang legacy chạy trong jsdom:
   50 hồ sơ mẫu × hướng cửa (có cả "chưa xét căn nhà"), rồi đủ 8 hướng cửa cho 8 Mệnh Quái. */
import { describe, it, expect, beforeAll } from 'vitest';
import { HUONG_LIST, batTrachReading, resolveBirth, type Huong } from '../../src/core';
import { parseRich, sectionPlainText, toPlainText, type Section } from '../../src/content/rich';
import { batTrachExplain, batTrachHanhCard, batTrachHouseBanner, batTrachLapXuanNote, batTrachNotes, batTrachPositions, batTrachStarCards, batTrachSummary } from '../../src/content/battrach/explain';
import { batTrachTongKet } from '../../src/content/battrach/tongket';
import { firstDiff, loadLegacy, sampleProfiles, squash, submitBatTrach, text } from './legacy';

const all = (ss: Section[]) => ss.map((s) => sectionPlainText(s)).join('\n');
const plain = (html: string | null) => (html ? toPlainText(parseRich(html)) : '');
const pairs = (cells: [string, string][]) => cells.map(([k, v]) => k + plain(v)).join('');

describe('Đối chiếu legacy — Bát Trạch', () => {
  let doc: Document;
  let errors: string[];
  beforeAll(() => { ({ doc, errors } = loadLegacy()); });

  it('trang legacy chạy không lỗi trong jsdom', () => { expect(errors).toEqual([]); });

  sampleProfiles().forEach(([name, input], i) => {
    it(name + ' — chưa xét nhà và 2 hướng cửa', () => {
      const b = resolveBirth(input);
      if (!b.ok) return;
      const options: (Huong | undefined)[] = [undefined, HUONG_LIST[i % 8], HUONG_LIST[(i * 3 + 5) % 8]];
      for (const huong of options) {
        submitBatTrach(doc, b.solar, input.gender, huong ?? '');
        const r = batTrachReading(b.solar, input.gender, huong);
        const checks: [string, string, string][] = [
          ['Tóm tắt', text(doc, 'pt-summary'), pairs(batTrachSummary(r))],
          ['Lập Xuân', text(doc, 'pt-lapXuanNote'), plain(batTrachLapXuanNote(b.solar, r))],
          ['Đánh giá nhà', text(doc, 'pt-houseBanner'), plain(r.house && batTrachHouseBanner(r.house))],
          ['8 sao', text(doc, 'pt-starGrid'), batTrachStarCards(r).map((c) => c.star + c.pill + c.line + c.desc).join('')],
          ['Bố trí', text(doc, 'pt-posGrid'), pairs(batTrachPositions(r))],
          ['Ngũ hành', text(doc, 'pt-hanhCard'), sectionPlainText(batTrachHanhCard(r))],
          ['Giải thích chỉ số', text(doc, 'pt-explain'), all(batTrachExplain(r))],
          ['Tổng kết', text(doc, 'pt-tongket'), all(batTrachTongKet(r))],
          ['Ghi chú', text(doc, 'pt-notes'), sectionPlainText(batTrachNotes())],
        ];
        for (const [label, legacy, app] of checks) expect(firstDiff(squash(legacy), squash(app)), `${label} (${huong ?? 'chưa xét'})`).toBeNull();
      }
    });
  });

  it('đủ 8 hướng cửa cho cả 8 Mệnh Quái', () => {
    for (let yy = 1980; yy < 1989; yy++) for (const g of ['M', 'F'] as const) for (const h of HUONG_LIST) {
      const solar = { dd: 15, mm: 6, yy };
      submitBatTrach(doc, solar, g, h);
      const r = batTrachReading(solar, g, h);
      expect(firstDiff(squash(text(doc, 'pt-tongket')), squash(all(batTrachTongKet(r))))).toBeNull();
      expect(firstDiff(squash(text(doc, 'pt-houseBanner')), squash(plain(batTrachHouseBanner(r.house!))))).toBeNull();
    }
  }, 60_000);
});
