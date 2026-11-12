/* Lược đồ 4: câu trả lời kiểm chứng ngũ hành (Phase 3C.5, ARCHITECTURE 14.6). */
import { describe, expect, it } from 'vitest';
import { createStore } from './store';
import { addProfile, clearNguHanhAnswers, nguHanhAnswersOf, removeProfile, setNguHanhAnswer, updateProfile } from './actions';
import { birthKeyOf, emptyState, parsePersisted, SCHEMA_VERSION } from './schema';
import { upgradeDoc } from './migrations';
import { backupText, parseBackup } from './backup';

const me = { name: 'An', gender: 'M', calendar: 'solar', day: 15, month: 6, year: 1996, leapMonth: false, hourIdx: 6, lateTy: false } as const;
const T = '2026-11-12T01:00:00Z';

describe('Lược đồ 4: nguHanhAnswers', () => {
  it('migration 3 → 4 giữ nguyên palmSessions và mọi dữ liệu cũ', () => {
    const v3 = {
      version: 3, profiles: [{ id: 'p1', name: 'An', gender: 'M', calendar: 'solar', day: 15, month: 6, year: 1996, leapMonth: false, hourIdx: 6, lateTy: false, createdAt: T, updatedAt: T, relation: 'self' }],
      activeProfileId: 'p1', settings: { theme: 'dark', ttsRate: 1.2, ttsPitch: 1, entryMode: 'short', journeySound: false, xungHo: 'anh' }, tools: { laBanCalib: 7, palmGuideSeen: true },
      palmSessions: [{
        id: 's1', profileId: 'p1', date: T, hand: 'right', role: 'current', version: 1, landmarks: Array.from({ length: 21 }, (_, i) => ({ x: i / 21, y: 0.5 })),
        lines: { sinh: [[{ x: 0.1, y: 0.2 }, { x: 0.3, y: 0.5 }]] }, answers: { Q01: 'right' }, measured: {},
      }],
    };
    const up = upgradeDoc(JSON.parse(JSON.stringify(v3)));
    expect(up.version).toBe(4);
    expect(up.nguHanhAnswers).toEqual([]);
    expect(up.palmSessions).toEqual(v3.palmSessions);
    expect(up.profiles).toEqual(v3.profiles);
    expect(up.settings).toEqual(v3.settings);
    expect(up.tools).toEqual(v3.tools);
    const r = parsePersisted(up);
    expect(r.ok).toBe(true);
    expect(SCHEMA_VERSION).toBe(4);
  });

  it('di chuyển từ v1 tới v4 qua một chuỗi migration', () => {
    const up = upgradeDoc({ version: 1, profiles: [], activeProfileId: null, settings: { theme: 'light', ttsRate: 1, ttsPitch: 1 }, tools: {} });
    expect(up.version).toBe(4);
    expect(parsePersisted(up).ok).toBe(true);
  });

  it('kiểm tra lược đồ: từ chối câu trả lời hỏng', () => {
    const s = createStore(emptyState());
    const id = addProfile(s, me);
    setNguHanhAnswer(s, id, { kind: 'nam', year: 2015 }, 'tot', T);
    const good = JSON.parse(JSON.stringify(s.getState()));
    expect(parsePersisted(good).ok).toBe(true);
    for (const bad of [
      { ...good.nguHanhAnswers[0], profileId: 'khong-co' },
      { ...good.nguHanhAnswers[0], outcome: 'rat-tot' },
      { ...good.nguHanhAnswers[0], target: { kind: 'nam', year: 3 } },
      { ...good.nguHanhAnswers[0], target: { kind: 'khac' } },
      { ...good.nguHanhAnswers[0], birthKey: '' },
    ]) expect(parsePersisted({ ...good, nguHanhAnswers: [bad] }).ok).toBe(false);
    expect(parsePersisted({ ...good, nguHanhAnswers: 'x' }).ok).toBe(false);
  });

  it('sao lưu rồi khôi phục giữ câu trả lời; file v3 cũ khôi phục được và có mảng rỗng', () => {
    const s = createStore(emptyState());
    const id = addProfile(s, me);
    setNguHanhAnswer(s, id, { kind: 'nam', year: 2015 }, 'xau', T);
    setNguHanhAnswer(s, id, { kind: 'daiVan', index: 1 }, 'khong-nho', T);
    const r = parseBackup(backupText(s.getState()));
    expect(r.ok && r.state.nguHanhAnswers).toEqual(s.getState().nguHanhAnswers);
    const old = { ...JSON.parse(backupText(s.getState())), version: 3 };
    delete old.nguHanhAnswers;
    const r3 = parseBackup(JSON.stringify(old));
    expect(r3.ok && r3.state.nguHanhAnswers).toEqual([]);
  });

  it('trả lời lại cùng mốc thì ghi đè, mốc khác thì thêm; Làm lại xoá hết của hồ sơ đó', () => {
    const s = createStore(emptyState());
    const a = addProfile(s, me), b = addProfile(s, { ...me, name: 'Bình', year: 1990 });
    setNguHanhAnswer(s, a, { kind: 'nam', year: 2015 }, 'tot', T);
    setNguHanhAnswer(s, a, { kind: 'nam', year: 2015 }, 'xau', T);
    setNguHanhAnswer(s, a, { kind: 'daiVan', index: 1 }, 'binh', T);
    setNguHanhAnswer(s, a, { kind: 'daiVan', index: 2 }, 'tot', T);
    setNguHanhAnswer(s, b, { kind: 'nam', year: 2015 }, 'tot', T);
    const mine = nguHanhAnswersOf(s.getState(), a);
    expect(mine).toHaveLength(3);
    expect(mine.find((x) => x.target.kind === 'nam')!.outcome).toBe('xau');
    clearNguHanhAnswers(s, a);
    expect(nguHanhAnswersOf(s.getState(), a)).toEqual([]);
    expect(nguHanhAnswersOf(s.getState(), b)).toHaveLength(1);
  });

  it('không lưu cho hồ sơ không tồn tại', () => {
    const s = createStore(emptyState());
    setNguHanhAnswer(s, 'khong-co', { kind: 'nam', year: 2015 }, 'tot', T);
    expect(s.getState().nguHanhAnswers).toEqual([]);
  });

  it('xoá hồ sơ thì xoá câu trả lời của hồ sơ đó, giữ của hồ sơ khác', () => {
    const s = createStore(emptyState());
    const a = addProfile(s, me), b = addProfile(s, { ...me, name: 'Bình', year: 1990 });
    setNguHanhAnswer(s, a, { kind: 'nam', year: 2015 }, 'tot', T);
    setNguHanhAnswer(s, b, { kind: 'nam', year: 2016 }, 'tot', T);
    removeProfile(s, a);
    expect(s.getState().nguHanhAnswers.map((x) => x.profileId)).toEqual([b]);
  });

  it('"Xoá toàn bộ dữ liệu" (emptyState) không còn câu trả lời nào', () => {
    expect(emptyState().nguHanhAnswers).toEqual([]);
  });

  it('sửa ngày giờ sinh thì xoá câu trả lời cũ; sửa tên hay quan hệ thì giữ', () => {
    const s = createStore(emptyState());
    const id = addProfile(s, me);
    setNguHanhAnswer(s, id, { kind: 'nam', year: 2015 }, 'tot', T);
    updateProfile(s, id, { ...me, name: 'An (đã sửa)', relation: 'self' });
    expect(nguHanhAnswersOf(s.getState(), id)).toHaveLength(1);
    for (const change of [{ day: 16 }, { month: 7 }, { year: 1997 }, { hourIdx: 7 }, { gender: 'F' as const }, { hourIdx: 0, lateTy: true }]) {
      const t = createStore(emptyState());
      const pid = addProfile(t, me);
      setNguHanhAnswer(t, pid, { kind: 'nam', year: 2015 }, 'tot', T);
      updateProfile(t, pid, { ...me, ...change });
      expect(t.getState().nguHanhAnswers, JSON.stringify(change)).toEqual([]);
    }
  });

  it('câu trả lời lạc dấu ngày giờ sinh (file sửa tay) không được dùng', () => {
    const s = createStore(emptyState());
    const id = addProfile(s, me);
    setNguHanhAnswer(s, id, { kind: 'nam', year: 2015 }, 'tot', T);
    s.setState((x) => ({ ...x, nguHanhAnswers: x.nguHanhAnswers.map((a) => ({ ...a, birthKey: 'M|solar|1|1|1990|0|0|0' })) }));
    expect(nguHanhAnswersOf(s.getState(), id)).toEqual([]);
    expect(birthKeyOf(s.getState().profiles[0])).toBe('M|solar|15|6|1996|0|6|0');
  });
});
