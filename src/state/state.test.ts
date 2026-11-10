import { describe, it, expect, vi, afterEach } from 'vitest';
import { createStore } from './store';
import { addProfile, removeProfile, setActiveProfile, setLucHaoCast, setLucHaoDate, setNapAmPair, setSetting, updateProfile, validateProfile, selectActiveProfile, type ProfileInput } from './actions';
import { emptyState, parsePersisted, STATE_KEY, type PersistedState } from './schema';
import { loadState, profileFromLegacyShared } from './migrations';
import { startPersistence } from './persist';
import { createMemoryKV } from '../platform/storage';

const me: ProfileInput = { name: 'An', gender: 'M', calendar: 'solar', day: 15, month: 6, year: 1996, leapMonth: false, hourIdx: 6, lateTy: false, relation: 'self' };
const mk = () => createStore<PersistedState>(emptyState());

describe('actions', () => {
  it('thêm hồ sơ đầu tiên thì chọn luôn; hồ sơ sau không đổi người đang xem', () => {
    const s = mk();
    const a = addProfile(s, me);
    const b = addProfile(s, { ...me, name: 'Bình', gender: 'F' });
    expect(s.getState().profiles.map((p) => p.name)).toEqual(['An', 'Bình']);
    expect(s.getState().activeProfileId).toBe(a);
    setActiveProfile(s, b);
    expect(selectActiveProfile(s.getState())?.name).toBe('Bình');
  });
  it('từ chối hồ sơ không hợp lệ (31/2, tên rỗng, tháng nhuận không có)', () => {
    const s = mk();
    expect(() => addProfile(s, { ...me, day: 31, month: 2 })).toThrow();
    expect(validateProfile({ ...me, name: '  ' })).toMatchObject({ ok: false, nameMissing: true });
    expect(validateProfile({ ...me, calendar: 'lunar', day: 1, month: 3, year: 2023, leapMonth: true })).toMatchObject({ ok: false, birth: { code: 'no-leap-month' } });
    expect(s.getState().profiles).toEqual([]);
  });
  it('chuẩn hoá: bỏ khoảng trắng tên, leapMonth chỉ khi âm lịch, lateTy chỉ khi giờ Tý', () => {
    const s = mk();
    addProfile(s, { ...me, name: '  An  ', leapMonth: true, lateTy: true });
    expect(s.getState().profiles[0]).toMatchObject({ name: 'An', leapMonth: false, lateTy: false });
  });
  it('sửa hồ sơ giữ id và createdAt, đổi updatedAt', () => {
    const s = mk();
    const id = addProfile(s, me, '2026-01-01T00:00:00.000Z');
    updateProfile(s, id, { ...me, name: 'An (sửa)', calendar: 'lunar', day: 1, month: 2, year: 2023, leapMonth: true }, '2026-02-01T00:00:00.000Z');
    expect(s.getState().profiles[0]).toMatchObject({ id, name: 'An (sửa)', leapMonth: true, createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-02-01T00:00:00.000Z' });
  });
  it('xoá hồ sơ đang xem → chuyển sang hồ sơ còn lại; bỏ cặp hợp hôn chứa hồ sơ đó', () => {
    const s = mk();
    const a = addProfile(s, me);
    const b = addProfile(s, { ...me, name: 'Bình' });
    setNapAmPair(s, [a, b]);
    removeProfile(s, a);
    expect(s.getState().activeProfileId).toBe(b);
    expect(s.getState().tools.napAmPair).toBeUndefined();
    removeProfile(s, b);
    expect(s.getState().activeProfileId).toBeNull();
  });
  it('cài đặt và quẻ Lục Hào', () => {
    const s = mk();
    setSetting(s, 'theme', 'dark');
    expect(s.getState().settings.theme).toBe('dark');
    setLucHaoCast(s, [7, 7, 9, 8, 6, 8], 't');
    expect(s.getState().tools.lucHaoLastCast).toEqual({ tosses: [7, 7, 9, 8, 6, 8], castAt: 't' });
    expect(() => setLucHaoCast(s, [7, 7, 9])).toThrow();
  });
});

describe('parsePersisted', () => {
  it('chấp nhận trạng thái rỗng và có hồ sơ', () => {
    const s = mk();
    addProfile(s, me);
    expect(parsePersisted(emptyState()).ok).toBe(true);
    expect(parsePersisted(JSON.parse(JSON.stringify(s.getState()))).ok).toBe(true);
  });
  it('báo lỗi rõ ràng', () => {
    const s = mk();
    addProfile(s, me);
    const st = JSON.parse(JSON.stringify(s.getState()));
    expect(parsePersisted({ ...st, version: 99 })).toEqual({ ok: false, error: 'version 99 không phải 3' });
    expect(parsePersisted({ ...st, activeProfileId: 'x' })).toMatchObject({ ok: false, error: 'activeProfileId không trỏ tới hồ sơ nào' });
    st.profiles[0].hourIdx = 12;
    expect(parsePersisted(st)).toMatchObject({ ok: false, error: 'profiles[0].hourIdx ngoài miền 0…11' });
    expect(parsePersisted('x').ok).toBe(false);
  });
});

describe('loadState / migrations', () => {
  const now = () => new Date('2026-11-04T08:00:00.000Z');
  it('chưa có dữ liệu → trạng thái rỗng', async () => {
    const r = await loadState(createMemoryKV(), { shared: null, theme: null }, now);
    expect(r).toEqual({ state: emptyState(), fromStorage: false });
  });
  it('0 → 1: tạo hồ sơ đầu tiên từ lyso-shared-v1 và lấy chủ đề lyso-theme', async () => {
    const shared = JSON.stringify({ gender: 'F', calType: 'lunar', dd: 1, mm: 2, yy: 2023, leap: 1, hourIdx: 0, lateTy: true });
    const r = await loadState(createMemoryKV(), { shared, theme: 'light' }, now);
    expect(r.notice).toEqual({ kind: 'imported-legacy' });
    expect(r.state.settings.theme).toBe('light');
    expect(r.state.profiles).toHaveLength(1);
    expect(r.state.profiles[0]).toMatchObject({ name: 'Tôi', gender: 'F', calendar: 'lunar', day: 1, month: 2, year: 2023, leapMonth: true, hourIdx: 0, lateTy: true, relation: 'self' });
    expect(r.state.activeProfileId).toBe(r.state.profiles[0].id);
    expect(parsePersisted(r.state).ok).toBe(true);
  });
  it('lyso-shared-v1 hỏng hoặc ngày không tồn tại thì bỏ qua', () => {
    expect(profileFromLegacyShared('{oops', 'x')).toBeNull();
    expect(profileFromLegacyShared(JSON.stringify({ gender: 'M', calType: 'solar', dd: 31, mm: 2, yy: 1996, leap: 0, hourIdx: 3 }), 'x')).toBeNull();
  });
  it('đã có lyso.state thì không đọc legacy', async () => {
    const s = mk();
    addProfile(s, me);
    const kv = createMemoryKV({ [STATE_KEY]: JSON.stringify(s.getState()) });
    const r = await loadState(kv, { shared: JSON.stringify({ gender: 'F', calType: 'solar', dd: 1, mm: 1, yy: 2000, hourIdx: 1 }), theme: null }, now);
    expect(r.fromStorage).toBe(true);
    expect(r.state.profiles.map((p) => p.name)).toEqual(['An']);
  });
  it('dữ liệu hỏng: giữ bản sao, khởi động rỗng, báo lỗi — không xoá', async () => {
    const kv = createMemoryKV({ [STATE_KEY]: '{"version":1,"profiles":"x"}' });
    const r = await loadState(kv, { shared: null, theme: null }, now);
    expect(r.state).toEqual(emptyState());
    expect(r.notice).toEqual({ kind: 'corrupt', backupKey: 'lyso.state.corrupt-2026-11-04T08-00-00-000Z', error: 'profiles không phải mảng' });
    expect(kv.data.get('lyso.state.corrupt-2026-11-04T08-00-00-000Z')).toBe('{"version":1,"profiles":"x"}');
    expect(kv.data.get(STATE_KEY)).toBe('{"version":1,"profiles":"x"}');
  });
  it('JSON hỏng cũng được giữ bản sao', async () => {
    const kv = createMemoryKV({ [STATE_KEY]: 'không phải json' });
    const r = await loadState(kv, { shared: null, theme: null }, now);
    expect(r.notice?.kind).toBe('corrupt');
  });
});

describe('persist', () => {
  afterEach(() => { vi.useRealTimers(); });
  it('gộp ghi trong 300ms, ghi ngay khi vào nền', async () => {
    vi.useFakeTimers();
    const s = mk();
    const kv = createMemoryKV();
    let pause = () => {};
    const p = startPersistence(s, kv, (cb) => { pause = cb; return () => {}; });
    addProfile(s, me);
    setSetting(s, 'theme', 'dark');
    expect(kv.data.has(STATE_KEY)).toBe(false);
    await vi.advanceTimersByTimeAsync(299);
    expect(kv.data.has(STATE_KEY)).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    expect(JSON.parse(kv.data.get(STATE_KEY)!).settings.theme).toBe('dark');
    setSetting(s, 'theme', 'light');
    pause();
    await Promise.resolve();
    expect(JSON.parse(kv.data.get(STATE_KEY)!).settings.theme).toBe('light');
    p.stop();
  });
});

describe('Lục Hào: lưu quẻ gần nhất', () => {
  it('lưu cách gieo và ngày xem; đổi ngày không gieo lại; dữ liệu hợp lệ khi đọc lại', () => {
    const s = mk();
    setLucHaoCast(s, [7, 7, 9, 8, 6, 8], 't', { method: 'random', date: [6, 2, 2021] });
    setLucHaoDate(s, [7, 2, 2021]);
    expect(s.getState().tools.lucHaoLastCast).toEqual({ tosses: [7, 7, 9, 8, 6, 8], castAt: 't', method: 'random', date: [7, 2, 2021] });
    expect(parsePersisted(JSON.parse(JSON.stringify(s.getState()))).ok).toBe(true);
    const bad = JSON.parse(JSON.stringify(s.getState()));
    bad.tools.lucHaoLastCast.date = [32, 1, 2021];
    expect(parsePersisted(bad)).toMatchObject({ ok: false, error: 'tools.lucHaoLastCast.date không hợp lệ' });
  });
});
