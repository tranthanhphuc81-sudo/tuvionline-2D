// @vitest-environment jsdom
import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { act, render, screen, fireEvent, cleanup } from '@testing-library/react';
import { AppProvider } from '../../../app/context';
import { createStore } from '../../../state/store';
import { emptyState, type PersistedState } from '../../../state/schema';
import type { CompassReading, CompassStart } from '../../../platform/compass';

const compass = vi.hoisted(() => ({
  emit: null as null | ((r: CompassReading) => void),
  result: { ok: true } as { ok: boolean },
  stop: vi.fn(),
  release: vi.fn(),
}));
vi.mock('../../../platform/compass', () => ({
  startCompass: async (cb: (r: CompassReading) => void): Promise<CompassStart> => {
    compass.emit = cb;
    return compass.result.ok ? { ok: true, stop: compass.stop } : { ok: false };
  },
  keepScreenOn: () => compass.release,
}));
import { LaBanScreen } from './LaBanScreen';

const profile = {
  id: 'a', name: 'An', gender: 'M' as const, calendar: 'solar' as const, day: 15, month: 6, year: 1988, leapMonth: false, hourIdx: 6, lateTy: false, createdAt: 't', updatedAt: 't',
};
const withProfile = (): PersistedState => ({ ...emptyState(), profiles: [profile], activeProfileId: 'a' });
const reading = (heading: number, x: Partial<CompassReading> = {}): CompassReading => ({ heading, accuracy: 3, headingErrorDeg: 2, tilted: false, ...x });

function setup(state: PersistedState = withProfile(), active = true) {
  const store = createStore<PersistedState>(state);
  const view = render(<AppProvider store={store}><LaBanScreen active={active} /></AppProvider>);
  return { store, view, rerender: (a: boolean) => view.rerender(<AppProvider store={store}><LaBanScreen active={a} /></AppProvider>) };
}
const tick = () => act(async () => { await Promise.resolve(); });

beforeEach(() => { compass.emit = null; compass.result = { ok: true }; compass.stop.mockClear(); compass.release.mockClear(); });
afterEach(() => { cleanup(); vi.useRealTimers(); });

describe('Màn hình La Bàn', () => {
  it('có cảm biến: hiện hướng, sao Du Niên và trạng thái', async () => {
    setup();
    await tick();
    expect(screen.getByRole('status').textContent).toBe('Đang chờ dữ liệu cảm biến…');
    act(() => compass.emit!(reading(90)));
    expect(screen.getByRole('status').textContent).toBe('Cảm biến đang hoạt động');
    expect(screen.getByText('90°', { selector: 'div' })).toBeTruthy();
    expect(screen.getByText('Đông — Chấn')).toBeTruthy();
    expect(screen.getByText('Phục Vị', { selector: 'b' })).toBeTruthy();
    expect(screen.getByRole('img').getAttribute('aria-label')).toBe('La bàn: 90 độ, hướng Đông, quẻ Chấn, sao Phục Vị');
  });

  it('sai số lớn: cảnh báo cần hiệu chỉnh, không tắt la bàn; hết nhiễu thì mất cảnh báo', async () => {
    setup();
    await tick();
    act(() => compass.emit!(reading(10, { accuracy: 1, headingErrorDeg: 30 })));
    expect(screen.getByRole('alert').textContent).toContain('sai số khoảng ±30°');
    expect(screen.getByRole('status').textContent).toBe('Cảm biến đang hoạt động');
    act(() => compass.emit!(reading(10)));
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('máy dựng đứng: nhắc đặt nằm ngang', async () => {
    setup();
    await tick();
    act(() => compass.emit!(reading(10, { tilted: true })));
    expect(screen.getByText('Hãy đặt máy nằm ngang để đọc hướng chính xác hơn.')).toBeTruthy();
  });

  it('máy không có cảm biến: báo rõ và tự chuyển xoay tay', async () => {
    compass.result = { ok: false };
    setup();
    await tick();
    expect(screen.getByRole('status').textContent).toBe('Máy này không có cảm biến từ trường nên không đọc được hướng — dùng chế độ xoay tay.');
    expect(screen.getByRole('radio', { name: '✋ Xoay tay' }).getAttribute('aria-checked')).toBe('true');
  });

  it('3 giây không có dữ liệu: chuyển xoay tay', async () => {
    vi.useFakeTimers();
    setup();
    await tick();
    act(() => { vi.advanceTimersByTime(3100); });
    expect(screen.getByRole('status').textContent).toBe('Không nhận được dữ liệu cảm biến ổn định — chuyển về chế độ xoay tay.');
  });

  it('xoay tay: nút tăng giảm qua mốc 0°, nhập độ trực tiếp', async () => {
    setup();
    await tick();
    fireEvent.click(screen.getByRole('radio', { name: '✋ Xoay tay' }));
    expect(screen.getByRole('status').textContent).toBe('Chế độ thủ công — kéo la bàn hoặc dùng ô nhập độ bên dưới');
    fireEvent.click(screen.getByRole('button', { name: 'Giảm 15 độ' }));
    expect(screen.getByText('345°')).toBeTruthy();
    fireEvent.change(screen.getByLabelText('Hướng (độ)'), { target: { value: '180' } });
    expect(screen.getByText('Nam — Ly')).toBeTruthy();
  });

  it('chỉ chạy khi đang hiển thị: rời màn hình thì dừng cảm biến và thôi giữ sáng', async () => {
    const { rerender } = setup(withProfile(), false);
    await tick();
    expect(compass.emit).toBeNull();
    rerender(true);
    await tick();
    expect(compass.emit).not.toBeNull();
    rerender(false);
    expect(compass.stop).toHaveBeenCalledTimes(1);
    expect(compass.release).toHaveBeenCalledTimes(1);
  });

  it('ô hiệu chỉnh: cộng vào hướng và lưu lại; ngoài ±45 thì không lưu', async () => {
    const { store } = setup();
    await tick();
    fireEvent.change(screen.getByLabelText('Hiệu chỉnh (độ)'), { target: { value: '10' } });
    expect(store.getState().tools.laBanCalib).toBe(10);
    act(() => compass.emit!(reading(350)));
    expect(screen.getByText('0°', { selector: 'div' })).toBeTruthy();
    fireEvent.change(screen.getByLabelText('Hiệu chỉnh (độ)'), { target: { value: '99' } });
    expect(store.getState().tools.laBanCalib).toBe(10);
  });

  it('chưa có hồ sơ: la bàn vẫn chạy, cung chưa tô màu, có lời nhắc', async () => {
    setup(emptyState());
    await tick();
    expect(screen.getByText('Chọn hoặc thêm hồ sơ để biết hướng này là sao Du Niên tốt hay xấu đối với bạn.')).toBeTruthy();
    expect(screen.queryByText('Mệnh Quái của bạn')).toBeNull();
  });
});
