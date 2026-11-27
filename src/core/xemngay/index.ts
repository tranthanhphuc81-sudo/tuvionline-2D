/* Xem ngày tốt xấu (ARCHITECTURE mục 17): Hoàng đạo / Hắc đạo theo 12 thần, Thập nhị trực, giờ hoàng đạo, ngày xung tuổi.
   Engine chỉ trả mã; câu chữ ở src/content/xemngay.
   - Tháng dùng để an thần ngày và trực là tháng TIẾT (nguyệt kiến, đổi ở tiết Lập Xuân, Kinh Trập…), không phải tháng âm.
     Nhờ vậy ngày giao tiết tự lặp lại trực của hôm trước, đúng như lịch vạn niên.
   - Múi giờ tiết khí theo `lunarTzForSolarYear` (UTC+7 từ 1968, UTC+8 trước đó), cùng quy tắc với lịch âm của app. */
import { convertSolar2Lunar, lunarTzForSolarYear, monthChiFromDate, shiftSolar, validSolar } from '../calendar';
import { dayCanChiIndex, mod, yearCanChiIndex, type CanChi, type ChiIdx } from '../canchi';

/** 12 thần trực ngày, theo thứ tự đếm từ Thanh Long. */
export const THAN_ORDER = [
  'thanh-long', 'minh-duong', 'thien-hinh', 'chu-tuoc', 'kim-quy', 'kim-duong',
  'bach-ho', 'ngoc-duong', 'thien-lao', 'huyen-vu', 'tu-menh', 'cau-tran',
] as const;
export type ThanId = (typeof THAN_ORDER)[number];
/** Sáu thần Hoàng đạo; sáu thần còn lại là Hắc đạo. */
export const HOANG_DAO_THAN: ReadonlySet<ThanId> = new Set<ThanId>(['thanh-long', 'minh-duong', 'kim-quy', 'kim-duong', 'ngoc-duong', 'tu-menh']);

/** Thập nhị trực, đếm từ Kiến. */
export const TRUC_ORDER = ['kien', 'tru', 'man', 'binh', 'dinh', 'chap', 'pha', 'nguy', 'thanh', 'thu', 'khai', 'be'] as const;
export type TrucId = (typeof TRUC_ORDER)[number];
/** Hai trực mọi lịch đều coi là xấu cho việc lớn. */
export const TRUC_XAU: ReadonlySet<TrucId> = new Set<TrucId>(['pha', 'be']);

/** Các việc hay hỏi khi chọn ngày. */
export const VIEC_ORDER = ['cuoi-hoi', 'khai-truong', 'dong-tho', 'nhap-trach', 'xuat-hanh', 'ky-ket', 'sam-sua', 'nhan-viec'] as const;
export type ViecId = (typeof VIEC_ORDER)[number];

/** Việc nên / nên tránh theo trực: bản tóm lược của app từ lời giải thập nhị trực thường in trong lịch vạn niên
    (ARCHITECTURE 17.3). Việc không có trong hai danh sách là "không nghiêng bên nào". */
export const TRUC_VIEC: Record<TrucId, { nen: readonly ViecId[]; ky: readonly ViecId[] }> = {
  kien: { nen: ['xuat-hanh', 'nhan-viec', 'khai-truong'], ky: ['dong-tho'] },
  tru: { nen: [], ky: ['cuoi-hoi', 'khai-truong'] },
  man: { nen: ['sam-sua', 'xuat-hanh'], ky: ['nhan-viec', 'dong-tho'] },
  binh: { nen: [], ky: [] },
  dinh: { nen: ['ky-ket', 'sam-sua', 'cuoi-hoi', 'dong-tho', 'nhap-trach'], ky: ['xuat-hanh'] },
  chap: { nen: ['ky-ket', 'dong-tho', 'cuoi-hoi', 'nhan-viec'], ky: ['nhap-trach', 'xuat-hanh', 'khai-truong', 'sam-sua'] },
  pha: { nen: [], ky: [...VIEC_ORDER] },
  nguy: { nen: [], ky: ['xuat-hanh', 'dong-tho', 'khai-truong', 'cuoi-hoi'] },
  thanh: { nen: ['cuoi-hoi', 'khai-truong', 'nhap-trach', 'xuat-hanh', 'nhan-viec', 'ky-ket', 'dong-tho', 'sam-sua'], ky: [] },
  thu: { nen: ['sam-sua'], ky: ['dong-tho', 'xuat-hanh', 'khai-truong'] },
  khai: { nen: ['khai-truong', 'cuoi-hoi', 'nhan-viec', 'xuat-hanh', 'dong-tho', 'nhap-trach'], ky: [] },
  be: { nen: [], ky: ['khai-truong', 'xuat-hanh', 'cuoi-hoi', 'nhap-trach', 'sam-sua'] },
};

/** Mức chung của ngày: đẹp (Hoàng đạo, trực không xấu), thường, nên tránh việc lớn (Hắc đạo gặp trực Phá hoặc Bế). */
export type DayGrade = 'dep' | 'thuong' | 'tranh';
export type ViecVerdict = 'hop' | 'trung' | 'ky';

export interface SolarDay { dd: number; mm: number; yy: number }
export interface DayInfo {
  date: SolarDay;
  /** thứ trong tuần, 0 = Chủ nhật */
  weekday: number;
  canChi: CanChi;
  lunar: { day: number; month: number; year: number; leap: boolean };
  /** chi của tháng tiết (nguyệt kiến) */
  monthChi: ChiIdx;
  than: ThanId;
  hoangDao: boolean;
  truc: TrucId;
  grade: DayGrade;
  /** chi của các giờ hoàng đạo trong ngày, tăng dần từ Tý */
  hours: ChiIdx[];
  /** chi tuổi bị ngày này xung (lục xung với chi ngày) */
  xungChi: ChiIdx;
  /** chỉ có khi biết chi năm sinh (năm âm lịch, đổi theo Tết) */
  person?: { birthChi: ChiIdx; xung: boolean; grade: DayGrade };
}

/** Chi khởi Thanh Long: tháng (hoặc ngày) Dần/Thân khởi ở Tý, Mão/Dậu ở Dần, Thìn/Tuất ở Thìn, Tỵ/Hợi ở Ngọ,
    Ngọ/Tý ở Thân, Mùi/Sửu ở Tuất. Dùng chi tháng để an thần ngày, chi ngày để an thần giờ. */
export function thanhLongStart(chi: ChiIdx): ChiIdx {
  return mod(2 * (chi - 2), 12);
}
export function thanOf(baseChi: ChiIdx, targetChi: ChiIdx): ThanId {
  return THAN_ORDER[mod(targetChi - thanhLongStart(baseChi), 12)];
}
/** Trực của ngày: ngày cùng chi với tháng tiết là Kiến, rồi đếm xuôi. */
export function trucOf(monthChi: ChiIdx, dayChi: ChiIdx): TrucId {
  return TRUC_ORDER[mod(dayChi - monthChi, 12)];
}
/** Chi tuổi của người sinh năm âm lịch `lunarYear` (năm đổi theo Tết, như cách gọi tuổi thường ngày). */
export function tuoiChi(lunarYear: number): ChiIdx {
  return yearCanChiIndex(lunarYear).chi;
}
export function xungOf(chi: ChiIdx): ChiIdx {
  return mod(chi + 6, 12);
}
export function hoangDaoHours(dayChi: ChiIdx): ChiIdx[] {
  return Array.from({ length: 12 }, (_, h) => h).filter((h) => HOANG_DAO_THAN.has(thanOf(dayChi, h)));
}

function gradeOf(hoangDao: boolean, truc: TrucId): DayGrade {
  const xau = TRUC_XAU.has(truc);
  if (hoangDao && !xau) return 'dep';
  if (!hoangDao && xau) return 'tranh';
  return 'thuong';
}
const lower = (g: DayGrade): DayGrade => (g === 'dep' ? 'thuong' : 'tranh');

/** Thông tin một ngày dương lịch. Ngày không tồn tại (31/2…) ném RangeError, không cuộn sang tháng sau. */
export function dayInfo(dd: number, mm: number, yy: number, birthChi?: ChiIdx): DayInfo {
  if (!validSolar(dd, mm, yy)) throw new RangeError(`Ngày không hợp lệ: ${dd}/${mm}/${yy}`);
  const tz = lunarTzForSolarYear(yy);
  const canChi = dayCanChiIndex(dd, mm, yy);
  const l = convertSolar2Lunar(dd, mm, yy, tz);
  const monthChi = monthChiFromDate(dd, mm, yy, tz);
  const than = thanOf(monthChi, canChi.chi);
  const hoangDao = HOANG_DAO_THAN.has(than);
  const truc = trucOf(monthChi, canChi.chi);
  const grade = gradeOf(hoangDao, truc);
  const xungChi = xungOf(canChi.chi);
  const info: DayInfo = {
    date: { dd, mm, yy }, weekday: new Date(Date.UTC(yy, mm - 1, dd)).getUTCDay(), canChi,
    lunar: { day: l[0], month: l[1], year: l[2], leap: l[3] === 1 },
    monthChi, than, hoangDao, truc, grade, hours: hoangDaoHours(canChi.chi), xungChi,
  };
  if (birthChi !== undefined) {
    const xung = xungChi === birthChi;
    info.person = { birthChi, xung, grade: xung ? lower(grade) : grade };
  }
  return info;
}

/** Ngày này với một việc: hợp (trực nên làm việc đó, Hoàng đạo, không xung tuổi), kỵ (trực kỵ việc đó, hoặc xung tuổi),
    còn lại là trung bình. */
export function viecVerdict(info: DayInfo, viec: ViecId): ViecVerdict {
  const t = TRUC_VIEC[info.truc];
  if (t.ky.includes(viec) || info.person?.xung) return 'ky';
  if (t.nen.includes(viec) && info.hoangDao) return 'hop';
  return 'trung';
}

/** Khoảng năm dương lịch xem được: đúng khoảng của lịch âm trong app (`validSolar`). */
export const XEMNGAY_YEARS = { min: 1900, max: 2100 } as const;

/** `n` ngày liên tiếp kể từ `from` (tính cả `from`); dừng ở 31/12/2100 nếu dãy chạy quá khoảng lịch. */
export function daysFrom(from: SolarDay, n: number, birthChi?: ChiIdx): DayInfo[] {
  const out: DayInfo[] = [];
  for (let i = 0; i < n; i++) {
    const [dd, mm, yy] = shiftSolar(from.dd, from.mm, from.yy, i);
    if (yy > XEMNGAY_YEARS.max) break;
    out.push(dayInfo(dd, mm, yy, birthChi));
  }
  return out;
}

/** Những ngày hợp việc `viec` trong `n` ngày kể từ `from`. */
export function findDays(from: SolarDay, n: number, viec: ViecId, birthChi?: ChiIdx): DayInfo[] {
  return daysFrom(from, n, birthChi).filter((d) => viecVerdict(d, viec) === 'hop');
}

/** Lưới tháng dương lịch: mọi ngày của tháng `mm/yy`. */
export function monthDays(mm: number, yy: number, birthChi?: ChiIdx): DayInfo[] {
  const len = new Date(Date.UTC(yy, mm, 0)).getUTCDate();
  return daysFrom({ dd: 1, mm, yy }, len, birthChi);
}
