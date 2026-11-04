import type { CanIdx, ChiIdx, Gender, HourIdx } from '../types';
import type { CanChi, Hanh } from '../canchi';

/** Ngày dương ĐÃ xử lý Tý muộn. `tz` tuỳ chọn, mặc định `lunarTzForSolarYear(yy)`; 0 bị coi như không truyền. */
export interface TuViInput { gender: Gender; dd: number; mm: number; yy: number; hourBranchIdx: HourIdx; tz?: number }

export type CungName =
  | 'Mệnh' | 'Phụ Mẫu' | 'Phúc Đức' | 'Điền Trạch' | 'Quan Lộc' | 'Nô Bộc'
  | 'Thiên Di' | 'Tật Ách' | 'Tài Bạch' | 'Tử Tức' | 'Phu Thê' | 'Huynh Đệ';

export interface DaiHan { chi: ChiIdx; tuoiStart: number; tuoiEnd: number; cungTen: CungName }
export interface TuHoa { loc: string; quyen: string; khoa: string; ky: string }

export interface TuViChart {
  lunar: { day: number; month: number; year: number; leap: number };
  yearCC: CanChi;
  dayCC: CanChi;
  gioCanIdx: CanIdx;
  gioChiIdx: HourIdx;
  isDuongCan: boolean;
  thuanDaiHan: boolean;
  menhChi: ChiIdx;
  thanChi: ChiIdx;
  menhCanIdx: CanIdx;
  cucHanh: Hanh;
  cucSo: number;
  cucTen: string;
  napAmTen: string;
  tuViChi: ChiIdx;
  thienPhuChi: ChiIdx;
  /** Chính tinh theo Chi cung (khoá là ChiIdx) */
  stars: Record<number, string[]>;
  /** Phụ tinh theo Chi cung */
  phuTinh: Record<number, string[]>;
  truongSinh: Record<number, string>;
  thaiTue: Record<number, string>;
  locTonChi: ChiIdx;
  kinhDuongChi: ChiIdx;
  daLaChi: ChiIdx;
  thienMa: ChiIdx;
  khoiChi: ChiIdx;
  vietChi: ChiIdx;
  taPhuChi: ChiIdx;
  huuBatChi: ChiIdx;
  vanXuongChi: ChiIdx;
  vanKhucChi: ChiIdx;
  diaKhongChi: ChiIdx;
  diaKiepChi: ChiIdx;
  tuHoaBanMenh: TuHoa;
  daiHan: DaiHan[];
  tieuHanStartChi: ChiIdx;
  thuanTieuHan: boolean;
  TUHOA: readonly (readonly string[])[];
}
