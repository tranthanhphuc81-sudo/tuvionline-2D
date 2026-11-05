import { useSyncExternalStore } from 'react';
import { pauseReading, readingState, resumeReading, skipReading, stopReading, subscribeReading } from '../../platform/tts';
import { STUDY_READING_ID } from '../../content/study';
import s from './ReadingBar.module.css';

/** Thanh điều khiển đọc thành lời, nằm ngay trên thanh tab nên cuộn tới đâu cũng thấy. Chỉ hiện khi đang đọc. */
export function ReadingBar() {
  const r = useSyncExternalStore(subscribeReading, readingState);
  if (!r || r.id === STUDY_READING_ID) return null;
  const last = r.index >= r.total - 1;
  return (
    <div className={s.bar} role="group" aria-label="Điều khiển đọc thành lời">
      <p className={s.caption}>{r.text}</p>
      <div className={s.inner}>
        <button type="button" className={s.btn} aria-label="Nghe lại đoạn trước" onClick={() => void skipReading(-1)}>⏮</button>
        <button
          type="button" className={`${s.btn} ${s.main}`} aria-label={r.paused ? 'Đọc tiếp' : 'Tạm dừng'}
          onClick={r.paused ? resumeReading : pauseReading}
        >{r.paused ? '▶' : '⏸'}</button>
        <button type="button" className={s.btn} aria-label="Đoạn sau" disabled={last} onClick={() => void skipReading(1)}>⏭</button>
        <span className={s.pos}>Đoạn {r.index + 1}/{r.total}</span>
        <button type="button" className={s.btn} aria-label="Dừng đọc" onClick={stopReading}>⏹</button>
      </div>
    </div>
  );
}
