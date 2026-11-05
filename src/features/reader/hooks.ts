import { useMemo, useSyncExternalStore } from 'react';
import { useApp } from '../../app/context';
import { readingState, subscribeReading, type SpeakOptions } from '../../platform/tts';
import { selectActiveProfile } from '../../state/actions';
import { xungHo, type Cue, type CueFocus, type Who } from './script';

const THAY_PITCH = 0.85, THAY_RATE = 0.9, SLOW = 0.85;

/** Giọng thầy: trầm và chậm hơn, nhân với cài đặt của người dùng (ARCHITECTURE.md mục 12.9). */
export const thayVoice = (rate: number, pitch: number, slow = false): SpeakOptions => ({ rate: rate * THAY_RATE * (slow ? SLOW : 1), pitch: pitch * THAY_PITCH });

/** Cách thầy gọi người đang xem. */
export function useWho(): Who {
  const profile = useApp(selectActiveProfile);
  const setting = useApp((x) => x.settings.xungHo);
  return useMemo(() => xungHo(profile ?? null, setting, new Date().getFullYear()), [profile, setting]);
}

/** Vùng thầy đang chỉ tới trong lần đọc `id`, để tô sáng trên lá số. */
export function useCueFocus(id: string): CueFocus | undefined {
  const r = useSyncExternalStore(subscribeReading, readingState);
  return r?.id === id ? (r.cue as Cue).focus : undefined;
}
