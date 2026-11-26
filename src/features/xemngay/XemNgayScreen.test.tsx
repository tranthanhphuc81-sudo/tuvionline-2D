// @vitest-environment jsdom
import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { AppProvider } from '../../app/context';
import { createStore } from '../../state/store';
import { emptyState, type PersistedState, type Profile } from '../../state/schema';
import { XemNgayScreen } from './XemNgayScreen';

/** Sinh dương lịch 1994 (năm âm Giáp Tuất): tuổi Tuất, bị ngày Giáp Thìn 26/11/2026 xung. */
const tuat: Profile = {
  id: 'a', name: 'An', gender: 'M', calendar: 'solar', day: 15, month: 6, year: 1994, leapMonth: false, hourIdx: 6, lateTy: false, createdAt: 't', updatedAt: 't',
};
const setup = (state: PersistedState) => render(<AppProvider store={createStore<PersistedState>(state)}><XemNgayScreen /></AppProvider>);

beforeEach(() => { vi.useFakeTimers({ toFake: ['Date'] }); vi.setSystemTime(new Date(2026, 10, 26, 9, 0)); });
afterEach(() => { cleanup(); vi.useRealTimers(); });

describe('Màn hình Xem ngày tốt xấu', () => {
  it('mở ra là hôm nay, đủ ba điều: thần, trực, tuổi; có lời nhắc tham khảo', () => {
    setup(emptyState());
    expect(screen.getByRole('heading', { name: 'Hôm nay, Thứ Năm, 26/11/2026', level: 2 })).toBeTruthy();
    expect(screen.getByText('Âm lịch 18/10 · ngày Giáp Thìn')).toBeTruthy();
    expect(screen.getByText(/Hoàng đạo: ngày Tư Mệnh/)).toBeTruthy();
    expect(screen.getByText(/^Trực Chấp/)).toBeTruthy();
    expect(screen.getByText(/người tuổi Tuất nên chọn ngày khác/)).toBeTruthy();
    expect(screen.getByText(/Thêm hồ sơ để app xem riêng/)).toBeTruthy();
    expect(screen.getByText(/không phải căn cứ để đưa ra quyết định quan trọng/)).toBeTruthy();
  });

  it('hồ sơ tuổi Tuất: ngày xung, hạ bậc, mọi việc nên tránh', () => {
    setup({ ...emptyState(), profiles: [tuat], activeProfileId: 'a' });
    expect(screen.getByText('Ngày thường với tuổi của hồ sơ')).toBeTruthy();
    expect(screen.getByText(/xung tuổi Tuất của hồ sơ này/)).toBeTruthy();
    expect(screen.getAllByText('Nên tránh').length).toBe(8);
  });

  it('chuyển ngày bằng nút, chạm ô lịch và về lại hôm nay', () => {
    setup(emptyState());
    fireEvent.click(screen.getByRole('button', { name: 'Ngày sau' }));
    expect(screen.getByRole('heading', { name: 'Thứ Sáu, 27/11/2026', level: 2 })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /^Chủ nhật, 08\/11\/2026/ }));
    expect(screen.getByRole('heading', { name: 'Chủ nhật, 08/11/2026', level: 2 })).toBeTruthy();
    expect(screen.getByText(/^Trực Bế/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Về hôm nay' }));
    expect(screen.getByRole('heading', { name: /^Hôm nay/, level: 2 })).toBeTruthy();
  });

  it('tìm ngày hợp việc: chọn việc thì danh sách đổi, chạm một ngày thì xem ngày đó', () => {
    setup(emptyState());
    fireEvent.click(screen.getByRole('radio', { name: 'Cưới hỏi' }));
    expect(screen.getByRole('radio', { name: 'Cưới hỏi' }).getAttribute('aria-checked')).toBe('true');
    const list = screen.getByRole('heading', { name: 'Ngày hợp trong 30 ngày tới' }).parentElement!;
    const first = list.querySelector('ul button') as HTMLButtonElement;
    fireEvent.click(first);
    expect(screen.getByText(/^Cưới hỏi: hợp\./)).toBeTruthy();
  });
});
