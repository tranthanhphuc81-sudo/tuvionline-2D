import { useState, type FormEvent } from 'react';
import { birthErrorText, birthNotesText } from '../../content/common/birth';
import { NAME_MISSING } from '../../content/common/notes';
import { INTAKE_ASK, INTAKE_INTRO } from '../../content/study';
import { addProfile, setActiveProfile } from '../../state/actions';
import { useAppCtx, useNav } from '../../app/context';
import { Segmented } from '../../ui/components/Segmented';
import ui from '../../ui/components/ui.module.css';
import { MISSING_DATE, toDraft, toInput, useDraftBirth, type Draft } from '../profiles/draft';
import { hourLabel } from '../profiles/format';
import profiles from '../profiles/profiles.module.css';
import s from './study.module.css';

const STEPS = ['name', 'gender', 'date', 'hour'] as const;

/** Form Hồ sơ được hỏi lần lượt từng câu (Phase 6.4). Dùng chung bản nháp và cách kiểm tra ngày với `ProfileForm`. */
export function Intake() {
  const { store } = useAppCtx();
  const nav = useNav();
  const [d, setD] = useState<Draft>(() => toDraft());
  const [i, setI] = useState(0);
  const [tried, setTried] = useState(false);
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((x) => ({ ...x, [k]: v }));

  const step = STEPS[i];
  const input = toInput(d);
  const birth = useDraftBirth(input);
  const lunar = d.calendar === 'lunar';
  const nameError = tried && step === 'name' && d.name.trim() === '' ? NAME_MISSING : null;
  const dateError = !tried || step !== 'date' ? null : !input ? MISSING_DATE : birth && !birth.ok ? birthErrorText(birth.errors[0]) : null;
  const note = step === 'date' && birth?.ok ? birthNotesText(birth.notes) : '';

  const next = (e: FormEvent) => {
    e.preventDefault();
    const valid = step === 'name' ? d.name.trim() !== '' : step === 'date' ? !!input && !!birth?.ok : true;
    if (!valid) { setTried(true); return; }
    setTried(false);
    if (step === 'hour') { if (input) setActiveProfile(store, addProfile(store, input)); return; }
    setI(i + 1);
  };

  return (
    <form className={s.intake} noValidate onSubmit={next}>
      {i === 0 && <p className={s.line}>{INTAKE_INTRO}</p>}
      <p className={s.ask}>{INTAKE_ASK[step]}</p>

      {step === 'name' && (
        <label className={ui.field}>
          <span className={ui.label}>Tên hoặc biệt danh</span>
          <input className={ui.input} value={d.name} maxLength={60} autoComplete="off" aria-invalid={!!nameError} onChange={(e) => set('name', e.target.value)} />
        </label>
      )}
      {nameError && <p className={ui.error} role="alert">{nameError}</p>}

      {step === 'gender' && <Segmented label="Giới tính" value={d.gender} onChange={(v) => set('gender', v)} options={[{ value: 'M', label: 'Nam' }, { value: 'F', label: 'Nữ' }]} />}

      {step === 'date' && (
        <>
          <Segmented label="Loại lịch nhập vào" value={d.calendar} onChange={(v) => set('calendar', v)} options={[{ value: 'solar', label: 'Dương lịch' }, { value: 'lunar', label: 'Âm lịch' }]} />
          <div className={profiles.dateGrid}>
            <label className={ui.field}>
              <span className={ui.label}>{lunar ? 'Ngày (âm)' : 'Ngày'}</span>
              <input className={ui.input} type="number" inputMode="numeric" min={1} max={lunar ? 30 : 31} value={d.day} aria-invalid={!!dateError} onChange={(e) => set('day', e.target.value)} />
            </label>
            <label className={ui.field}>
              <span className={ui.label}>{lunar ? 'Tháng (âm)' : 'Tháng'}</span>
              <input className={ui.input} type="number" inputMode="numeric" min={1} max={12} value={d.month} aria-invalid={!!dateError} onChange={(e) => set('month', e.target.value)} />
            </label>
            <label className={ui.field}>
              <span className={ui.label}>Năm sinh</span>
              <input className={ui.input} type="number" inputMode="numeric" min={1900} max={2100} value={d.year} aria-invalid={!!dateError} onChange={(e) => set('year', e.target.value)} />
            </label>
          </div>
          {lunar && <Segmented label="Tháng nhuận?" value={d.leapMonth ? '1' : '0'} onChange={(v) => set('leapMonth', v === '1')} options={[{ value: '0', label: 'Không' }, { value: '1', label: 'Có (tháng nhuận)' }]} />}
          {dateError && <p className={ui.error} role="alert">{dateError}</p>}
          {note && <p className={ui.muted} aria-live="polite">{note}</p>}
        </>
      )}

      {step === 'hour' && (
        <>
          <label className={ui.field}>
            <span className={ui.label}>Giờ sinh</span>
            <select className={ui.input} value={d.hourIdx} onChange={(e) => set('hourIdx', parseInt(e.target.value, 10))}>
              {Array.from({ length: 12 }, (_, h) => <option key={h} value={h}>{hourLabel(h)}</option>)}
            </select>
          </label>
          {d.hourIdx === 0 && (
            <label className={ui.check}>
              <input type="checkbox" checked={d.lateTy} onChange={(e) => set('lateTy', e.target.checked)} />
              <span>Sinh từ 23:00 đến 23:59 (giờ Tý muộn) — tính sang ngày hôm sau. <span className={ui.muted}>Có trường phái tính Tý muộn vẫn thuộc ngày cũ.</span></span>
            </label>
          )}
        </>
      )}

      <div className={ui.row}>
        {i > 0 && <button type="button" className={ui.btn} onClick={() => { setTried(false); setI(i - 1); }}>Quay lại</button>}
        <button type="submit" className={`${ui.btn} ${ui.primary}`} style={{ flex: 1 }}>{step === 'hour' ? 'Lưu hồ sơ' : 'Tiếp'}</button>
      </div>
      <button type="button" className={`${ui.btn} ${ui.ghost} ${ui.block}`} onClick={() => nav.push({ name: 'profiles.edit' })}>Điền cả hồ sơ một lần</button>
    </form>
  );
}
