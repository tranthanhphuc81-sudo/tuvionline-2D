/* Bát Tự Tứ Trụ (Phần 2): lập 4 trụ theo tiết khí, Đại Vận, tuổi khởi vận, Thập Thần, Tàng Can. */
import { jdFromDate, convertSolar2Lunar, convertLunar2Solar, findSolarTerm, tietAround, lunarTzForSolarYear } from '../calendar';
import {
  CAN, CHI, HOUR_RANGES, mod, dayCanChiIndex, yearCanChiIndex, canOfChiFromDan, canOfHourFromTy, cycleIdx, fromCycle,
  type CanChi, type CanIdx, type ChiIdx,
} from '../canchi';
import type { BatTuChart, BatTuInput, BtHanhIdx, Pillar, TangCanRole, ThapThan } from './types';

/** Thứ tự hành RIÊNG của Bát Tự — khác Lục Hào (ARCHITECTURE.md mục 5.3 điểm 2). */
export const BT_HANH_ORDER = ['Mộc', 'Hoả', 'Thổ', 'Kim', 'Thuỷ'] as const;
const HANH5 = BT_HANH_ORDER;
export const CAN_HANH: readonly BtHanhIdx[] = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4];
/** Tý Thuỷ, Sửu Thổ, Dần Mộc, Mão Mộc, Thìn Thổ, Tỵ Hoả, Ngọ Hoả, Mùi Thổ, Thân Kim, Dậu Kim, Tuất Thổ, Hợi Thuỷ */
export const CHI_HANH: readonly BtHanhIdx[] = [4, 2, 0, 0, 2, 1, 1, 2, 3, 3, 2, 4];
/** Giờ đại diện của mỗi giờ (2 tiếng), tính bằng độ lệch so với giữa trưa — JD nguyên của jdFromDate ứng với giữa trưa. */
export const HOUR_OFFSET_FROM_NOON: readonly number[] = [-12, -10, -8, -6, -4, -2, 0, 2, 4, 6, 8, 10];

export const TANG_CAN: Record<number, readonly (readonly [CanIdx, TangCanRole])[]> = {
  0: [[9, 'Bản khí']], 1: [[5, 'Bản khí'], [9, 'Trung khí'], [7, 'Dư khí']],
  2: [[0, 'Bản khí'], [2, 'Trung khí'], [4, 'Dư khí']], 3: [[1, 'Bản khí']],
  4: [[4, 'Bản khí'], [1, 'Trung khí'], [9, 'Dư khí']], 5: [[2, 'Bản khí'], [6, 'Trung khí'], [4, 'Dư khí']],
  6: [[3, 'Bản khí'], [5, 'Trung khí']], 7: [[5, 'Bản khí'], [3, 'Trung khí'], [1, 'Dư khí']],
  8: [[6, 'Bản khí'], [8, 'Trung khí'], [4, 'Dư khí']], 9: [[7, 'Bản khí']],
  10: [[4, 'Bản khí'], [7, 'Trung khí'], [3, 'Dư khí']], 11: [[8, 'Bản khí'], [0, 'Trung khí']],
};
type Rel = 'same' | 'taSinh' | 'taKhac' | 'khacTa' | 'sinhTa';
export const THAP_THAN: Record<Rel, { same: ThapThan; diff: ThapThan }> = {
  same: { same: 'Tỷ Kiên', diff: 'Kiếp Tài' }, taSinh: { same: 'Thực Thần', diff: 'Thương Quan' },
  taKhac: { same: 'Thiên Tài', diff: 'Chính Tài' }, khacTa: { same: 'Thất Sát', diff: 'Chính Quan' },
  sinhTa: { same: 'Thiên Ấn', diff: 'Chính Ấn' },
};
export const GIUP_THAN: readonly ThapThan[] = ['Tỷ Kiên', 'Kiếp Tài', 'Thiên Ấn', 'Chính Ấn'];

export function thapThan(nhatChuCan: CanIdx, targetCan: CanIdx): ThapThan {
  const ne = Math.floor(nhatChuCan / 2), te = Math.floor(targetCan / 2);
  const parity = (nhatChuCan % 2 === targetCan % 2) ? 'same' : 'diff';
  let rel: Rel;
  if (te === ne) rel = 'same';
  else if (te === mod(ne + 1, 5)) rel = 'taSinh';
  else if (te === mod(ne + 2, 5)) rel = 'taKhac';
  else if (te === mod(ne + 3, 5)) rel = 'khacTa';
  else rel = 'sinhTa';
  return THAP_THAN[rel][parity];
}

/** Vượng – Tướng – Hưu – Tù – Tử theo mùa (Chi tháng). */
export const VTHTT_ORDER = ['Vượng', 'Tướng', 'Hưu', 'Tù', 'Tử'] as const;
/** Hành vượng theo mùa (chỉ số BT_HANH_ORDER). */
export function seasonHanh(monthChiIdx: ChiIdx): BtHanhIdx {
  if ([2, 3].includes(monthChiIdx)) return 0; // Xuân → Mộc
  if ([5, 6].includes(monthChiIdx)) return 1; // Hạ → Hoả
  if ([8, 9].includes(monthChiIdx)) return 3; // Thu → Kim
  if ([11, 0].includes(monthChiIdx)) return 4; // Đông → Thuỷ
  return 2; // Tứ quý → Thổ
}

export function calcChart(input: BatTuInput): BatTuChart {
  // Tiết khí của Bát Tự dùng UTC+7 cố định, kể cả năm trước 1968 (ARCHITECTURE.md mục 5.3 điểm 3 — giữ nguyên).
  const TZ = 7;
  const { gender, dd, mm, yy, hourChiIdx } = input;
  const lunar = convertSolar2Lunar(dd, mm, yy, lunarTzForSolarYear(yy));
  // Trụ Năm: theo tiết Lập Xuân
  const jdLX_thisYear = findSolarTerm(jdFromDate(4, 2, yy), 315, TZ);
  const inputJD = jdFromDate(dd, mm, yy) + HOUR_OFFSET_FROM_NOON[hourChiIdx] / 24;
  const tietYear = (inputJD >= jdLX_thisYear) ? yy : yy - 1;
  const yearCC = yearCanChiIndex(tietYear);
  // Trụ Tháng: tìm đoạn tiết chứa inputJD
  const allTiet = tietAround(yy, TZ);
  let monthChiIdx: ChiIdx | null = null;
  for (let i = 0; i < allTiet.length - 1; i++) {
    if (inputJD >= allTiet[i].jd && inputJD < allTiet[i + 1].jd) { monthChiIdx = allTiet[i].chiIdx; break; }
  }
  if (monthChiIdx === null) throw new Error('Bát Tự: không tìm được tiết của tháng');
  const monthCanIdx = canOfChiFromDan(yearCC.can, monthChiIdx);
  // Trụ Ngày
  const dayCC = dayCanChiIndex(dd, mm, yy);
  const nhatChu = dayCC.can;
  // Trụ Giờ
  const gioCanIdx = canOfHourFromTy(dayCC.can, hourChiIdx);

  const pillars: Pillar[] = [
    { role: 'Trụ Năm', can: yearCC.can, chi: yearCC.chi },
    { role: 'Trụ Tháng', can: monthCanIdx, chi: monthChiIdx },
    { role: 'Trụ Ngày', can: dayCC.can, chi: dayCC.chi, isNhatChu: true },
    { role: 'Trụ Giờ', can: gioCanIdx, chi: hourChiIdx },
  ];

  const isDuongCan = (yearCC.can % 2 === 0);
  const thuanDaiVan = (gender === 'M') === isDuongCan; // Dương Nam hoặc Âm Nữ → thuận

  const startCycle = cycleIdx(monthCanIdx, monthChiIdx);
  const daiVan: CanChi[] = [];
  for (let i = 0; i < 9; i++) daiVan.push(fromCycle(thuanDaiVan ? startCycle + i : startCycle - i));

  // Tuổi khởi vận: đếm số ngày tới tiết liền kề (thuận: tiết kế tiếp; nghịch: tiết liền trước)
  let khoiVanDiffDays: number;
  if (thuanDaiVan) {
    const next = allTiet.find((t) => t.jd > inputJD)!;
    khoiVanDiffDays = next.jd - inputJD;
  } else {
    const prevArr = allTiet.filter((t) => t.jd <= inputJD);
    const prev = prevArr[prevArr.length - 1];
    khoiVanDiffDays = inputJD - prev.jd;
  }
  const totalMonths = khoiVanDiffDays * 4;
  let khoiVanYears = Math.floor(totalMonths / 12);
  let khoiVanMonths = Math.round(totalMonths - khoiVanYears * 12);
  if (khoiVanMonths >= 12) { khoiVanMonths = 0; khoiVanYears += 1; }

  return {
    lunar, yearCC, monthCanIdx, monthChiIdx, dayCC, gioCanIdx, hourChiIdx, nhatChu,
    pillars, isDuongCan, thuanDaiVan, daiVan, khoiVanYears, khoiVanMonths, khoiVanDiffDays, tietYear,
  };
}

export const BatTuEngine = {
  CAN, CHI, HANH5, CAN_HANH, CHI_HANH, HOUR_RANGES, TANG_CAN, THAP_THAN, GIUP_THAN,
  mod, thapThan, seasonHanh, VTHTT_ORDER, calcChart, yearCanChiIndex, convertSolar2Lunar, convertLunar2Solar,
};
export default BatTuEngine;
