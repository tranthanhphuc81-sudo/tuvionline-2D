// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { act, render, screen, fireEvent, cleanup } from '@testing-library/react';
import { AppProvider } from '../../app/context';
import { createStore } from '../../state/store';
import { removeProfile, setActiveProfile } from '../../state/actions';
import { emptyState, type PersistedState, type Profile } from '../../state/schema';
import { BatTrachScreen } from './battrach/BatTrachScreen';
import { NapAmScreen } from './napam/NapAmScreen';

const person = (id: string, name: string, day: number, month: number, year: number, gender: 'M' | 'F' = 'M'): Profile => ({
  id, name, gender, calendar: 'solar', day, month, year, leapMonth: false, hourIdx: 6, lateTy: false, createdAt: 't', updatedAt: 't',
});
const two = (): PersistedState => ({ ...emptyState(), profiles: [person('a', 'An', 15, 6, 1981), person('b', 'Bình', 20, 8, 1985, 'F')], activeProfileId: 'a' });
function setup(ui: React.ReactElement, state: PersistedState) {
  const store = createStore<PersistedState>(state);
  render(<AppProvider store={store}>{ui}</AppProvider>);
  return store;
}
afterEach(cleanup);

describe('Màn hình Bát Trạch', () => {
  it('chưa có hồ sơ: mời thêm hồ sơ', () => {
    setup(<BatTrachScreen />, emptyState());
    expect(screen.getByRole('button', { name: '＋ Thêm hồ sơ' })).toBeTruthy();
  });

  it('sinh trước Lập Xuân: báo và tính theo năm trước', () => {
    setup(<BatTrachScreen />, { ...emptyState(), profiles: [person('a', 'An', 2, 2, 2000)], activeProfileId: 'a' });
    expect(screen.getByText(/Sinh trước tiết Lập Xuân/)).toBeTruthy();
    expect(screen.getByText('1999', { selector: 'dd' })).toBeTruthy();
  });

  it('chọn hướng cửa: lưu lại, hiện đánh giá nhà; bỏ chọn thì xoá đánh giá', () => {
    const store = setup(<BatTrachScreen />, { ...emptyState(), profiles: [person('a', 'An', 15, 6, 1988)], activeProfileId: 'a' });
    expect(screen.queryByText('Trạch Quái căn nhà')).toBeNull();
    const sel = screen.getByLabelText('Hướng cửa chính của căn nhà đang xét (không bắt buộc)');
    fireEvent.change(sel, { target: { value: 'Đông Bắc' } });
    expect(store.getState().tools.batTrachHuongCua).toBe('Đông Bắc');
    expect(screen.getByText('Trạch Quái căn nhà')).toBeTruthy();
    expect(screen.getByText(/Lệch nhóm/)).toBeTruthy();
    expect(screen.getByText(/· đang chọn/)).toBeTruthy();
    fireEvent.change(sel, { target: { value: '' } });
    expect(store.getState().tools.batTrachHuongCua).toBeUndefined();
    expect(screen.queryByText(/Lệch nhóm/)).toBeNull();
  });

  it('hồ sơ âm lịch ngày không tồn tại: báo lỗi, không tính', () => {
    setup(<BatTrachScreen />, { ...emptyState(), profiles: [{ ...person('a', 'An', 30, 2, 2023), calendar: 'lunar', leapMonth: true, month: 5 }], activeProfileId: 'a' });
    expect(screen.getByRole('alert')).toBeTruthy();
    expect(screen.queryByText('Mệnh Quái', { selector: 'dt' })).toBeNull();
  });
});

describe('Màn hình Nạp Âm', () => {
  it('mặc định xem người đang chọn, chưa so sánh', () => {
    const store = setup(<NapAmScreen />, two());
    expect(screen.getByText('Thạch Lựu Mộc', { selector: 'dd' })).toBeTruthy();
    expect(screen.queryByText('So sánh — tham khảo khi xem hợp hôn')).toBeNull();
    expect(store.getState().tools.napAmPair).toBeUndefined();
  });

  it('chọn Người 2: so sánh và lưu cặp; xoá hồ sơ thì về một người', () => {
    const store = setup(<NapAmScreen />, two());
    fireEvent.change(screen.getByLabelText('Người 2'), { target: { value: 'b' } });
    expect(screen.getByText('So sánh — tham khảo khi xem hợp hôn')).toBeTruthy();
    expect(screen.getByText('Tóm lại: hai người có hợp nhau không?')).toBeTruthy();
    expect(store.getState().tools.napAmPair).toEqual(['a', 'b']);
    act(() => removeProfile(store, 'b'));
    expect(screen.queryByText('So sánh — tham khảo khi xem hợp hôn')).toBeNull();
    expect(store.getState().tools.napAmPair).toBeUndefined();
  });

  it('mở lại: khôi phục cặp đã lưu', () => {
    setup(<NapAmScreen />, { ...two(), tools: { napAmPair: ['b', 'a'] } });
    expect(screen.getByRole('heading', { name: 'Người 1 · Bình' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Người 2 · An' })).toBeTruthy();
  });

  it('đổi người đang xem ở thanh trên: Người 1 đổi theo', () => {
    const store = setup(<NapAmScreen />, two());
    act(() => setActiveProfile(store, 'b'));
    expect(screen.getByRole('heading', { name: 'Người 1 · Bình' })).toBeTruthy();
  });

  it('nhập tay chỉ có năm, và ngày không tồn tại báo lỗi nguyên văn', () => {
    setup(<NapAmScreen />, emptyState());
    expect(screen.queryByText('Tổng kết')).toBeNull();
    fireEvent.change(screen.getByLabelText('Người 1 — Năm (dương lịch)'), { target: { value: '1985' } });
    fireEvent.click(screen.getByRole('button', { name: 'Tra Nạp Âm' }));
    expect(screen.getByText('Chỉ nhập năm 1985')).toBeTruthy();
    fireEvent.change(screen.getByLabelText('Người 1 — Ngày'), { target: { value: '31' } });
    fireEvent.change(screen.getByLabelText('Người 1 — Tháng'), { target: { value: '2' } });
    fireEvent.click(screen.getByRole('button', { name: 'Tra Nạp Âm' }));
    expect(screen.getByRole('alert').textContent).toBe('Người 1: ngày 31/2/1985 không tồn tại trên lịch dương.');
    expect(screen.queryByText('Tổng kết')).toBeNull();
  });
});
