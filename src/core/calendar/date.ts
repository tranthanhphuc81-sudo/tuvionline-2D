/* Kiểm tra và dịch ngày. Không bao giờ âm thầm "cuộn" 31/2 thành 3/3. */
import type { DMY } from './julian';
import { convertLunar2Solar, convertSolar2Lunar } from './lunar';
import { lunarTzForLunarYear } from './timezone';

export function pad2(n: number): string {
  return (n < 10 ? '0' : '') + n;
}

/** Ngày dương lịch có thật không (loại 31/2, 31/4...), trong khoảng 1900–2100. */
export function validSolar(dd: number, mm: number, yy: number): boolean {
  if (!Number.isInteger(dd) || !Number.isInteger(mm) || !Number.isInteger(yy)) return false;
  if (yy < 1900 || yy > 2100 || mm < 1 || mm > 12 || dd < 1) return false;
  const d = new Date(Date.UTC(yy, mm - 1, dd));
  return d.getUTCFullYear() === yy && d.getUTCMonth() === mm - 1 && d.getUTCDate() === dd;
}

/** Cộng/trừ ngày cho một ngày dương lịch. */
export function shiftSolar(dd: number, mm: number, yy: number, delta: number): DMY {
  const d = new Date(Date.UTC(yy, mm - 1, dd + delta));
  return [d.getUTCDate(), d.getUTCMonth() + 1, d.getUTCFullYear()];
}

/** Ngày âm có thật không: đổi sang dương rồi đổi ngược lại phải ra đúng ngày đó (loại 30 tháng thiếu, tháng nhuận sai).
    Trả về ngày dương tương ứng, hoặc `null`. `tz` mặc định theo năm âm (`lunarTzForLunarYear`). */
export function validLunar(ld: number, lm: number, ly: number, leap: boolean | number, tz: number = lunarTzForLunarYear(ly)): DMY | null {
  if (!Number.isInteger(ld) || !Number.isInteger(lm) || !Number.isInteger(ly)) return null;
  if (ly < 1900 || ly > 2100 || lm < 1 || lm > 12 || ld < 1 || ld > 30) return null;
  const lp = leap ? 1 : 0;
  const s = convertLunar2Solar(ld, lm, ly, lp, tz);
  if (s[0] === 0 || !validSolar(s[0], s[1], s[2])) return null;
  const back = convertSolar2Lunar(s[0], s[1], s[2], tz);
  if (back[0] !== ld || back[1] !== lm || back[2] !== ly || back[3] !== lp) return null;
  return s;
}
