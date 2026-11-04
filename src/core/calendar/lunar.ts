/* Đổi lịch dương ↔ âm (thuật toán Hồ Ngọc Đức). */
import { INT, jdFromDate, jdToDate, type DMY } from './julian';
import { getNewMoonDay, getSunLongitude } from './astro';

/** [ngày âm, tháng âm, năm âm, nhuận (0|1)] */
export type LunarTuple = [day: number, month: number, year: number, leap: number];

export function getLunarMonth11(yy: number, timeZone: number): number {
  const off = jdFromDate(31, 12, yy) - 2415021, k = INT(off / 29.530588853);
  let nm = getNewMoonDay(k, timeZone);
  if (getSunLongitude(nm, timeZone) >= 9) nm = getNewMoonDay(k - 1, timeZone);
  return nm;
}

export function getLeapMonthOffset(a11: number, timeZone: number): number {
  const k = INT((a11 - 2415021.076998695) / 29.530588853 + 0.5);
  let last = 0, i = 1;
  let arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone);
  do { last = arc; i++; arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone); } while (arc !== last && i < 14);
  return i - 1;
}

export function convertSolar2Lunar(dd: number, mm: number, yy: number, timeZone: number): LunarTuple {
  const dayNumber = jdFromDate(dd, mm, yy), k = INT((dayNumber - 2415021.076998695) / 29.530588853);
  let monthStart = getNewMoonDay(k + 1, timeZone);
  if (monthStart > dayNumber) monthStart = getNewMoonDay(k, timeZone);
  let a11 = getLunarMonth11(yy, timeZone), b11 = a11, lunarYear: number;
  if (a11 >= monthStart) { lunarYear = yy; a11 = getLunarMonth11(yy - 1, timeZone); }
  else { lunarYear = yy + 1; b11 = getLunarMonth11(yy + 1, timeZone); }
  const lunarDay = dayNumber - monthStart + 1, diff = INT((monthStart - a11) / 29);
  let lunarLeap = 0, lunarMonth = diff + 11;
  if (b11 - a11 > 365) {
    const leapMonthDiff = getLeapMonthOffset(a11, timeZone);
    if (diff >= leapMonthDiff) { lunarMonth = diff + 10; if (diff === leapMonthDiff) lunarLeap = 1; }
  }
  if (lunarMonth > 12) lunarMonth -= 12;
  if (lunarMonth >= 11 && diff < 4) lunarYear -= 1;
  return [lunarDay, lunarMonth, lunarYear, lunarLeap];
}

/** Trả [0, 0, 0] nếu tháng nhuận không tồn tại trong năm đó. */
export function convertLunar2Solar(lunarDay: number, lunarMonth: number, lunarYear: number, lunarLeap: number, timeZone: number): DMY {
  let a11: number, b11: number;
  if (lunarMonth < 11) { a11 = getLunarMonth11(lunarYear - 1, timeZone); b11 = getLunarMonth11(lunarYear, timeZone); }
  else { a11 = getLunarMonth11(lunarYear, timeZone); b11 = getLunarMonth11(lunarYear + 1, timeZone); }
  const k = INT(0.5 + (a11 - 2415021.076998695) / 29.530588853);
  let off = lunarMonth - 11;
  if (off < 0) off += 12;
  if (b11 - a11 > 365) {
    const leapOff = getLeapMonthOffset(a11, timeZone);
    let leapMonth = leapOff - 2;
    if (leapMonth < 0) leapMonth += 12;
    if (lunarLeap !== 0 && lunarMonth !== leapMonth) return [0, 0, 0];
    else if (lunarLeap !== 0 || off >= leapOff) off += 1;
  }
  const monthStart = getNewMoonDay(k + off, timeZone);
  return jdToDate(monthStart + lunarDay - 1);
}
