/* Nghi thức có cử chỉ (ARCHITECTURE 16.4): keo, chuông, cài đặt. */
import { describe, it, expect, vi } from 'vitest';
import { KEO_MAX, keoNext, tossKeo } from '../src/features/luchao/keo';
import { ringBell } from '../src/platform/ambientAudio';
import { KEO_LINES } from '../src/content/reader/templates';
import { BANNED_TERMS } from '../src/content/nguhanh/vocab';
import { emptyState, parsePersisted } from '../src/state/schema';

describe('keo', () => {
  it('một sấp một ngửa là thuận; hai mặt giống nhau là chưa thuận', () => {
    const seq = (a: number, b: number) => { const r = [a, b]; return () => r.shift()!; };
    expect(tossKeo(seq(0.1, 0.9)).result).toBe('thuan');
    expect(tossKeo(seq(0.9, 0.1)).result).toBe('thuan');
    expect(tossKeo(seq(0.9, 0.9)).result).toBe('cung-ngua');
    expect(tossKeo(seq(0.1, 0.1)).result).toBe('cung-sap');
  });
  it('chưa thuận thì xin lại, đến lần thứ ba thì cứ gieo', () => {
    expect(KEO_MAX).toBe(3);
    expect(keoNext('cung-ngua', 1)).toBe('lai');
    expect(keoNext('cung-sap', 2)).toBe('lai');
    expect(keoNext('cung-sap', 3)).toBe('du');
    expect(keoNext('thuan', 1)).toBe('thuan');
  });
  it('lời keo không hứa hẹn, không từ cấm, mỗi loại ≥ 2 biến thể', () => {
    const all = Object.values(KEO_LINES).flat().join(' ').toLowerCase();
    for (const w of [...BANNED_TERMS, 'may mắn', 'giải hạn', 'linh ứng']) expect(all, w).not.toContain(w.toLowerCase());
    for (const k of Object.keys(KEO_LINES) as (keyof typeof KEO_LINES)[]) expect(KEO_LINES[k].length).toBeGreaterThanOrEqual(2);
  });
});

describe('chuông', () => {
  function fakeCtx() {
    const made = { osc: 0, closed: 0 };
    const node = () => ({ connect: (x: unknown) => x, gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} }, frequency: { setValueAtTime() {}, linearRampToValueAtTime() {} }, start() {}, stop() {} });
    class Ctx {
      currentTime = 0; destination = {};
      resume() { return Promise.resolve(); }
      close() { made.closed++; return Promise.resolve(); }
      createGain() { return node(); }
      createOscillator() { made.osc++; return node(); }
    }
    return { Ctx: Ctx as unknown as typeof AudioContext, made };
  }
  it('máy cho phát tiếng thì ngân; máy im lặng thì đóng ngay, không phát', async () => {
    vi.useFakeTimers();
    const a = fakeCtx();
    expect(ringBell(Promise.resolve(true), a.Ctx)).toBe(true);
    await Promise.resolve(); await Promise.resolve();
    expect(a.made.osc).toBe(2);
    vi.advanceTimersByTime(3400);
    expect(a.made.closed).toBe(1);
    const b = fakeCtx();
    ringBell(Promise.resolve(false), b.Ctx);
    await Promise.resolve(); await Promise.resolve();
    expect(b.made.osc).toBe(0);
    expect(b.made.closed).toBe(1);
    vi.useRealTimers();
  });
});

describe('cài đặt xin keo', () => {
  it('không có là bật; có thì phải là boolean', () => {
    const base = emptyState();
    expect(parsePersisted(base).ok).toBe(true);
    expect(parsePersisted({ ...base, settings: { ...base.settings, xinKeo: false } }).ok).toBe(true);
    expect(parsePersisted({ ...base, settings: { ...base.settings, xinKeo: 'tắt' } }).ok).toBe(false);
  });
});
