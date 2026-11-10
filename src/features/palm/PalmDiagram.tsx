/* Sơ đồ bàn tay vẽ từ 21 điểm khớp và các nét đã chạm. Không dùng ảnh chụp. Tay trái được lật để nhìn như đang xem lòng bàn tay mình. */
import type { PalmPt } from '../../core';
import { PALM_LINE_NAME } from '../../content/palm/ui';
import type { PalmLineKey, PalmSession } from '../../state/schema';
import s from './palm.module.css';

export const PALM_LINE_COLOR: Record<PalmLineKey, string> = { tam: '#ff3b6b', tri: '#5b8cff', sinh: '#b36bff', dinh: '#2fd070' };
const FINGERS = [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16], [17, 18, 19, 20]];
const PALM_RING = [0, 1, 5, 9, 13, 17];
const K = 512;

const pts = (ps: readonly PalmPt[]) => ps.map((p) => `${(p.x * K).toFixed(1)},${(p.y * K).toFixed(1)}`).join(' ');

export function PalmDiagram({ session, focus }: { session: Pick<PalmSession, 'hand' | 'landmarks' | 'lines'>; focus?: PalmLineKey }) {
  const lm = session.landmarks;
  const mirror = session.hand === 'left';
  const shown = Object.keys(session.lines) as PalmLineKey[];
  // Khung vừa khít bàn tay và các nét, để đầu ngón tay không bị cắt
  const all = [...lm, ...shown.flatMap((k) => (session.lines[k] ?? []).flat())];
  const pad = 24;
  const x0 = Math.min(...all.map((p) => p.x)) * K - pad, x1 = Math.max(...all.map((p) => p.x)) * K + pad;
  const y0 = Math.min(...all.map((p) => p.y)) * K - pad, y1 = Math.max(...all.map((p) => p.y)) * K + pad;
  return (
    <figure style={{ margin: 0 }}>
      <svg className={s.diagram} viewBox={`${x0} ${y0} ${x1 - x0} ${y1 - y0}`} role="img" aria-label={`Sơ đồ bàn tay ${mirror ? 'trái' : 'phải'} với các đường ${shown.map((k) => PALM_LINE_NAME[k]).join(', ') || 'chưa có'}`}>
        <g transform={mirror ? `translate(${x0 + x1} 0) scale(-1 1)` : undefined} fill="none" strokeLinecap="round" strokeLinejoin="round">
          <polygon points={pts(PALM_RING.map((i) => lm[i]))} fill="var(--surface3)" stroke="var(--line-strong)" strokeWidth={3} />
          {FINGERS.map((f, i) => <polyline key={i} points={pts(f.map((j) => lm[j]))} stroke="var(--line-strong)" strokeWidth={14} opacity={0.55} />)}
          {shown.map((k) => (session.lines[k] ?? []).map((seg, i) => (
            <polyline key={k + i} points={pts(seg)} stroke={PALM_LINE_COLOR[k]} strokeWidth={focus && focus !== k ? 3 : 6} opacity={focus && focus !== k ? 0.35 : 1} />
          )))}
        </g>
      </svg>
      <figcaption className={s.legend}>
        {shown.map((k) => <span key={k}><i style={{ background: PALM_LINE_COLOR[k] }} />{PALM_LINE_NAME[k]}</span>)}
      </figcaption>
    </figure>
  );
}
