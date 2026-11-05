/* Thắp hương ở điện Tam Thanh (ARCHITECTURE.md mục 12.1, 12.10): chỉ là tưởng niệm, TUỲ CHỌN. Không tính điểm, không huy hiệu,
   không ảnh hưởng kết quả đọc. Nén hương cháy theo thời gian thật từ `tools.incenseLitAt`, lưu trên máy. */
import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { useApp, useAppCtx } from '../../app/context';
import { INCENSE_TEXT } from '../../content/study';
import { tapLight } from '../../platform/haptics';
import { setIncenseLit } from '../../state/actions';
import s from './incense.module.css';

export const INCENSE_MS = 20 * 60 * 1000;
const HOLD_MS = 800;
const REFRESH_MS = 15000;

export type IncenseState = { kind: 'none' } | { kind: 'burning'; left: number } | { kind: 'ash' };

/** `left` = phần hương còn lại, 1 → 0. Đồng hồ máy bị chỉnh lùi thì coi như vừa thắp. */
export function incenseState(litAt: string | undefined, now: number): IncenseState {
  const t = litAt ? Date.parse(litAt) : NaN;
  if (Number.isNaN(t)) return { kind: 'none' };
  const elapsed = Math.max(now - t, 0);
  return elapsed >= INCENSE_MS ? { kind: 'ash' } : { kind: 'burning', left: 1 - elapsed / INCENSE_MS };
}

export function useIncense(): IncenseState {
  const litAt = useApp((x) => x.tools.incenseLitAt);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), REFRESH_MS);
    return () => clearInterval(t);
  }, [litAt]);
  return incenseState(litAt, now);
}

/** Nén hương trong lư. */
export function IncenseStick({ state }: { state: Exclude<IncenseState, { kind: 'none' }> }) {
  const left = state.kind === 'burning' ? state.left : 0;
  return (
    <div className={s.stick} role="img" aria-label={state.kind === 'burning' ? INCENSE_TEXT.burning : INCENSE_TEXT.ash}>
      {state.kind === 'burning' && <i className={s.ember} style={{ bottom: `${12 + left * 40}px` }} />}
      <i className={s.rod} style={{ transform: `scaleY(${0.1 + left * 0.9})` }} />
      <i className={s.bowl} />
    </div>
  );
}

/** Nút chạm giữ để thắp. Trình đọc màn hình và bàn phím bấm một lần là thắp, vì không giữ được. */
export function IncenseControl() {
  const { store } = useAppCtx();
  const state = useIncense();
  const [holding, setHolding] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancel = () => { if (timer.current) clearTimeout(timer.current); timer.current = null; setHolding(false); };
  const light = () => { cancel(); setIncenseLit(store); void tapLight(); };
  useEffect(() => cancel, []);
  const burning = state.kind === 'burning';
  return (
    <>
      {state.kind !== 'none' && <IncenseStick state={state} />}
      {burning ? <p className={s.note}>{INCENSE_TEXT.burning}</p> : (
        <button
          type="button" className={s.hold} data-holding={holding}
          onPointerDown={() => { setHolding(true); timer.current = setTimeout(light, HOLD_MS); }}
          onPointerUp={cancel} onPointerLeave={cancel} onPointerCancel={cancel}
          onClick={(e: MouseEvent) => { if (e.detail === 0) light(); }}
        >{INCENSE_TEXT.hold}</button>
      )}
    </>
  );
}
