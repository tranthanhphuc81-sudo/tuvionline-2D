import { useEffect, useId, useRef, type ReactNode } from 'react';
import { useBackHandler } from '../../app/hooks';
import s from './Sheet.module.css';

/** Bảng trượt từ dưới lên. Back/Esc hoặc chạm nền tối để đóng. */
export function Sheet({ open, title, onClose, children }: { open: boolean; title: string; onClose(): void; children: ReactNode }) {
  const id = useId();
  const panel = useRef<HTMLDivElement>(null);
  useBackHandler(() => { onClose(); return true; }, open);
  useEffect(() => {
    if (open) panel.current?.focus();
  }, [open]);
  if (!open) return null;
  return (
    <div className={s.backdrop} onClick={onClose}>
      <div ref={panel} className={s.panel} role="dialog" aria-modal="true" aria-labelledby={id} tabIndex={-1} onClick={(e) => e.stopPropagation()}>
        <div className={s.grip} aria-hidden="true" />
        <h2 id={id} className={s.title}>{title}</h2>
        {children}
      </div>
    </div>
  );
}
