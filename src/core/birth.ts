/* Quy đổi hồ sơ người dùng (dương hoặc âm lịch, tháng nhuận, giờ Tý muộn) thành đầu vào chung cho mọi engine.
   Logic kiểm tra chép từ legacy (lyso-toolkit.html, form Tử Vi/Bát Tự/"Thông tin dùng chung"):
   âm lịch thì đổi sang dương rồi đổi ngược lại để kiểm tra; không bao giờ âm thầm "cuộn" 31/2 thành 3/3.
   Trả MÃ lỗi/ghi chú; câu chữ ở src/content/common/birth.ts. */
import { convertLunar2Solar, convertSolar2Lunar, lunarTzForLunarYear, lunarTzForSolarYear, shiftSolar, validSolar } from './calendar';
import type { Gender, HourIdx } from './types';

export interface SolarDate { dd: number; mm: number; yy: number }
export interface LunarDate { day: number; month: number; year: number; leap: boolean }

/** Phần hồ sơ cần để tính (trùng tên trường với `Profile` trong ARCHITECTURE.md mục 3). */
export interface BirthProfile {
  gender: Gender;
  calendar: 'solar' | 'lunar';
  day: number; month: number; year: number;
  /** chỉ có nghĩa khi calendar = 'lunar' */
  leapMonth: boolean;
  hourIdx: HourIdx;
  /** giờ Tý muộn (23:00–23:59) → tính sang ngày hôm sau; chỉ có tác dụng khi hourIdx = 0 */
  lateTy: boolean;
}

/** Đầu vào chung của các engine: luôn là ngày DƯƠNG đã xử lý Tý muộn. */
export interface BirthCalcInput { gender: Gender; dd: number; mm: number; yy: number; hourIdx: HourIdx }

export type BirthError =
  | { code: 'invalid-solar'; dd: number; mm: number; yy: number }
  | { code: 'invalid-lunar'; day: number; month: number; year: number; leap: boolean }
  | { code: 'no-leap-month'; month: number; year: number };

export type BirthNote =
  | { code: 'from-lunar'; solar: SolarDate }
  | { code: 'late-ty'; calcDate: SolarDate }
  | { code: 'before-1968' };

export type ResolvedBirth =
  | {
      ok: true;
      /** ngày sinh dương lịch (chưa cộng Tý muộn) — dùng cho Nạp Âm, Bát Trạch */
      solar: SolarDate;
      /** ngày sinh âm lịch */
      lunar: LunarDate;
      /** ngày dùng để tính Tử Vi, Bát Tự (đã cộng Tý muộn nếu có) */
      calcDate: SolarDate;
      input: BirthCalcInput;
      notes: BirthNote[];
    }
  | { ok: false; errors: BirthError[] };

export function resolveBirth(p: BirthProfile): ResolvedBirth {
  const { day: dd, month: mm, year: yy } = p;
  let solar: SolarDate, lunar: LunarDate;
  const notes: BirthNote[] = [];
  if (p.calendar === 'lunar') {
    const leap = p.leapMonth ? 1 : 0;
    const ltz = lunarTzForLunarYear(yy);
    const okRange = Number.isInteger(dd) && Number.isInteger(mm) && Number.isInteger(yy)
      && dd >= 1 && dd <= 30 && mm >= 1 && mm <= 12 && yy >= 1900 && yy <= 2100;
    const [sd, sm, sy] = okRange ? convertLunar2Solar(dd, mm, yy, leap, ltz) : [0, 0, 0];
    const back = sd ? convertSolar2Lunar(sd, sm, sy, ltz) : null;
    if (!sd || !back || back[0] !== dd || back[1] !== mm || back[2] !== yy || back[3] !== leap) {
      return {
        ok: false,
        errors: [!sd && leap ? { code: 'no-leap-month', month: mm, year: yy } : { code: 'invalid-lunar', day: dd, month: mm, year: yy, leap: !!leap }],
      };
    }
    solar = { dd: sd, mm: sm, yy: sy };
    lunar = { day: dd, month: mm, year: yy, leap: !!leap };
    notes.push({ code: 'from-lunar', solar });
  } else {
    if (!validSolar(dd, mm, yy)) return { ok: false, errors: [{ code: 'invalid-solar', dd, mm, yy }] };
    solar = { dd, mm, yy };
    const l = convertSolar2Lunar(dd, mm, yy, lunarTzForSolarYear(yy));
    lunar = { day: l[0], month: l[1], year: l[2], leap: l[3] === 1 };
  }
  let calcDate = solar;
  if (p.hourIdx === 0 && p.lateTy) {
    const [cd, cm, cy] = shiftSolar(solar.dd, solar.mm, solar.yy, 1);
    calcDate = { dd: cd, mm: cm, yy: cy };
    notes.push({ code: 'late-ty', calcDate });
  }
  if (solar.yy < 1968) notes.push({ code: 'before-1968' });
  return {
    ok: true, solar, lunar, calcDate, notes,
    input: { gender: p.gender, dd: calcDate.dd, mm: calcDate.mm, yy: calcDate.yy, hourIdx: p.hourIdx },
  };
}
