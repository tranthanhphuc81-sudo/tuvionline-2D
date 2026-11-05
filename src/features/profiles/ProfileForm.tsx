import { useState } from 'react';
import { birthErrorText, birthNotesText } from '../../content/common/birth';
import { NAME_MISSING, RELATION_LABEL } from '../../content/common/notes';
import { RELATIONS, type Relation } from '../../state/schema';
import type { ProfileInput } from '../../state/actions';
import { Segmented } from '../../ui/components/Segmented';
import ui from '../../ui/components/ui.module.css';
import { MISSING_DATE, toDraft, toInput, useDraftBirth, type Draft } from './draft';
import { hourLabel } from './format';
import s from './profiles.module.css';

/** Form nhập hồ sơ: dương/âm lịch, tháng nhuận, giờ, Tý muộn; báo lỗi tiếng Việt như legacy. */
export function ProfileForm({ initial, submitLabel, onSubmit }: { initial?: ProfileInput; submitLabel: string; onSubmit(p: ProfileInput): void }) {
  const [d, setD] = useState<Draft>(() => toDraft(initial));
  const [tried, setTried] = useState(false);
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((x) => ({ ...x, [k]: v }));

  const input = toInput(d);
  const birth = useDraftBirth(input);
  const nameError = tried && d.name.trim() === '' ? NAME_MISSING : null;
  const dateError = !tried ? null : !input ? MISSING_DATE : birth && !birth.ok ? birthErrorText(birth.errors[0]) : null;
  const note = birth?.ok ? birthNotesText(birth.notes) : '';
  const lunar = d.calendar === 'lunar';

  return (
    <form
      className={ui.stack}
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        setTried(true);
        if (input && birth?.ok && d.name.trim() !== '') onSubmit(input);
      }}
    >
      <label className={ui.field}>
        <span className={ui.label}>Tên hoặc biệt danh</span>
        <input className={ui.input} value={d.name} maxLength={60} autoComplete="off" aria-invalid={!!nameError} onChange={(e) => set('name', e.target.value)} />
      </label>
      {nameError && <p className={ui.error} role="alert">{nameError}</p>}

      <label className={ui.field}>
        <span className={ui.label}>Quan hệ với bạn (không bắt buộc)</span>
        <select className={ui.input} value={d.relation} onChange={(e) => set('relation', e.target.value as Relation | '')}>
          <option value="">— Không ghi —</option>
          {RELATIONS.map((r) => <option key={r} value={r}>{RELATION_LABEL[r]}</option>)}
        </select>
      </label>

      <Segmented label="Giới tính" value={d.gender} onChange={(v) => set('gender', v)} options={[{ value: 'M', label: 'Nam' }, { value: 'F', label: 'Nữ' }]} />
      <Segmented label="Loại lịch nhập vào" value={d.calendar} onChange={(v) => set('calendar', v)} options={[{ value: 'solar', label: 'Dương lịch' }, { value: 'lunar', label: 'Âm lịch' }]} />

      <div className={s.dateGrid}>
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
      {lunar && (
        <Segmented label="Tháng nhuận?" value={d.leapMonth ? '1' : '0'} onChange={(v) => set('leapMonth', v === '1')} options={[{ value: '0', label: 'Không' }, { value: '1', label: 'Có (tháng nhuận)' }]} />
      )}
      {dateError && <p className={ui.error} role="alert">{dateError}</p>}

      <label className={ui.field}>
        <span className={ui.label}>Giờ sinh</span>
        <select className={ui.input} value={d.hourIdx} onChange={(e) => set('hourIdx', parseInt(e.target.value, 10))}>
          {Array.from({ length: 12 }, (_, i) => <option key={i} value={i}>{hourLabel(i)}</option>)}
        </select>
      </label>
      {d.hourIdx === 0 && (
        <label className={ui.check}>
          <input type="checkbox" checked={d.lateTy} onChange={(e) => set('lateTy', e.target.checked)} />
          <span>Sinh từ 23:00 đến 23:59 (giờ Tý muộn) — tính sang ngày hôm sau. <span className={ui.muted}>Có trường phái tính Tý muộn vẫn thuộc ngày cũ.</span></span>
        </label>
      )}
      {note && <p className={ui.muted} aria-live="polite">{note}</p>}

      <button type="submit" className={`${ui.btn} ${ui.primary} ${ui.block}`}>{submitLabel}</button>
    </form>
  );
}
