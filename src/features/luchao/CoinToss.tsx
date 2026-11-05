import { useEffect, useRef, useState } from 'react';
import { randomToss } from '../../core';
import { tapLight } from '../../platform/haptics';
import { onShake } from '../../platform/shake';
import ui from '../../ui/components/ui.module.css';
import s from './CoinToss.module.css';

const COUNT = 6;

/** Tự tay gieo từng hào: chạm hoặc lắc máy, rung nhẹ mỗi lần. `active` = false thì không nghe lắc, vì màn hình này luôn được giữ mount. */
export function CoinToss({ active, onDone }: { active: boolean; onDone(tosses: number[]): void }) {
  const [tosses, setTosses] = useState<number[]>([]);
  const done = useRef(onDone);
  done.current = onDone;
  const list = useRef<number[]>([]);

  const toss = useRef(() => {
    const next = [...list.current, randomToss()];
    void tapLight();
    if (next.length === COUNT) { list.current = []; setTosses([]); done.current(next); return; }
    list.current = next;
    setTosses(next);
  });

  useEffect(() => (active ? onShake(toss.current) : undefined), [active]);

  const last = tosses[tosses.length - 1];
  return (
    <div className={ui.stack}>
      <div className={s.coins} aria-hidden="true">
        {[0, 1, 2].map((i) => <i key={`${tosses.length}-${i}`} className={s.coin} data-heads={last !== undefined && i < last - 6} style={{ animationDelay: `${i * 60}ms` }} />)}
      </div>
      {tosses.length > 0 && <p className={ui.muted} aria-live="polite">{tosses.map((t, i) => `Hào ${i + 1}: ${t}`).join(' · ')}</p>}
      <button type="button" className={`${ui.btn} ${ui.block}`} onClick={toss.current}>🪙 Gieo hào {tosses.length + 1}/{COUNT}</button>
      <p className={ui.muted}>Tự tay gieo: chạm nút hoặc lắc máy cho mỗi hào.</p>
    </div>
  );
}
