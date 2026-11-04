/* Đối chiếu câu chữ Nạp Âm của app (src/content/napam) với trang legacy chạy trong jsdom:
   một người, hai người, chỉ nhập năm, đủ 60 × 60 cặp năm (kể cả 4 ngoại lệ sinh khắc) và thông báo lỗi. */
import { describe, it, expect, beforeAll } from 'vitest';
import { napAmCompat, resolveBirth, resolveNapAmInput } from '../../src/core';
import { parseRich, sectionPlainText, toPlainText, type Section } from '../../src/content/rich';
import { napAmExplain, napAmInputErrorText, napAmNotes, napAmPersonCells } from '../../src/content/napam/explain';
import { napAmRelationText } from '../../src/content/napam/relation';
import { napAmTongKet } from '../../src/content/napam/tongket';
import { firstDiff, loadLegacy, sampleProfiles, squash, submitNapAm, text } from './legacy';

type Raw = readonly [string, string, string];
const all = (ss: Section[]) => ss.map((s) => sectionPlainText(s)).join('\n');
const cells = (c: [string, string][]) => c.map(([k, v]) => k + toPlainText(parseRich(v))).join('');
const EMPTY: Raw = ['', '', ''];

function compare(doc: Document, a: Raw, b: Raw) {
  submitNapAm(doc, a, b);
  const r1 = resolveNapAmInput(...a), r2 = b[2] ? resolveNapAmInput(...b) : null;
  if (!r1.ok || (r2 && !r2.ok)) throw new Error('ca thử phải hợp lệ');
  const p2 = r2?.ok ? r2.person : null;
  const c = p2 ? napAmCompat(r1.person.res, p2.res) : null;
  const checks: [string, string, string][] = [
    ['Người 1', text(doc, 'na-summary'), cells(napAmPersonCells(r1.person))],
    ['Giải thích', text(doc, 'na-explain'), all(napAmExplain(r1.person.res, p2?.res ?? null))],
    ['Tổng kết', text(doc, 'na-tongket'), all(napAmTongKet(r1.person.res, p2 && c ? { r2: p2.res, compat: c } : null))],
  ];
  if (p2 && c) {
    checks.push(['Người 2', text(doc, 'na-summary2'), cells(napAmPersonCells(p2))]);
    checks.push(['So sánh', text(doc, 'na-verdict'), napAmRelationText(c.rel, r1.person.res, p2.res)]);
  }
  for (const [label, legacy, app] of checks) expect(firstDiff(squash(legacy), squash(app)), `${label} ${a.join('/')} × ${b.join('/')}`).toBeNull();
}

describe('Đối chiếu legacy — Nạp Âm', () => {
  let doc: Document;
  let errors: string[];
  beforeAll(() => { ({ doc, errors } = loadLegacy()); });

  it('trang legacy chạy không lỗi trong jsdom', () => { expect(errors).toEqual([]); });

  it('hồ sơ mẫu: một người, và ghép đôi với người kế tiếp', () => {
    const raws: Raw[] = sampleProfiles().flatMap(([, p]) => {
      const b = resolveBirth(p);
      return b.ok ? [[String(b.solar.dd), String(b.solar.mm), String(b.solar.yy)] as Raw] : [];
    });
    raws.forEach((r, i) => { compare(doc, r, EMPTY); compare(doc, r, raws[(i + 1) % raws.length]); });
  }, 60_000);

  it('ghi chú cố định', () => {
    const legacy = doc.querySelector('#na-results > .notes')?.textContent ?? '';
    expect(firstDiff(squash(legacy), squash(sectionPlainText(napAmNotes())))).toBeNull();
  });

  it('chỉ nhập năm: dùng đúng năm đó; trước Tết: lùi năm âm', () => {
    compare(doc, ['', '', '1985'], EMPTY);
    compare(doc, ['', '', '1981'], ['', '', '1985']);
    compare(doc, ['20', '1', '1990'], EMPTY);
  });

  it('60 năm × 12 năm rải đều, và cả 4 ngoại lệ theo hai chiều', () => {
    const y = (n: number): Raw => ['', '', String(n)];
    for (let a = 1984; a < 2044; a++) for (let b = 1984; b < 2044; b += 5) compare(doc, y(a), y(b));
    const exceptions = [[1982, 1976], [1992, 1986], [2014, 1986], [1978, 1982], [1948, 1982]];
    for (const [a, b] of exceptions) { compare(doc, y(a), y(b)); compare(doc, y(b), y(a)); }
  }, 60_000);

  it('thông báo lỗi khớp nguyên văn', () => {
    const cases: [Raw, Raw, 1 | 2][] = [
      [['1', '1', '1800'], EMPTY, 1], [['15', '', '1990'], EMPTY, 1], [['31', '2', '1990'], EMPTY, 1],
      [['15', '6', '1990'], ['', '6', '1991'], 2], [['15', '6', '1990'], ['30', '2', '1991'], 2], [['15', '6', '1990'], ['2', '2', ''], 2],
    ];
    for (const [a, b, who] of cases) {
      submitNapAm(doc, a, b);
      const res = resolveNapAmInput(...(who === 1 ? a : b));
      if (res.ok) throw new Error('phải báo lỗi');
      expect(doc.querySelector('#na-form')?.textContent).toContain(napAmInputErrorText(res.error, 'Người ' + who));
    }
  });
});
