/* Lược đồ dữ liệu lưu trên máy — MỘT tài liệu JSON ở khoá `lyso.state` (ARCHITECTURE.md mục 3).
   Đổi lược đồ thì tăng SCHEMA_VERSION và thêm migration trong migrations.ts. */
import type { Gender, Huong, PalmPt } from '../core';

export const SCHEMA_VERSION = 3 as const;
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
/** Lối vào đạo quán (ARCHITECTURE.md mục 12.2). `auto` = lần đầu và ngày rằm, mùng 1, Tết thì đầy đủ, còn lại rút gọn. */
export type EntryMode = 'auto' | 'full' | 'short' | 'none';
export type XungHoSetting = 'tu-dong' | 'con' | 'anh' | 'chi' | 'co' | 'chu' | 'ban';
/** Người đọc tự tạo từ ảnh của người dùng (ảnh lưu riêng ở khoá `lyso.reader.photo`, không nằm trong tài liệu này). */
export interface CustomReader { name: string; ta: string; voice: 'nam' | 'nu' }
export interface Settings {
  theme: Theme; ttsRate: number; ttsPitch: number; /** giọng người dùng chọn, tuỳ chọn; không có = tự chọn */ ttsVoice?: string; entryMode: EntryMode; journeySound: boolean; xungHo: XungHoSetting;
  /** người đọc ở Tĩnh thất (content/reader/personas.ts) hoặc 'custom'; mã lạ thì dùng Thầy */
  reader?: string;
  /** màu áo người đọc; không có = màu mặc định của nhân vật */
  readerRobe?: string;
  readerCustom?: CustomReader;
}

export interface LucHaoCast {
  tosses: number[];
  castAt: string;
  /** cách gieo (thêm ở Phase 3.4, tuỳ chọn — dữ liệu cũ không có vẫn hợp lệ) */
  method?: 'random' | 'manual';
  /** ngày xem quẻ [ngày, tháng, năm] dương lịch (Phase 3.4, tuỳ chọn) */
  date?: [number, number, number];
}

export interface JourneyHistory {
  firstDone: boolean;
  /** ngày dương gần nhất đã chạy bản đầy đủ, dạng YYYY-MM-DD */
  lastFullDate?: string;
}

export interface Tools {
  lucHaoLastCast?: LucHaoCast;
  batTrachHuongCua?: Huong;
  napAmPair?: [string, string];
  /** ô hiệu chỉnh của La Bàn, −45…45 độ (Phase 4.2, tuỳ chọn) */
  laBanCalib?: number;
  /** lịch sử lối vào (Phase 6.2) */
  journey?: JourneyHistory;
  /** lúc thắp hương, ISO (Phase 6.6) */
  incenseLitAt?: string;
  /** đã xem hướng dẫn chạm đường chỉ tay (tự mở lần đầu) */
  palmGuideSeen?: boolean;
}

/** Một lần xem chỉ tay (ARCHITECTURE mục 13.1). KHÔNG lưu ảnh: chỉ các nét đã chuẩn hoá và 21 điểm khớp bàn tay. */
export type PalmLineKey = 'sinh' | 'tri' | 'tam' | 'dinh';
export const PALM_LINE_KEYS: readonly PalmLineKey[] = ['sinh', 'tri', 'tam', 'dinh'];
export interface PalmSession {
  id: string;
  profileId: string;
  date: string;
  hand: 'left' | 'right';
  /** tay hiện tại hay tay bẩm sinh */
  role: 'current' | 'innate';
  /** mỗi đường là một hay nhiều đoạn (đường đứt quãng có nhiều đoạn), toạ độ khung xem 0…1 */
  lines: Partial<Record<PalmLineKey, PalmPt[][]>>;
  landmarks: PalmPt[];
  answers: Record<string, string | string[] | null>;
  measured: Record<string, string | string[] | null>;
  version: number;
}
export const PALM_SESSION_VERSION = 1;

export interface PersistedState {
  version: typeof SCHEMA_VERSION;
  profiles: Profile[];
  activeProfileId: string | null;
  settings: Settings;
  tools: Tools;
  /** các lần xem chỉ tay, thêm ở lược đồ 3 */
  palmSessions: PalmSession[];
}

export const DEFAULT_SETTINGS: Settings = { theme: 'system', ttsRate: 1, ttsPitch: 1, entryMode: 'auto', journeySound: true, xungHo: 'tu-dong' };

export function emptyState(): PersistedState {
  return { version: SCHEMA_VERSION, profiles: [], activeProfileId: null, settings: { ...DEFAULT_SETTINGS }, tools: {}, palmSessions: [] };
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

const isPt = (v: unknown): boolean => isObj(v) && typeof v.x === 'number' && typeof v.y === 'number' && Number.isFinite(v.x) && Number.isFinite(v.y);

function checkPalmSession(p: unknown, i: number, profileIds: ReadonlySet<string>): string | null {
  const at = `palmSessions[${i}]`;
  if (!isObj(p)) return `${at} không phải object`;
  if (!isStr(p.id) || !p.id) return `${at}.id thiếu`;
  if (!isStr(p.profileId) || !profileIds.has(p.profileId)) return `${at}.profileId không trỏ tới hồ sơ nào`;
  if (!isStr(p.date)) return `${at}.date thiếu`;
  if (p.hand !== 'left' && p.hand !== 'right') return `${at}.hand không hợp lệ`;
  if (p.role !== 'current' && p.role !== 'innate') return `${at}.role không hợp lệ`;
  if (!Number.isInteger(p.version)) return `${at}.version không hợp lệ`;
  if (!Array.isArray(p.landmarks) || p.landmarks.length !== 21 || !p.landmarks.every(isPt)) return `${at}.landmarks phải có 21 điểm`;
  if (!isObj(p.lines)) return `${at}.lines không phải object`;
  for (const [k, segs] of Object.entries(p.lines)) {
    if (!PALM_LINE_KEYS.includes(k as PalmLineKey)) return `${at}.lines có đường lạ`;
    if (!Array.isArray(segs) || !segs.every((s) => Array.isArray(s) && s.every(isPt))) return `${at}.lines.${k} không hợp lệ`;
  }
  if (!isObj(p.answers) || !isObj(p.measured)) return `${at}.answers/measured không phải object`;
  const okAns = (v: unknown) => v === null || isStr(v) || (Array.isArray(v) && v.every(isStr));
  if (!Object.values(p.answers).every(okAns) || !Object.values(p.measured).every(okAns)) return `${at}: câu trả lời không hợp lệ`;
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
  if (!['auto', 'full', 'short', 'none'].includes(s.entryMode as string)) return { ok: false, error: 'settings.entryMode không hợp lệ' };
  if (typeof s.journeySound !== 'boolean') return { ok: false, error: 'settings.journeySound không phải boolean' };
  if (!['tu-dong', 'con', 'anh', 'chi', 'co', 'chu', 'ban'].includes(s.xungHo as string)) return { ok: false, error: 'settings.xungHo không hợp lệ' };
  if ((s.reader !== undefined && !isStr(s.reader)) || (s.readerRobe !== undefined && !isStr(s.readerRobe))) return { ok: false, error: 'settings.reader không hợp lệ' };
  if (s.readerCustom !== undefined) {
    const c = s.readerCustom;
    if (!isObj(c) || !isStr(c.name) || !isStr(c.ta) || (c.voice !== 'nam' && c.voice !== 'nu')) return { ok: false, error: 'settings.readerCustom không hợp lệ' };
  }
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
  if (t.journey !== undefined) {
    const j = t.journey;
    if (!isObj(j) || typeof j.firstDone !== 'boolean' || (j.lastFullDate !== undefined && !isStr(j.lastFullDate))) return { ok: false, error: 'tools.journey không hợp lệ' };
  }
  if (t.incenseLitAt !== undefined && !isStr(t.incenseLitAt)) return { ok: false, error: 'tools.incenseLitAt không hợp lệ' };
  if (t.palmGuideSeen !== undefined && typeof t.palmGuideSeen !== 'boolean') return { ok: false, error: 'tools.palmGuideSeen không hợp lệ' };
  if (t.laBanCalib !== undefined && !isInt(t.laBanCalib, -45, 45)) return { ok: false, error: 'tools.laBanCalib không hợp lệ' };
  if (!Array.isArray(raw.palmSessions)) return { ok: false, error: 'palmSessions không phải mảng' };
  for (let i = 0; i < raw.palmSessions.length; i++) {
    const e = checkPalmSession(raw.palmSessions[i], i, ids);
    if (e) return { ok: false, error: e };
  }
  return { ok: true, state: raw as unknown as PersistedState };
}
