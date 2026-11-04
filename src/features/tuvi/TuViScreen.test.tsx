// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, within } from '@testing-library/react';
import { AppProvider } from '../../app/context';
import { createStore } from '../../state/store';
import { emptyState, type PersistedState } from '../../state/schema';
import { addProfile } from '../../state/actions';
import { TuViScreen } from './TuViScreen';

function setup(withProfile = true) {
  const store = createStore<PersistedState>(emptyState());
  // Ví dụ Chương 10, Phần 1: Nam, 12/7/1979 âm lịch, giờ Thìn
  if (withProfile) addProfile(store, { name: 'An', gender: 'M', calendar: 'lunar', day: 12, month: 7, year: 1979, leapMonth: false, hourIdx: 4, lateTy: false });
  render(<AppProvider store={store}><TuViScreen /></AppProvider>);
}
afterEach(cleanup);

describe('Màn hình Tử Vi', () => {
  it('chưa có hồ sơ: mời thêm hồ sơ', () => {
    setup(false);
    expect(screen.getByRole('button', { name: '＋ Thêm hồ sơ' })).toBeTruthy();
  });

  it('lá số 12 ô có nhãn đầy đủ; mặc định chọn cung Mệnh', () => {
    setup();
    const grid = screen.getByRole('group', { name: 'Lá số 12 cung' });
    const cells = within(grid).getAllByRole('button');
    expect(cells).toHaveLength(12);
    const menh = within(grid).getByRole('button', { name: /^Cung Mệnh tại Thìn: Thiên Cơ, Thiên Lương Hoá Khoa\. Đại hạn 3 đến 12 tuổi$/ });
    expect(menh.getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByRole('heading', { name: 'Cung Mệnh' })).toBeTruthy();
  });

  it('chạm ô khác → thẻ chi tiết đổi; nút ‹ › chuyển cung', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: /^Cung Phu Thê tại Dần/ }));
    expect(screen.getByRole('heading', { name: 'Cung Phu Thê' })).toBeTruthy();
    expect(screen.getByText('· cung sáng')).toBeTruthy(); // Thái Dương ở Dần
    fireEvent.click(screen.getByRole('button', { name: 'Cung sau' }));
    expect(screen.getByRole('heading', { name: 'Cung Huynh Đệ' })).toBeTruthy(); // Mão, theo chiều kim đồng hồ
  });

  it('chế độ Danh sách bắt đầu từ Mệnh; chạm thẻ thì quay về lá số ở cung đó', () => {
    setup();
    fireEvent.click(screen.getByRole('radio', { name: 'Danh sách' }));
    const items = screen.getAllByRole('listitem').filter((li) => li.closest('ol'));
    expect(items[0].textContent).toContain('Mệnh');
    fireEvent.click(within(items[4]).getByRole('button'));
    expect(screen.getByRole('heading', { name: 'Cung Quan Lộc' })).toBeTruthy();
  });

  it('tra năm: đổi bảng và phần đọc nhanh', () => {
    setup();
    const input = screen.getByLabelText('Xem vận năm dương lịch');
    fireEvent.change(input, { target: { value: '1979' } });
    fireEvent.click(screen.getByRole('button', { name: 'Xem' }));
    expect(screen.getByText('Đọc nhanh năm 1979 (Kỷ Mùi)')).toBeTruthy();
    expect(screen.getByText('1 tuổi', { selector: 'dd' })).toBeTruthy();
    fireEvent.change(input, { target: { value: '1970' } });
    fireEvent.click(screen.getByRole('button', { name: 'Xem' }));
    expect(screen.getByText('Năm này trước năm sinh — chưa có lưu niên để xem.')).toBeTruthy();
  });

  it('có Tổng kết, Giải thích chỉ số và lời lưu ý văn hoá', () => {
    setup();
    expect(screen.getByText('Tóm lại: lá số này nói gì về bạn?')).toBeTruthy();
    expect(screen.getByText('1. Cục — Mộc Tam Cục (Đại Lâm Mộc), hành Mộc')).toBeTruthy();
    expect(screen.getByText('Công cụ mang tính văn hoá, tham khảo — không phải căn cứ để đưa ra quyết định quan trọng.')).toBeTruthy();
  });
});
