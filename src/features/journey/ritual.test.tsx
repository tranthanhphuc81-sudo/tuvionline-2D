// @vitest-environment jsdom
/* Thắp hương, lắc máy, gieo xu, an sao (Phase 6.6). */
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { act, render, screen, fireEvent, cleanup } from '@testing-library/react';
import { readFileSync, readdirSync } from 'node:fs';
import { AppProvider } from '../../app/context';
import { createStore } from '../../state/store';
import { emptyState, type PersistedState } from '../../state/schema';
import { INCENSE_MS, IncenseControl, incenseState } from './incense';
import { CoinToss } from '../luchao/CoinToss';
import { requestStarReveal, takeStarReveal } from '../tuvi/reveal';
import { SHAKE_GAP_MS, SHAKE_LIMIT, shakeDetector } from '../../platform/shake';
import { allLines } from '../../content/reader/templates';
import { INCENSE_TEXT } from '../../content/study';

const T0 = Date.parse('2026-11-05T08:00:00Z');
const iso = new Date(T0).toISOString();
afterEach(() => { cleanup(); vi.useRealTimers(); });

describe('nén hương', () => {
  it('chưa thắp, đang cháy, đã tàn sau 20 phút', () => {
    expect(incenseState(undefined, T0)).toEqual({ kind: 'none' });
    expect(incenseState(iso, T0)).toEqual({ kind: 'burning', left: 1 });
    expect(incenseState(iso, T0 + INCENSE_MS / 2)).toEqual({ kind: 'burning', left: 0.5 });
    expect(incenseState(iso, T0 + INCENSE_MS - 1).kind).toBe('burning');
    expect(incenseState(iso, T0 + INCENSE_MS).kind).toBe('ash');
  });
  it('dữ liệu hỏng hoặc đồng hồ chỉnh lùi không gây lỗi', () => {
    expect(incenseState('hỏng', T0)).toEqual({ kind: 'none' });
    expect(incenseState(iso, T0 - 5000)).toEqual({ kind: 'burning', left: 1 });
  });
  it('lời về hương không hứa hẹn gì', () => {
    const text = Object.values(INCENSE_TEXT).join(' ').toLowerCase();
    for (const w of ['vận', 'may mắn', 'giải hạn', 'điểm', 'công đức']) expect(text).not.toContain(w);
    expect(allLines().join(' ')).not.toMatch(/thắp hương|nén hương/);
  });
});

describe('nút thắp hương', () => {
  const setup = () => {
    const store = createStore<PersistedState>(emptyState());
    render(<AppProvider store={store}><IncenseControl /></AppProvider>);
    return store;
  };
  it('chạm giữ đủ lâu mới thắp; nhả sớm thì thôi', () => {
    vi.useFakeTimers();
    const store = setup();
    const btn = screen.getByRole('button', { name: INCENSE_TEXT.hold });
    fireEvent.pointerDown(btn);
    act(() => { vi.advanceTimersByTime(300); });
    fireEvent.pointerUp(btn);
    act(() => { vi.advanceTimersByTime(2000); });
    expect(store.getState().tools.incenseLitAt).toBeUndefined();
    fireEvent.pointerDown(btn);
    act(() => { vi.advanceTimersByTime(900); });
    expect(store.getState().tools.incenseLitAt).toBeTruthy();
    expect(screen.getByRole('img', { name: INCENSE_TEXT.burning })).toBeTruthy();
  });
  it('bàn phím hoặc trình đọc màn hình: một lần bấm là thắp', () => {
    const store = setup();
    fireEvent.click(screen.getByRole('button', { name: INCENSE_TEXT.hold }));
    expect(store.getState().tools.incenseLitAt).toBeTruthy();
  });
});

describe('lắc máy', () => {
  it('đứng yên và run tay không tính, lắc mạnh mới tính', () => {
    const hit = shakeDetector();
    expect(hit(0, 0, 9.8, 0)).toBe(false);
    expect(hit(5, 5, 12, 100)).toBe(false);
    expect(hit(SHAKE_LIMIT, 0, 0, 200)).toBe(true);
  });
  it('một cú lắc không tính hai lần', () => {
    const hit = shakeDetector();
    expect(hit(30, 0, 0, 0)).toBe(true);
    expect(hit(30, 0, 0, SHAKE_GAP_MS - 1)).toBe(false);
    expect(hit(30, 0, 0, SHAKE_GAP_MS)).toBe(true);
  });
});

describe('gieo xu', () => {
  let done: (t: number[]) => void;
  beforeEach(() => { done = vi.fn(); });
  const press = () => fireEvent.click(screen.getByRole('button', { name: /Gieo hào/ }));

  it('đủ 6 lần thì lập quẻ, mỗi hào từ 6 đến 9', () => {
    render(<CoinToss active={false} onDone={done} />);
    for (let i = 0; i < 5; i++) press();
    expect(done).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: /Gieo hào 6\/6/ })).toBeTruthy();
    press();
    const [t] = (done as unknown as { mock: { calls: number[][][] } }).mock.calls[0];
    expect(t).toHaveLength(6);
    for (const x of t) expect(x >= 6 && x <= 9).toBe(true);
    expect(screen.getByRole('button', { name: /Gieo hào 1\/6/ })).toBeTruthy();
  });

  it('lắc máy gieo được khi đang mở, không gieo khi ở tab khác', () => {
    const shake = () => { const e = new Event('devicemotion') as Event & { accelerationIncludingGravity: unknown }; e.accelerationIncludingGravity = { x: 40, y: 0, z: 0 }; act(() => { window.dispatchEvent(e); }); };
    const { rerender } = render(<CoinToss active={false} onDone={done} />);
    shake();
    expect(screen.getByRole('button', { name: /Gieo hào 1\/6/ })).toBeTruthy();
    rerender(<CoinToss active onDone={done} />);
    shake();
    expect(screen.getByRole('button', { name: /Gieo hào 2\/6/ })).toBeTruthy();
  });
});

describe('an sao', () => {
  it('chỉ chạy một lần sau khi được yêu cầu', () => {
    expect(takeStarReveal()).toBe(false);
    requestStarReveal();
    expect(takeStarReveal()).toBe(true);
    expect(takeStarReveal()).toBe(false);
  });
  it('tôn trọng giảm chuyển động', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true }));
    requestStarReveal();
    expect(takeStarReveal()).toBe(false);
    vi.unstubAllGlobals();
  });
});

describe('file nhân vật', () => {
  it('thầy và đạo đồng có đủ 5 trạng thái, không quá 400 nét', () => {
    const dir = 'src/assets/journey/character';
    expect(readdirSync(dir).sort()).toEqual(['daodong.json', 'thay.json']);
    for (const f of readdirSync(dir)) {
      const raw = readFileSync(`${dir}/${f}`, 'utf8');
      expect(JSON.parse(raw).markers.map((m: { cm: string }) => m.cm)).toEqual(['idle', 'talk', 'point', 'turnPage', 'nod']);
      expect((raw.match(/"ty":"(sh|el|rc)"/g) ?? []).length).toBeLessThanOrEqual(400);
    }
  });
});
