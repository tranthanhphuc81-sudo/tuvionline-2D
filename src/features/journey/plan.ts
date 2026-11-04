/* Quyết định chạy hành trình kiểu nào khi mở app, và máy trạng thái đi qua các trạm (ARCHITECTURE.md mục 12.2). Hàm thuần. */
import type { EntryMode, JourneyHistory } from '../../state/schema';

export type EntryPlan = 'full' | 'short' | 'fade' | 'none';

export interface LunarDay { day: number; month: number; leap: boolean }
export type LunarEvent = 'tet' | 'ram' | 'mung1' | null;

/** Tết (mùng 1–3 tháng Giêng) ưu tiên hơn mùng 1. Tháng nhuận vẫn có rằm và mùng 1, nhưng không có Tết. */
export function lunarEventOf({ day, month, leap }: LunarDay): LunarEvent {
  if (month === 1 && !leap && day <= 3) return 'tet';
  if (day === 15) return 'ram';
  return day === 1 ? 'mung1' : null;
}

export function entryPlan(mode: EntryMode, history: JourneyHistory | undefined, today: string, lunar: LunarDay, reducedMotion: boolean): EntryPlan {
  if (mode === 'none') return 'none';
  if (reducedMotion) return 'fade';
  if (mode === 'full' || mode === 'short') return mode;
  if (!history?.firstDone) return 'full';
  return lunarEventOf(lunar) && history.lastFullDate !== today ? 'full' : 'short';
}

export interface JourneyState { index: number; done: boolean }

/** `fade` không đi qua các trạm, chỉ mờ dần vào tĩnh thất (trạm cuối). */
export function startJourney(plan: Exclude<EntryPlan, 'none'>, sceneCount: number): JourneyState {
  return { index: plan === 'fade' ? sceneCount - 1 : 0, done: false };
}

export function stepJourney(s: JourneyState, sceneCount: number): JourneyState {
  if (s.done) return s;
  return s.index >= sceneCount - 1 ? { ...s, done: true } : { ...s, index: s.index + 1 };
}

/** "Bỏ qua" và nút Back đều vào thẳng tĩnh thất từ bất kỳ trạm nào. */
export function skipJourney(s: JourneyState, sceneCount: number): JourneyState {
  return { index: sceneCount - 1, done: true };
}
