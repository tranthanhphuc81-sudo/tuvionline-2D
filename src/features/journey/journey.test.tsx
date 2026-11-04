// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { act, render, screen, fireEvent, cleanup } from '@testing-library/react';
import { backStack } from '../../platform/back';
import { Journey } from './Journey';
import { adaptCount, particleAlpha, spawnParticle, stepParticle } from './particles';
import { entryPlan, lunarEventOf, skipJourney, startJourney, stepJourney } from './plan';
import { SCENES } from './scenes';
import { layerTransform } from './SceneEngine';

const THUONG = { day: 8, month: 5, leap: false };
const done = { firstDone: true };

describe('chọn lối vào', () => {
  const plan = (mode: Parameters<typeof entryPlan>[0], h: Parameters<typeof entryPlan>[1], lunar = THUONG, reduced = false) => entryPlan(mode, h, '2026-11-05', lunar, reduced);
  it('tự động: lần đầu đầy đủ, các lần sau rút gọn', () => {
    expect(plan('auto', undefined)).toBe('full');
    expect(plan('auto', done)).toBe('short');
  });
  it('tự đầy đủ vào rằm, mùng 1, Tết; mỗi ngày một lần', () => {
    expect(plan('auto', done, { day: 15, month: 5, leap: false })).toBe('full');
    expect(plan('auto', done, { day: 1, month: 5, leap: false })).toBe('full');
    expect(plan('auto', done, { day: 2, month: 1, leap: false })).toBe('full');
    expect(plan('auto', { firstDone: true, lastFullDate: '2026-11-05' }, { day: 15, month: 5, leap: false })).toBe('short');
    expect(plan('auto', { firstDone: true, lastFullDate: '2026-11-04' }, { day: 15, month: 5, leap: false })).toBe('full');
  });
  it('cài đặt thắng quy tắc tự động', () => {
    expect(plan('full', done)).toBe('full');
    expect(plan('short', undefined, { day: 15, month: 5, leap: false })).toBe('short');
    expect(plan('none', undefined, { day: 1, month: 1, leap: false })).toBe('none');
  });
  it('giảm chuyển động: chỉ mờ dần, trừ khi đã tắt lối vào', () => {
    expect(plan('auto', undefined, THUONG, true)).toBe('fade');
    expect(plan('full', done, THUONG, true)).toBe('fade');
    expect(plan('none', done, THUONG, true)).toBe('none');
  });
  it('ngày âm đặc biệt', () => {
    expect(lunarEventOf({ day: 1, month: 1, leap: false })).toBe('tet');
    expect(lunarEventOf({ day: 3, month: 1, leap: false })).toBe('tet');
    expect(lunarEventOf({ day: 4, month: 1, leap: false })).toBeNull();
    expect(lunarEventOf({ day: 15, month: 1, leap: false })).toBe('ram');
    expect(lunarEventOf({ day: 1, month: 2, leap: true })).toBe('mung1');
    expect(lunarEventOf({ day: 1, month: 1, leap: true })).toBe('mung1');
  });
});

describe('máy trạng thái', () => {
  it('đi lần lượt 5 trạm rồi xong, không vượt quá', () => {
    let s = startJourney('full', 5);
    for (let i = 1; i < 5; i++) { s = stepJourney(s, 5); expect(s).toEqual({ index: i, done: false }); }
    s = stepJourney(s, 5);
    expect(s).toEqual({ index: 4, done: true });
    expect(stepJourney(s, 5)).toEqual(s);
  });
  it('bỏ qua từ bất kỳ trạm nào đều vào tĩnh thất', () => {
    for (let i = 0; i < 5; i++) expect(skipJourney({ index: i, done: false }, 5)).toEqual({ index: 4, done: true });
  });
  it('mờ dần: bắt đầu ngay ở tĩnh thất', () => { expect(startJourney('fade', 5).index).toBe(4); });
});

describe('cấu hình cảnh', () => {
  it('5 trạm đúng thứ tự, mỗi trạm 4 lớp có ảnh, độ sâu tăng dần', () => {
    expect(SCENES.map((x) => x.id)).toEqual(['gate', 'garden', 'hall', 'corridor', 'study']);
    for (const sc of SCENES) {
      const base = sc.layers.filter((l) => !l.when);
      expect(base).toHaveLength(4);
      base.forEach((l, i) => { if (i) expect(l.depth).toBeGreaterThan(base[i - 1].depth); });
      sc.layers.forEach((l) => expect(l.src).toBeTruthy());
    }
  });
  it('đầy đủ 20–30 giây, rút gọn 2–3 giây', () => {
    const sum = (k: 'full' | 'short') => SCENES.reduce((a, x) => a + x.durationMs[k], 0);
    expect(sum('full')).toBeGreaterThanOrEqual(20000);
    expect(sum('full')).toBeLessThanOrEqual(30000);
    expect(sum('short')).toBeGreaterThanOrEqual(2000);
    expect(sum('short')).toBeLessThanOrEqual(3000);
  });
  it('lớp gần di chuyển nhiều hơn lớp xa', () => {
    expect(layerTransform(0, 1)).toBe('translate3d(0,0.00px,0) scale(1.0000)');
    expect(layerTransform(1, 1)).toBe('translate3d(0,-36.00px,0) scale(1.1400)');
  });
});

describe('hạt', () => {
  it('giảm số hạt khi dưới 50 fps, không xuống dưới 2', () => {
    expect(adaptCount(20, 60)).toBe(20);
    expect(adaptCount(20, 40)).toBe(14);
    expect(adaptCount(2, 20)).toBe(2);
  });
  it('hết đời thì sinh lại, còn đời thì tiến theo vận tốc', () => {
    const p = { ...spawnParticle('leaf', 360, 640, () => 0.5), life: 0.1, x: 100, y: 100, vx: 10, vy: 20 };
    expect(stepParticle(p, 1, 360, 640)).toMatchObject({ x: 110, y: 120 });
    expect(stepParticle({ ...p, life: 0.999 }, 1, 360, 640).life).toBe(0);
  });
  it('độ đậm bằng 0 ở đầu và cuối đời', () => {
    expect(particleAlpha(0)).toBeCloseTo(0);
    expect(particleAlpha(1)).toBeCloseTo(0);
    expect(particleAlpha(0.5)).toBeCloseTo(1);
  });
});

describe('màn hình hành trình', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { cleanup(); vi.useRealTimers(); });
  const at = () => document.querySelector('[data-scene]')?.getAttribute('data-scene');

  it('chạm để bước tới; nút Bỏ qua luôn hiện', () => {
    render(<Journey plan="full" onDone={() => {}} />);
    expect(at()).toBe('gate');
    const d = screen.getByRole('dialog');
    fireEvent.pointerDown(d, { clientY: 300 });
    fireEvent.pointerUp(d, { clientY: 300 });
    expect(at()).toBe('garden');
    expect(screen.getByRole('button', { name: 'Bỏ qua' })).toBeTruthy();
  });

  it('tự đi hết hành trình đầy đủ rồi vào tĩnh thất', () => {
    const onDone = vi.fn();
    render(<Journey plan="full" onDone={onDone} />);
    for (let i = 0; i < 5; i++) act(() => { vi.advanceTimersByTime(5000); });
    act(() => { vi.advanceTimersByTime(400); });
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('điện Tam Thanh có "Đi tiếp", hành lang có lời mời vào; không chặn ai lại', () => {
    render(<Journey plan="full" onDone={() => {}} />);
    act(() => { vi.advanceTimersByTime(5000); });
    act(() => { vi.advanceTimersByTime(5000); });
    expect(at()).toBe('hall');
    fireEvent.click(screen.getByRole('button', { name: 'Đi tiếp' }));
    expect(at()).toBe('corridor');
    expect(screen.getByRole('button', { name: 'Vào tĩnh thất' })).toBeTruthy();
  });

  it('nút Back từ bất kỳ trạm nào đều vào thẳng tĩnh thất, rồi trả Back về cho app', () => {
    const onDone = vi.fn();
    const before = backStack.size;
    const { unmount } = render(<Journey plan="full" onDone={onDone} />);
    expect(backStack.size).toBe(before + 1);
    act(() => { expect(backStack.dispatch()).toBe('handled'); });
    act(() => { vi.advanceTimersByTime(400); });
    expect(onDone).toHaveBeenCalledTimes(1);
    unmount();
    expect(backStack.size).toBe(before);
  });

  it('giảm chuyển động: chỉ thấy tĩnh thất rồi mờ đi, không có hạt', () => {
    const onDone = vi.fn();
    render(<Journey plan="fade" onDone={onDone} />);
    expect(at()).toBe('study');
    expect(document.querySelector('canvas')).toBeNull();
    act(() => { vi.advanceTimersByTime(400); });
    act(() => { vi.advanceTimersByTime(400); });
    expect(onDone).toHaveBeenCalledTimes(1);
  });
});
