/* Lời sách cho Can ngày theo tháng sinh (src/content/cachcuc/thuongly.ts). ARCHITECTURE 15.9. */
import { describe, it, expect } from 'vitest';
import { THUONG_LY, THUONG_LY_NOTE, bookCans, canList, firstCanVerdict, presenceLevel, presenceOf, thangOfChi, thuongLyOf, thuongLySection, thuongLySpeech, viDuOf } from '../src/content/cachcuc/thuongly';
import { batTuChart } from '../src/core';
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

describe('đối chiếu với lá số: can sách nêu có trong lá chưa', () => {
  // Giáp Thìn · Đinh Mão · Giáp Tý · Mậu Thìn: Giáp sinh tháng Mão, sách xét Bính Quý trước, thân mạnh Canh Mậu Đinh
  const pl = [{ can: 0, chi: 4 }, { can: 3, chi: 3 }, { can: 0, chi: 0 }, { can: 4, chi: 4 }];
  it('phân biệt lộ ra can, chỉ ẩn trong chi, và chưa có', () => {
    expect(presenceOf(pl, 3)).toEqual({ can: 3, lo: ['can tháng'], tang: [] }); // Đinh lộ ở can tháng
    expect(presenceLevel(presenceOf(pl, 9))).toBe('tang'); // Quý: Tý (bản khí), Thìn (dư khí)
    expect(presenceOf(pl, 9).tang).toEqual(['chi năm Thìn (dư khí)', 'chi ngày Tý (bản khí)', 'chi giờ Thìn (dư khí)']);
    expect(presenceLevel(presenceOf(pl, 6))).toBe('khong'); // Canh
    expect(presenceOf(pl, 0).lo).toEqual(['can năm']); // can ngày là chính mình, không tính
    const t = sectionPlainText(thuongLySection(0, 3, 'Hoả', pl));
    expect(t).toContain('Lá của bạn có các can này chưa?');
    expect(t).toContain('Bính (Hoả): lá số chưa có.');
    expect(t).toContain('Đinh (Hoả): lộ ra ở can tháng.');
    expect(t).toContain('Quý (Thuỷ): chưa lộ ra can nào, chỉ ẩn trong chi năm Thìn');
    expect(bookCans(thuongLyOf(0, 3)).length).toBe(5); // Bính Quý Canh Mậu Đinh, không lặp
  });
  it('lá số thật: câu "can xét trước" gặp đủ ba trường hợp, mọi can sách nêu đều có một dòng, lời Thầy không có từ cấm', () => {
    let seed = 20261113; const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
    const seen = new Set<string>();
    for (let i = 0; i < 1500; i++) {
      const ch = batTuChart({ gender: 'M', dd: 1 + Math.floor(rnd() * 28), mm: 1 + Math.floor(rnd() * 12), yy: 1940 + Math.floor(rnd() * 80), hourIdx: Math.floor(rnd() * 12) } as never);
      const t = thuongLyOf(ch.nhatChu, ch.monthChiIdx);
      const first = canList(t.uu)[0];
      seen.add(presenceLevel(presenceOf(ch.pillars, first)));
      const sec = thuongLySection(ch.nhatChu, ch.monthChiIdx, 'Mộc', ch.pillars);
      const li = sec.blocks.find((b) => b.id === 'thuongly.co.list') as { items: unknown[] };
      expect(li.items.length).toBe(bookCans(t).length);
      expect(sectionPlainText(sec)).not.toMatch(/undefined|NaN/);
      const sp = thuongLySpeech(ch.nhatChu, ch.monthChiIdx, ch.pillars).toLowerCase();
      expect(sp).toContain(firstCanVerdict(t, ch.pillars).toLowerCase());
      for (const w of NO_SPEECH_TERMS) expect(sp).not.toContain(w);
    }
    expect([...seen].sort()).toEqual(['khong', 'lo', 'tang']);
  });
  it('không truyền lá số thì giữ nguyên như trước (không có phần đối chiếu)', () => {
    expect(sectionPlainText(thuongLySection(0, 2, 'Hoả'))).not.toMatch(/Lá của bạn có các can này chưa/);
  });
});
