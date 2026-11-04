/* Can Chi dùng chung: tên Can/Chi, can chi năm/ngày/giờ, Ngũ Hổ Độn, Ngũ Thử Độn. */
import { jdFromDate } from '../calendar';
import type { CanIdx, ChiIdx, HourIdx } from '../types';

export type { CanIdx, ChiIdx, HourIdx } from '../types';
export * from './napamTable';
export * from './hanh';

export const CAN: readonly string[] = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
export const CHI: readonly string[] = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];
export const HOUR_RANGES: readonly string[] = [
  '23:00–00:59', '01:00–02:59', '03:00–04:59', '05:00–06:59', '07:00–08:59', '09:00–10:59',
  '11:00–12:59', '13:00–14:59', '15:00–16:59', '17:00–18:59', '19:00–20:59', '21:00–22:59',
];
/** Chi Dần — gốc đếm cung của Tử Vi và tháng Giêng. */
export const DAN: ChiIdx = 2;

export interface CanChi { can: CanIdx; chi: ChiIdx }

/** Phần dư luôn không âm. */
export function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

/** Kiểm tra miền giá trị ở biên. */
export function asChi(n: number): ChiIdx {
  if (!Number.isInteger(n) || n < 0 || n > 11) throw new RangeError(`Chi ngoài miền 0…11: ${n}`);
  return n;
}
export function asCan(n: number): CanIdx {
  if (!Number.isInteger(n) || n < 0 || n > 9) throw new RangeError(`Can ngoài miền 0…9: ${n}`);
  return n;
}

/** Can chi của năm (âm lịch hoặc năm tiết, tuỳ nơi gọi). */
export function yearCanChiIndex(year: number): CanChi {
  return { can: mod(year - 4, 10), chi: mod(year - 4, 12) };
}

/** Can chi của ngày dương lịch. */
export function dayCanChiIndex(dd: number, mm: number, yy: number): CanChi {
  const jd = jdFromDate(dd, mm, yy);
  const idx = mod(jd + 49, 60);
  return { can: idx % 10, chi: idx % 12 };
}

const NGU_HO_DON: Record<number, CanIdx> = { 0: 2, 5: 2, 1: 4, 6: 4, 2: 6, 7: 6, 3: 8, 8: 8, 4: 0, 9: 0 };
const NGU_THU_DON: Record<number, CanIdx> = { 0: 0, 5: 0, 1: 2, 6: 2, 2: 4, 7: 4, 3: 6, 8: 6, 4: 8, 9: 8 };

/** Ngũ Hổ Độn: Can của tháng Dần theo Can năm. */
export function ngHoDonDanCan(yearCanIdx: CanIdx): CanIdx {
  return NGU_HO_DON[yearCanIdx];
}
/** Ngũ Thử Độn: Can của giờ Tý theo Can ngày. */
export function nguThuDonTyCan(dayCanIdx: CanIdx): CanIdx {
  return NGU_THU_DON[dayCanIdx];
}
/** Can của Chi `chiIdx` (tháng/cung) đếm từ Dần theo Ngũ Hổ Độn. */
export function canOfChiFromDan(yearCanIdx: CanIdx, chiIdx: ChiIdx): CanIdx {
  return mod(ngHoDonDanCan(yearCanIdx) + mod(chiIdx - DAN, 12), 10);
}
/** Can của giờ theo Ngũ Thử Độn. */
export function canOfHourFromTy(dayCanIdx: CanIdx, hourChiIdx: HourIdx): CanIdx {
  return mod(nguThuDonTyCan(dayCanIdx) + hourChiIdx, 10);
}

/** Vị trí trong vòng Lục Thập Hoa Giáp (0…59), -1 nếu cặp không hợp lệ (khác âm dương). */
export function cycleIdx(can: CanIdx, chi: ChiIdx): number {
  for (let i = 0; i < 60; i++) if (i % 10 === can && i % 12 === chi) return i;
  return -1;
}
export function fromCycle(i: number): CanChi {
  const j = mod(i, 60);
  return { can: j % 10, chi: j % 12 };
}
