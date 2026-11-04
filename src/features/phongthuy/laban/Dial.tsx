import { useRef, type PointerEvent } from 'react';
import { angleFromCenter, type Huong, type LaBanSector } from '../../../core';
import s from '../phongthuy.module.css';

const C = 200;
const xy = (deg: number, r: number) => { const a = (deg * Math.PI) / 180; return { x: C + r * Math.sin(a), y: C - r * Math.cos(a) }; };
function sectorPath(r0: number, r1: number, b0: number, b1: number) {
  const p1 = xy(b0, r1), p2 = xy(b1, r1), p3 = xy(b1, r0), p4 = xy(b0, r0);
  return `M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)} A ${r1} ${r1} 0 0 1 ${p2.x.toFixed(2)} ${p2.y.toFixed(2)} L ${p3.x.toFixed(2)} ${p3.y.toFixed(2)} A ${r0} ${r0} 0 0 0 ${p4.x.toFixed(2)} ${p4.y.toFixed(2)} Z`;
}
const TICKS = Array.from({ length: 24 }, (_, i) => i * 15);

/** Vòng la bàn: vòng xoay, kim cố định ở trên cùng. `onDrag` chỉ truyền ở chế độ xoay tay. `focus` để thầy đọc (Phase 6) tô sáng một hướng. */
export function Dial({ sectors, heading, label, onDrag, focus }: {
  sectors: readonly LaBanSector[]; heading: number; label: string; onDrag?: (deg: number) => void; focus?: { huong?: Huong };
}) {
  const dragging = useRef(false);
  const emit = (e: PointerEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    onDrag?.(angleFromCenter(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2)));
  };
  return (
    <svg
      className={s.dial} data-drag={!!onDrag} viewBox="-20 -20 440 440" role="img" aria-label={label}
      onPointerDown={(e) => { if (!onDrag) return; dragging.current = true; e.currentTarget.setPointerCapture?.(e.pointerId); emit(e); }}
      onPointerMove={(e) => { if (dragging.current) emit(e); }}
      onPointerUp={() => { dragging.current = false; }}
      onPointerCancel={() => { dragging.current = false; }}
    >
      <g style={{ transform: `rotate(${(-heading).toFixed(2)}deg)`, transformOrigin: `${C}px ${C}px` }}>
        {TICKS.map((d) => {
          const main = d % 45 === 0, a = xy(d, 196), b = xy(d, main ? 178 : 187);
          return <line key={d} x1={a.x} y1={a.y} x2={b.x} y2={b.y} className={s.tick} strokeWidth={main ? 2 : 1} />;
        })}
        <circle cx={C} cy={C} r={196} className={s.ringLine} />
        <circle cx={C} cy={C} r={118} className={s.ringLine} />
        {sectors.map((x) => {
          const pos = xy(x.bearing, 148);
          return (
            <g key={x.huong}>
              <path d={sectorPath(118, 178, x.bearing - 22.5, x.bearing + 22.5)} className={s.sector} data-good={x.star ? x.star.good : undefined} data-focus={focus?.huong === x.huong} />
              <g transform={`translate(${pos.x.toFixed(2)},${pos.y.toFixed(2)}) rotate(${x.bearing})`} textAnchor="middle">
                <text y={-6} className={s.secName}>{x.huong}</text>
                <text y={13} className={s.secQuai}>{x.quai}</text>
                {x.star && <text y={28} className={s.secStar}>{x.star.star}</text>}
              </g>
            </g>
          );
        })}
        {[0, 90, 180, 270].map((d) => {
          const pos = xy(d, 208);
          return <text key={d} transform={`translate(${pos.x.toFixed(2)},${pos.y.toFixed(2)}) rotate(${d})`} textAnchor="middle" className={s.secDeg}>{d}°</text>;
        })}
        <circle cx={C} cy={C} r={26} className={s.hub} />
        <path d={`M ${C} ${C - 20} A 20 20 0 0 1 ${C} ${C + 20} A 10 10 0 0 0 ${C} ${C} A 10 10 0 0 1 ${C} ${C - 20} Z`} className={s.hubInk} />
      </g>
      <polygon points="200,-2 208,20 200,15 192,20" className={s.needle} />
      <line x1={200} y1={82} x2={200} y2={200} className={s.needleLine} />
      <circle cx={200} cy={200} r={5} className={s.needle} />
    </svg>
  );
}
