import { describe, it, expect } from 'vitest';
import { backupFileName, backupText, parseBackup } from './backup';
import { emptyState, SCHEMA_VERSION, type PersistedState, type Profile } from './schema';

const person = (over: Partial<Profile> = {}): Profile => ({
  id: 'a', name: 'An', gender: 'M', calendar: 'solar', day: 15, month: 6, year: 1996, leapMonth: false, hourIdx: 6, lateTy: false, createdAt: 't', updatedAt: 't', ...over,
});
const withOne = (over: Partial<Profile> = {}): PersistedState => ({ ...emptyState(), profiles: [person(over)], activeProfileId: 'a' });

describe('Sao lưu, khôi phục', () => {
  it('xuất rồi nhập lại được đúng dữ liệu', () => {
    const s: PersistedState = { ...withOne(), settings: { ...emptyState().settings, theme: 'dark', xungHo: 'anh' }, tools: { laBanCalib: 5 } };
    const r = parseBackup(backupText(s));
    expect(r).toEqual({ ok: true, state: s });
  });

  it('file bản cũ chạy qua migration', () => {
    const { entryMode: _e, journeySound: _j, xungHo: _x, ...oldSettings } = emptyState().settings;
    const r = parseBackup(JSON.stringify({ ...withOne(), version: 1, settings: oldSettings }));
    expect(r.ok && r.state.version).toBe(SCHEMA_VERSION);
    expect(r.ok && r.state.settings.entryMode).toBe('auto');
  });

  it('báo đúng lý do khi file không dùng được', () => {
    expect(parseBackup('xin chào')).toEqual({ ok: false, error: 'not-json' });
    expect(parseBackup('[]')).toEqual({ ok: false, error: 'invalid' });
    expect(parseBackup('null')).toEqual({ ok: false, error: 'invalid' });
    expect(parseBackup('{"a":1}')).toEqual({ ok: false, error: 'invalid' });
    expect(parseBackup(JSON.stringify({ ...withOne(), version: SCHEMA_VERSION + 1 }))).toEqual({ ok: false, error: 'newer' });
  });

  it('không nhận ngày không tồn tại, kể cả 31/2 nằm trong miền 1…31', () => {
    expect(parseBackup(backupText(withOne({ day: 31, month: 2 })))).toEqual({ ok: false, error: 'bad-date' });
  });

  it('tên file theo ngày, có số 0 đệm', () => {
    expect(backupFileName(new Date(2026, 10, 6))).toBe('ly-so-sao-luu-2026-11-06.json');
    expect(backupFileName(new Date(2026, 0, 2))).toBe('ly-so-sao-luu-2026-01-02.json');
  });
});
