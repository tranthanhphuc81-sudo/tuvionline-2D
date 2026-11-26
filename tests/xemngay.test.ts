/* Xem ngày (ARCHITECTURE mục 17). Trực và giờ hoàng đạo đối chiếu xemlicham.com (đọc 26/11/2026). */
import { describe, expect, it } from 'vitest';
import { dayInfo, daysFrom, findDays, monthDays, tuoiChi, viecVerdict, HOANG_DAO_THAN, THAN_ORDER, TRUC_VIEC, VIEC_ORDER } from '../src/core';
import { thanhLongStart } from '../src/core/xemngay';

const CHI = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];
const at = (n: string) => CHI.indexOf(n);

describe('Đối chiếu lịch vạn niên', () => {
  it('26/11/2026: Giáp Thìn, 18/10 âm, tháng Hợi, trực Chấp, Tư Mệnh hoàng đạo, xung Tuất', () => {
    const d = dayInfo(26, 11, 2026);
    expect(d.canChi).toEqual({ can: 0, chi: at('Thìn') });
    expect(d.lunar).toEqual({ day: 18, month: 10, year: 2026, leap: false });
    expect(d.monthChi).toBe(at('Hợi'));
    expect(d.truc).toBe('chap');
    expect(d.than).toBe('tu-menh');
    expect(d.hoangDao).toBe(true);
    expect(d.xungChi).toBe(at('Tuất'));
    expect(d.weekday).toBe(4);
  });
  it('8/11/2026 (30/9 âm, đã qua Lập Đông): trực Bế, tháng tiết Hợi chứ không theo tháng 9 âm', () => {
    const d = dayInfo(8, 11, 2026);
    expect(d.lunar.month).toBe(9);
    expect(d.monthChi).toBe(at('Hợi'));
    expect(d.truc).toBe('be');
    expect(d.xungChi).toBe(at('Thìn'));
  });
  it('5/2/2026 (18/12 âm, đã qua Lập Xuân): trực Thành', () => {
    const d = dayInfo(5, 2, 2026);
    expect(d.lunar).toEqual({ day: 18, month: 12, year: 2025, leap: false });
    expect(d.truc).toBe('thanh');
  });
  it('ngày Thìn, Tuất: giờ hoàng đạo Dần, Thìn, Tỵ, Thân, Dậu, Hợi', () => {
    const want = ['Dần', 'Thìn', 'Tỵ', 'Thân', 'Dậu', 'Hợi'].map(at);
    for (const [dd, mm, yy] of [[26, 11, 2026], [8, 11, 2026], [5, 2, 2026]]) expect(dayInfo(dd, mm, yy).hours).toEqual(want);
  });
});

describe('Quy tắc an thần và trực', () => {
  it('bảng khởi Thanh Long', () => {
    const table: Record<string, string> = { Dần: 'Tý', Thân: 'Tý', Mão: 'Dần', Dậu: 'Dần', Thìn: 'Thìn', Tuất: 'Thìn', Tỵ: 'Ngọ', Hợi: 'Ngọ', Ngọ: 'Thân', Tý: 'Thân', Mùi: 'Tuất', Sửu: 'Tuất' };
    for (const [m, start] of Object.entries(table)) expect(CHI[thanhLongStart(at(m))]).toBe(start);
  });
  it('sáu thần hoàng đạo, sáu hắc đạo; mỗi ngày đúng sáu giờ hoàng đạo', () => {
    expect(THAN_ORDER.filter((t) => HOANG_DAO_THAN.has(t))).toEqual(['thanh-long', 'minh-duong', 'kim-quy', 'kim-duong', 'ngoc-duong', 'tu-menh']);
    for (const d of monthDays(11, 2026)) expect(d.hours).toHaveLength(6);
  });
  it('ngày giao tiết lặp lại trực của hôm trước (mọi lần giao tiết trong năm 2026)', () => {
    const days = daysFrom({ dd: 1, mm: 1, yy: 2026 }, 365);
    let switches = 0;
    for (let i = 1; i < days.length; i++) {
      if (days[i].monthChi === days[i - 1].monthChi) continue;
      switches++;
      expect(days[i].truc).toBe(days[i - 1].truc);
    }
    expect(switches).toBe(12);
  });
  it('trực chạy liên tục trong một tháng tiết', () => {
    const days = daysFrom({ dd: 8, mm: 11, yy: 2026 }, 28);
    const order = ['kien', 'tru', 'man', 'binh', 'dinh', 'chap', 'pha', 'nguy', 'thanh', 'thu', 'khai', 'be'];
    for (let i = 1; i < days.length; i++) {
      if (days[i].monthChi !== days[i - 1].monthChi) continue;
      expect(order.indexOf(days[i].truc)).toBe((order.indexOf(days[i - 1].truc) + 1) % 12);
    }
  });
  it('không cuộn ngày sai', () => {
    expect(() => dayInfo(31, 2, 2026)).toThrow(RangeError);
    expect(monthDays(2, 2024)).toHaveLength(29);
    expect(monthDays(2, 2026)).toHaveLength(28);
  });
  it('trước 1968 dùng múi giờ UTC+8 vẫn tính được', () => {
    expect(dayInfo(15, 6, 1960).hours).toHaveLength(6);
  });
});

describe('Mức ngày, xung tuổi, việc', () => {
  it('mức chung: đẹp khi hoàng đạo và trực không phải Phá, Bế; nên tránh khi hắc đạo gặp Phá, Bế', () => {
    for (const d of daysFrom({ dd: 1, mm: 1, yy: 2026 }, 365)) {
      const xau = d.truc === 'pha' || d.truc === 'be';
      expect(d.grade).toBe(d.hoangDao && !xau ? 'dep' : !d.hoangDao && xau ? 'tranh' : 'thuong');
    }
  });
  it('tuổi Tuất gặp ngày Giáp Thìn: xung, hạ một bậc, mọi việc đều kỵ', () => {
    const tuat = tuoiChi(1994);
    expect(CHI[tuat]).toBe('Tuất');
    const d = dayInfo(26, 11, 2026, tuat);
    expect(d.person).toEqual({ birthChi: tuat, xung: true, grade: 'thuong' });
    for (const v of VIEC_ORDER) expect(viecVerdict(d, v)).toBe('ky');
  });
  it('không xung thì giữ mức chung', () => {
    const d = dayInfo(26, 11, 2026, tuoiChi(1990));
    expect(d.person?.xung).toBe(false);
    expect(d.person?.grade).toBe(d.grade);
  });
  it('tuổi đổi theo năm âm truyền vào (năm âm 1993 là Dậu)', () => {
    expect(CHI[tuoiChi(1993)]).toBe('Dậu');
  });
  it('26/11/2026 trực Chấp: sắm sửa đồ lớn kỵ, ký kết hợp', () => {
    const d = dayInfo(26, 11, 2026);
    expect(viecVerdict(d, 'sam-sua')).toBe('ky');
    expect(viecVerdict(d, 'ky-ket')).toBe('hop');
    expect(viecVerdict(d, 'khai-truong')).toBe('ky');
  });
  it('ngày tìm được cho một việc luôn là hoàng đạo, trực nên làm việc đó, không xung tuổi', () => {
    const tuat = tuoiChi(1994);
    for (const v of VIEC_ORDER) {
      for (const d of findDays({ dd: 26, mm: 11, yy: 2026 }, 60, v, tuat)) {
        expect(d.hoangDao).toBe(true);
        expect(TRUC_VIEC[d.truc].nen).toContain(v);
        expect(d.person?.xung).toBe(false);
      }
      expect(findDays({ dd: 26, mm: 11, yy: 2026 }, 60, v).length).toBeGreaterThan(0);
    }
  });
  it('bảng việc không có việc vừa nên vừa kỵ trong cùng một trực', () => {
    for (const t of Object.values(TRUC_VIEC)) expect(t.nen.filter((v) => t.ky.includes(v))).toEqual([]);
  });
});

describe('Câu chữ xem ngày', async () => {
  const C = await import('../src/content/xemngay');
  const { hasBannedTerm } = await import('../src/content/nguhanh/vocab');
  it('không có từ cấm trong mọi câu, ở mọi ngày của một năm', () => {
    const fixed = [...Object.values(C.TRUC_VI).map((t) => t.text), ...Object.values(C.VIEC_VI), C.XEMNGAY_INTRO, C.XEMNGAY_RULE_NOTE, C.XEMNGAY_PRACTICAL, C.FIND_NONE, C.XEMNGAY_NO_PROFILE];
    for (const t of fixed) expect(hasBannedTerm(t), t).toBe(false);
    for (const d of daysFrom({ dd: 1, mm: 1, yy: 2026 }, 365, tuoiChi(1994))) {
      const lines = [C.thanLine(d), C.hoursLine(d), C.tuoiLine(d), C.lunarLine(d), ...VIEC_ORDER.map((v) => C.viecLine(d, v, viecVerdict(d, v)))];
      for (const t of lines) expect(hasBannedTerm(t), t).toBe(false);
    }
  });
  it('dòng giờ và dòng ngày', () => {
    const d = dayInfo(26, 11, 2026);
    expect(C.solarLine(d)).toBe('Thứ Năm, 26/11/2026');
    expect(C.lunarLine(d)).toBe('Âm lịch 18/10 · ngày Giáp Thìn');
    expect(C.hoursLine(d)).toBe('Giờ hoàng đạo: Dần (03–05 giờ), Thìn (07–09 giờ), Tỵ (09–11 giờ), Thân (15–17 giờ), Dậu (17–19 giờ), Hợi (21–23 giờ).');
    expect(C.thanLine(d)).toContain('Hoàng đạo: ngày Tư Mệnh');
    expect(C.tuoiLine(d)).toContain('xung tuổi Tuất');
  });
});
