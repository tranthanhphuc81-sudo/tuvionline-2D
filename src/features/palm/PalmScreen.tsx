/* Xem chỉ tay (ARCHITECTURE mục 13.1): chọn tay → chụp → chạm 4 đường → xác nhận số đo → vài câu hỏi → kết quả.
   Ảnh chỉ nằm trong bộ nhớ khi đang xem, không được lưu; chỉ lưu các nét đã chạm và 21 điểm khớp. */
import { useRef, useState } from 'react';
import { measureHand, measureLines, measuresToAnswers, type MountId } from '../../core';
import { mountAnswer, PALM_QUESTIONS, questionsAt, type PalmQuestion } from '../../content/palm/questions';
import {
  PALM_CONFIRM_HINT, PALM_CONFIRM_TITLE, PALM_FIRST_TIME, PALM_HAND_HINT, PALM_HAND_Q, PALM_INTRO, PALM_MODEL_FAILED, PALM_MORE_HINT, PALM_MORE_TITLE,
  PALM_MOUNT_LABEL, PALM_NO_HAND, PALM_NOTE, PALM_PHOTO_TIPS, PALM_Q30_GROUPS, PALM_QUESTIONS_TITLE, PALM_SAVED_HINT, PALM_UNREADABLE,
} from '../../content/palm/ui';
import { useApp, useAppCtx, useNav } from '../../app/context';
import { useBackHandler } from '../../app/hooks';
import { savePalmSession, selectActiveProfile } from '../../state/actions';
import ui from '../../ui/components/ui.module.css';
import { QuestionField, type PalmAnswer } from './QuestionField';
import { MachineAnswers } from './MachineAnswers';
import { holdPhoto } from './photoMemory';
import { TraceStep, type TraceResult } from './TraceStep';
import type { PreparedPhoto } from './vision/photo';
import { SIZE } from './vision/types';
import s from './palm.module.css';

type Step = 'start' | 'trace' | 'confirm' | 'questions';
type Answers = Record<string, PalmAnswer>;
type Hand = 'left' | 'right';

const Q = (id: string) => PALM_QUESTIONS.find((q) => q.id === id)!;
const HAND_Q: PalmQuestion = { id: 'hand', text: PALM_HAND_Q, stage: 'before', multi: false, options: [{ value: 'right', label: 'Tay phải' }, { value: 'left', label: 'Tay trái' }] };
const MORE_QS = questionsAt('more').filter((q) => q.id !== 'Q30');

export function PalmScreen() {
  const nav = useNav();
  const { store } = useAppCtx();
  const profile = useApp(selectActiveProfile);
  const saved = useApp((x) => (profile ? x.palmSessions.filter((p) => p.profileId === profile.id).length : 0));
  const onScreen = nav.tab === 'home' && nav.route.name === 'palm';

  const [step, setStep] = useState<Step>('start');
  const [dominant, setDominant] = useState<Hand>('right');
  const [hand, setHand] = useState<Hand>('right');
  const [photo, setPhoto] = useState<PreparedPhoto | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Answers>({});
  const [machine, setMachine] = useState<Record<string, string | string[] | null>>({});
  const [traced, setTraced] = useState<TraceResult | null>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const [mounts, setMounts] = useState<Record<'noi' | 'phang', MountId[]>>({ noi: [], phang: [] });
  const camera = useRef<HTMLInputElement>(null);
  const library = useRef<HTMLInputElement>(null);

  useBackHandler(() => { setStep(step === 'questions' ? 'confirm' : 'trace'); return true; }, onScreen && (step === 'confirm' || step === 'questions'));

  const pick = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const { preparePhoto } = await import('./vision/photo');
      const r = await preparePhoto(file);
      if (r === 'no-hand') setError(PALM_NO_HAND);
      else if (r === 'unreadable') setError(PALM_UNREADABLE);
      else { setPhoto(r); setStep('trace'); }
    } catch {
      setError(PALM_MODEL_FAILED);
    } finally {
      setBusy(false);
    }
  };

  const traceDone = (t: TraceResult) => {
    if (!photo) return;
    const landmarks = photo.landmarks.map((p) => ({ x: p.x / SIZE, y: p.y / SIZE }));
    const flat = (k: keyof TraceResult['lines']) => t.lines[k]?.flat();
    const ms = [...measureHand(landmarks), ...measureLines({ landmarks, lines: { sinh: flat('sinh'), tri: flat('tri'), tam: flat('tam'), dinh: flat('dinh') }, breaks: t.breaks, strength: t.strength, minor: t.minor })];
    const auto = measuresToAnswers(ms);
    // Người dùng nói không có Định mạng thì đó là câu trả lời, không phải "không rõ"
    if (!t.lines.dinh) auto.Q25 = 'DM15';
    // Câu chọn nhiều mà máy chỉ thấy một mã thì vẫn là mảng
    for (const q of PALM_QUESTIONS) if (q.multi && typeof auto[q.id] === 'string') auto[q.id] = [auto[q.id] as string];
    setTraced(t);
    setMachine(auto);
    setAnswers((old) => ({ ...old, ...auto }));
    setStep('confirm');
  };

  const set = (id: string) => (v: string | string[] | null) => setAnswers((a) => ({ ...a, [id]: v }));
  const toggleMount = (level: 'noi' | 'phang', m: MountId) => setMounts((x) => ({ ...x, [level]: x[level].includes(m) ? x[level].filter((y) => y !== m) : [...x[level], m] }));

  /** Câu máy đã trả lời: mọi câu đo được, cộng các câu "Xem kỹ hơn" mà máy thấy rõ đặc điểm. Những câu này không hỏi lại. */
  const byMachine = PALM_QUESTIONS.filter((q) => q.stage === 'measured' || (machine[q.id] !== undefined && machine[q.id] !== null));
  const asked = (q: PalmQuestion) => !byMachine.includes(q);
  const basicQs = questionsAt('basic').filter(asked);
  const moreQs = MORE_QS.filter(asked);

  const finish = () => {
    if (!profile || !photo || !traced) return;
    const codes = [...mounts.noi.map((m) => mountAnswer(m, 'noi')), ...mounts.phang.map((m) => mountAnswer(m, 'phang'))].filter((c): c is string => !!c);
    const all: Record<string, string | string[] | null> = { Q01: dominant };
    for (const [k, v] of Object.entries(answers)) if (v !== undefined) all[k] = v;
    if (codes.length) all.Q30 = codes;
    const id = savePalmSession(store, {
      profileId: profile.id, hand, role: hand === dominant ? 'current' : 'innate',
      landmarks: photo.landmarks.map((p) => ({ x: p.x / SIZE, y: p.y / SIZE })), lines: traced.lines, answers: all, measured: machine,
    });
    holdPhoto(id, photo.view);
    nav.replace({ name: 'palm.result' });
  };

  if (!profile) {
    return (
      <div className={ui.stack}>
        <p>Bạn cần có hồ sơ để lưu kết quả xem chỉ tay.</p>
        <button type="button" className={`${ui.btn} ${ui.primary} ${ui.block}`} onClick={() => nav.push({ name: 'profiles.edit' })}>＋ Thêm hồ sơ</button>
      </div>
    );
  }

  return (
    <div className={ui.stack}>
      {step === 'start' && (
        <>
          <p>{PALM_INTRO}</p>
          <p className={ui.muted}>{PALM_FIRST_TIME}</p>
          <section className={ui.card}>
            <QuestionField q={Q('Q01')} value={dominant} onChange={(v) => { setDominant(v as Hand); setHand(v as Hand); }} noUnsure />
            <QuestionField q={HAND_Q} value={hand} onChange={(v) => setHand(v as Hand)} noUnsure />
            <p className={ui.muted}>{PALM_HAND_HINT}</p>
          </section>
          <p>{PALM_PHOTO_TIPS}</p>
          <input ref={camera} className={s.fileInput} type="file" accept="image/*" capture="environment" onChange={(e) => { void pick(e.target.files?.[0]); e.target.value = ''; }} />
          <input ref={library} className={s.fileInput} type="file" accept="image/*" onChange={(e) => { void pick(e.target.files?.[0]); e.target.value = ''; }} />
          <button type="button" className={`${ui.btn} ${ui.primary} ${ui.block}`} disabled={busy} onClick={() => camera.current?.click()}>📷 Chụp ảnh lòng bàn tay</button>
          <button type="button" className={`${ui.btn} ${ui.block}`} disabled={busy} onClick={() => library.current?.click()}>Chọn từ thư viện ảnh</button>
          <p className={s.status} role="status">{busy ? 'Đang xử lý ảnh…' : ''}</p>
          {error && <p className={ui.error} role="alert">{error}</p>}
          {saved > 0 && (
            <button type="button" className={`${ui.btn} ${ui.block}`} onClick={() => nav.push({ name: 'palm.result' })}>{PALM_SAVED_HINT} Xem lại</button>
          )}
          <p className={ui.muted}>{PALM_NOTE}</p>
        </>
      )}

      {photo && (
        <div hidden={step !== 'trace'}>
          <TraceStep photo={photo} active={onScreen && step === 'trace'} onDone={traceDone} onExit={() => { setPhoto(null); setTraced(null); setStep('start'); }} />
        </div>
      )}

      {step === 'confirm' && (
        <>
          <h2 className={ui.sectionTitle}>{PALM_CONFIRM_TITLE}</h2>
          <p className={ui.muted}>{PALM_CONFIRM_HINT}</p>
          <section className={ui.card}>
            <MachineAnswers questions={byMachine} answers={answers} machine={machine} onChange={(id, v) => set(id)(v)} />
          </section>
          <button type="button" className={`${ui.btn} ${ui.primary} ${ui.block}`} onClick={() => setStep('questions')}>Tiếp ›</button>
        </>
      )}

      {step === 'questions' && (
        <>
          <h2 className={ui.sectionTitle}>{PALM_QUESTIONS_TITLE}</h2>
          <section className={ui.card}>
            {basicQs.map((q) => <QuestionField key={q.id} q={q} value={answers[q.id]} onChange={set(q.id)} />)}
          </section>
          <details className={s.more} open={moreOpen} onToggle={(e) => setMoreOpen(e.currentTarget.open)}>
            <summary>{PALM_MORE_TITLE}</summary>
            <p className={ui.muted}>{PALM_MORE_HINT}</p>
            {moreQs.map((q) => <QuestionField key={q.id} q={q} value={answers[q.id]} onChange={set(q.id)} />)}
            {PALM_Q30_GROUPS.map((g) => (
              <div key={g.level} className={s.question} role="group" aria-label={g.title}>
                <p className={s.qtext}>{g.title}</p>
                <div className={s.chips}>
                  {g.mounts.map((m) => (
                    <button key={m} type="button" className={s.chip} role="checkbox" aria-checked={mounts[g.level].includes(m)} onClick={() => toggleMount(g.level, m)}>{PALM_MOUNT_LABEL[m]}</button>
                  ))}
                </div>
              </div>
            ))}
          </details>
          <button type="button" className={`${ui.btn} ${ui.primary} ${ui.block}`} onClick={finish}>Xem kết quả ›</button>
        </>
      )}
    </div>
  );
}
