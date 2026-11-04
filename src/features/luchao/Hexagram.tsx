/* Sơ đồ quẻ và danh sách 6 hào (hào 6 ở trên cùng). `focus.hao` dành cho Phase 6 (thầy đọc tô sáng một hào). */
import { LucHaoEngine, type HaoView, type LucHaoResult } from '../../core';
import s from './luchao.module.css';

const { CAN, CHI, HANH5 } = LucHaoEngine;

function Bar({ duong }: { duong: boolean }) {
  return duong
    ? <span className={s.bar} data-duong="true" aria-hidden="true"><i /></span>
    : <span className={s.bar} data-duong="false" aria-hidden="true"><i /><i /></span>;
}

export function HexagramDiagram({ r }: { r: LucHaoResult }) {
  const rows = [...r.hao].reverse();
  return (
    <figure className={s.diagram} aria-label={`Quẻ ${r.name}`}>
      <figcaption className={s.hxName}>{r.name}</figcaption>
      {rows.map((h) => {
        const tag = [h.isThe && 'Thế', h.isUng && 'Ứng', h.dong && 'Động'].filter(Boolean).join(' · ');
        return (
          <div key={h.idx} className={s.hxRow} data-dong={h.dong}>
            <Bar duong={!!h.amDuong} />
            <span className={s.hxTag}>Hào {h.idx}{tag ? ' — ' : ''}{tag && <b>{tag}</b>}</span>
          </div>
        );
      })}
    </figure>
  );
}

const PILL: Record<string, string> = { 'Vượng': 'vuong', 'Tướng': 'tuong', 'Hưu': 'huu', 'Tù': 'tu', 'Tử': 'tu' };

export function HaoList({ views, focus }: { views: HaoView[]; focus?: { hao?: number } }) {
  const rows = [...views].reverse();
  return (
    <ol className={s.haoList} reversed>
      {rows.map(({ hao: h, state, nhatRel, isDungThan }) => {
        const rel = nhatRel === 'xung' ? 'Nhật xung' : nhatRel === 'hop' ? 'Nhật hợp' : '';
        return (
          <li key={h.idx} className={s.hao} data-the={h.isThe} data-dong={h.dong} data-focus={focus?.hao === h.idx || undefined}
            aria-label={`Hào ${h.idx}: ${h.amDuong ? 'dương' : 'âm'}, ${CAN[h.can]} ${CHI[h.chi]}, hành ${HANH5[h.hanhIdx]}, ${h.lucThan}${h.isThe ? ', Thế' : ''}${h.isUng ? ', Ứng' : ''}${h.dong ? ', động' : ''}${isDungThan ? ', Dụng Thần' : ''}, ${state}${rel ? ', ' + rel : ''}`}>
            <Bar duong={!!h.amDuong} />
            <div className={s.haoMain} aria-hidden="true">
              <div className={s.haoLine}>
                <b>Hào {h.idx}</b>
                <span><span className={s.can}>{CAN[h.can]}</span> {CHI[h.chi]}</span>
                <span className={s.muted}>{HANH5[h.hanhIdx]}</span>
                <span className={s.luc}>{h.lucThan}</span>
              </div>
              <div className={s.haoTags}>
                {h.isThe && <span className={s.tag} data-k="the">THẾ</span>}
                {h.isUng && <span className={s.tag} data-k="ung">ỨNG</span>}
                {h.dong && <span className={s.tag} data-k="dong">ĐỘNG</span>}
                {isDungThan && <span className={s.tag} data-k="dt">DỤNG THẦN</span>}
                <span className={s.pill} data-k={PILL[state]}>{state}</span>
                {rel && <b className={s.rel}>· {rel}</b>}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function BienCard({ r }: { r: LucHaoResult }) {
  if (!r.bien) return null;
  return (
    <div className={s.bien}>
      <div><b className={s.bienName}>{r.bien.name}</b> <span className={s.muted}>— Cung {r.bien.cung}, {r.bien.step}</span></div>
      {r.bien.hoaList.map((x) => (
        <div key={x.haoIdx} className={s.hoaRow}>
          <span>Hào {x.haoIdx}: <b>{CAN[x.tuCan]} {CHI[x.tuChi]}</b> ({x.tuLucThan})</span>
          <span className={s.arrow}>hoá →</span>
          <span><b>{CAN[x.denCan]} {CHI[x.denChi]}</b> ({x.denLucThan})</span>
        </div>
      ))}
    </div>
  );
}
