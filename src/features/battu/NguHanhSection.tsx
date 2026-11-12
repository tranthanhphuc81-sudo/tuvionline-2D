/* Mục "Phân tích ngũ hành" trên màn Bát Tự (Phase 3C.4, ARCHITECTURE mục 14). Đặt sau hai hộp Vượng Suy và Dụng Thần sơ bộ.
   Giữ nguyên các mục legacy; mục này chạy engine src/core/nguhanh và mở đầu bằng dòng đối chiếu với gợi ý sơ bộ (14.1).
   Chân: một nút "Xem cách luận khác". Giả: hai lựa chọn ngang hàng. Không thành hoặc không có dấu hiệu: một cách luận. */
import { useMemo, useState } from 'react';
import { batTuReading, type BatTuChart } from '../../core';
import type { Reading } from '../../core/nguhanh';
import { useNguHanh } from './useNguHanh';
import { OUTCOME_LABEL, VERIFICATION_INTRO, VERIFICATION_NOT_ENOUGH, practicalReport, readingLabel, resolutionText, verificationPrompt, weightPhrase } from '../../content/nguhanh';
import { useApp, useAppCtx } from '../../app/context';
import { clearNguHanhAnswers, setNguHanhAnswer } from '../../state/actions';
import { birthKeyOf, type NguHanhOutcome } from '../../state/schema';
import { SectionView } from '../../ui/components/SectionView';
import { SpeakButton } from '../../ui/components/SpeakButton';
import { useWho } from '../reader/hooks';
import { buildScript } from '../reader/script';
import { nguHanhScriptInput } from '../reader/nguhanhScript';
import { Segmented } from '../../ui/components/Segmented';
import ui from '../../ui/components/ui.module.css';
import s from './battu.module.css';

const FOLD_IDS = new Set(['nguhanh.why', 'nguhanh.notes']);

const OUTCOMES: NguHanhOutcome[] = ['tot', 'binh', 'xau', 'khong-nho'];

export function NguHanhSection({ ch, nowYear, profileId }: { ch: BatTuChart; nowYear: number; profileId: string }) {
  const { store } = useAppCtx();
  const { base, a, mine, resolved, questions, next } = useNguHanh(ch, nowYear, profileId);
  const who = useWho();
  const legacy = useMemo(() => batTuReading(ch, nowYear), [ch, nowYear]);
  const [picked, setPicked] = useState<Reading['id'] | null>(null);
  const main = a.readings[0], other = a.readings[1];
  const active = picked && a.readings.some((r) => r.id === picked) ? picked : main.id;
  const grade = a.follow?.grade;
  const sections = useMemo(() => practicalReport(a, { nowYear, legacy, readingId: active }), [a, nowYear, legacy, active]);

  // Bảng 4 điều kiện hiện rõ khi Chân hoặc Giả; khi Không thành thì nằm trong "Vì sao ra kết quả này" (14.7)
  const patternInFold = grade === 'khong-thanh';
  const inFold = (id: string) => FOLD_IDS.has(id) || (patternInFold && id === 'nguhanh.pattern');
  const head = sections.filter((x) => ['nguhanh.intro', 'nguhanh.headline'].includes(x.id) || (!patternInFold && x.id === 'nguhanh.pattern'));
  const fold = sections.filter((x) => inFold(x.id));
  const balance = sections.find((x) => x.id === 'nguhanh.balance');
  // Chân: cách luận khác chỉ hiện khi người dùng bấm xem; Giả: luôn có ở lựa chọn ngang hàng
  const rest = sections.filter((x) => !head.includes(x) && !fold.includes(x) && x !== balance && (x.id !== 'nguhanh.alt' || grade !== 'chan' || active !== main.id));

  const viewingOther = other && active === other.id;
  return (
    <section aria-labelledby="battu-nguhanh" className={ui.stack}>
      <h2 id="battu-nguhanh" className={ui.sectionTitle}>Phân tích ngũ hành</h2>
      <div className={ui.card}>
        <SpeakButton id="nguhanh" label="Nghe phần ngũ hành" getCues={() => buildScript('nguhanh', who, nguHanhScriptInput({ a, ask: next ? { question: next, base } : undefined }, who))} />
        {grade === 'gia' && other && (
          <Segmented<Reading['id']>
            label="Cách luận (hai cách cho kết quả khác nhau)"
            options={a.readings.map((r) => ({ value: r.id, label: `${readingLabel(r)}${r.id === main.id ? ' · ' + weightPhrase(r.weight).replace(/ về$/, '') : ''}` }))}
            value={active} onChange={setPicked}
          />
        )}
        <SectionView sections={head} />
        <details className={s.ngFold}>
          <summary><span>Vì sao ra kết quả này</span></summary>
          <SectionView sections={fold.map((x) => (x.id === 'nguhanh.why' ? { ...x, title: '' } : x))} level={4} />
        </details>
        {balance && (
          <details className={s.ngFold}>
            <summary><span>Mô hình cân bằng 5 hành (tuỳ chọn)</span></summary>
            <SectionView sections={[{ ...balance, title: '' }]} level={4} />
          </details>
        )}
        {grade === 'chan' && other && (
          <button type="button" className={`${ui.btn} ${ui.block}`} onClick={() => setPicked(viewingOther ? main.id : other.id)}>
            {viewingOther ? 'Quay lại cách luận chính' : 'Xem cách luận khác'}
          </button>
        )}
        {base.readings.length > 1 && (
          <section className={s.verify} aria-labelledby="battu-kiemchung">
            <h3 id="battu-kiemchung" className={s.verifyTitle}>Kiểm chứng bằng các năm đã qua</h3>
            {questions.length === 0 && mine.length === 0 ? <p className={ui.muted}>{VERIFICATION_NOT_ENOUGH}</p> : <p className={ui.muted}>{VERIFICATION_INTRO}</p>}
            {resolved && <p role="status">{resolutionText(resolved, a)}</p>}
            {next && (
              <>
                <p>{verificationPrompt(next, base)}</p>
                <div className={s.verifyBtns}>
                  {OUTCOMES.map((o) => (
                    <button key={o} type="button" className={ui.btn} onClick={() => setNguHanhAnswer(store, profileId, next.target, o)}>{OUTCOME_LABEL[o]}</button>
                  ))}
                </div>
              </>
            )}
            {mine.length > 0 && <button type="button" className={`${ui.btn} ${ui.block}`} onClick={() => clearNguHanhAnswers(store, profileId)}>Làm lại</button>}
          </section>
        )}
        <SectionView sections={rest} />
      </div>
    </section>
  );
}
