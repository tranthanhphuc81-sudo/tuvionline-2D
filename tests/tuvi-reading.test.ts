/* Phần tính toán luận giải Tử Vi chuyển từ legacy (src/core/tuvi/reading.ts). Câu chữ được kiểm ở tests/parity/tuvi.test.ts. */
import { describe, it, expect } from 'vitest';
import { TuViEngine, brightness, chiRel, tamPhuong, tuViYear, tuViYearLookup, tuViReading, banMenh, cungNameFor } from '../src/core';

const [d, m, y] = TuViEngine.convertLunar2Solar(12, 7, 1979, 0, 7);
const ch = TuViEngine.calcChart({ gender: 'M', dd: d, mm: m, yy: y, hourBranchIdx: 4 }); // Chương 10, Phần 1
const CHI = TuViEngine.CHI;

describe('reading — quy tắc nhỏ', () => {
  it('độ sáng chỉ xét Thái Dương / Thái Âm', () => {
    expect(brightness('Thái Dương', 2)).toBe(1);
    expect(brightness('Thái Dương', 0)).toBe(-1);
    expect(brightness('Thái Dương', 7)).toBe(0);
    expect(brightness('Thái Âm', 9)).toBe(1);
    expect(brightness('Thái Âm', 4)).toBe(-1);
    expect(brightness('Tử Vi', 4)).toBe(0);
  });
  it('quan hệ Chi: Lục Hợp, Tam Hợp, Lục Xung', () => {
    expect(chiRel(0, 1)).toEqual({ s: 1, kind: 'luc-hop' });
    expect(chiRel(8, 4)).toEqual({ s: 1, kind: 'tam-hop' });
    expect(chiRel(0, 6)).toEqual({ s: -1, kind: 'luc-xung' });
    expect(chiRel(3, 3)).toEqual({ s: 0, kind: 'same' });
    expect(chiRel(0, 2)).toEqual({ s: 0, kind: 'none' });
  });
  it('tam phương tứ chính', () => {
    expect(tamPhuong(4)).toEqual([4, 8, 0, 10]);
  });
  it('bản mệnh = Nạp Âm năm Kỷ Mùi: Thiên Thượng Hoả', () => {
    expect(banMenh(ch)).toEqual({ hanh: 'Hoả', ten: 'Thiên Thượng Hoả' });
  });
});

describe('lưu niên', () => {
  it('năm trước năm sinh thì không có lưu niên', () => {
    expect(tuViYear(ch, 1978)).toBeNull();
  });
  it('năm sinh: tuổi 1, Tiểu Hạn ở cung khởi (Sửu, Nam đi thuận), là năm tuổi', () => {
    const r = tuViYear(ch, 1979)!;
    expect([r.age, CHI[r.tieuHanChi], r.namTuoi, r.canChi]).toEqual([1, 'Sửu', true, 'Kỷ Mùi']);
    expect(r.thaiTueCung).toBe(cungNameFor(ch.menhChi, 7));
  });
  it('tra năm: Đại Hạn trong 12 chặng và quay vòng khi quá 120 tuổi', () => {
    const a = tuViYearLookup(ch, 1990);
    expect([a.age, CHI[a.daiHanChi!], a.daiHan?.tuoiStart]).toEqual([12, 'Thìn', 3]);
    const b = tuViYearLookup(ch, 1979 + 130);
    expect(b.daiHan).toBeNull();
    expect(b.daiHanChi).not.toBeNull();
    expect(tuViYearLookup(ch, 1970)).toMatchObject({ age: -8, daiHanChi: null, tieuHanChi: null });
  });
});

describe('tổng kết', () => {
  it('Đại Hạn hiện tại theo năm truyền vào; 3 năm lưu niên', () => {
    const r = tuViReading(ch, 2026);
    expect(r.daiHanNow?.age).toBe(48);
    expect(r.daiHanNow?.daiHan.tuoiStart).toBe(43);
    expect(r.years.map((x) => x.year)).toEqual([2026, 2027, 2028]);
    expect(r.areas.map((a) => a.cung)).toEqual(['Tài Bạch', 'Quan Lộc', 'Phu Thê', 'Tật Ách', 'Điền Trạch', 'Thiên Di']);
  });
});
