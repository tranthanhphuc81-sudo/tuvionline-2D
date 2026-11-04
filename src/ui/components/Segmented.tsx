import { useId } from 'react';
import s from './Segmented.module.css';

export interface SegOption<T extends string> { value: T; label: string }

/** Nút chọn một trong vài giá trị (radiogroup). */
export function Segmented<T extends string>({ label, options, value, onChange, hideLabel }: {
  label: string; options: readonly SegOption<T>[]; value: T; onChange(v: T): void; hideLabel?: boolean;
}) {
  const id = useId();
  return (
    <div className={s.wrap}>
      <span id={id} className={hideLabel ? 'visually-hidden' : s.label}>{label}</span>
      <div role="radiogroup" aria-labelledby={id} className={s.group}>
        {options.map((o) => (
          <button key={o.value} type="button" role="radio" aria-checked={o.value === value} className={s.opt} onClick={() => onChange(o.value)}>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
