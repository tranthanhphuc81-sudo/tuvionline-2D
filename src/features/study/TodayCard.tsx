/* Thẻ "Hôm nay" ở Tĩnh thất (ARCHITECTURE 16.2): lời hôm nay theo lá số, nút nghe, dải 7 ngày đã ghé, đã thắp hương.
   Không tự đọc khi mở màn hình (tiếng bật lên bất ngờ dễ làm phiền), người dùng bấm "Nghe lời hôm nay". */
import { useMemo } from 'react';
import type { BatTuChart } from '../../core';
import { STUDY_READING_ID, studyTitle } from '../../content/study';
import { lastDays, todayReading } from '../../content/today';
import { CULTURE_LINE } from '../../content/reader/templates';
import { useApp } from '../../app/context';
import { readAloud } from '../../platform/tts';
import ui from '../../ui/components/ui.module.css';
import { useNguHanh } from '../battu/useNguHanh';
import { thayVoice } from '../reader/hooks';
import { buildPlainCues, type Who } from '../reader/script';
import { xungHoPlain } from '../reader/nguhanhScript';
import s from './study.module.css';

const WEEKDAY = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export function TodayCard({ ch, profileId, who, slow, disabled }: { ch: BatTuChart; profileId: string; who: Who; slow: boolean; disabled?: boolean }) {
  const rate = useApp((x) => x.settings.ttsRate);
  const pitch = useApp((x) => x.settings.ttsPitch);
  const visits = useApp((x) => x.tools.visits);
  const incense = useApp((x) => x.tools.incenseDays);
  const now = new Date();
  const { a } = useNguHanh(ch, now.getFullYear(), profileId);
  const today = useMemo(() => todayReading(a, new Date()), [a]);
  const text = xungHoPlain(today.text, who);
  const days = lastDays(now);
  const seen = days.filter((d) => visits?.includes(d)).length;
  const lit = days.filter((d) => incense?.includes(d)).length;
  const listen = () => void readAloud(STUDY_READING_ID, buildPlainCues(who, [text, CULTURE_LINE], 'homnay'), thayVoice(rate, pitch, slow));

  return (
    <section className={s.today} aria-labelledby="study-today">
      <h2 id="study-today" className={s.todayTitle}>Hôm nay, {studyTitle(now)}</h2>
      <p className={s.todayText} data-level={today.level}>{text}</p>
      <button type="button" className={`${ui.btn} ${ui.block}`} disabled={disabled} onClick={listen}>🔊 Nghe lời hôm nay</button>
      <div className={s.days} role="img" aria-label={`Bảy ngày gần đây: đã ghé ${seen} ngày, thắp hương ${lit} ngày.`}>
        {days.map((d) => (
          <span key={d} className={s.day} data-visit={!!visits?.includes(d)} data-incense={!!incense?.includes(d)} aria-hidden="true">
            {WEEKDAY[new Date(d + 'T12:00:00').getDay()]}
          </span>
        ))}
      </div>
    </section>
  );
}
