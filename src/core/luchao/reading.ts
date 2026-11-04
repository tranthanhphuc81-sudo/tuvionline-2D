/* Phần TÍNH TOÁN của luận đoán Lục Hào, chuyển từ legacy (lyso-toolkit.html: tab Lục Hào — randomToss, renderHaoList,
   findDungThanHao, renderVerdict; LySoInterp.lucHao). Giữ nguyên quy tắc và thứ tự xét. Câu chữ ở src/content/luchao. */
import { monthChiFromDate } from '../calendar';
import { dayCanChiIndex, mod, type CanChi, type ChiIdx, type Hanh } from '../canchi';
import { LH_HANH_ORDER, VTHTT, chiRelation, seasonOfMonthChi } from './engine';
import type { Hao, LucHaoResult, LucThan, Season, Toss, VuongSuy } from './types';

/** "Hỏi về việc gì": Thế (bản thân), Ứng (đối tượng/kết quả) hoặc một Lục Thân. */
export type DungThanKey = 'the' | 'ung' | LucThan;
export const DUNG_THAN_KEYS: readonly DungThanKey[] = ['the', 'Phụ Mẫu', 'Huynh Đệ', 'Tử Tôn', 'Thê Tài', 'Quan Quỷ', 'ung'];

/* ===== Gieo quẻ ===== */
/** Một đồng xu: true = mặt hình (Dương, 3 điểm). Mặc định dùng bộ sinh số ngẫu nhiên mật mã nếu có. */
export function coinFlip(): boolean {
  const c = (globalThis as { crypto?: Crypto }).crypto;
  if (c && typeof c.getRandomValues === 'function') { const a = new Uint8Array(1); c.getRandomValues(a); return (a[0] & 1) === 1; }
  return Math.random() < 0.5;
}
/** Một hào = 3 đồng xu: 0 mặt hình → 6, 1 → 7, 2 → 8, 3 → 9 (legacy randomToss). */
export function randomToss(flip: () => boolean = coinFlip): Toss {
  let heads = 0;
  for (let i = 0; i < 3; i++) if (flip()) heads++;
  return 6 + heads;
}
/** 6 hào, từ hào Sơ đến hào Thượng. */
export function randomTosses(flip: () => boolean = coinFlip): Toss[] {
  return [0, 1, 2, 3, 4, 5].map(() => randomToss(flip));
}

/* ===== Bối cảnh ngày xem ===== */
export interface CastContext { nhat: CanChi; thangChi: ChiIdx; season: Season }
/** Nhật thần (can chi ngày), Nguyệt lệnh (Chi tháng theo tiết, UTC+7) và mùa của ngày xem quẻ. */
export function castContext(dd: number, mm: number, yy: number): CastContext {
  const thangChi = monthChiFromDate(dd, mm, yy, 7);
  return { nhat: dayCanChiIndex(dd, mm, yy), thangChi, season: seasonOfMonthChi(thangChi) };
}

export type NhatRel = 'xung' | 'hop' | null;
export interface HaoView { hao: Hao; state: VuongSuy; nhatRel: NhatRel; isDungThan: boolean }
/** Trạng thái vượng suy và quan hệ với Nhật thần của từng hào (hào 1 → 6). */
export function haoViews(r: LucHaoResult, ctx: CastContext, key: DungThanKey): HaoView[] {
  const vt = VTHTT[ctx.season];
  return r.hao.map((h) => ({
    hao: h, state: vt[h.hanhIdx], nhatRel: chiRelation(h.chi, ctx.nhat.chi),
    isDungThan: (key === 'the' && h.isThe) || (key === 'ung' && h.isUng) || key === h.lucThan,
  }));
}

export function findDungThanHao(r: LucHaoResult, key: DungThanKey): Hao[] {
  if (key === 'the') return r.hao.filter((h) => h.isThe);
  if (key === 'ung') return r.hao.filter((h) => h.isUng);
  return r.hao.filter((h) => h.lucThan === key);
}

/* ===== Mục "Luận đoán" (legacy renderVerdict) ===== */
export interface VerdictHao {
  hao: Hao;
  state: VuongSuy;
  strong: boolean;
  nhatRel: NhatRel;
  /** quan hệ với Thế: 0 đồng hành, 1 bị Thế sinh, 2 bị Thế khắc, 3 khắc Thế, 4 sinh Thế; null nếu chính là Thế */
  theRel: number | null;
  theIdx: number;
}
export function verdictHaos(r: LucHaoResult, ctx: CastContext, key: DungThanKey): VerdictHao[] {
  const vt = VTHTT[ctx.season];
  const the = r.hao.find((x) => x.isThe)!;
  return findDungThanHao(r, key).map((h) => {
    const state = vt[h.hanhIdx];
    return {
      hao: h, state, strong: state === 'Vượng' || state === 'Tướng', nhatRel: chiRelation(h.chi, ctx.nhat.chi),
      theRel: h.isThe ? null : mod(h.hanhIdx - the.hanhIdx, 5), theIdx: the.idx,
    };
  });
}

/* ===== Tổng kết (legacy lucHao) ===== */
export type LhTone = 'ok' | 'mid' | 'warn';
export interface LucHaoReading {
  key: DungThanKey;
  /** hào Dụng Thần được chọn (mạnh nhất trong các hào ứng viên), null nếu quẻ không có */
  dt: Hao | null;
  state: VuongSuy | null;
  strong: boolean;
  nhatRel: NhatRel;
  /** quan hệ (việc/đối phương) so với bản thân, như `theRel`; null nếu không xét */
  otherRel: number | null;
  /** hành của hào Dụng Thần */
  dtHanh: Hanh | null;
  score: number;
  tone: LhTone;
}
export function lucHaoReading(r: LucHaoResult, ctx: CastContext, key: DungThanKey): LucHaoReading {
  const vt = VTHTT[ctx.season];
  const theHao = r.hao.find((h) => h.isThe)!;
  const ungHao = r.hao.find((h) => h.isUng)!;
  const dts = key === 'the' ? [theHao] : key === 'ung' ? [ungHao] : r.hao.filter((h) => h.lucThan === key);
  let score = 0;
  if (!dts.length) return { key, dt: null, state: null, strong: false, nhatRel: null, otherRel: null, dtHanh: null, score: -1, tone: 'warn' };
  const rank = (h: Hao) => (vt[h.hanhIdx] === 'Vượng' ? 2 : vt[h.hanhIdx] === 'Tướng' ? 1 : 0);
  const dt = dts.slice().sort((x, y) => rank(y) - rank(x))[0];
  const st = vt[dt.hanhIdx];
  const strong = st === 'Vượng' || st === 'Tướng';
  if (strong) score += 2; else if (st !== 'Hưu') score -= 2;
  const rel = chiRelation(dt.chi, ctx.nhat.chi);
  if (rel === 'hop') score += 1;
  if (rel === 'xung') score += strong ? 1 : -1;
  const other = key === 'the' ? ungHao : theHao;
  let otherRel: number | null = null;
  if (other && other !== dt) {
    const d = mod((key === 'the' ? other.hanhIdx : dt.hanhIdx) - (key === 'the' ? dt.hanhIdx : theHao.hanhIdx), 5);
    otherRel = d;
    if (d === 4) score += 1; else if (d === 2) score += 0.5; else if (d === 3) score -= 1; else if (d === 1) score -= 0.5;
  }
  const tone: LhTone = score >= 2 ? 'ok' : score >= 0 ? 'mid' : 'warn';
  return { key, dt, state: st, strong, nhatRel: rel, otherRel, dtHanh: LH_HANH_ORDER[dt.hanhIdx], score, tone };
}
