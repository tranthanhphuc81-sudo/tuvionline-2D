/* Đối chiếu câu chữ La Bàn của app (src/content/laban) với trang legacy chạy trong jsdom. Mục 3 của "Cách đọc" cố ý viết lại
   (app không qua trình duyệt, không hỏi quyền) nên không so. */
import { describe, it, expect, beforeAll } from 'vitest';
import { batTrachReading, laBanSectors, resolveBirth, sectorOf } from '../../src/core';
import { LABAN_FOOT, LABAN_INTRO, LABAN_MANUAL_HINT, LABAN_STATUS, laBanCells, laBanLessons, laBanVerdict } from '../../src/content/laban/explain';
import { parseRich, sectionPlainText, toPlainText } from '../../src/content/rich';
import { FIXED_NOW, firstDiff, loadLegacy, sampleProfiles, squash, text } from './legacy';

const FILE = 'docs/legacy/la-ban-phong-thuy.html';

describe('Đối chiếu legacy — La Bàn', () => {
  let doc: Document;
  let errors: string[];
  const input = (id: string, v: string) => { (doc.getElementById(id) as HTMLInputElement).value = v; };
  const fire = (id: string) => doc.getElementById(id)!.dispatchEvent(new (doc.defaultView as unknown as typeof globalThis).Event('input'));
  beforeAll(() => { ({ doc, errors } = loadLegacy(FIXED_NOW, FILE)); });

  it('trang legacy chạy không lỗi trong jsdom', () => { expect(errors).toEqual([]); });

  sampleProfiles().slice(0, 12).forEach(([name, p]) => {
    it(name + ' — 16 hướng', () => {
      const b = resolveBirth(p);
      if (!b.ok) throw new Error('hồ sơ mẫu phải hợp lệ');
      input('p-dd', String(b.solar.dd)); input('p-mm', String(b.solar.mm)); input('p-yy', String(b.solar.yy));
      (doc.querySelector(`#p-genderSeg [data-val="${p.gender}"]`) as HTMLElement).click();
      (doc.getElementById('calcBtn') as HTMLElement).click();
      const r = batTrachReading(b.solar, p.gender);
      const sectors = laBanSectors(r.dn);
      for (let h = 0; h < 360; h += 22.5) {
        input('degInput', String(Math.floor(h))); fire('degInput');
        const s = sectorOf(Math.floor(h), sectors);
        expect(firstDiff(squash(text(doc, 'resultGrid')), squash(laBanCells(s, r.quai).map(([k, v]) => k + v).join('')))).toBeNull();
        expect(firstDiff(squash(text(doc, 'verdictBanner')), squash(toPlainText(parseRich(laBanVerdict(s)))))).toBeNull();
        expect(text(doc, 'huongReadout')).toBe(s.huong + ' — ' + s.quai);
      }
    });
  });

  it('bài học, giới thiệu và ghi chú khớp nguyên văn (trừ mục 3)', () => {
    const items = [...doc.querySelectorAll('.lessonItem')].map((x) => x.textContent ?? '');
    const app = laBanLessons().map((s) => sectionPlainText(s));
    [0, 1, 3].forEach((i) => expect(firstDiff(squash(items[i]), squash(app[i]))).toBeNull());
    expect(doc.querySelector('.hero p')?.textContent).toBe(LABAN_INTRO);
    expect(doc.querySelector('.footNote')?.textContent).toBe(LABAN_FOOT);
    expect(doc.querySelector('.dragHint')?.textContent).toBe(LABAN_MANUAL_HINT);
    expect(text(doc, 'sensorStatus')).toBe(LABAN_STATUS.manual);
  });
});
