import type { CanIdx, ChiIdx, Gender, HourIdx } from '../types';
import type { LunarTuple } from '../calendar/lunar';
import type { CanChi } from '../canchi';

/** Chỉ số hành theo thứ tự RIÊNG của Bát Tự: 0 Mộc, 1 Hoả, 2 Thổ, 3 Kim, 4 Thuỷ (BT_HANH_ORDER). */
export type BtHanhIdx = number;
export type ThapThan =
  | 'Tỷ Kiên' | 'Kiếp Tài' | 'Thực Thần' | 'Thương Quan' | 'Thiên Tài'
  | 'Chính Tài' | 'Thất Sát' | 'Chính Quan' | 'Thiên Ấn' | 'Chính Ấn';
export type TangCanRole = 'Bản khí' | 'Trung khí' | 'Dư khí';

/** Ngày dương ĐÃ xử lý Tý muộn. */
export interface BatTuInput { gender: Gender; dd: number; mm: number; yy: number; hourChiIdx: HourIdx }

export interface Pillar { role: 'Trụ Năm' | 'Trụ Tháng' | 'Trụ Ngày' | 'Trụ Giờ'; can: CanIdx; chi: ChiIdx; isNhatChu?: true }

export interface BatTuChart {
  lunar: LunarTuple;
  yearCC: CanChi;
  monthCanIdx: CanIdx;
  monthChiIdx: ChiIdx;
  dayCC: CanChi;
  gioCanIdx: CanIdx;
  hourChiIdx: HourIdx;
  nhatChu: CanIdx;
  pillars: Pillar[];
  isDuongCan: boolean;
  thuanDaiVan: boolean;
  daiVan: CanChi[];
  khoiVanYears: number;
  khoiVanMonths: number;
  khoiVanDiffDays: number;
  /** Năm tính theo tiết Lập Xuân (Trụ Năm) */
  tietYear: number;
}
