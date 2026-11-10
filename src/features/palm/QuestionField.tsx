import type { PalmQuestion } from '../../content/palm/questions';
import { PALM_UNSURE } from '../../content/palm/ui';
import s from './palm.module.css';

export type PalmAnswer = string | string[] | null | undefined;

/** Một câu hỏi chọn một (có "Không rõ") hoặc chọn nhiều. `undefined` là chưa trả lời. */
export function QuestionField({ q, value, onChange, fromMachine, noUnsure }: {
  q: PalmQuestion; value: PalmAnswer; onChange(v: string | string[] | null): void; fromMachine?: boolean; noUnsure?: boolean;
}) {
  const id = `palm-q-${q.id}`;
  const picked = Array.isArray(value) ? value : [];
  return (
    <div className={s.question} role={q.multi ? 'group' : 'radiogroup'} aria-labelledby={id}>
      <p id={id} className={s.qtext}>{q.text}</p>
      {q.hint && <p className={s.qhint}>{q.hint}</p>}
      <div className={s.chips}>
        {q.options.map((o) => {
          const on = q.multi ? picked.includes(o.value) : value === o.value;
          return (
            <button
              key={o.value} type="button" className={s.chip} role={q.multi ? 'checkbox' : 'radio'} aria-checked={on}
              onClick={() => onChange(q.multi ? (on ? picked.filter((x) => x !== o.value) : [...picked, o.value]) : o.value)}
            >{o.label}</button>
          );
        })}
        {!q.multi && !noUnsure && (
          <button type="button" className={s.chip} data-unsure="true" role="radio" aria-checked={value === null} onClick={() => onChange(null)}>{PALM_UNSURE}</button>
        )}
      </div>
      {fromMachine && <span className={s.fromMachine}>Máy đã chọn sẵn từ ảnh</span>}
    </div>
  );
}
