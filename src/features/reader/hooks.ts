import { useMemo, useSyncExternalStore } from 'react';
import { useApp } from '../../app/context';
import { readingState, subscribeReading, type SpeakOptions } from '../../platform/tts';
import { selectActiveProfile } from '../../state/actions';
import { xungHo, type Cue, type CueFocus, type Who } from './script';
import { ROBES, readerPersona, robeOf, taTitle } from '../../content/reader/personas';

const THAY_PITCH = 0.85, THAY_RATE = 0.9, SLOW = 0.85;

/** Cao độ của người đọc đang chọn (nam trầm, nữ cao); các màn hình đặt lại khi đổi người đọc. */
let readerPitch = THAY_PITCH;
export const setReaderPitch = (p: number) => { readerPitch = p; };

/** Giọng người đọc: chậm hơn và cao độ theo nhân vật, nhân với cài đặt của người dùng (ARCHITECTURE.md mục 12.9). */
export const thayVoice = (rate: number, pitch: number, slow = false): SpeakOptions => ({ rate: rate * THAY_RATE * (slow ? SLOW : 1), pitch: pitch * readerPitch });

/** Người đọc đang chọn: nhân vật, màu áo, tên gọi để ghi lên nút ("Thầy đọc", "Cô đọc"). */
export function useReader() {
  const reader = useApp((x) => x.settings.reader);
  const robe = useApp((x) => x.settings.readerRobe);
  const custom = useApp((x) => x.settings.readerCustom);
  return useMemo(() => {
    const persona = readerPersona(reader, custom);
    setReaderPitch(persona.pitch);
    return { persona, robe: ROBES[robeOf(persona, robe)].colors, Ta: taTitle(persona) };
  }, [reader, robe, custom]);
}

/** Cách thầy gọi người đang xem. */
export function useWho(): Who {
  const profile = useApp(selectActiveProfile);
  const setting = useApp((x) => x.settings.xungHo);
  const { persona } = useReader();
  return useMemo(() => xungHo(profile ?? null, setting, new Date().getFullYear(), persona), [profile, setting, persona]);
}

/** Vùng thầy đang chỉ tới trong lần đọc `id`, để tô sáng trên lá số. */
export function useCueFocus(id: string): CueFocus | undefined {
  const r = useSyncExternalStore(subscribeReading, readingState);
  return r?.id === id ? (r.cue as Cue).focus : undefined;
}
