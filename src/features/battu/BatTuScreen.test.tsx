// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { AppProvider } from '../../app/context';
import { createStore } from '../../state/store';
import { emptyState, type PersistedState } from '../../state/schema';
import { addProfile } from '../../state/actions';
import { BatTuScreen } from './BatTuScreen';

function setup(p?: { day: number; month: number; year: number; hourIdx: number }) {
  const store = createStore<PersistedState>(emptyState());
  if (p) addProfile(store, { name: 'An', gender: 'M', calendar: 'solar', leapMonth: false, lateTy: false, ...p });
  render(<AppProvider store={store}><BatTuScreen /></AppProvider>);
}
afterEach(cleanup);

describe('Màn hình Bát Tự', () => {
  it('chưa có hồ sơ: mời thêm hồ sơ', () => {
    setup();
    expect(screen.getByRole('button', { name: '＋ Thêm hồ sơ' })).toBeTruthy();
  });

  it('ví dụ vàng 6/2/2021 giờ Ngọ: 4 trụ Tân Sửu · Canh Dần · Ất Dậu · Nhâm Ngọ, Nhật Chủ Ất', () => {
    setup({ day: 6, month: 2, year: 2021, hourIdx: 6 });
    expect(screen.getByText('Tân Sửu · Canh Dần · Ất Dậu · Nhâm Ngọ')).toBeTruthy();
    const day = screen.getByRole('article', { name: /^Trụ Ngày: Ất Dậu, Mộc Âm, Nhật Chủ\./ });
    expect(day.getAttribute('data-nhatchu')).toBe('true');
    expect(screen.getAllByRole('article', { name: /^Trụ / })).toHaveLength(4);
    expect(screen.getByText('Gợi ý Dụng Thần')).toBeTruthy();
    expect(screen.getByText(/Sát trọng dụng Ấn/)).toBeTruthy();
  });

  it('giữa Lập Xuân và Tết: hiện lưu ý Trụ Năm khác năm âm lịch', () => {
    setup({ day: 4, month: 2, year: 2024, hourIdx: 11 });
    expect(screen.getByRole('note').textContent).toContain('Trụ Năm Bát Tự (Giáp Thìn) KHÁC với năm ghi trên lịch Âm (2023)');
  });

  it('tra Lưu Niên: tuổi và Thập Thần của năm', () => {
    setup({ day: 6, month: 2, year: 2021, hourIdx: 6 });
    fireEvent.change(screen.getByLabelText('Xem vận năm dương lịch'), { target: { value: '2021' } });
    fireEvent.click(screen.getByRole('button', { name: 'Xem' }));
    expect(screen.getByText('1 tuổi', { selector: 'dd' })).toBeTruthy();
    expect(screen.getByText('Tân Sửu', { selector: 'dd' })).toBeTruthy();
  });

  it('có Tổng kết với mục Thập Thần nổi bật và lời lưu ý văn hoá', () => {
    setup({ day: 15, month: 6, year: 1996, hourIdx: 6 });
    expect(screen.getByText('🧩 Thập Thần nổi bật — tính cách và nghề nghiệp')).toBeTruthy();
    expect(screen.getByText('Công cụ mang tính văn hoá, tham khảo — không phải căn cứ để đưa ra quyết định quan trọng.')).toBeTruthy();
  });
});
