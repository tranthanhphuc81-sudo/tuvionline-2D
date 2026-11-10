// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { PERSONAS, ROBES, readerPersona, robeOf } from '../../content/reader/personas';
import { AppProvider } from '../../app/context';
import { createStore } from '../../state/store';
import { emptyState, parsePersisted, type PersistedState } from '../../state/schema';
import { ReaderSection } from '../settings/ReaderSection';
import { recolorRobe } from './Character';

afterEach(cleanup);

describe('Người đọc', () => {
  it('đủ nhân vật, mã không trùng, màu mặc định có thật', () => {
    expect(PERSONAS.length).toBeGreaterThanOrEqual(10);
    expect(new Set(PERSONAS.map((p) => p.id)).size).toBe(PERSONAS.length);
    for (const p of PERSONAS) expect(ROBES[p.robe]).toBeTruthy();
  });

  it('mã lạ thì là Thầy; ảnh tự chọn lấy tiếng xưng và giọng của người dùng', () => {
    expect(readerPersona('khong-co', undefined).id).toBe('thay');
    const c = readerPersona('custom', { name: 'Mẹ', ta: 'chị', voice: 'nu' });
    expect([c.custom, c.ta, c.elder, c.pitch > 1]).toEqual([true, 'chị', false, true]);
    expect(robeOf(PERSONAS[0], 'son')).toBe('son');
    expect(robeOf(PERSONAS[0], 'mau-la')).toBe(PERSONAS[0].robe);
  });

  it('đổi màu áo chỉ đổi đúng các lớp có tên', () => {
    const data = { layers: [{ shapes: [{ ty: 'fl', nm: 'robe', c: { a: 0, k: [0, 0, 0, 1] } }, { ty: 'fl', c: { a: 0, k: [1, 1, 1, 1] } }] }] };
    const out = recolorRobe(data, ['#ff0000', '#00ff00', '#0000ff']);
    expect(out.layers[0].shapes[0].c.k).toEqual([1, 0, 0, 1]);
    expect(out.layers[0].shapes[1].c.k).toEqual([1, 1, 1, 1]);
    expect(data.layers[0].shapes[0].c.k).toEqual([0, 0, 0, 1]);
  });

  it('cài đặt người đọc lưu được, sai dạng thì báo lỗi', () => {
    const ok = { ...emptyState(), settings: { ...emptyState().settings, reader: 'co-do', readerRobe: 'son', readerCustom: { name: 'A', ta: 'cô', voice: 'nu' } } };
    expect(parsePersisted(JSON.parse(JSON.stringify(ok))).ok).toBe(true);
    expect(parsePersisted({ ...ok, settings: { ...ok.settings, readerCustom: { name: 'A', ta: 'cô', voice: 'x' } } }).ok).toBe(false);
  });

  it('Cài đặt: chọn nhân vật và màu áo; chọn ảnh của bạn hiện thông tin riêng', () => {
    const store = createStore<PersistedState>(emptyState());
    render(<AppProvider store={store}><ReaderSection voices={['v1', 'v2']} /></AppProvider>);
    fireEvent.click(screen.getByRole('radio', { name: /^Cô đồ/ }));
    expect(store.getState().settings.reader).toBe('co-do');
    fireEvent.click(screen.getByRole('radio', { name: /Chàm/ }));
    expect(store.getState().settings.readerRobe).toBe('cham');
    fireEvent.click(screen.getByRole('radio', { name: /Đỏ son/ }));
    expect(store.getState().settings.readerRobe).toBeUndefined();
    expect(screen.getAllByRole('button', { name: /Nghe thử giọng/ })).toHaveLength(2);
    fireEvent.click(screen.getByRole('radio', { name: 'Giọng 2' }));
    expect(store.getState().settings.ttsVoice).toBe('v2');
  });
});
