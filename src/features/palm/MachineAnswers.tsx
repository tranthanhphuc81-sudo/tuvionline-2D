/* Bảng "Máy đo được": mỗi câu máy đã trả lời là một dòng ngắn, chạm "Sửa" mới mở lựa chọn. */
import { useState } from 'react';
import type { PalmQuestion } from '../../content/palm/questions';
import { PALM_UNSURE } from '../../content/palm/ui';
import { QuestionField, type PalmAnswer } from './QuestionField';
import s from './palm.module.css';

export function answerLabel(q: PalmQuestion, v: PalmAnswer): string {
  if (v === null || v === undefined || (Array.isArray(v) && !v.length)) return PALM_UNSURE;
  const vals = Array.isArray(v) ? v : [v];
  return vals.map((x) => q.options.find((o) => o.value === x)?.label ?? x).join(', ');
}

export function MachineAnswers({ questions, answers, machine, onChange }: {
  questions: readonly PalmQuestion[]; answers: Record<string, PalmAnswer>; machine: Record<string, PalmAnswer>; onChange(id: string, v: string | string[] | null): void;
}) {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <ul className={s.machineList}>
      {questions.map((q) => {
        const changed = JSON.stringify(answers[q.id]) !== JSON.stringify(machine[q.id]);
        return (
          <li key={q.id} className={s.machineRow}>
            <div className={s.machineHead}>
              <span className={s.machineText}>
                <span className={s.machineQ}>{q.text}</span>
                <b>{answerLabel(q, answers[q.id])}</b>{changed && <span className={s.badge}> · bạn đã sửa</span>}
              </span>
              <button type="button" className={s.edit} aria-expanded={open === q.id} onClick={() => setOpen(open === q.id ? null : q.id)}>
                {open === q.id ? 'Xong' : 'Sửa'}
              </button>
            </div>
            {open === q.id && <QuestionField q={q} value={answers[q.id]} onChange={(v) => onChange(q.id, v)} />}
          </li>
        );
      })}
    </ul>
  );
}
