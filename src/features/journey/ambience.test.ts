// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAmbience, sceneSeasonOf, timeOfDayOf } from './ambience';
import { SCENES, activeLayers, activeParticles } from './scenes';

const env = vi.hoisted(() => ({ native: true, mode: 'normal' as string, fail: false }));
vi.mock('../../platform/native', () => ({ isNative: () => env.native }));
vi.mock('@capacitor/core', async (orig) => ({
  ...(await orig<typeof import('@capacitor/core')>()),
  registerPlugin: () => ({ ringerMode: async () => { if (env.fail) throw new Error('x'); return { mode: env.mode }; } }),
}));
import { soundAllowed } from '../../platform/device';
import { createAmbientPlayer } from '../../platform/ambientAudio';

const at = (y: number, m: number, d: number, h = 12, min = 0) => getAmbience(new Date(y, m - 1, d, h, min));

describe('ngày âm', () => {
  it('rằm, mùng 1, Tết của năm 2026', () => {
    expect(at(2026, 2, 17).lunarEvent).toBe('tet'); // mùng 1 Tết Bính Ngọ
    expect(at(2026, 2, 19).lunarEvent).toBe('tet'); // mùng 3
    expect(at(2026, 2, 20).lunarEvent).toBeNull(); // mùng 4
    expect(at(2026, 3, 3).lunarEvent).toBe('ram'); // rằm tháng Giêng
    expect(at(2026, 3, 19).lunarEvent).toBe('mung1'); // mùng 1 tháng Hai
  });
  it('đổi ngày đúng lúc nửa đêm: 23h59 giao thừa chưa là Tết, 00h00 là Tết', () => {
    expect(at(2026, 2, 16, 23, 59)).toMatchObject({ timeOfDay: 'night', lunarEvent: null });
    expect(at(2026, 2, 17, 0, 0)).toMatchObject({ timeOfDay: 'night', lunarEvent: 'tet' });
  });
});

describe('mùa theo tiết khí', () => {
  it('đổi mùa đúng quanh Lập Xuân 2026 (4/2), không theo tháng dương', () => {
    expect(at(2026, 2, 3).season).toBe('dong');
    expect(at(2026, 2, 5).season).toBe('xuan');
  });
  it('đủ bốn mùa trong năm', () => {
    expect([at(2026, 4, 1).season, at(2026, 7, 1).season, at(2026, 10, 1).season, at(2026, 12, 25).season]).toEqual(['xuan', 'ha', 'thu', 'dong']);
  });
  it('12 Chi tháng chia đều bốn mùa, không có "tứ quý"', () => {
    const s = Array.from({ length: 12 }, (_, i) => sceneSeasonOf(i as Parameters<typeof sceneSeasonOf>[0]));
    expect(s).toEqual(['dong', 'dong', 'xuan', 'xuan', 'xuan', 'ha', 'ha', 'ha', 'thu', 'thu', 'thu', 'dong']);
  });
});

describe('giờ trong ngày', () => {
  it('biên các khung giờ', () => {
    expect([4, 5, 9, 10, 15, 16, 18, 19, 23, 0].map(timeOfDayOf)).toEqual(['night', 'dawn', 'dawn', 'noon', 'noon', 'dusk', 'dusk', 'night', 'night', 'night']);
  });
});

describe('chọn biến thể cảnh', () => {
  const base = { timeOfDay: 'noon', season: 'thu', lunarEvent: null } as const;
  const garden = SCENES[1], gate = SCENES[0], hall = SCENES[2];
  const whens = (x: { when?: string }[]) => x.flatMap((l) => (l.when ? [l.when] : []));
  it('chỉ một lớp mùa ở vườn; rằm thêm trăng', () => {
    expect(whens(activeLayers(garden, base))).toEqual(['thu']);
    expect(whens(activeLayers(garden, { ...base, lunarEvent: 'ram' }))).toEqual(['ram', 'thu']);
  });
  it('lớp xếp từ xa tới gần để trăng nằm sau mái', () => {
    const d = activeLayers(garden, { ...base, lunarEvent: 'ram' }).map((l) => l.depth);
    expect(d).toEqual([...d].sort((a, b) => a - b));
  });
  it('Tết có câu đối ở cổng; ngày thường không', () => {
    expect(whens(activeLayers(gate, base))).toEqual([]);
    expect(whens(activeLayers(gate, { ...base, lunarEvent: 'tet' }))).toEqual(['tet']);
  });
  it('đom đóm chỉ có ban đêm; mùng 1 thêm khói hương', () => {
    expect(activeParticles(garden, base).map((p) => p.kind)).toEqual(['ripple']);
    expect(activeParticles(garden, { ...base, timeOfDay: 'night' }).map((p) => p.kind)).toEqual(['ripple', 'firefly']);
    expect(activeParticles(hall, base)).toHaveLength(1);
    expect(activeParticles(hall, { ...base, lunarEvent: 'mung1' })).toHaveLength(2);
  });
  it('ngoài vườn nhiều tiếng, vào trong nhỏ dần, tĩnh thất chỉ còn đèn dầu; có một tiếng chuông ở điện', () => {
    expect(Object.keys(garden.ambience).length).toBeGreaterThan(Object.keys(hall.ambience).length);
    expect(Object.keys(SCENES[4].ambience)).toEqual(['lamp']);
    expect(SCENES.filter((s) => s.bell).map((s) => s.id)).toEqual(['hall']);
  });
});

describe('âm thanh', () => {
  beforeEach(() => { env.native = true; env.mode = 'normal'; env.fail = false; });
  it('chỉ phát khi chuông đang bật', async () => {
    expect(await soundAllowed()).toBe(true);
    env.mode = 'silent';
    expect(await soundAllowed()).toBe(false);
    env.mode = 'vibrate';
    expect(await soundAllowed()).toBe(false);
  });
  it('không đọc được chế độ máy thì im lặng; trình duyệt luôn cho phép', async () => {
    env.fail = true;
    expect(await soundAllowed()).toBe(false);
    env.native = false;
    expect(await soundAllowed()).toBe(true);
  });
  it('máy không có Web Audio: trả null, không ném lỗi', () => {
    expect(createAmbientPlayer(undefined as never)).toBeNull();
  });
});
