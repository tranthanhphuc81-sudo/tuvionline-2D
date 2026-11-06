/* Sao lưu, khôi phục: file là đúng tài liệu `lyso.state` (ARCHITECTURE.md mục 3). Khôi phục chạy qua migrations rồi kiểm tra đầy đủ. */
import { validateProfile } from './actions';
import { upgradeDoc } from './migrations';
import { parsePersisted, SCHEMA_VERSION, type PersistedState } from './schema';

/** File sao lưu thật chỉ vài KB; chặn file lớn trước khi đọc vào bộ nhớ. */
export const BACKUP_MAX_BYTES = 1_000_000;

export type RestoreError = 'not-json' | 'newer' | 'invalid' | 'bad-date';
export type RestoreResult = { ok: true; state: PersistedState } | { ok: false; error: RestoreError };

export function backupText(s: PersistedState): string {
  return JSON.stringify(s, null, 2);
}

export function backupFileName(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `ly-so-sao-luu-${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}.json`;
}

export function parseBackup(text: string): RestoreResult {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, error: 'not-json' };
  }
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return { ok: false, error: 'invalid' };
  const doc = raw as Record<string, unknown>;
  if (typeof doc.version === 'number' && doc.version > SCHEMA_VERSION) return { ok: false, error: 'newer' };
  let r: ReturnType<typeof parsePersisted>;
  try {
    r = parsePersisted(upgradeDoc(doc));
  } catch {
    return { ok: false, error: 'invalid' };
  }
  if (!r.ok) return { ok: false, error: 'invalid' };
  // parsePersisted chỉ kiểm miền giá trị; file có thể bị sửa tay thành 31/2 nên kiểm lại ngày có thật.
  if (!r.state.profiles.every((p) => validateProfile(p).ok)) return { ok: false, error: 'bad-date' };
  return { ok: true, state: r.state };
}
