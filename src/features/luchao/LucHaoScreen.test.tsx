// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { AppProvider } from '../../app/context';
import { createStore } from '../../state/store';
import { emptyState, type PersistedState } from '../../state/schema';
import { LucHaoScreen } from './LucHaoScreen';

function setup(state: PersistedState = emptyState()) {
  const store = createStore<PersistedState>(state);
  render(<AppProvider store={store}><LucHaoScreen /></AppProvider>);
  return store;
}
const withCast = (): PersistedState => ({ ...emptyState(), tools: { lucHaoLastCast: { tosses: [7, 7, 9, 8, 6, 8], castAt: 't', method: 'manual', date: [6, 2, 2021] } } });
afterEach(cleanup);

describe('Màn hình Lục Hào', () => {
  it('chưa gieo: chỉ có form, chưa có kết quả', () => {
    setup();
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
    const store = setup();
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
