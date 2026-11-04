/* Nối quy tắc lối vào với app: đọc ngày hôm nay, cài đặt, rồi ghi nhận lần mở. */
import { LySoUtil, lunarOfSolar } from '../../core';
import { markJourney, type AppStore } from '../../state/actions';
import { entryPlan, type EntryPlan } from './plan';

const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

export interface TodayEntry { plan: EntryPlan; today: string }

/** Chỉ đọc, không ghi: StrictMode gọi hàm khởi tạo state hai lần. Ghi nhận bằng `recordEntry` trong effect. */
export function todayEntry(store: AppStore, now = new Date()): TodayEntry {
  const dd = now.getDate(), mm = now.getMonth() + 1, yy = now.getFullYear();
  const today = `${yy}-${LySoUtil.pad2(mm)}-${LySoUtil.pad2(dd)}`;
  const { settings, tools } = store.getState();
  return { plan: entryPlan(settings.entryMode, tools.journey, today, lunarOfSolar(dd, mm, yy), reducedMotion()), today };
}

export function recordEntry(store: AppStore, { plan, today }: TodayEntry): void {
  if (plan !== 'none') markJourney(store, today, plan === 'full');
}
