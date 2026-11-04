/* Bộ kiểm thử "vàng" — các kết quả đã đối chiếu với tài liệu Lý Số (docs/) và bản web.
   Mọi thay đổi ở src/core (chuyển sang TypeScript, gộp hàm lịch âm...) PHẢI giữ toàn bộ file này xanh. */
import { describe, it, expect } from 'vitest';
import { LySoUtil, TuViEngine, BatTuEngine, LucHaoEngine, PhongThuyEngine, NapAmEngine, napAmForBirth, quickProfile } from '../src/core';

const CHI = TuViEngine.CHI as string[];
const at = (name: string) => CHI.indexOf(name);

describe('Lịch âm (thuật toán Hồ Ngọc Đức)', () => {
  it('Tết Giáp Thìn 2024 là 10/2/2024', () => {
    expect(TuViEngine.convertSolar2Lunar(10, 2, 2024, 7)).toEqual([1, 1, 2024, 0]);
  });
  it('Tết Mậu Thân 1968 (miền Bắc, UTC+7) là 29/1/1968', () => {
    expect(TuViEngine.calcChart({ gender: 'M', dd: 29, mm: 1, yy: 1968, hourBranchIdx: 6 }).lunar).toEqual({ day: 1, month: 1, year: 1968, leap: 0 });
  });
  it('trước 1968 dùng UTC+8: 2/2/1965 là mùng 1 Tết Ất Tỵ', () => {
    expect(TuViEngine.convertSolar2Lunar(2, 2, 1965, LySoUtil.lunarTzForSolarYear(1965))).toEqual([1, 1, 1965, 0]);
  });
  it('đổi âm → dương → âm khớp nhau', () => {
    const [d, m, y] = TuViEngine.convertLunar2Solar(12, 7, 1979, 0, 7);
    expect(TuViEngine.convertSolar2Lunar(d, m, y, 7)).toEqual([12, 7, 1979, 0]);
  });
});

describe('Kiểm tra ngày nhập', () => {
  it('loại ngày không tồn tại', () => {
    expect(LySoUtil.validSolar(31, 2, 1996)).toBe(false);
    expect(LySoUtil.validSolar(29, 2, 2024)).toBe(true);
    expect(LySoUtil.validSolar(29, 2, 2023)).toBe(false);
  });
  it('giờ Tý muộn cộng 1 ngày, qua tháng/năm', () => {
    expect(LySoUtil.shiftSolar(31, 12, 1999, 1)).toEqual([1, 1, 2000]);
  });
});

describe('Tử Vi — ví dụ Chương 10, Phần 1 (Nam, Kỷ Mùi, 12/7 âm lịch, giờ Thìn)', () => {
  const [d, m, y] = TuViEngine.convertLunar2Solar(12, 7, 1979, 0, 7);
  const c = TuViEngine.calcChart({ gender: 'M', dd: d, mm: m, yy: y, hourBranchIdx: 4 });
  const starAt = (s: string) => CHI[Number(Object.entries(c.stars).find(([, list]) => (list as string[]).includes(s))![0])];

  it('Mệnh Thìn, Thân Tý, Mộc Tam Cục', () => {
    expect(CHI[c.menhChi]).toBe('Thìn');
    expect(CHI[c.thanChi]).toBe('Tý');
    expect(c.cucTen).toBe('Mộc Tam Cục');
  });
  it('14 chính tinh đúng vị trí', () => {
    const expected: Record<string, string> = {
      'Tử Vi': 'Tỵ', 'Thiên Cơ': 'Thìn', 'Thái Dương': 'Dần', 'Vũ Khúc': 'Sửu', 'Thiên Đồng': 'Tý', 'Liêm Trinh': 'Dậu',
      'Thiên Phủ': 'Hợi', 'Thái Âm': 'Tý', 'Tham Lang': 'Sửu', 'Cự Môn': 'Dần', 'Thiên Tướng': 'Mão', 'Thiên Lương': 'Thìn', 'Thất Sát': 'Tỵ', 'Phá Quân': 'Dậu',
    };
    for (const [s, chi] of Object.entries(expected)) expect(starAt(s), s).toBe(chi);
  });
  it('vòng Trường Sinh / Thái Tuế / Lộc Tồn', () => {
    expect(c.truongSinh[at('Thìn')]).toBe('Tử');
    expect(c.truongSinh[at('Tý')]).toBe('Dưỡng');
    expect(c.thaiTue[at('Thìn')]).toBe('Phúc Đức');
    expect(c.thaiTue[at('Tý')]).toBe('Tử Phù');
    expect([CHI[c.locTonChi], CHI[c.kinhDuongChi], CHI[c.daLaChi]]).toEqual(['Ngọ', 'Mùi', 'Tỵ']);
  });
  it('Tứ Hoá Can Kỷ', () => {
    expect(c.tuHoaBanMenh).toEqual({ loc: 'Vũ Khúc', quyen: 'Tham Lang', khoa: 'Thiên Lương', ky: 'Văn Khúc' });
  });
  it('Đại Hạn và Tiểu Hạn', () => {
    expect(c.daiHan.slice(0, 3).map((x: { chi: number; tuoiStart: number }) => [CHI[x.chi], x.tuoiStart])).toEqual([['Thìn', 3], ['Mão', 13], ['Dần', 23]]);
    expect(CHI[c.tieuHanStartChi]).toBe('Sửu');
    expect(c.thuanTieuHan).toBe(true);
  });
});

describe('Tử Vi — tên 12 cung và Trường Sinh theo Cục', () => {
  it('Mệnh tại Hợi: Huynh Đệ ở Tuất, Phụ Mẫu ở Tý, Quan Lộc ở Mão, Tài Bạch ở Mùi', () => {
    const c = TuViEngine.calcChart({ gender: 'M', dd: 15, mm: 6, yy: 1996, hourBranchIdx: 6 });
    expect(CHI[c.menhChi]).toBe('Hợi');
    const name = (chi: string) => c.daiHan.find((x: { chi: number }) => x.chi === at(chi))!.cungTen;
    expect([name('Tuất'), name('Tý'), name('Mão'), name('Mùi'), name('Tỵ')]).toEqual(['Huynh Đệ', 'Phụ Mẫu', 'Quan Lộc', 'Tài Bạch', 'Thiên Di']);
  });
  it('Kim Tứ Cục khởi Trường Sinh tại Tỵ, Hoả Lục Cục tại Dần', () => {
    const found: Record<string, string> = {};
    for (let d = 1; d <= 28 && Object.keys(found).length < 5; d++) {
      for (let h = 0; h < 12; h++) {
        const c = TuViEngine.calcChart({ gender: 'M', dd: d, mm: 3, yy: 1990, hourBranchIdx: h });
        const ts = Object.entries(c.truongSinh).find(([, v]) => v === 'Trường Sinh')!;
        found[c.cucHanh] = CHI[Number(ts[0])];
      }
    }
    expect(found).toMatchObject({ Kim: 'Tỵ', Hoả: 'Dần', Mộc: 'Hợi', Thuỷ: 'Thân', Thổ: 'Thân' });
  });
});

describe('Bát Tự — ví dụ vàng 6/2/2021 giờ Ngọ', () => {
  it('Tân Sửu · Canh Dần · Ất Dậu · Nhâm Ngọ', () => {
    const c = BatTuEngine.calcChart({ gender: 'M', dd: 6, mm: 2, yy: 2021, hourChiIdx: 6 });
    const { CAN, CHI: C } = BatTuEngine;
    expect(c.pillars.map((p: { can: number; chi: number }) => `${CAN[p.can]} ${C[p.chi]}`)).toEqual(['Tân Sửu', 'Canh Dần', 'Ất Dậu', 'Nhâm Ngọ']);
  });
  it('sinh trước Lập Xuân thì Trụ Năm thuộc năm trước', () => {
    const c = BatTuEngine.calcChart({ gender: 'M', dd: 1, mm: 2, yy: 2021, hourChiIdx: 6 });
    expect(c.tietYear).toBe(2020);
  });
});

describe('Lục Hào — ví dụ Chương 10, Phần 3 (7,7,9,8,6,8)', () => {
  it('Địa Thiên Thái, cung Khôn, Tam thế, Thế 3 / Ứng 6, có quẻ biến', () => {
    const r = LucHaoEngine.calcQuai([7, 7, 9, 8, 6, 8]);
    expect([r.name, r.cung, r.step, r.theHao, r.ungHao]).toEqual(['Địa Thiên Thái', 'Khôn', 'Tam thế', 3, 6]);
    expect(r.bien).not.toBeNull();
  });
});

describe('Bát Trạch', () => {
  it('Mệnh Quái theo năm & giới tính', () => {
    expect(PhongThuyEngine.menhQuai(1988, 'M')).toBe('Chấn');
    expect(PhongThuyEngine.menhQuai(1988, 'F')).toBe('Chấn');
    expect(PhongThuyEngine.menhQuai(1990, 'M')).toBe('Khảm');
    expect(PhongThuyEngine.menhQuai(2000, 'M')).toBe('Ly');
    expect(PhongThuyEngine.menhQuai(2000, 'F')).toBe('Càn');
  });
  it('Du Niên của Tốn: Sinh Khí ở Khảm (Bắc)', () => {
    const sk = PhongThuyEngine.duNien('Tốn').find((s: { star: string }) => s.star === 'Sinh Khí')!;
    expect(sk.quai).toBe('Khảm');
    expect(PhongThuyEngine.QUAI_TO_HUONG[sk.quai]).toBe('Bắc');
  });
});

describe('Nạp Âm', () => {
  it('tính theo năm âm lịch: 20/1/1990 vẫn là Kỷ Tỵ – Đại Lâm Mộc', () => {
    const r = napAmForBirth(20, 1, 1990);
    expect([r.canChiTen, r.ten, r.beforeTet]).toEqual(['Kỷ Tỵ', 'Đại Lâm Mộc', true]);
  });
  it('ví dụ B Phụ lục: 1981 Thạch Lựu Mộc, 1985 Hải Trung Kim, Kim khắc Mộc', () => {
    const a = NapAmEngine.napAmOfYear(1981), b = NapAmEngine.napAmOfYear(1985);
    expect([a.ten, b.ten]).toEqual(['Thạch Lựu Mộc', 'Hải Trung Kim']);
    expect(NapAmEngine.relation(a, b).cls).toBe('warn');
  });
  it('ví dụ C Phụ lục: Kiếm Phong Kim gặp Hoả là ngoại lệ có lợi', () => {
    const a = NapAmEngine.napAmOfYear(1992), b = NapAmEngine.napAmOfYear(1978);
    expect([a.ten, b.ten]).toEqual(['Kiếm Phong Kim', 'Thiên Thượng Hoả']);
    expect(NapAmEngine.relation(a, b).cls).toBe('ok');
  });
});

describe('quickProfile (màn hình Tổng Hợp)', () => {
  it('gộp đủ 4 hệ thống cho một người', () => {
    const p = quickProfile({ gender: 'M', dd: 15, mm: 6, yy: 1996, hourIdx: 6 });
    expect(p.tuvi.menhChi).toBe('Hợi');
    expect(p.tuvi.cucTen).toBe('Mộc Tam Cục');
    expect(p.battu.pillars[0]).toBe('Bính Tý');
    expect(p.battrach.quai).toBe('Tốn');
    expect(p.napam.ten).toBe('Giản Hạ Thuỷ');
  });
  it('báo lỗi ngày không tồn tại', () => {
    expect(() => quickProfile({ gender: 'M', dd: 31, mm: 2, yy: 1996, hourIdx: 6 })).toThrow();
  });
});
