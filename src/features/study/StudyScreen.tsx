import { useMemo, useState, useSyncExternalStore } from 'react';
import { profileSummary, tongHopOf } from '../../core';
import { SPEECH_FAILED, SPEECH_NO_VOICE } from '../../content/speech';
import { STUDY_GREETING, STUDY_INVALID, STUDY_OBJECTS, STUDY_READING_ID, type StudyObjectId } from '../../content/study';
import { tongHopParts } from '../../content/tonghop/explain';
import { CULTURAL_NOTE } from '../../content/common/notes';
import { useApp, useNav } from '../../app/context';
import type { Route, TabId } from '../../app/routes';
import { pauseReading, readAloud, readingState, resumeReading, setReadingOptions, skipReading, subscribeReading, vietnameseVoice } from '../../platform/tts';
import { selectActiveProfile } from '../../state/actions';
import { BootNoticeBanner } from '../home/HomeScreen';
import ui from '../../ui/components/ui.module.css';
import { thayVoice, useWho } from '../reader/hooks';
import { buildScript } from '../reader/script';
import { Intake } from './Intake';
import s from './study.module.css';

const art = import.meta.glob('../../assets/journey/art/{room,obj-*}.svg', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
const file = (name: string) => art[`../../assets/journey/art/${name}.svg`];

const OBJECTS: readonly { id: StudyObjectId; tab?: TabId; route?: Route }[] = [
  { id: 'laso', tab: 'tuvi' },
  { id: 'thetre', tab: 'battu' },
  { id: 'xu', tab: 'luchao' },
  { id: 'laban', tab: 'phongthuy', route: { name: 'phongthuy', sub: 'laban' } },
  { id: 'sach', tab: 'phongthuy', route: { name: 'phongthuy', sub: 'napam' } },
  { id: 'so', route: { name: 'tonghop' } },
];


/** Tĩnh thất: màn hình chính. Án thư có đồ vật mở từng công cụ, dưới là phụ đề và điều khiển Thầy đọc (ARCHITECTURE.md mục 12.11). */
export function StudyScreen() {
  const nav = useNav();
  const profile = useApp(selectActiveProfile);
  const rate = useApp((x) => x.settings.ttsRate);
  const pitch = useApp((x) => x.settings.ttsPitch);
  const res = useMemo(() => (profile ? profileSummary(profile) : null), [profile]);
  const reading = useSyncExternalStore(subscribeReading, readingState);
  const mine = reading?.id === STUDY_READING_ID ? reading : null;
  const [slow, setSlow] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const who = useWho();

  const open = (o: (typeof OBJECTS)[number]) => {
    if (o.tab && o.route) nav.goTo(o.tab, o.route);
    else if (o.tab) nav.selectTab(o.tab);
    else if (o.route) nav.push(o.route);
  };

  const main = async () => {
    if (mine) { if (mine.paused) resumeReading(); else pauseReading(); return; }
    if (!res?.ok) return;
    setNote(null);
    if ((await vietnameseVoice()) === 'missing') { setNote(SPEECH_NO_VOICE); return; }
    const cues = buildScript('tonghop', who, { sections: tongHopParts(tongHopOf(res.birth)).flatMap((part) => part.sections) });
    if (!(await readAloud(STUDY_READING_ID, cues, thayVoice(rate, pitch, slow)))) setNote(SPEECH_FAILED);
  };
  const toggleSlow = () => { const v = !slow; setSlow(v); setReadingOptions(STUDY_READING_ID, thayVoice(rate, pitch, v)); };

  const invalid = !!profile && !!res && !res.ok;
  return (
    <div className={s.study} data-intake={!profile}>
      <div className={s.room}>
        <img className={s.art} src={file('room')} alt="" draggable={false} />
        <div className={s.glow} aria-hidden="true" />
        {profile && (
          <nav className={s.desk} aria-label="Đồ vật trên án thư">
            {OBJECTS.map((o) => (
              <button key={o.id} type="button" className={s.object} aria-label={STUDY_OBJECTS[o.id].aria} onClick={() => open(o)}>
                <img src={file(`obj-${o.id}`)} alt="" draggable={false} />
                <span aria-hidden="true">{STUDY_OBJECTS[o.id].label}</span>
              </button>
            ))}
          </nav>
        )}
      </div>

      <BootNoticeBanner />
      {profile ? (
        <div className={s.panel}>
          <p className={s.subtitle} data-speaking={!!mine}>{note ?? mine?.text ?? (invalid ? STUDY_INVALID : STUDY_GREETING)}</p>
          <div className={s.controls} role="group" aria-label="Điều khiển Thầy đọc">
            <button type="button" className={s.ctl} aria-label="Nghe lại đoạn trước" disabled={!mine} onClick={() => void skipReading(-1)}>⏮</button>
            <button type="button" className={s.main} disabled={invalid} onClick={() => void main()}>
              <span aria-hidden="true">{mine && !mine.paused ? '⏸' : '▶'}</span> {mine ? (mine.paused ? 'Đọc tiếp' : 'Tạm dừng') : 'Thầy đọc'}
            </button>
            <button type="button" className={s.ctl} aria-label="Đoạn sau" disabled={!mine || mine.index >= mine.total - 1} onClick={() => void skipReading(1)}>⏭</button>
            <button type="button" className={s.ctl} aria-label="Nói chậm" aria-pressed={slow} onClick={toggleSlow}>🐢</button>
          </div>
          <p className={`${ui.muted} ${s.note}`}>{CULTURAL_NOTE}</p>
        </div>
      ) : <Intake />}
    </div>
  );
}
