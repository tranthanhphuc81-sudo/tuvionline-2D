import type { Huong } from '../../../core';
import type { StarCard } from '../../../content/battrach/explain';
import s from '../phongthuy.module.css';

/** 8 sao Du Niên. Thẻ đang xét (hướng cửa) có viền vàng; `focus` để thầy đọc (Phase 6) tô sáng một hướng. */
export function StarGrid({ cards, focus }: { cards: readonly StarCard[]; focus?: { huong?: Huong } }) {
  return (
    <ul className={s.starGrid} aria-label="Bảng Du Niên 8 sao">
      {cards.map((c) => (
        <li key={c.star} className={s.star} data-good={c.good} data-cur={c.cur} data-focus={focus?.huong === c.huong}>
          <div className={s.starHead}>
            <span className={s.starName}>{c.star}</span>
            <span className={s.pill} data-good={c.good}>{c.pill}</span>
          </div>
          <div className={s.starLine}>{c.line}</div>
          <p className={s.starDesc}>{c.desc}</p>
        </li>
      ))}
    </ul>
  );
}
