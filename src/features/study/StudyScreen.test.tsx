// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { act, render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { AppProvider } from '../../app/context';
import { initialRouter } from '../../app/router';
import { createStore } from '../../state/store';
import { emptyState, type PersistedState, type Profile } from '../../state/schema';
import { studyTitle } from '../../content/study';

vi.mock('../../platform/native', () => ({ isNative: () => true }));
const plugin = vi.hoisted(() => ({ speak: vi.fn(), stop: vi.fn(async () => {}), getSupportedVoices: vi.fn(), openInstall: vi.fn() }));
vi.mock('@capacitor-community/text-to-speech', () => ({ TextToSpeech: plugin }));
import { StudyScreen } from './StudyScreen';
import { readingState, stopReading } from '../../platform/tts';

const person: Profile = {
  id: 'a', name: 'An', gender: 'M', calendar: 'solar', day: 15, month: 6, year: 1996, leapMonth: false, hourIdx: 6, lateTy: false, createdAt: 't', updatedAt: 't',
};
const withProfile = (p: Profile = person): PersistedState => ({ ...emptyState(), profiles: [p], activeProfileId: 'a' });
function setup(state: PersistedState) {
  const store = createStore<PersistedState>(state);
  const nav = createStore(initialRouter());
  render(<AppProvider store={store} nav={nav}><StudyScreen /></AppProvider>);
  return { store, nav };
}
const type = (label: string, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } });
const next = () => fireEvent.click(screen.getByRole('button', { name: 'Tiếp' }));

beforeEach(() => {
  plugin.speak.mockReset();
  plugin.speak.mockImplementation(() => new Promise(() => {}));
  plugin.getSupportedVoices.mockResolvedValue({ voices: [{ voiceURI: 'vi-vn-x-vic-local', lang: 'vi-VN', localService: true }] });
});
afterEach(() => { act(() => stopReading()); cleanup(); });

describe('Đồ vật trên án thư', () => {
  it('đủ 6 đồ vật, mỗi đồ vật có nhãn truy cập', () => {
    setup(withProfile());
    for (const name of [/Tờ lá số/, /Bốn thẻ tre/, /Ba đồng xu/, /La bàn gỗ/, /Sách cổ/, /Sổ tổng hợp/]) expect(screen.getByRole('button', { name })).toBeTruthy();
  });

  it('chạm đồ vật mở đúng công cụ', () => {
    const { nav } = setup(withProfile());
    fireEvent.click(screen.getByRole('button', { name: /Tờ lá số/ }));
    expect(nav.getState().tab).toBe('tuvi');
    fireEvent.click(screen.getByRole('button', { name: /Sách cổ/ }));
    expect(nav.getState().stacks.phongthuy[0]).toEqual({ name: 'phongthuy', sub: 'napam' });
    fireEvent.click(screen.getByRole('button', { name: /La bàn gỗ/ }));
    expect(nav.getState().stacks.phongthuy[0]).toEqual({ name: 'phongthuy', sub: 'laban' });
  });

  it('sổ tổng hợp mở màn hình con trên tab chính', () => {
    const { nav } = setup(withProfile());
    fireEvent.click(screen.getByRole('button', { name: /Sổ tổng hợp/ }));
    expect(nav.getState().tab).toBe('home');
    expect(nav.getState().stacks.home.at(-1)).toEqual({ name: 'tonghop' });
  });
});

describe('Thầy đọc', () => {
  it('bấm đọc: phụ đề hiện đoạn đang đọc, nút đổi thành Tạm dừng', async () => {
    setup(withProfile());
    fireEvent.click(screen.getByRole('button', { name: /Thầy đọc/ }));
    await waitFor(() => expect(plugin.speak).toHaveBeenCalled());
    expect(screen.getByRole('button', { name: /Tạm dừng/ })).toBeTruthy();
    expect(screen.getByText(/Thầy chào con/)).toBeTruthy();
    expect(plugin.speak.mock.calls[0][0].pitch).toBeCloseTo(0.85);
  });

  it('nói chậm: đổi tốc độ ngay trong lúc đang đọc', async () => {
    setup(withProfile());
    fireEvent.click(screen.getByRole('button', { name: /Thầy đọc/ }));
    await waitFor(() => expect(plugin.speak).toHaveBeenCalledTimes(1));
    const before = plugin.speak.mock.calls[0][0].rate;
    fireEvent.click(screen.getByRole('button', { name: 'Nói chậm' }));
    await waitFor(() => expect(plugin.speak).toHaveBeenCalledTimes(2));
    expect(plugin.speak.mock.calls[1][0].rate).toBeCloseTo(before * 0.85);
    expect(readingState()?.index).toBe(0);
  });

  it('ngày sinh sai: báo rõ, không đọc được', () => {
    setup(withProfile({ ...person, day: 31, month: 2 }));
    expect(screen.getByText(/chưa đọc được/)).toBeTruthy();
    expect((screen.getByRole('button', { name: /Thầy đọc/ }) as HTMLButtonElement).disabled).toBe(true);
  });
});

describe('Hỏi lần lượt khi chưa có hồ sơ', () => {
  it('đủ các bước thì lưu hồ sơ và đặt làm người đang xem', () => {
    const { store } = setup(emptyState());
    expect(screen.queryByRole('button', { name: /Tờ lá số/ })).toBeNull();
    type('Tên hoặc biệt danh', 'An');
    next();
    fireEvent.click(screen.getByRole('radio', { name: 'Nữ' }));
    next();
    type('Ngày', '15'); type('Tháng', '6'); type('Năm sinh', '1996');
    next();
    fireEvent.click(screen.getByRole('button', { name: 'Lưu hồ sơ' }));
    const [p] = store.getState().profiles;
    expect(p).toMatchObject({ name: 'An', gender: 'F', day: 15, month: 6, year: 1996 });
    expect(store.getState().activeProfileId).toBe(p.id);
  });

  it('thiếu tên: không sang bước sau', () => {
    setup(emptyState());
    next();
    expect(screen.getByRole('alert').textContent).toBe('Vui lòng nhập tên hoặc biệt danh cho hồ sơ.');
    expect(screen.getByLabelText('Tên hoặc biệt danh')).toBeTruthy();
  });

  it('ngày không tồn tại: giữ ở bước ngày, không tự cuộn sang tháng sau', () => {
    const { store } = setup(emptyState());
    type('Tên hoặc biệt danh', 'An');
    next(); next();
    type('Ngày', '31'); type('Tháng', '2'); type('Năm sinh', '1996');
    next();
    expect(screen.getByRole('alert').textContent).toContain('Ngày 31/2/1996 không tồn tại');
    expect(screen.queryByLabelText('Giờ sinh')).toBeNull();
    expect(store.getState().profiles).toEqual([]);
  });

  it('quay lại vẫn giữ chữ đã nhập', () => {
    setup(emptyState());
    type('Tên hoặc biệt danh', 'An');
    next();
    fireEvent.click(screen.getByRole('button', { name: 'Quay lại' }));
    expect((screen.getByLabelText('Tên hoặc biệt danh') as HTMLInputElement).value).toBe('An');
  });
});

describe('Nhãn thanh trên', () => {
  it('ngày âm và năm Can Chi của hôm nay', () => {
    expect(studyTitle(new Date(2026, 10, 5))).toBe('27/9 Bính Ngọ');
    expect(studyTitle(new Date(2026, 1, 17))).toBe('1/1 Bính Ngọ');
  });
});
