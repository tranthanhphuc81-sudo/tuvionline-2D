/* 12 tiết đầu tháng (dùng cho Trụ Tháng Bát Tự, tháng của Lục Hào, Lập Xuân của Bát Trạch). */
import { jdFromDate } from './julian';
import { findSolarTerm } from './astro';
import type { ChiIdx } from '../types';

/** [tên, kinh độ Mặt Trời (°), Chi của tháng bắt đầu, tháng đoán, ngày đoán] */
export type TietRow = readonly [name: string, deg: number, chiIdx: ChiIdx, guessMM: number, guessDD: number];

export const TIET: readonly TietRow[] = [
  ['Tiểu Hàn', 285, 1, 1, 6], ['Lập Xuân', 315, 2, 2, 4], ['Kinh Trập', 345, 3, 3, 6],
  ['Thanh Minh', 15, 4, 4, 5], ['Lập Hạ', 45, 5, 5, 6], ['Mang Chủng', 75, 6, 6, 6],
  ['Tiểu Thử', 105, 7, 7, 7], ['Lập Thu', 135, 8, 8, 8], ['Bạch Lộ', 165, 9, 9, 8],
  ['Hàn Lộ', 195, 10, 10, 8], ['Lập Đông', 225, 11, 11, 7], ['Đại Tuyết', 255, 0, 12, 7],
];

export interface TietBoundary { name: string; chiIdx: ChiIdx; jd: number }

export function tietBoundariesForYear(yy: number, tz: number): TietBoundary[] {
  return TIET.map(([name, deg, chiIdx, mm, dd]) => ({ name, chiIdx, jd: findSolarTerm(jdFromDate(dd, mm, yy), deg, tz) }));
}

/** Tiết của năm trước, năm nay, năm sau — sắp theo thời gian. */
export function tietAround(yy: number, tz: number): TietBoundary[] {
  return [...tietBoundariesForYear(yy - 1, tz), ...tietBoundariesForYear(yy, tz), ...tietBoundariesForYear(yy + 1, tz)]
    .sort((a, b) => a.jd - b.jd);
}

/** Thời điểm Lập Xuân (JD thực) của năm dương `year`. */
export function lapXuanJD(year: number, tz: number): number {
  return findSolarTerm(jdFromDate(4, 2, year), 315, tz);
}

/** Chi tháng theo tiết, so ngày sinh theo quy ước JD giữa trưa (Lục Hào). Không tìm thấy thì trả 0. */
export function monthChiFromDate(dd: number, mm: number, yy: number, tz: number): ChiIdx {
  const inputJD = jdFromDate(dd, mm, yy);
  const allTiet = tietAround(yy, tz);
  for (let i = 0; i < allTiet.length - 1; i++) {
    if (inputJD >= allTiet[i].jd && inputJD < allTiet[i + 1].jd) return allTiet[i].chiIdx;
  }
  return 0;
}
