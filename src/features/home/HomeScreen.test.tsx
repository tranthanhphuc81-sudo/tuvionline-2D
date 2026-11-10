// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { initialRouter, push } from '../../app/router';
import { AppProvider } from '../../app/context';
import { createStore } from '../../state/store';
import { emptyState, type PersistedState, type Profile } from '../../state/schema';
import { HomeScreen } from './HomeScreen';

const person: Profile = {
  id: 'a', name: 'An', gender: 'M', calendar: 'solar', day: 15, month: 6, year: 1996, leapMonth: false, hourIdx: 6, lateTy: false, createdAt: 't', updatedAt: 't',
};
function setup(state: PersistedState) {
  render(<AppProvider store={createStore<PersistedState>(state)}><HomeScreen /></AppProvider>);
}
const HEADINGS = ['Tóm lại về bạn (dễ hiểu)', 'Ngũ hành theo từng hệ thống', 'Bảng so sánh 4 hệ thống', 'Đọc tổng hợp thế nào?'];
afterEach(cleanup);

describe('Màn hình Tổng hợp', () => {
  it('có hồ sơ: đủ 4 phần, 4 hàng so sánh, đối chiếu chéo và ghi chú tham khảo', () => {
    setup({ ...emptyState(), profiles: [person], activeProfileId: 'a' });
    for (const h of HEADINGS) expect(screen.getByRole('heading', { name: h, level: 2 })).toBeTruthy();
    expect(screen.getByText('📌 Điểm chính')).toBeTruthy();
    expect(screen.queryByText('✅ Điểm mạnh')).toBeNull();
    expect(screen.getByRole('table').querySelectorAll('tbody tr')).toHaveLength(4);
    expect(screen.getByText(/Thử đối chiếu 4 hành với nhau/)).toBeTruthy();
    expect(screen.getByText(/Bảng tổng hợp này chỉ gộp hiển thị/)).toBeTruthy();
  });

  it('chưa có hồ sơ hoặc ngày sai: không hiện phần tổng hợp', () => {
    setup(emptyState());
    expect(screen.queryByRole('heading', { name: HEADINGS[0] })).toBeNull();
    cleanup();
    setup({ ...emptyState(), profiles: [{ ...person, day: 31, month: 2 }], activeProfileId: 'a' });
    expect(screen.getByRole('alert')).toBeTruthy();
    expect(screen.queryByRole('heading', { name: HEADINGS[0] })).toBeNull();
  });

  it('lối tắt Chỉ tay mở chồng lên Tổng hợp để Back về lại Tổng hợp', () => {
    const nav = createStore(push(initialRouter(), { name: 'tonghop' }));
    render(<AppProvider store={createStore<PersistedState>(emptyState())} nav={nav}><HomeScreen /></AppProvider>);
    fireEvent.click(screen.getByRole('button', { name: /Chỉ tay/ }));
    expect(nav.getState().stacks.home.map((r) => r.name)).toEqual(['home', 'tonghop', 'palm']);
  });
});
