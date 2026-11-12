/* Bộ lá số mẫu lấy từ sách (Tử Bình Chân Thuyên, Trích Thiên Tủy): kiểm dữ liệu chép từ sách và ghi lại mức khớp của engine.
   Con số khớp KHÔNG phải mục tiêu phải đạt: nó chỉ để biết khi engine đổi thì kết quả so với sách đổi thế nào.
   Đổi engine có chủ ý thì chạy `npm run compare:sach`, đọc lại docs/NGU-HANH-SACH.md rồi sửa con số dưới đây. */
import { describe, expect, it } from 'vitest';
import { CAN, CHI } from '../src/core/canchi';
import { ELEMENTS } from '../src/core/nguhanh';
import { evaluate, loadSach } from '../scripts/lib/sach';

const { cases } = loadSach();

describe('bộ lá số mẫu từ sách', () => {
  it('có 50 lá, mã không trùng, đủ trang và câu sách', () => {
    expect(cases.length).toBe(50);
    expect(new Set(cases.map((c) => c.id)).size).toBe(cases.length);
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

  it('engine chạy được trên mọi lá; mức khớp hiện tại (ghi lại, không phải mục tiêu)', () => {
    const rs = cases.map(evaluate);
    const n = (m: string) => rs.filter((r) => r.match === m).length;
    expect({ trung: n('trung'), gan: n('gan'), khac: n('khac'), nguoc: n('nguoc') }).toEqual({ trung: 18, gan: 2, khac: 20, nguoc: 10 });
    expect(rs.filter((r) => r.rule14).length).toBe(24);
  });
});
