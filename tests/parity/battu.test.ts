/* Đối chiếu câu chữ Bát Tự của app (src/content/battu) với trang legacy chạy trong jsdom. */
import { describe, it, expect, beforeAll } from 'vitest';
import { batTuChart, resolveBirth } from '../../src/core';
import { sectionPlainText, toPlainText, parseRich, type Section } from '../../src/content/rich';
import { batTuDungThan, batTuExplain, batTuKhoiVanNote, batTuLapXuanNote, batTuNotes, batTuVuongSuy } from '../../src/content/battu/explain';
import { batTuTongKet } from '../../src/content/battu/tongket';
import { FIXED_NOW, firstDiff, loadLegacy, sampleProfiles, squash, submitBirthForm, text } from './legacy';

const NOW_YEAR = FIXED_NOW.getFullYear();
const all = (ss: Section[]) => ss.map((s) => sectionPlainText(s)).join('\n');

describe('Đối chiếu legacy — Bát Tự', () => {
  let doc: Document;
  let errors: string[];
  beforeAll(() => { ({ doc, errors } = loadLegacy()); });

  it('trang legacy chạy không lỗi trong jsdom', () => { expect(errors).toEqual([]); });

  for (const [name, input] of sampleProfiles()) {
    it(name, () => {
      const r = resolveBirth(input);
      if (!r.ok) throw new Error('hồ sơ mẫu không hợp lệ: ' + name);
      const ch = batTuChart(r.input);
      submitBirthForm(doc, 'bt', input);
      const banner = doc.getElementById('bt-noteBanner') as HTMLElement;
      const lx = batTuLapXuanNote(ch);
      const checks: [string, string, string][] = [
        ['Giải thích chỉ số', text(doc, 'bt-explain'), all(batTuExplain(ch))],
        ['Tổng kết', text(doc, 'bt-tongket'), all(batTuTongKet(ch, NOW_YEAR))],
        ['Vượng Suy', text(doc, 'bt-vsBox'), sectionPlainText(batTuVuongSuy(ch))],
        ['Dụng Thần', text(doc, 'bt-dtBox'), sectionPlainText(batTuDungThan(ch))],
        ['Tuổi khởi vận', text(doc, 'bt-khoiVanNote'), batTuKhoiVanNote(ch)],
        ['Lưu ý Lập Xuân/Tết', banner.style.display === 'none' ? '' : banner.textContent ?? '', lx ? toPlainText(parseRich(lx)) : ''],
        ['Ghi chú', text(doc, 'bt-notes'), sectionPlainText(batTuNotes())],
      ];
      for (const [label, legacy, app] of checks) expect(firstDiff(squash(legacy), squash(app)), label).toBeNull();
    });
  }
});
