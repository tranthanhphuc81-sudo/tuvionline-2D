/* Bước xin keo trước khi gieo quẻ (ARCHITECTURE 16.4): chạm nút hoặc lắc máy, hai miếng keo rơi, rung vừa.
   Thuận, hoặc đủ ba lần, thì báo `onDone` sau một nhịp để người dùng đọc kịp câu. Luôn có nút "Bỏ qua". */
import { useEffect, useRef, useState } from 'react';
import { KEO_LINES, fill, pick } from '../../content/reader/templates';
import { tapMedium } from '../../platform/haptics';
import { onShake } from '../../platform/shake';
import ui from '../../ui/components/ui.module.css';
import { KEO_MAX, keoNext, tossKeo, type KeoFace } from './keo';
import s from './CoinToss.module.css';

/** Chờ bấy nhiêu sau khi keo thuận (hoặc đủ lần) rồi mới chuyển sang gieo xu. */
export const KEO_DONE_MS = 1400;

export function KeoStep({ active, goi, onDone }: { active: boolean; goi: string; onDone(): void }) {
  const [tries, setTries] = useState(0);
  const [faces, setFaces] = useState<[KeoFace, KeoFace] | null>(null);
  const [line, setLine] = useState(() => fill(pick(KEO_LINES.start, new Date().getDate()), { goi }));
  const finished = useRef(false);
  const done = useRef(onDone);
  done.current = onDone;
  const triesRef = useRef(0);

  const toss = useRef(() => {
    if (finished.current) return;
    const t = triesRef.current + 1;
    triesRef.current = t;
    const r = tossKeo();
    void tapMedium();
    setTries(t);
    setFaces(r.faces);
    const next = keoNext(r.result, t);
    setLine(fill(pick(KEO_LINES[next], t), { goi }));
    if (next !== 'lai') { finished.current = true; setTimeout(() => done.current(), KEO_DONE_MS); }
  });

  useEffect(() => (active ? onShake(toss.current) : undefined), [active]);

  return (
    <div className={ui.stack}>
      <div className={s.coins} aria-hidden="true">
        {[0, 1].map((i) => <i key={`${tries}-${i}`} className={s.keo} data-face={faces?.[i] ?? 'none'} style={{ animationDelay: `${i * 80}ms` }} />)}
      </div>
      <p className={ui.muted} aria-live="polite">{line}</p>
      <button type="button" className={`${ui.btn} ${ui.primary} ${ui.block}`} disabled={finished.current} onClick={toss.current}>{finished.current ? 'Đang chuyển sang gieo quẻ…' : `🙏 Xin keo ${tries + 1}/${KEO_MAX}`}</button>
      <button type="button" className={`${ui.btn} ${ui.ghost} ${ui.block}`} onClick={() => { finished.current = true; done.current(); }}>Bỏ qua, gieo luôn</button>
    </div>
  );
}
