/* Lá số 12 cung — bố cục C đã chốt ở Phase 3.1 (ARCHITECTURE.md mục 10): lưới 4×4 gọn vừa 360px, ô giữa là thiên bàn,
   chạm ô để chọn cung; tô cung Mệnh, cung đang chọn, tam phương tứ chính và vẽ đường nối.
   `focus` dành cho Phase 6 (thầy đọc điều khiển ô tô sáng và đường nối). */
import { TuViEngine, cungNameFor, tamPhuong, HOA_KEYS, type HoaKey, type TuViChart } from '../../core';
import s from './ChartGrid.module.css';

const { CHI, CAN } = TuViEngine;
/** [chi, cột, hàng] — đúng vị trí của legacy renderChart */
export const PALACE_POS: readonly (readonly [number, number, number])[] = [
  [5, 1, 1], [6, 2, 1], [7, 3, 1], [8, 4, 1],
  [4, 1, 2], [9, 4, 2],
  [3, 1, 3], [10, 4, 3],
  [2, 1, 4], [1, 2, 4], [0, 3, 4], [11, 4, 4],
];
export const HOA_LABEL: Record<HoaKey, string> = { loc: 'Hoá Lộc', quyen: 'Hoá Quyền', khoa: 'Hoá Khoa', ky: 'Hoá Kỵ' };

export interface ChartFocus { palace?: number; lines?: [number, number][] }

export function hoaOf(ch: TuViChart, star: string): HoaKey[] {
  return HOA_KEYS.filter((k) => ch.tuHoaBanMenh[k] === star);
}

export function StarName({ ch, star }: { ch: TuViChart; star: string }) {
  const hoa = hoaOf(ch, star);
  // chấm Tứ Hoá dính vào chữ cuối để không rơi xuống dòng riêng
  const words = star.split(' ');
  const last = words.pop()!;
  const head = words.join(' ');
  return (
    <span className={s.star}>
      {head && head + ' '}
      <span className={s.nowrap}>{last}{hoa.map((k) => <i key={k} className={s.dot} data-hoa={k} aria-hidden="true" />)}</span>
      {hoa.length > 0 && <span className="visually-hidden"> ({hoa.map((k) => HOA_LABEL[k]).join(', ')})</span>}
    </span>
  );
}

function palaceLabel(ch: TuViChart, c: number): string {
  const stars = ch.stars[c] || [];
  const dh = ch.daiHan.find((d) => d.chi === c)!;
  const starTxt = stars.length ? stars.map((x) => x + hoaOf(ch, x).map((k) => ' ' + HOA_LABEL[k]).join('')).join(', ') : 'vô chính diệu';
  return `Cung ${cungNameFor(ch.menhChi, c)} tại ${CHI[c]}${c === ch.thanChi ? ', có Thân' : ''}: ${starTxt}. Đại hạn ${dh.tuoiStart} đến ${dh.tuoiEnd} tuổi`;
}

export function ChartGrid({ ch, name, gender, selected, onSelect, focus }: {
  ch: TuViChart; name: string; gender: 'M' | 'F'; selected: number; onSelect(c: number): void; focus?: ChartFocus;
}) {
  const sel = focus?.palace ?? selected;
  const tp = tamPhuong(sel);
  const lines: [number, number][] = focus?.lines ?? [[sel, tp[1]], [sel, tp[2]], [sel, tp[3]]];
  const center = (c: number) => { const p = PALACE_POS.find((x) => x[0] === c)!; return [(p[1] - 0.5) * 25, (p[2] - 0.5) * 25]; };
  return (
    <div className={s.grid} role="group" aria-label="Lá số 12 cung">
      {PALACE_POS.map(([c, col, row]) => {
        const stars = ch.stars[c] || [];
        const dh = ch.daiHan.find((d) => d.chi === c)!;
        const cls = [s.cell, c === ch.menhChi && s.menh, c === sel ? s.sel : tp.includes(c) && s.tp].filter(Boolean).join(' ');
        return (
          <button key={c} type="button" className={cls} style={{ gridColumn: col, gridRow: row }}
            aria-pressed={c === sel} aria-label={palaceLabel(ch, c)} onClick={() => onSelect(c)}>
            {c === ch.thanChi && <span className={s.than} aria-hidden="true">Thân</span>}
            <span className={s.hd} aria-hidden="true"><b>{CHI[c]}</b><span className={s.cg}>{cungNameFor(ch.menhChi, c)}</span></span>
            <span className={s.stars} aria-hidden="true">
              {stars.length ? stars.map((x) => <StarName key={x} ch={ch} star={x} />) : <span className={s.vcd}>vô chính diệu</span>}
            </span>
            <span className={s.age} aria-hidden="true">{dh.tuoiStart}–{dh.tuoiEnd}</span>
          </button>
        );
      })}
      <div className={s.center}>
        <b className={s.cname}>{name}</b>
        <span>{gender === 'M' ? 'Nam' : 'Nữ'} · ÂL {ch.lunar.day}/{ch.lunar.month}{ch.lunar.leap ? ' (nhuận)' : ''}/{ch.lunar.year}</span>
        <span>Giờ {CHI[ch.gioChiIdx]} · Năm {CAN[ch.yearCC.can]} {CHI[ch.yearCC.chi]}</span>
        <span className={s.cuc}>{ch.cucTen}</span>
        <span className={s.muted}>({ch.napAmTen})</span>
      </div>
      <svg className={s.lines} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        {lines.map(([a, b]) => { const [x1, y1] = center(a); const [x2, y2] = center(b); return <line key={a + '-' + b} x1={x1} y1={y1} x2={x2} y2={y2} />; })}
      </svg>
    </div>
  );
}
