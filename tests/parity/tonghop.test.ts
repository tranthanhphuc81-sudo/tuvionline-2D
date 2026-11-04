/* Đối chiếu câu chữ Tổng Hợp của app (src/content/tonghop) với trang legacy chạy trong jsdom: nạp đủ 4 tab cho cùng một hồ sơ,
   bấm "Cập nhật Tổng Hợp" rồi so toàn bộ #tonghop-content (trừ dải báo đồng bộ — app luôn dùng một hồ sơ nên không có). */
import { describe, it, expect, beforeAll } from 'vitest';
import { hanhRel, huongOfHanh, resolveBirth, tongHopOf, type Hanh, type TongHopReading } from '../../src/core';
import { HANH_INFO } from '../../src/content/interp/hanh';
import { sectionPlainText } from '../../src/content/rich';
import { tongHopParts } from '../../src/content/tonghop/explain';
import { firstDiff, loadLegacy, sampleProfiles, squash, submitBatTrach, submitBirthForm, submitNapAm, submitTuVi, type TvInput } from './legacy';

const appText = (r: TongHopReading) => tongHopParts(r).map((part) => part.title + part.sections.map((s) => sectionPlainText(s)).join('\n')).join('\n');

function legacyText(doc: Document, p: TvInput, solar: { dd: number; mm: number; yy: number }): string {
  submitTuVi(doc, p);
  submitBirthForm(doc, 'bt', p);
  submitBatTrach(doc, solar, p.gender, '');
  submitNapAm(doc, [String(solar.dd), String(solar.mm), String(solar.yy)], ['', '', '']);
  (doc.getElementById('th-refreshBtn') as HTMLElement).click();
  const box = doc.getElementById('tonghop-content')!;
  const banner = box.querySelector('.note-banner.ok');
  if (!banner) throw new Error('legacy phải báo đã đồng bộ cả 4 công cụ');
  banner.remove();
  return box.textContent ?? '';
}

describe('Đối chiếu legacy — Tổng Hợp', () => {
  let doc: Document;
  let errors: string[];
  beforeAll(() => { ({ doc, errors } = loadLegacy()); });

  it('trang legacy chạy không lỗi trong jsdom', () => { expect(errors).toEqual([]); });

  it('hồ sơ mẫu: toàn bộ nội dung khớp, đi qua đủ các nhánh', () => {
    const seen = new Set<string>();
    for (const [name, p] of sampleProfiles()) {
      const b = resolveBirth(p);
      if (!b.ok) throw new Error('hồ sơ mẫu phải hợp lệ: ' + name);
      const r = tongHopOf(b);
      expect(firstDiff(squash(legacyText(doc, p, b.solar)), squash(appText(r))), name).toBeNull();
      seen.add(r.battrach.gold.length ? 'có hướng vàng' : 'không hướng vàng');
      seen.add(r.tuvi.menhStars.length ? 'có chính tinh' : 'Vô Chính Diệu');
      seen.add(r.battu.thanVuong ? 'Thân vượng' : 'Thân nhược');
      Object.values(r.rel).forEach((x) => seen.add(x.kind));
    }
    expect([...seen].sort()).toEqual([
      'Thân nhược', 'Thân vượng', 'Vô Chính Diệu', 'a-khac-b', 'a-sinh-b', 'b-khac-a', 'b-sinh-a', 'có chính tinh', 'có hướng vàng', 'không hướng vàng', 'same',
    ].sort());
  }, 120_000);

  it('hướng theo hành của core khớp HANH_INFO', () => {
    for (const h of Object.keys(HANH_INFO) as Hanh[]) expect([...huongOfHanh(h)].sort()).toEqual([...HANH_INFO[h].huong].sort());
  });

  it('quan hệ hai hành: đúng vòng sinh khắc theo cả hai chiều', () => {
    expect(hanhRel('Kim', 'Kim').kind).toBe('same');
    expect(hanhRel('Kim', 'Thuỷ').kind).toBe('a-sinh-b');
    expect(hanhRel('Thuỷ', 'Kim').kind).toBe('b-sinh-a');
    expect(hanhRel('Kim', 'Mộc').kind).toBe('a-khac-b');
    expect(hanhRel('Mộc', 'Kim').kind).toBe('b-khac-a');
  });
});
