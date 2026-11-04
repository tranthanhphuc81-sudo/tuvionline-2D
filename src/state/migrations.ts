/* Nạp và nâng cấp dữ liệu khi khởi động (ARCHITECTURE.md mục 3).
   - migrations[v]: chuyển tài liệu version v → v + 1. Hiện SCHEMA_VERSION = 1 nên chưa có bước nào.
   - Migration 0 → 1: chưa có `lyso.state` mà localStorage còn `lyso-shared-v1` (bản 0.1, trang legacy) → tạo hồ sơ đầu tiên.
   - Dữ liệu hỏng: giữ bản sao ở `lyso.state.corrupt-<thời điểm>`, khởi động rỗng và báo người dùng. Không âm thầm xoá. */
import { resolveBirth } from '../core';
import type { KV } from '../platform/storage';
import { emptyState, parsePersisted, SCHEMA_VERSION, STATE_KEY, type PersistedState, type Profile, type Theme } from './schema';
import { newId } from './ids';

export const LEGACY_SHARED_KEY = 'lyso-shared-v1';
export const LEGACY_THEME_KEY = 'lyso-theme';

export const migrations: Record<number, (old: Record<string, unknown>) => Record<string, unknown>> = {};

export type BootNotice =
  | { kind: 'corrupt'; backupKey: string; error: string }
  | { kind: 'imported-legacy' };

export interface LoadResult { state: PersistedState; notice?: BootNotice; fromStorage: boolean }

export interface LegacySources { shared: string | null; theme: string | null }

/** Đọc hồ sơ từ `lyso-shared-v1` của trang legacy. Trả null nếu thiếu, hỏng, hoặc ngày không tồn tại. */
export function profileFromLegacyShared(raw: string | null, now: string): Profile | null {
  if (!raw) return null;
  let v: Record<string, unknown>;
  try {
    const x = JSON.parse(raw);
    if (typeof x !== 'object' || x === null) return null;
    v = x as Record<string, unknown>;
  } catch {
    return null;
  }
  const gender = v.gender === 'F' ? 'F' : v.gender === 'M' ? 'M' : null;
  const calendar = v.calType === 'lunar' ? 'lunar' : v.calType === 'solar' ? 'solar' : null;
  const day = Number(v.dd), month = Number(v.mm), year = Number(v.yy), hourIdx = Number(v.hourIdx);
  if (!gender || !calendar || !Number.isInteger(hourIdx) || hourIdx < 0 || hourIdx > 11) return null;
  const leapMonth = calendar === 'lunar' && Number(v.leap) === 1;
  const lateTy = v.lateTy === true;
  const r = resolveBirth({ gender, calendar, day, month, year, leapMonth, hourIdx, lateTy });
  if (!r.ok) return null;
  return { id: newId(), name: 'Tôi', gender, calendar, day, month, year, leapMonth, hourIdx, lateTy, relation: 'self', createdAt: now, updatedAt: now };
}

function legacyTheme(raw: string | null): Theme | null {
  return raw === 'light' || raw === 'dark' ? raw : null;
}

export async function loadState(kv: KV, legacy: LegacySources, now: () => Date = () => new Date()): Promise<LoadResult> {
  const raw = await kv.get(STATE_KEY);
  if (raw === null) {
    const s = emptyState();
    const theme = legacyTheme(legacy.theme);
    if (theme) s.settings.theme = theme;
    const p = profileFromLegacyShared(legacy.shared, now().toISOString());
    if (p) {
      s.profiles.push(p);
      s.activeProfileId = p.id;
      return { state: s, notice: { kind: 'imported-legacy' }, fromStorage: false };
    }
    return { state: s, fromStorage: false };
  }
  let error: string;
  try {
    let doc = JSON.parse(raw) as Record<string, unknown>;
    let v = typeof doc?.version === 'number' ? doc.version : NaN;
    while (Number.isInteger(v) && v < SCHEMA_VERSION && migrations[v]) {
      doc = migrations[v](doc);
      v = doc.version as number;
    }
    const r = parsePersisted(doc);
    if (r.ok) return { state: r.state, fromStorage: true };
    error = r.error;
  } catch (e) {
    error = 'JSON hỏng: ' + (e as Error).message;
  }
  const backupKey = `${STATE_KEY}.corrupt-${now().toISOString().replace(/[:.]/g, '-')}`;
  await kv.set(backupKey, raw);
  return { state: emptyState(), notice: { kind: 'corrupt', backupKey, error }, fromStorage: false };
}
