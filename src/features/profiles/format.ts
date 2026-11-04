import { TuViEngine } from '../../core';
import type { Profile } from '../../state/schema';

const CHI = TuViEngine.CHI;
const HOUR_RANGES = TuViEngine.HOUR_RANGES;

export function hourLabel(i: number): string {
  return 'Giờ ' + CHI[i] + ' (' + HOUR_RANGES[i] + ')';
}

/** "15/6/1996 dương lịch · giờ Ngọ" — giống dòng tóm tắt "Thông tin dùng chung" của legacy. */
export function birthLine(p: Pick<Profile, 'day' | 'month' | 'year' | 'calendar' | 'leapMonth' | 'hourIdx' | 'lateTy'>): string {
  return p.day + '/' + p.month + (p.calendar === 'lunar' && p.leapMonth ? ' (nhuận)' : '') + '/' + p.year + ' '
    + (p.calendar === 'lunar' ? 'âm lịch' : 'dương lịch') + ' · giờ ' + CHI[p.hourIdx] + (p.hourIdx === 0 && p.lateTy ? ' (Tý muộn)' : '');
}

export function initials(name: string): string {
  const w = name.trim().split(/\s+/).filter(Boolean);
  return (w.length ? w[w.length - 1][0] : '?').toUpperCase();
}
