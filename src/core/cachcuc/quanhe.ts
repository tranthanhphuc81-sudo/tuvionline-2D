/* Hình, xung, hội, hợp trong tứ trụ (TBCT ch.5 "hợp nhi bất hợp", ch.7 "hình xung hội hợp giải pháp"; TTT ch.11 "Phương cục",
   phần II ch.18–19). ARCHITECTURE 15.6. Chỉ trả mã; câu chữ ở src/content/cachcuc/quanhe.ts. */
import { BRANCH_CLASHES, BRANCH_SIX_COMBOS, BRANCH_TRIADS, STEM_COMBOS, type Element } from '../nguhanh/data';
import type { CanIdx, ChiIdx } from '../types';

/** Thiên can tương xung: hai can cùng âm dương, cách nhau 6 ngôi (Giáp Canh, Ất Tân, Bính Nhâm, Đinh Quý). */
const STEM_CLASHES: ReadonlyArray<readonly [CanIdx, CanIdx]> = [[0, 6], [1, 7], [2, 8], [3, 9]];
/** Tam hội phương: ba chi cùng một phương, mạnh hơn tam hợp. */
export const BRANCH_MEETINGS: ReadonlyArray<{ set: readonly [ChiIdx, ChiIdx, ChiIdx]; to: Element }> = [
  { set: [2, 3, 4], to: 'Mộc' }, { set: [5, 6, 7], to: 'Hoả' }, { set: [8, 9, 10], to: 'Kim' }, { set: [11, 0, 1], to: 'Thuỷ' },
];
/** Tam hình: Dần Tỵ Thân (vô ân), Sửu Tuất Mùi (cậy thế), Tý Mão (vô lễ); tự hình: Thìn, Ngọ, Dậu, Hợi gặp chính nó. */
const PUNISH_TRIOS: ReadonlyArray<readonly ChiIdx[]> = [[2, 5, 8], [1, 10, 7]];
const PUNISH_PAIR: readonly [ChiIdx, ChiIdx] = [0, 3];
const SELF_PUNISH: readonly ChiIdx[] = [4, 6, 9, 11];
/** Lục hại. */
const HARMS: ReadonlyArray<readonly [ChiIdx, ChiIdx]> = [[0, 7], [1, 6], [2, 5], [3, 4], [8, 11], [9, 10]];

export type QuanHeKind = 'can-hop' | 'can-xung' | 'tam-hoi' | 'tam-hop' | 'ban-hop' | 'luc-hop' | 'xung' | 'hinh' | 'tu-hinh' | 'hai';

export interface QuanHe {
  kind: QuanHeKind;
  /** chỉ số trụ: 0 năm, 1 tháng, 2 ngày, 3 giờ */
  pillars: number[];
  /** hành hợp thành (hợp, hội) */
  to?: Element;
  /** hai trụ kề nhau. Sách: cách xa thì hợp, xung yếu đi nhiều */
  ke?: boolean;
  /** xung đã được hợp giải, hoặc hợp đã bị xung phá */
  giai?: boolean;
}

const has = <T,>(pair: readonly T[], a: T, b: T) => (pair[0] === a && pair[1] === b) || (pair[0] === b && pair[1] === a);
const pairsOf = (n: number) => { const out: [number, number][] = []; for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) out.push([i, j]); return out; };

export function quanHe(stems: readonly CanIdx[], branches: readonly ChiIdx[]): QuanHe[] {
  const out: QuanHe[] = [];
  for (const [i, j] of pairsOf(4)) {
    const combo = STEM_COMBOS.find((c) => has(c.pair, stems[i], stems[j]));
    if (combo) out.push({ kind: 'can-hop', pillars: [i, j], to: combo.to, ke: j - i === 1 });
    if (STEM_CLASHES.some((c) => has(c, stems[i], stems[j]))) out.push({ kind: 'can-xung', pillars: [i, j], ke: j - i === 1 });
  }
  // Ba chi: tam hội trước tam hợp (sách xếp hội mạnh hơn hợp)
  for (const g of [...BRANCH_MEETINGS.map((m) => ({ ...m, kind: 'tam-hoi' as const })), ...BRANCH_TRIADS.map((t) => ({ ...t, kind: 'tam-hop' as const }))]) {
    const idx = g.set.map((b) => branches.indexOf(b));
    if (idx.every((x) => x >= 0)) out.push({ kind: g.kind, pillars: [...idx].sort(), to: g.to });
  }
  for (const t of BRANCH_TRIADS) {
    if (t.set.every((b) => branches.includes(b))) continue;
    const mid = branches.indexOf(t.set[1]);
    if (mid < 0) continue;
    for (const side of [t.set[0], t.set[2]]) { const k = branches.indexOf(side); if (k >= 0) out.push({ kind: 'ban-hop', pillars: [Math.min(mid, k), Math.max(mid, k)], to: t.to }); }
  }
  for (const [i, j] of pairsOf(4)) {
    const a = branches[i], b = branches[j];
    const six = BRANCH_SIX_COMBOS.find((c) => has(c.pair, a, b));
    if (six) out.push({ kind: 'luc-hop', pillars: [i, j], to: six.to, ke: j - i === 1 });
    if (BRANCH_CLASHES.some((c) => has(c, a, b))) out.push({ kind: 'xung', pillars: [i, j], ke: j - i === 1 });
    if (HARMS.some((c) => has(c, a, b))) out.push({ kind: 'hai', pillars: [i, j], ke: j - i === 1 });
    if (has(PUNISH_PAIR, a, b) || PUNISH_TRIOS.some((t) => a !== b && t.includes(a) && t.includes(b))) out.push({ kind: 'hinh', pillars: [i, j], ke: j - i === 1 });
    if (a === b && SELF_PUNISH.includes(a)) out.push({ kind: 'tu-hinh', pillars: [i, j], ke: j - i === 1 });
  }
  // Giải pháp (TBCT ch.7): chi bị xung mà đang ở trong một hợp hay hội khác thì xung được giải; ngược lại hợp bị xung làm lỏng.
  const inHop = (p: number) => out.some((r) => (r.kind === 'luc-hop' || r.kind === 'tam-hop' || r.kind === 'tam-hoi' || r.kind === 'ban-hop') && r.pillars.includes(p));
  for (const r of out) if (r.kind === 'xung' && (inHop(r.pillars[0]) || inHop(r.pillars[1]))) r.giai = true;
  return out;
}
