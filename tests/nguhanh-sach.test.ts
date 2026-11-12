/* Bộ lá số mẫu lấy từ sách (Tử Bình Chân Thuyên, Trích Thiên Tủy): kiểm dữ liệu chép từ sách và ghi lại mức khớp của engine.
   Con số khớp KHÔNG phải mục tiêu phải đạt: nó chỉ để biết khi engine đổi thì kết quả so với sách đổi thế nào.
   Đợt 1 dùng để hiệu chỉnh (ARCHITECTURE 14.12); đợt 2 thêm sau, là tập kiểm tra độc lập (14.13): đừng chỉnh engine cho vừa đợt 2
   mà không có lá mới để thử lại.
   Đổi engine có chủ ý thì chạy `npm run compare:sach`, đọc lại docs/NGU-HANH-SACH.md rồi sửa con số dưới đây. */
import { describe, expect, it } from 'vitest';
import { CAN, CHI } from '../src/core/canchi';
import { ELEMENTS, REFERENCE_CONFIG } from '../src/core/nguhanh';
import { evaluate, loadSach, type SachResult } from '../scripts/lib/sach';

const { cases } = loadSach();
const tally = (rs: SachResult[]) => {
  const n = (m: string) => rs.filter((r) => r.match === m).length;
  return { trung: n('trung'), gan: n('gan'), khac: n('khac'), nguoc: n('nguoc'), khop14: rs.filter((r) => r.rule14).length };
};

describe('bộ lá số mẫu từ sách', () => {
  it('có 91 lá (đợt 1: 50, đợt 2: 41), mã không trùng, đủ trang và câu sách', () => {
    expect(cases.length).toBe(91);
    expect(cases.filter((c) => c.batch === 1).length).toBe(50);
    expect(cases.filter((c) => c.batch === 2).length).toBe(41);
    expect(new Set(cases.map((c) => c.id)).size).toBe(cases.length);
    expect(new Set(cases.map((c) => c.pillars.join('|'))).size, 'không trùng tứ trụ').toBe(cases.length);
    for (const c of cases) {
      expect(c.page, c.id).toBeTruthy();
      expect(c.note.length, c.id).toBeGreaterThan(10);
      expect(ELEMENTS, c.id).toContain(c.dung);
      for (const e of c.accept ?? []) { expect(ELEMENTS).toContain(e); expect(e).not.toBe(c.dung); }
    }
  });

  it('tứ trụ chép đúng luật: âm dương, can tháng theo Ngũ Hổ Độn, can giờ theo Ngũ Thử Độn', () => {
    for (const c of cases) {
      const p = c.pillars.map((s) => { const [a, b] = s.split(' '); return [CAN.indexOf(a), CHI.indexOf(b)]; });
      for (const [s, b] of p) { expect(s, c.id).toBeGreaterThanOrEqual(0); expect(b, c.id).toBeGreaterThanOrEqual(0); expect(s % 2, c.id).toBe(b % 2); }
      const [[ys], [ms, mb], [ds], [hs, hb]] = p;
      expect(ms, `${c.id} can tháng`).toBe(((ys % 5) * 2 + 2 + ((mb - 2 + 12) % 12)) % 10);
      expect(hs, `${c.id} can giờ`).toBe(((ds % 5) * 2 + hb) % 10);
    }
  });

  it('mức khớp hiện tại theo từng đợt, bản app dùng và bản v0.2 (ghi lại, không phải mục tiêu)', () => {
    const b1 = cases.filter((c) => c.batch === 1), b2 = cases.filter((c) => c.batch === 2);
    expect(tally(b1.map((c) => evaluate(c)))).toEqual({ trung: 20, gan: 2, khac: 19, nguoc: 9, khop14: 25 });
    expect(tally(b1.map((c) => evaluate(c, REFERENCE_CONFIG)))).toEqual({ trung: 18, gan: 2, khac: 20, nguoc: 10, khop14: 24 });
    // Đợt 2: hiệu chỉnh 14.12 không đổi lá nào.
    expect(tally(b2.map((c) => evaluate(c)))).toEqual({ trung: 7, gan: 0, khac: 23, nguoc: 11, khop14: 19 });
    expect(tally(b2.map((c) => evaluate(c, REFERENCE_CONFIG)))).toEqual({ trung: 7, gan: 0, khac: 23, nguoc: 11, khop14: 19 });
  });
});
