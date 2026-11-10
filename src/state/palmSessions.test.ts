import { describe, it, expect } from 'vitest';
import { createStore } from './store';
import { addProfile, palmHistory, PALM_HISTORY_MAX, removePalmSession, removeProfile, savePalmSession, type PalmSessionInput } from './actions';
import { emptyState, parsePersisted } from './schema';
import { upgradeDoc } from './migrations';
import { backupText, parseBackup } from './backup';

const me = { name: 'An', gender: 'M', calendar: 'solar', day: 15, month: 6, year: 1996, leapMonth: false, hourIdx: 6, lateTy: false } as const;
const lm = Array.from({ length: 21 }, (_, i) => ({ x: i / 21, y: 1 - i / 21 }));
const session = (profileId: string, over: Partial<PalmSessionInput> = {}): PalmSessionInput => ({
  profileId, hand: 'right', role: 'current', landmarks: lm,
  lines: { sinh: [[{ x: 0.2, y: 0.3 }, { x: 0.3, y: 0.6 }]], tri: [[{ x: 0.2, y: 0.4 }, { x: 0.6, y: 0.5 }], [{ x: 0.7, y: 0.5 }, { x: 0.8, y: 0.55 }]] },
  answers: { Q01: 'right', Q30: ['M04', 'M05'], Q09: null }, measured: { Q17: 'SD02', Q20: null }, ...over,
});

describe('Lần xem chỉ tay (lược đồ 3)', () => {
  it('giữ lịch sử các lần xem, mới nhất trước', () => {
    const s = createStore(emptyState());
    const id = addProfile(s, me);
    const a = savePalmSession(s, session(id), '2026-11-10T01:00:00Z');
    const b = savePalmSession(s, session(id, { hand: 'left' }), '2026-11-11T01:00:00Z');
    const c = savePalmSession(s, session(id, { role: 'innate' }), '2026-11-12T01:00:00Z');
    expect(palmHistory(s.getState().palmSessions, id).map((x) => x.id)).toEqual([c, b, a]);
    expect(parsePersisted(JSON.parse(JSON.stringify(s.getState())))).toMatchObject({ ok: true });
  });

  it('quá giới hạn thì bỏ lần cũ nhất của đúng vai đó', () => {
    const s = createStore(emptyState());
    const id = addProfile(s, me);
    const innate = savePalmSession(s, session(id, { role: 'innate' }), '2026-01-01T00:00:00Z');
    const ids = Array.from({ length: PALM_HISTORY_MAX + 2 }, (_, i) => savePalmSession(s, session(id), `2026-02-${String(i + 1).padStart(2, '0')}T00:00:00Z`));
    const kept = palmHistory(s.getState().palmSessions, id).filter((x) => x.role === 'current').map((x) => x.id);
    expect(kept).toHaveLength(PALM_HISTORY_MAX);
    expect(kept).not.toContain(ids[0]);
    expect(kept).not.toContain(ids[1]);
    expect(kept[0]).toBe(ids[ids.length - 1]);
    expect(palmHistory(s.getState().palmSessions, id).some((x) => x.id === innate)).toBe(true);
  });

  it('không lưu cho hồ sơ không tồn tại', () => {
    const s = createStore(emptyState());
    expect(() => savePalmSession(s, session('x'))).toThrow();
  });

  it('xoá hồ sơ thì xoá luôn các lần xem tay của hồ sơ đó', () => {
    const s = createStore(emptyState());
    const a = addProfile(s, me), b = addProfile(s, { ...me, name: 'Bình' });
    savePalmSession(s, session(a));
    const keep = savePalmSession(s, session(b));
    removeProfile(s, a);
    expect(s.getState().palmSessions.map((x) => x.id)).toEqual([keep]);
    removePalmSession(s, keep);
    expect(s.getState().palmSessions).toEqual([]);
  });

  it('migration 2 → 3 thêm danh sách rỗng', () => {
    const { palmSessions: _p, ...old } = { ...emptyState(), version: 2 };
    const r = parsePersisted(upgradeDoc(old as Record<string, unknown>));
    expect(r.ok && r.state.palmSessions).toEqual([]);
  });

  it('kiểm tra hình dạng: sai số điểm, đường lạ, hồ sơ không có', () => {
    const s = createStore(emptyState());
    const id = addProfile(s, me);
    savePalmSession(s, session(id));
    const st = JSON.parse(JSON.stringify(s.getState()));
    const bad = (f: (d: typeof st) => void) => { const d = JSON.parse(JSON.stringify(st)); f(d); return parsePersisted(d).ok; };
    expect(bad(() => undefined)).toBe(true);
    expect(bad((d) => d.palmSessions[0].landmarks.pop())).toBe(false);
    expect(bad((d) => { d.palmSessions[0].lines.la = []; })).toBe(false);
    expect(bad((d) => { d.palmSessions[0].profileId = 'khong-co'; })).toBe(false);
    expect(bad((d) => { d.palmSessions[0].hand = 'giua'; })).toBe(false);
  });

  it('sao lưu rồi khôi phục giữ nguyên các lần xem tay', () => {
    const s = createStore(emptyState());
    savePalmSession(s, session(addProfile(s, me)));
    const r = parseBackup(backupText(s.getState()));
    expect(r).toEqual({ ok: true, state: s.getState() });
  });
});
