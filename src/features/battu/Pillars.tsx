/* 4 thẻ trụ Bát Tự (2×2 ở màn hẹp, 4 cột khi rộng). `focus` dành cho Phase 6 (thầy đọc tô sáng một trụ; `hidden` tô các tàng can của trụ đó, dùng ở 3C.6). */
import { BatTuEngine, tangCanOf, type BatTuChart } from '../../core';
import s from './battu.module.css';

const { CAN, CHI, HANH5, CAN_HANH, thapThan } = BatTuEngine;
export const hanhAmDuong = (canIdx: number) => HANH5[CAN_HANH[canIdx]] + ' ' + (canIdx % 2 === 0 ? 'Dương' : 'Âm');

export function Pillars({ ch, focus }: { ch: BatTuChart; focus?: { pillar?: number; hidden?: number[] } }) {
  return (
    <div className={s.pillars}>
      {ch.pillars.map((pl, i) => {
        const tag = pl.isNhatChu ? 'NHẬT CHỦ' : thapThan(ch.nhatChu, pl.can);
        const tang = tangCanOf(ch, pl.chi);
        const label = `${pl.role}: ${CAN[pl.can]} ${CHI[pl.chi]}, ${hanhAmDuong(pl.can)}, ${pl.isNhatChu ? 'Nhật Chủ' : 'Thập Thần ' + tag}. Tàng can: ${tang.map((t) => CAN[t.can] + ' ' + t.level + ' ' + t.thapThan).join('; ')}`;
        return (
          <article key={pl.role} className={s.pillar} data-nhatchu={!!pl.isNhatChu} data-focus={focus?.pillar === i || undefined} aria-label={label}>
            <div className={s.role}>{pl.role}</div>
            <div className={s.cc}><span className={s.can}>{CAN[pl.can]}</span> <span>{CHI[pl.chi]}</span></div>
            <div className={s.meta}>{hanhAmDuong(pl.can)}</div>
            <span className={s.loTag} data-nhatchu={!!pl.isNhatChu}>{tag}</span>
            <div className={s.tangTitle}>Tàng can trong {CHI[pl.chi]}</div>
            {tang.map((t) => (
              <div key={t.can} className={s.tangRow} data-dominant={t.level === 'Bản khí'} data-focus={(focus?.pillar === i && focus.hidden?.includes(t.can)) || undefined}>
                <span>{CAN[t.can]} <small>({t.level})</small></span><span className={s.tt}>{t.thapThan}</span>
              </div>
            ))}
          </article>
        );
      })}
    </div>
  );
}
