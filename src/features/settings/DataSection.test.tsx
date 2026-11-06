// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor, within } from '@testing-library/react';
import { AppProvider } from '../../app/context';
import { RESTORE_ERROR, SHARE_FAILED } from '../../content/common/about';
import { backupText } from '../../state/backup';
import { LEGACY_SHARED_KEY } from '../../state/migrations';
import { emptyState, STATE_KEY, type PersistedState, type Profile } from '../../state/schema';
import { createStore } from '../../state/store';
import { createMemoryKV } from '../../platform/storage';
import { ShareButton } from '../share/ShareButton';
import { DataSection, wipeExtras } from './DataSection';

const shareFile = vi.hoisted(() => vi.fn());
vi.mock('../../platform/share', () => ({ shareFile, clearShareCache: vi.fn(async () => undefined) }));
const renderCard = vi.hoisted(() => vi.fn());
vi.mock('../share/render', () => ({ renderCard }));

const person = (id: string, name: string): Profile => ({
  id, name, gender: 'M', calendar: 'solar', day: 15, month: 6, year: 1996, leapMonth: false, hourIdx: 6, lateTy: false, createdAt: 't', updatedAt: 't',
});
const state = (...p: Profile[]): PersistedState => ({ ...emptyState(), profiles: p, activeProfileId: p[0]?.id ?? null });

function setup(s: PersistedState) {
  const store = createStore<PersistedState>(s);
  render(<AppProvider store={store}><DataSection /></AppProvider>);
  return store;
}
const pick = (text: string) => {
  const input = screen.getByLabelText('Chọn file sao lưu') as HTMLInputElement;
  fireEvent.change(input, { target: { files: [new File([text], 'x.json')] } });
};

afterEach(() => { cleanup(); vi.clearAllMocks(); localStorage.clear(); });

describe('Dữ liệu của bạn', () => {
  it('sao lưu gửi đúng tài liệu lyso.state ra bảng chia sẻ', async () => {
    shareFile.mockResolvedValue('shared');
    const s = state(person('a', 'An'));
    setup(s);
    fireEvent.click(screen.getByRole('button', { name: 'Sao lưu ra file' }));
    await waitFor(() => expect(shareFile).toHaveBeenCalled());
    const [blob, name] = shareFile.mock.calls[0];
    expect(name).toMatch(/^ly-so-sao-luu-\d{4}-\d{2}-\d{2}\.json$/);
    expect(JSON.parse(await (blob as Blob).text())).toEqual(s);
  });

  it('khôi phục hỏi lại trước khi thay dữ liệu; Huỷ thì giữ nguyên', async () => {
    const store = setup(state(person('a', 'An')));
    pick(backupText(state(person('b', 'Bình'), person('c', 'Cúc'))));
    const dialog = await screen.findByText(/File có 2 hồ sơ/);
    expect(dialog.textContent).toContain('(1 hồ sơ');
    expect(store.getState().profiles[0].name).toBe('An');
    fireEvent.click(screen.getByRole('button', { name: 'Huỷ' }));
    expect(store.getState().profiles[0].name).toBe('An');
  });

  it('đồng ý khôi phục thì thay toàn bộ', async () => {
    const store = setup(state(person('a', 'An')));
    pick(backupText(state(person('b', 'Bình'))));
    await screen.findByText(/File có 1 hồ sơ/);
    fireEvent.click(screen.getByRole('button', { name: 'Khôi phục' }));
    expect(store.getState().profiles.map((p) => p.name)).toEqual(['Bình']);
  });

  it('file sai báo lỗi và không đổi dữ liệu', async () => {
    const before = state(person('a', 'An'));
    const store = setup(before);
    pick('không phải json');
    expect((await screen.findByRole('alert')).textContent).toBe(RESTORE_ERROR['not-json']);
    expect(store.getState()).toBe(before);
  });

  it('xoá toàn bộ phải xác nhận rồi mới xoá', () => {
    const store = setup(state(person('a', 'An')));
    fireEvent.click(screen.getByRole('button', { name: 'Xoá toàn bộ dữ liệu' }));
    expect(store.getState().profiles).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: 'Xoá hết' }));
    expect(store.getState()).toEqual(emptyState());
  });

  it('wipeExtras xoá bản sao dữ liệu hỏng và dữ liệu bản 0.1, không đụng khoá khác', async () => {
    const kv = createMemoryKV({ [`${STATE_KEY}.corrupt-1`]: 'x', [STATE_KEY]: '{}', other: '1' });
    localStorage.setItem(LEGACY_SHARED_KEY, '{}');
    await wipeExtras(kv);
    expect([...kv.data.keys()].sort()).toEqual(['lyso.state', 'other']);
    expect(localStorage.getItem(LEGACY_SHARED_KEY)).toBeNull();
  });
});

describe('Nút Chia sẻ ảnh', () => {
  it('tạo ảnh rồi chia sẻ với tên file theo công cụ', async () => {
    renderCard.mockResolvedValue(new Blob(['png']));
    shareFile.mockResolvedValue('shared');
    render(<ShareButton getCard={() => ({ slug: 'tu-vi', title: 'Lá số Tử Vi', groups: [] })} />);
    fireEvent.click(screen.getByRole('button', { name: /Chia sẻ ảnh/ }));
    await waitFor(() => expect(shareFile).toHaveBeenCalledWith(expect.any(Blob), 'ly-so-tu-vi.png', 'Lá số Tử Vi'));
  });

  it('plugin thiếu hoặc lỗi thì báo rõ, nút dùng lại được', async () => {
    renderCard.mockResolvedValue(new Blob(['png']));
    shareFile.mockRejectedValue(new Error('not implemented'));
    const { container } = render(<ShareButton getCard={() => ({ slug: 'x', title: 'T', groups: [] })} />);
    fireEvent.click(screen.getByRole('button', { name: /Chia sẻ ảnh/ }));
    expect((await screen.findByRole('status')).textContent).toBe(SHARE_FAILED);
    expect((within(container).getByRole('button') as HTMLButtonElement).disabled).toBe(false);
  });
});
