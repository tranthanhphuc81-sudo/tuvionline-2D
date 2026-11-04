/* Lược đồ dữ liệu lưu trên máy — MỘT tài liệu JSON ở khoá `lyso.state` (ARCHITECTURE.md mục 3).
   Đổi lược đồ thì tăng SCHEMA_VERSION và thêm migration trong migrations.ts. */
import type { Gender, Huong } from '../core';

export const SCHEMA_VERSION = 1 as const;
export const STATE_KEY = 'lyso.state';

export type Relation = 'self' | 'spouse' | 'child' | 'parent' | 'sibling' | 'other';
export const RELATIONS: readonly Relation[] = ['self', 'spouse', 'child', 'parent', 'sibling', 'other'];

export interface Profile {
  id: string;
  name: string;
  gender: Gender;
  /** LƯU ĐÚNG như người dùng nhập; ngày dương được suy ra khi tính */
  calendar: 'solar' | 'lunar';
  day: number;
  month: number;
  year: number;
  /** chỉ có nghĩa khi calendar = 'lunar' */
  leapMonth: boolean;
  /** 0 = Tý … 11 = Hợi */
  hourIdx: number;
  /** giờ Tý muộn → tính sang ngày hôm sau */
  lateTy: boolean;
  relation?: Relation;
  createdAt: string;
  updatedAt: string;
}

export type Theme = 'system' | 'light' | 'dark';
export interface Settings { theme: Theme; ttsRate: number; ttsPitch: number }

export interface LucHaoCast {
  tosses: number[];
  castAt: string;
  /** cách gieo (thêm ở Phase 3.4, tuỳ chọn — dữ liệu cũ không có vẫn hợp lệ) */
  method?: 'random' | 'manual';
  /** ngày xem quẻ [ngày, tháng, năm] dương lịch (Phase 3.4, tuỳ chọn) */
  date?: [number, number, number];
}

export interface Tools {
  lucHaoLastCast?: LucHaoCast;
  batTrachHuongCua?: Huong;
  napAmPair?: [string, string];
}

export interface PersistedState {
  version: typeof SCHEMA_VERSION;
  profiles: Profile[];
  activeProfileId: string | null;
  settings: Settings;
  tools: Tools;
}

export const DEFAULT_SETTINGS: Settings = { theme: 'system', ttsRate: 1, ttsPitch: 1 };

export function emptyState(): PersistedState {
  return { version: SCHEMA_VERSION, profiles: [], activeProfileId: null, settings: { ...DEFAULT_SETTINGS }, tools: {} };
}

/* ===== Kiểm tra hình dạng dữ liệu (viết tay, báo lỗi rõ ràng) ===== */

export type ParseResult = { ok: true; state: PersistedState } | { ok: false; error: string };

const HUONG: readonly string[] = ['Bắc', 'Đông Bắc', 'Đông', 'Đông Nam', 'Nam', 'Tây Nam', 'Tây', 'Tây Bắc'];
const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const isInt = (v: unknown, lo: number, hi: number): v is number => Number.isInteger(v) && (v as number) >= lo && (v as number) <= hi;
const isStr = (v: unknown): v is string => typeof v === 'string';

function checkProfile(p: unknown, i: number): string | null {
  const at = `profiles[${i}]`;
  if (!isObj(p)) return `${at} không phải object`;
  if (!isStr(p.id) || !p.id) return `${at}.id thiếu`;
  if (!isStr(p.name)) return `${at}.name không phải chuỗi`;
  if (p.gender !== 'M' && p.gender !== 'F') return `${at}.gender phải là 'M' hoặc 'F'`;
  if (p.calendar !== 'solar' && p.calendar !== 'lunar') return `${at}.calendar phải là 'solar' hoặc 'lunar'`;
  if (!isInt(p.day, 1, 31)) return `${at}.day ngoài miền 1…31`;
  if (!isInt(p.month, 1, 12)) return `${at}.month ngoài miền 1…12`;
  if (!isInt(p.year, 1900, 2100)) return `${at}.year ngoài miền 1900…2100`;
  if (typeof p.leapMonth !== 'boolean') return `${at}.leapMonth không phải boolean`;
  if (!isInt(p.hourIdx, 0, 11)) return `${at}.hourIdx ngoài miền 0…11`;
  if (typeof p.lateTy !== 'boolean') return `${at}.lateTy không phải boolean`;
  if (p.relation !== undefined && !RELATIONS.includes(p.relation as Relation)) return `${at}.relation không hợp lệ`;
  if (!isStr(p.createdAt) || !isStr(p.updatedAt)) return `${at}.createdAt/updatedAt thiếu`;
  return null;
}

export function parsePersisted(raw: unknown): ParseResult {
  if (!isObj(raw)) return { ok: false, error: 'dữ liệu không phải object' };
  if (raw.version !== SCHEMA_VERSION) return { ok: false, error: `version ${String(raw.version)} không phải ${SCHEMA_VERSION}` };
  if (!Array.isArray(raw.profiles)) return { ok: false, error: 'profiles không phải mảng' };
  for (let i = 0; i < raw.profiles.length; i++) {
    const e = checkProfile(raw.profiles[i], i);
    if (e) return { ok: false, error: e };
  }
  const profiles = raw.profiles as Profile[];
  const ids = new Set(profiles.map((p) => p.id));
  if (ids.size !== profiles.length) return { ok: false, error: 'trùng id hồ sơ' };
  if (raw.activeProfileId !== null && !(isStr(raw.activeProfileId) && ids.has(raw.activeProfileId))) {
    return { ok: false, error: 'activeProfileId không trỏ tới hồ sơ nào' };
  }
  const s = raw.settings;
  if (!isObj(s)) return { ok: false, error: 'settings không phải object' };
  if (s.theme !== 'system' && s.theme !== 'light' && s.theme !== 'dark') return { ok: false, error: 'settings.theme không hợp lệ' };
  if (typeof s.ttsRate !== 'number' || typeof s.ttsPitch !== 'number') return { ok: false, error: 'settings.ttsRate/ttsPitch không phải số' };
  const t = raw.tools;
  if (!isObj(t)) return { ok: false, error: 'tools không phải object' };
  if (t.lucHaoLastCast !== undefined) {
    const c = t.lucHaoLastCast;
    if (!isObj(c) || !Array.isArray(c.tosses) || c.tosses.length !== 6 || !c.tosses.every((x) => isInt(x, 6, 9)) || !isStr(c.castAt)) {
      return { ok: false, error: 'tools.lucHaoLastCast không hợp lệ' };
    }
    if (c.method !== undefined && c.method !== 'random' && c.method !== 'manual') return { ok: false, error: 'tools.lucHaoLastCast.method không hợp lệ' };
    if (c.date !== undefined && !(Array.isArray(c.date) && c.date.length === 3 && isInt(c.date[0], 1, 31) && isInt(c.date[1], 1, 12) && isInt(c.date[2], 1900, 2100))) {
      return { ok: false, error: 'tools.lucHaoLastCast.date không hợp lệ' };
    }
  }
  if (t.batTrachHuongCua !== undefined && !HUONG.includes(t.batTrachHuongCua as string)) return { ok: false, error: 'tools.batTrachHuongCua không hợp lệ' };
  if (t.napAmPair !== undefined && !(Array.isArray(t.napAmPair) && t.napAmPair.length === 2 && t.napAmPair.every(isStr))) {
    return { ok: false, error: 'tools.napAmPair không hợp lệ' };
  }
  return { ok: true, state: raw as unknown as PersistedState };
}
