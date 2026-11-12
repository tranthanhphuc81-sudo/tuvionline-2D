/* Lựa chọn "Ngũ hành" ở Tĩnh thất (Phase 3C.6, ARCHITECTURE 14.6): Thầy đọc phần ngũ hành, rồi nếu lá số có hai cách luận mà chưa
   phân định thì hỏi lần lượt các giai đoạn đã qua theo mẫu hội thoại của Intake. Người dùng trả lời bằng 4 nút ngay trong khung
   phụ đề; câu trả lời lưu vào state như thẻ kiểm chứng ở màn Bát Tự (cùng bộ câu trả lời). Thầy nói kết luận, hoặc nói "chưa đủ để chắc". */
import { useEffect, useRef, useState } from 'react';
import type { BatTuChart } from '../../core';
import { OUTCOME_LABEL, resolutionText, verificationPrompt } from '../../content/nguhanh';
import { LEADS, fill, pick } from '../../content/reader/templates';
import { STUDY_NGUHANH, STUDY_READING_ID } from '../../content/study';
import { useApp, useAppCtx } from '../../app/context';
import { readAloud, readingOwner } from '../../platform/tts';
import { setNguHanhAnswer } from '../../state/actions';
import type { NguHanhOutcome } from '../../state/schema';
import ui from '../../ui/components/ui.module.css';
import { useNguHanh } from '../battu/useNguHanh';
import { thayVoice, useReader } from '../reader/hooks';
import { buildPlainCues, buildScript, type Who } from '../reader/script';
import { nguHanhScriptInput } from '../reader/nguhanhScript';
import s from './study.module.css';

const OUTCOMES: NguHanhOutcome[] = ['tot', 'binh', 'xau', 'khong-nho'];
const nowYear = () => new Date().getFullYear();

/** Nút "Nghe phần ngũ hành": đọc xong mà còn câu hỏi thì báo cho màn hình mở khung hỏi đáp. */
export function NguHanhButton({ ch, profileId, who, slow, onAsk, disabled }: { ch: BatTuChart; profileId: string; who: Who; slow: boolean; onAsk(): void; disabled?: boolean }) {
  const rate = useApp((x) => x.settings.ttsRate);
  const pitch = useApp((x) => x.settings.ttsPitch);
  const { a, next } = useNguHanh(ch, nowYear(), profileId);
  const go = async () => {
    const ok = await readAloud(STUDY_READING_ID, buildScript('nguhanh', who, nguHanhScriptInput({ a }, who)), thayVoice(rate, pitch, slow));
    // đọc hết (không bị đọc bài khác chen vào) mà còn câu hỏi thì chuyển sang hỏi đáp
    if (ok && readingOwner() === null && next) onAsk();
  };
  return <button type="button" className={`${ui.btn} ${ui.block}`} disabled={disabled} onClick={() => void go()}>🔊 {STUDY_NGUHANH.button}</button>;
}

/** Khung hỏi đáp: Thầy nói, người dùng bấm một trong 4 nút. */
export function NguHanhQA({ ch, profileId, who, onClose }: { ch: BatTuChart; profileId: string; who: Who; onClose(): void }) {
  const { store } = useAppCtx();
  const rate = useApp((x) => x.settings.ttsRate);
  const pitch = useApp((x) => x.settings.ttsPitch);
  const { Ta } = useReader();
  const { base, a, mine, resolved, next } = useNguHanh(ch, nowYear(), profileId);
  const [line, setLine] = useState<string>('');
  const seen = useRef<number | null>(null);
  const vars = { goi: who.goi, ta: who.ta ?? 'thầy' };

  const conclusion = resolved
    ? (resolved.decided ? resolutionText(resolved, a) : fill(pick(LEADS.nguhanhChuaChac, 0), vars) + ' ' + resolutionText(resolved, a))
    : fill(pick(LEADS.nguhanhChuaChac, 0), vars);
  const prompt = next ? verificationPrompt(next, base) : '';

  // Thầy nói mỗi khi đổi câu hỏi hoặc có câu trả lời mới: lần đầu có lời dẫn, các lần sau có lời cảm ơn
  useEffect(() => {
    const first = seen.current === null;
    const answered = !first && mine.length > (seen.current ?? 0);
    seen.current = mine.length;
    const texts: string[] = [];
    if (first && next) texts.push(fill(pick(LEADS.nguhanhHoi, new Date().getDate()), vars));
    if (answered) texts.push(fill(pick(LEADS.nguhanhCamOn, new Date().getDate()), vars));
    texts.push(next ? prompt : conclusion);
    setLine(texts[0] === (next ? prompt : conclusion) ? '' : texts[0]);
    void readAloud(STUDY_READING_ID, buildPlainCues(who, texts, 'nguhanh-hoi'), thayVoice(rate, pitch));
    // chỉ chạy khi đổi câu hỏi hay số câu trả lời
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mine.length, next?.target.kind, next && (next.target.kind === 'nam' ? next.target.year : next.target.index)]);

  return (
    <div className={s.intake} role="group" aria-label={STUDY_NGUHANH.group}>
      {line && <p className={s.line}>{line}</p>}
      {next ? (
        <>
          <p className={s.ask}>{prompt}</p>
          <div className={s.answers}>
            {OUTCOMES.map((o) => (
              <button key={o} type="button" className={ui.btn} onClick={() => setNguHanhAnswer(store, profileId, next.target, o)}>{OUTCOME_LABEL[o]}</button>
            ))}
          </div>
          <button type="button" className={`${ui.btn} ${ui.ghost} ${ui.block}`} onClick={onClose}>Để {Ta} hỏi sau</button>
        </>
      ) : (
        <>
          <p className={s.ask}>{conclusion}</p>
          <button type="button" className={`${ui.btn} ${ui.primary} ${ui.block}`} onClick={onClose}>{STUDY_NGUHANH.done}</button>
        </>
      )}
    </div>
  );
}
