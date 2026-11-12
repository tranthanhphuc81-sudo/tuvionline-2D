/* Lời sách cho Can ngày theo tháng sinh (src/content/cachcuc/thuongly.ts). ARCHITECTURE 15.9. */
import { describe, it, expect } from 'vitest';
import { THUONG_LY, THUONG_LY_NOTE, canList, thangOfChi, thuongLyOf, thuongLySection, thuongLySpeech, viDuOf } from '../src/content/cachcuc/thuongly';
import { sectionPlainText } from '../src/content/rich';
import { NO_SPEECH_TERMS } from '../src/content/noSpeech';
import { loadSach } from '../scripts/lib/sach';
import { evalThuongLy } from '../scripts/compare-thuongly';

describe('bảng lẽ thường', () => {
  it('đủ 10 Can × 12 tháng, can hợp lệ, có can xét trước', () => {
    expect(THUONG_LY).toHaveLength(10);
    for (const row of THUONG_LY) {
      expect(row).toHaveLength(12);
      for (const t of row) {
        expect(canList(t.uu).length).toBeGreaterThan(0);
        for (const c of [...canList(t.uu), ...canList(t.cuong), ...canList(t.nhuoc)]) expect(c).toBeGreaterThanOrEqual(0);
      }
    }
  });
  it('số trang nằm trong phụ lục (204–303) và tăng dần theo thứ tự sách', () => {
    const pages = THUONG_LY.flat().map((t) => t.p);
    expect(Math.min(...pages)).toBe(204);
    expect(Math.max(...pages)).toBe(302);
    for (let i = 1; i < pages.length; i++) expect(pages[i]).toBeGreaterThanOrEqual(pages[i - 1]);
  });
  it('lời tóm tắt ngắn, không phải chép cả đoạn sách', () => {
    for (const t of THUONG_LY.flat()) expect(t.tom.length).toBeLessThan(300);
  });
  it('tháng giêng là Dần, tháng chạp là Sửu', () => {
    expect([thangOfChi(2), thangOfChi(1), thangOfChi(0)]).toEqual([0, 11, 10]);
    expect(thuongLyOf(0, 2).p).toBe(204); // Giáp tháng giêng
    expect(thuongLyOf(9, 1).p).toBe(302); // Quý tháng chạp
  });
});

describe('lá ví dụ của phụ lục', () => {
  it('mỗi lá ví dụ nằm ở trang của đúng ô Can × tháng (kiểm chéo số trang của bảng)', () => {
    let n = 0;
    for (let dm = 0; dm < 10; dm++) for (let m = 0; m < 12; m++) for (const c of viDuOf(dm, m)) {
      n++;
      const pg = parseInt(c.page, 10), start = thuongLyOf(dm, m).p;
      expect(pg).toBeGreaterThanOrEqual(start);
      expect(pg).toBeLessThanOrEqual(start + 3);
    }
    expect(n).toBe(50);
  });
  it('ô có lá ví dụ thì khối lời sách liệt kê lá đó', () => {
    const vd = viDuOf(0, 5); // Giáp tháng Tỵ, trang 207
    expect(vd.length).toBeGreaterThan(0);
    expect(sectionPlainText(thuongLySection(0, 5, 'Thuỷ'))).toContain(vd[0].pillars.join(' · '));
  });
});

describe('so với lá số mẫu trong sách', () => {
  const { cases } = loadSach();
  const hitA = (book: string) => cases.filter((c) => c.book === book).filter((c) => evalThuongLy(c).A).length;
  // TBCT: 50/56 lá lấy từ chính phụ lục này, chỉ là kiểm tra nhất quán. TTT: nguồn độc lập.
  it('hành của can xét trước khớp TBCT không thấp hơn mức đã đo (31/56)', () => { expect(hitA('tbct')).toBeGreaterThanOrEqual(31); });
  it('khớp Trích Thiên Tủy không thấp hơn mức đã đo (21/65)', () => { expect(hitA('ttt')).toBeGreaterThanOrEqual(21); });
});

describe('câu chữ', () => {
  it('có trang sách, lời nhắc tham khảo, và so với mục Cách cục', () => {
    const t = sectionPlainText(thuongLySection(0, 2, 'Hoả'));
    expect(t).toContain('trang 204');
    expect(t).toContain(THUONG_LY_NOTE);
    expect(t).toContain('trùng với Dụng thần ở mục Cách cục');
    expect(sectionPlainText(thuongLySection(0, 2, 'Kim'))).toContain('mục Cách cục chọn Kim');
  });
  it('lời Thầy đọc không có từ cấm đọc', () => {
    for (let dm = 0; dm < 10; dm++) for (let m = 0; m < 12; m++) {
      const s = thuongLySpeech(dm, m).toLowerCase();
      for (const w of NO_SPEECH_TERMS) expect(s).not.toContain(w);
    }
  });
});
