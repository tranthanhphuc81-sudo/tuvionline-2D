/* Biến thể cảnh theo lịch (ARCHITECTURE.md mục 12.3). Giờ theo đồng hồ máy; ngày âm và tiết khí lấy từ src/core. */
import { lunarOfSolar, monthChiFromDate, type ChiIdx } from '../../core';
import { lunarEventOf, type LunarEvent } from './plan';

export type TimeOfDay = 'dawn' | 'noon' | 'dusk' | 'night';
export type SceneSeason = 'xuan' | 'ha' | 'thu' | 'dong';
export interface Ambience { timeOfDay: TimeOfDay; season: SceneSeason; lunarEvent: LunarEvent }

export function timeOfDayOf(hour: number): TimeOfDay {
  if (hour >= 5 && hour < 10) return 'dawn';
  if (hour >= 10 && hour < 16) return 'noon';
  return hour >= 16 && hour < 19 ? 'dusk' : 'night';
}

/** Bốn mùa của cảnh: Dần–Thìn, Tỵ–Mùi, Thân–Tuất, Hợi–Sửu. Khác `seasonOfMonthChi` của Lục Hào vốn có thêm "tứ quý". */
export function sceneSeasonOf(monthChi: ChiIdx): SceneSeason {
  if (monthChi >= 2 && monthChi <= 4) return 'xuan';
  if (monthChi >= 5 && monthChi <= 7) return 'ha';
  return monthChi >= 8 && monthChi <= 10 ? 'thu' : 'dong';
}

export function getAmbience(now: Date): Ambience {
  const dd = now.getDate(), mm = now.getMonth() + 1, yy = now.getFullYear();
  return { timeOfDay: timeOfDayOf(now.getHours()), season: sceneSeasonOf(monthChiFromDate(dd, mm, yy, 7)), lunarEvent: lunarEventOf(lunarOfSolar(dd, mm, yy)) };
}
