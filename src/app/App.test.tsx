// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, within, act } from '@testing-library/react';
import { App } from './App';
import { AppProvider } from './context';
import { createStore } from '../state/store';
import { emptyState, type PersistedState } from '../state/schema';
import { addProfile } from '../state/actions';
import { initialRouter } from './router';
import { backStack } from '../platform/back';
import { routerBack } from './router';

function setup(withProfile = false) {
  const store = createStore<PersistedState>(emptyState());
  if (withProfile) addProfile(store, { name: 'An', gender: 'M', calendar: 'solar', day: 15, month: 6, year: 1996, leapMonth: false, hourIdx: 6, lateTy: false });
  const nav = createStore(initialRouter());
  backStack.setFallback(() => { const r = routerBack(nav.getState()); nav.setState(r.state); return r.action; });
  render(<AppProvider store={store} nav={nav}><App /></AppProvider>);
  return { store, nav };
}
const visible = () => screen.getAllByRole('tabpanel').find((p) => !p.hidden)!;

afterEach(cleanup);

/** Màn hình trên cùng của tab đang mở: các màn hình dưới nó vẫn mount, chỉ ẩn. */
function topScreen(): HTMLElement {
  return visible().lastElementChild as HTMLElement;
}

describe('Khung app', () => {
  it('chưa có hồ sơ: mời thêm hồ sơ; thêm xong thì Tổng hợp hiện tóm tắt', () => {
    const { store } = setup();
    fireEvent.click(screen.getByRole('button', { name: 'Điền cả hồ sơ một lần' }));
    const panel = topScreen();
    fireEvent.change(within(panel).getByLabelText('Tên hoặc biệt danh'), { target: { value: 'An' } });
    fireEvent.change(within(panel).getByLabelText('Ngày'), { target: { value: '15' } });
    fireEvent.change(within(panel).getByLabelText('Tháng'), { target: { value: '6' } });
    fireEvent.change(within(panel).getByLabelText('Năm sinh'), { target: { value: '1996' } });
    fireEvent.click(within(panel).getByRole('button', { name: 'Lưu hồ sơ' }));
    expect(store.getState().profiles).toHaveLength(1);
    fireEvent.click(within(visible()).getByRole('button', { name: /Sổ tổng hợp/ }));
    expect(within(visible()).getByText('Giản Hạ Thuỷ', { selector: 'b' })).toBeTruthy();
    expect(within(visible()).getByText('Mộc Tam Cục', { selector: 'b' })).toBeTruthy();
  });

  it('form hồ sơ báo lỗi tiếng Việt như legacy, không lưu ngày không tồn tại', () => {
    const { store } = setup();
    fireEvent.click(screen.getByRole('button', { name: 'Điền cả hồ sơ một lần' }));
    const panel = topScreen();
    fireEvent.click(within(panel).getByRole('button', { name: 'Lưu hồ sơ' }));
    expect(within(panel).getByText('Vui lòng nhập tên hoặc biệt danh cho hồ sơ.')).toBeTruthy();
    fireEvent.change(within(panel).getByLabelText('Tên hoặc biệt danh'), { target: { value: 'An' } });
    fireEvent.change(within(panel).getByLabelText('Ngày'), { target: { value: '31' } });
    fireEvent.change(within(panel).getByLabelText('Tháng'), { target: { value: '2' } });
    fireEvent.change(within(panel).getByLabelText('Năm sinh'), { target: { value: '1996' } });
    fireEvent.click(within(panel).getByRole('button', { name: 'Lưu hồ sơ' }));
    expect(within(panel).getByRole('alert').textContent).toBe('Ngày 31/2/1996 không tồn tại trên lịch dương (ví dụ tháng 2 chỉ có 28 hoặc 29 ngày) — vui lòng kiểm tra lại.');
    fireEvent.click(within(panel).getByRole('radio', { name: 'Âm lịch' }));
    fireEvent.change(within(panel).getByLabelText('Ngày (âm)'), { target: { value: '1' } });
    fireEvent.change(within(panel).getByLabelText('Tháng (âm)'), { target: { value: '3' } });
    fireEvent.change(within(panel).getByLabelText('Năm sinh'), { target: { value: '2023' } });
    fireEvent.click(within(panel).getByRole('radio', { name: 'Có (tháng nhuận)' }));
    expect(within(panel).getByRole('alert').textContent).toBe('Năm 2023 không có tháng 3 nhuận — kiểm tra lại ô "Tháng nhuận?".');
    expect(store.getState().profiles).toEqual([]);
  });

  it('chuyển tab không mất trạng thái của tab khác', () => {
    setup(true);
    fireEvent.click(screen.getByRole('tab', { name: /Phong thủy/ }));
    fireEvent.click(within(visible()).getByRole('radio', { name: 'Nạp Âm' }));
    fireEvent.click(screen.getByRole('tab', { name: /Tử Vi/ }));
    fireEvent.click(screen.getByRole('tab', { name: /Phong thủy/ }));
    expect(within(visible()).getByRole('radio', { name: 'Nạp Âm' }).getAttribute('aria-checked')).toBe('true');
  });

  it('Back: đóng bảng chọn trước, rồi lùi màn hình con, rồi về Tổng hợp', () => {
    const { nav } = setup(true);
    fireEvent.click(screen.getByRole('tab', { name: /Bát Tự/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Cài đặt' }));
    fireEvent.click(screen.getByRole('button', { name: /Đang xem: An/ }));
    expect(screen.getByRole('dialog')).toBeTruthy();
    const back = () => act(() => { backStack.dispatch(); });
    back();
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(nav.getState().stacks.battu).toHaveLength(2);
    back();
    expect(nav.getState().stacks.battu).toHaveLength(1);
    back();
    expect(nav.getState().tab).toBe('home');
    expect(backStack.dispatch()).toBe('minimize');
  });

  it('nút chỉ có biểu tượng đều có aria-label', () => {
    setup(true);
    fireEvent.click(screen.getByRole('button', { name: 'Cài đặt' }));
    for (const btn of screen.getAllByRole('button')) {
      const text = (btn.textContent ?? '').replace(/[\s←⚙＋]/gu, '');
      if (!text) expect(btn.getAttribute('aria-label'), btn.outerHTML).toBeTruthy();
    }
    expect(screen.getByRole('button', { name: 'Quay lại' })).toBeTruthy();
  });

  it('sửa và xoá hồ sơ (có hỏi lại)', () => {
    const { store } = setup(true);
    fireEvent.click(screen.getByRole('button', { name: /Đang xem: An/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Quản lý hồ sơ' }));
    fireEvent.click(within(visible()).getByRole('button', { name: /An/ }));
    fireEvent.click(within(visible()).getByRole('button', { name: 'Xoá hồ sơ này' }));
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Xoá' }));
    expect(store.getState().profiles).toEqual([]);
  });
});
