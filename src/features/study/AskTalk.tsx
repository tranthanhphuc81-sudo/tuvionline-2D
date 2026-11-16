/* Khung "Hỏi chuyện Thầy" ở Tĩnh thất (ARCHITECTURE 16.3), theo mẫu hỏi đáp của NguHanhQA: Thầy mời hỏi, người dùng chọn một câu
   có sẵn, Thầy trả lời bằng giọng nói rồi hỏi "còn gì nữa không"; bấm "Thôi, cảm ơn" thì Thầy chào và đóng khung. */
import { useEffect, useMemo, useRef, useState } from 'react';
import type { BatTuChart, TongHopReading } from '../../core';
import { ASK_QUESTIONS, askAnswer, type AskId } from '../../content/ask';
import { STUDY_READING_ID } from '../../content/study';
import { ASK_LINES, fill, pick } from '../../content/reader/templates';
import { useApp } from '../../app/context';
import { readAloud } from '../../platform/tts';
import ui from '../../ui/components/ui.module.css';
import { useNguHanh } from '../battu/useNguHanh';
import { thayVoice, useReader } from '../reader/hooks';
import { buildPlainCues, type Who } from '../reader/script';
import { xungHoPlain } from '../reader/nguhanhScript';
import s from './study.module.css';

export function AskTalk({ ch, tongHop, profileId, who, onClose }: { ch: BatTuChart; tongHop: TongHopReading; profileId: string; who: Who; onClose(): void }) {
  const rate = useApp((x) => x.settings.ttsRate);
  const pitch = useApp((x) => x.settings.ttsPitch);
  const { Ta } = useReader();
  const { a } = useNguHanh(ch, new Date().getFullYear(), profileId);
  const seed = new Date().getDate();
  const vars = { goi: who.goi, ta: who.ta ?? 'thầy' };
  const [asked, setAsked] = useState<AskId | null>(null);
  const turn = useRef(0);
  const answer = useMemo(() => (asked ? askAnswer(asked, { tongHop, nguHanh: a, now: new Date() }).map((t) => xungHoPlain(t, who)) : []), [asked, tongHop, a, who]);
  const say = (texts: string[], id: string) => void readAloud(STUDY_READING_ID, buildPlainCues(who, texts, id), thayVoice(rate, pitch));

  // Lần đầu mở khung: Thầy mời hỏi
  useEffect(() => { say([fill(pick(ASK_LINES.open, seed), vars)], 'hoi-mo'); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const choose = (id: AskId) => {
    turn.current += 1;
    setAsked(id);
    const texts = askAnswer(id, { tongHop, nguHanh: a, now: new Date() }).map((t) => xungHoPlain(t, who));
    say([...texts, fill(pick(ASK_LINES.more, seed + turn.current), vars)], `hoi-${id}`);
  };
  const bye = () => { say([fill(pick(ASK_LINES.bye, seed), vars)], 'hoi-chao'); onClose(); };

  return (
    <div className={s.intake} role="group" aria-label={`Hỏi chuyện ${Ta}`}>
      {asked ? <p className={s.ask}>{ASK_QUESTIONS.find((q) => q.id === asked)!.label}</p> : <p className={s.line}>{fill(pick(ASK_LINES.open, seed), vars)}</p>}
      {asked && <div className={s.answer} aria-live="polite">{answer.map((t, i) => <p key={i}>{t}</p>)}</div>}
      <div className={s.askList}>
        {ASK_QUESTIONS.map((q) => (
          <button key={q.id} type="button" className={ui.btn} aria-pressed={asked === q.id} onClick={() => choose(q.id)}>{q.label}</button>
        ))}
      </div>
      <button type="button" className={`${ui.btn} ${ui.ghost} ${ui.block}`} onClick={bye}>Thôi, cảm ơn {Ta}</button>
    </div>
  );
}
