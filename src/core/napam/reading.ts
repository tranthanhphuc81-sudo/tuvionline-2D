/* Phần TÍNH TOÁN của tab Nạp Âm, chuyển từ legacy (lyso-toolkit.html: resolvePerson, LySoInterp.napAm). Giữ nguyên quy tắc
   và thứ tự xét. Câu chữ ở src/content/napam. */
import { convertSolar2Lunar, lunarTzForSolarYear, validSolar } from '../calendar';
import { khacOf, sinhOf } from '../canchi';
import { chiRel, type ChiRelKind } from '../tuvi/reading';
import { napAmOfYear, relation } from './engine';
import type { NapAmRelation, NapAmYear } from './types';

export interface NapAmBirth extends NapAmYear {
  lunar: { day: number; month: number; year: number; leap: number };
  /** sinh trước Tết nên năm âm khác năm dương */
  beforeTet: boolean;
}

/** Nạp Âm theo năm ÂM LỊCH (đổi năm vào Tết), không theo năm dương lịch. */
export function napAmForBirth(dd: number, mm: number, yy: number): NapAmBirth {
  const lunar = convertSolar2Lunar(dd, mm, yy, lunarTzForSolarYear(yy));
  const res = napAmOfYear(lunar[2]);
  return { ...res, lunar: { day: lunar[0], month: lunar[1], year: lunar[2], leap: lunar[3] }, beforeTet: lunar[2] !== yy };
}

/** Một người trong tab Nạp Âm: có đủ ngày sinh dương lịch, hoặc chỉ có năm (`date`, `lunar` = null). */
export interface NapAmPerson {
  res: NapAmYear;
  solarY: number;
  date: { dd: number; mm: number; yy: number } | null;
  lunar: NapAmBirth['lunar'] | null;
  shifted: boolean;
}

export function napAmPersonOfDate(dd: number, mm: number, yy: number): NapAmPerson {
  const b = napAmForBirth(dd, mm, yy);
  return { res: b, solarY: yy, date: { dd, mm, yy }, lunar: b.lunar, shifted: b.beforeTet };
}

export type NapAmInputError =
  | { code: 'year-range' }
  | { code: 'partial-date' }
  | { code: 'invalid-date'; dd: number; mm: number; yy: number };

/** Kiểm tra ô nhập tay (legacy resolvePerson): chỉ năm thì dùng đúng năm đó, có ngày tháng thì đổi năm theo Tết. */
export function resolveNapAmInput(dRaw: string, mRaw: string, yRaw: string): { ok: true; person: NapAmPerson } | { ok: false; error: NapAmInputError } {
  const y = parseInt(yRaw, 10);
  if (!Number.isInteger(y) || y < 1900 || y > 2100) return { ok: false, error: { code: 'year-range' } };
  const hasD = dRaw.trim() !== '', hasM = mRaw.trim() !== '';
  if (hasD !== hasM) return { ok: false, error: { code: 'partial-date' } };
  if (!hasD) return { ok: true, person: { res: napAmOfYear(y), solarY: y, date: null, lunar: null, shifted: false } };
  const d = parseInt(dRaw, 10), m = parseInt(mRaw, 10);
  if (!validSolar(d, m, y)) return { ok: false, error: { code: 'invalid-date', dd: d, mm: m, yy: y } };
  return { ok: true, person: napAmPersonOfDate(d, m, y) };
}

export type HopLevel = 'rat-hop' | 'hop' | 'binh-thuong' | 'dung-hoa';
export type NapAmTone = 'ok' | 'mid' | 'warn';

/** Vai của hai người theo Ngũ hành gốc: cùng hành, `by` sinh người kia, hoặc `by` khắc người kia. */
export type HanhFlow = { kind: 'same' } | { kind: 'sinh' | 'khac'; by: 1 | 2 };

export interface NapAmCompat {
  rel: NapAmRelation;
  chiKind: ChiRelKind;
  /** điểm Nạp Âm (+1 hoặc −1) cộng điểm tuổi (+1, 0, −1) */
  score: number;
  level: HopLevel;
  tone: NapAmTone;
  flow: HanhFlow;
}

/** So hai người: mạng (có ngoại lệ dân gian) và tuổi con giáp (legacy LySoInterp.napAm). */
export function napAmCompat(r1: NapAmYear, r2: NapAmYear): NapAmCompat {
  const rel = relation(r1, r2);
  const cr = chiRel(r1.chi, r2.chi);
  const score = (rel.cls === 'ok' ? 1 : -1) + cr.s;
  const level: HopLevel = score >= 2 ? 'rat-hop' : score === 1 ? 'hop' : score === 0 ? 'binh-thuong' : 'dung-hoa';
  const a = r1.hanh, b = r2.hanh;
  let flow: HanhFlow;
  if (a === b) flow = { kind: 'same' };
  else if (sinhOf(a) === b || sinhOf(b) === a) flow = { kind: 'sinh', by: sinhOf(a) === b ? 1 : 2 };
  else flow = { kind: 'khac', by: khacOf(a) === b ? 1 : 2 };
  return { rel, chiKind: cr.kind, score, level, tone: level === 'binh-thuong' ? 'mid' : level === 'dung-hoa' ? 'warn' : 'ok', flow };
}
