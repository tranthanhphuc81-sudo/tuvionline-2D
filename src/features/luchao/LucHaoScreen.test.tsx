// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import { AppProvider } from '../../app/context';
import { createStore } from '../../state/store';
import { emptyState, type PersistedState } from '../../state/schema';
import { LucHaoScreen } from './LucHaoScreen';

function setup(state: PersistedState = emptyState()) {
  const store = createStore<PersistedState>(state);
  render(<AppProvider store={store}><LucHaoScreen /></AppProvider>);
  return store;
}
/** Tắt bước xin keo cho các test chỉ xét phép gieo (ARCHITECTURE 16.4). */
const noKeo = (): PersistedState => ({ ...emptyState(), settings: { ...emptyState().settings, xinKeo: false } });
const withCast = (): PersistedState => ({ ...emptyState(), tools: { lucHaoLastCast: { tosses: [7, 7, 9, 8, 6, 8], castAt: 't', method: 'manual', date: [6, 2, 2021] } } });
afterEach(cleanup);

describe('Màn hình Lục Hào', () => {
  it('chưa gieo: chỉ có form, chưa có kết quả; mặc định xin keo trước, "Bỏ qua" thì hiện nút gieo', () => {
    setup();
    expect(screen.getByRole('button', { name: /Xin keo 1\/3/ })).toBeTruthy();
    expect(screen.queryByRole('button', { name: '🎲 Gieo quẻ' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Bỏ qua, gieo luôn' }));
    expect(screen.getByRole('button', { name: '🎲 Gieo quẻ' })).toBeTruthy();
    expect(screen.queryByText('Luận đoán')).toBeNull();
  });

  it('nhập tay ví dụ Chương 10 (7,7,9,8,6,8): Địa Thiên Thái, có quẻ biến', () => {
    const store = setup();
    fireEvent.change(screen.getByLabelText('Ngày xem'), { target: { value: '6' } });
    fireEvent.change(screen.getByLabelText('Tháng'), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText('Năm'), { target: { value: '2021' } });
    fireEvent.click(screen.getByRole('radio', { name: 'Nhập tay' }));
    ['Hào 1 (Sơ)', 'Hào 2 (Nhị)', 'Hào 3 (Tam)', 'Hào 4 (Tứ)', 'Hào 5 (Ngũ)', 'Hào 6 (Thượng)'].forEach((l, i) =>
      fireEvent.change(screen.getByLabelText(l), { target: { value: String([7, 7, 9, 8, 6, 8][i]) } }));
    fireEvent.click(screen.getByRole('button', { name: 'Lập quẻ từ 6 số đã nhập' }));
    expect(store.getState().tools.lucHaoLastCast).toMatchObject({ tosses: [7, 7, 9, 8, 6, 8], method: 'manual', date: [6, 2, 2021] });
    expect(screen.getByText('Địa Thiên Thái', { selector: 'dd' })).toBeTruthy();
    expect(screen.getByText('Quẻ biến')).toBeTruthy();
    expect(screen.getByText('Ất Dậu', { selector: 'dd' })).toBeTruthy();
  });

  it('GIỮ quẻ khi đổi "Hỏi về việc gì": không gieo lại, chỉ luận lại', () => {
    const store = setup(withCast());
    const before = store.getState().tools.lucHaoLastCast;
    expect(screen.getByText('Dụng Thần đã chọn: Thế hào (bản thân)')).toBeTruthy();
    fireEvent.change(screen.getByLabelText('Hỏi về việc gì (chọn Dụng Thần)'), { target: { value: 'Thê Tài' } });
    expect(store.getState().tools.lucHaoLastCast).toBe(before);
    expect(screen.getByText('Dụng Thần đã chọn: Thê Tài')).toBeTruthy();
    expect(screen.getByText('Địa Thiên Thái', { selector: 'dd' })).toBeTruthy();
  });

  it('gieo ngẫu nhiên: 6 hào trong 6…9, kèm dòng báo kết quả; gieo lại thì thay quẻ', () => {
    const store = setup(noKeo());
    fireEvent.click(screen.getByRole('button', { name: '🎲 Gieo quẻ' }));
    const c1 = store.getState().tools.lucHaoLastCast!;
    expect(c1.method).toBe('random');
    expect(c1.tosses).toHaveLength(6);
    c1.tosses.forEach((t) => expect([6, 7, 8, 9]).toContain(t));
    expect(screen.getByText(/Kết quả gieo ngẫu nhiên/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: '🎲 Gieo quẻ mới' }));
    expect(store.getState().tools.lucHaoLastCast).not.toBe(c1);
  });

  it('ngày xem không tồn tại: báo lỗi, ẩn kết quả, không đổi quẻ đã lưu', () => {
    const store = setup(withCast());
    fireEvent.change(screen.getByLabelText('Ngày xem'), { target: { value: '31' } });
    expect(screen.getByRole('alert').textContent).toBe('Ngày xem quẻ 31/2/2021 không tồn tại trên lịch dương — vui lòng kiểm tra lại.');
    expect(screen.queryByText('Luận đoán')).toBeNull();
    expect(store.getState().tools.lucHaoLastCast?.date).toEqual([6, 2, 2021]);
  });
});

describe('Xin keo (ARCHITECTURE 16.4)', () => {
  afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); });
  it('keo thuận (một sấp một ngửa) thì sau một nhịp chuyển sang gieo xu', () => {
    vi.useFakeTimers();
    const r = [0.1, 0.9];
    vi.spyOn(Math, 'random').mockImplementation(() => r.shift() ?? 0.5);
    setup();
    fireEvent.click(screen.getByRole('button', { name: /Xin keo 1\/3/ }));
    expect(screen.getByText(/keo thuận|Keo thuận/)).toBeTruthy();
    act(() => { vi.advanceTimersByTime(1500); });
    expect(screen.getByRole('button', { name: '🎲 Gieo quẻ' })).toBeTruthy();
  });
  it('ba lần chưa thuận vẫn được gieo, không chặn ai', () => {
    vi.useFakeTimers();
    vi.spyOn(Math, 'random').mockReturnValue(0.9); // luôn hai mặt ngửa
    setup();
    for (let i = 1; i <= 3; i++) fireEvent.click(screen.getByRole('button', { name: new RegExp('Xin keo ' + i + '/3') }));
    expect(screen.getByText(/Ba lần rồi|Đủ ba lần/)).toBeTruthy();
    act(() => { vi.advanceTimersByTime(1500); });
    expect(screen.getByRole('button', { name: '🎲 Gieo quẻ' })).toBeTruthy();
  });
  it('tắt trong Cài đặt thì không có bước keo; nhập tay cũng không có', () => {
    setup(noKeo());
    expect(screen.queryByRole('button', { name: /Xin keo/ })).toBeNull();
    cleanup();
    setup();
    fireEvent.click(screen.getByRole('radio', { name: 'Nhập tay' }));
    expect(screen.queryByRole('button', { name: /Xin keo/ })).toBeNull();
  });
});
