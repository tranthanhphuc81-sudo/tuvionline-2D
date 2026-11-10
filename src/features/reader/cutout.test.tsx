// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent, act } from '@testing-library/react';
import { AppProvider } from '../../app/context';
import { createStore } from '../../state/store';
import { emptyState, parsePersisted, type PersistedState } from '../../state/schema';
import { ReaderSection } from '../settings/ReaderSection';
import { CUT_H, CUT_W, fitBox, maskToAlpha } from './cutout';
import { loadReaderPhoto, READER_CUTOUT_KEY, READER_PHOTO_KEY, removeReaderPhoto } from './customPhoto';
import type { KV } from '../../platform/storage';

afterEach(cleanup);

/** Mặt nạ w×h: 1 trong các hình chữ nhật cho trước, 0 ở ngoài. */
function mask(w: number, h: number, rects: [number, number, number, number][]) {
  const m = new Float32Array(w * h);
  for (const [x0, y0, x1, y1] of rects) for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) m[y * w + x] = 1;
  return m;
}

describe('Tách nền ảnh người đọc', () => {
  it('giữ mảng người lớn nhất, bỏ đốm lẻ ngoài nền, khung ôm sát người', () => {
    const r = maskToAlpha(mask(40, 40, [[10, 8, 29, 39], [0, 0, 2, 2]]), 40, 40)!;
    expect(r.alpha[20 * 40 + 20]).toBe(255);
    expect(r.alpha[1 * 40 + 1]).toBe(0);
    expect(r.alpha[5 * 40 + 35]).toBe(0);
    expect(r.box.x).toBeLessThanOrEqual(10);
    expect(r.box.x + r.box.w - 1).toBeGreaterThanOrEqual(29);
    expect(r.box.y).toBeLessThanOrEqual(8);
    expect(r.box.y).toBeGreaterThan(4);
  });

  it('mép mềm theo độ tin cậy, không cắt cứng', () => {
    const m = mask(20, 20, [[5, 5, 14, 19]]);
    m[10 * 20 + 4] = 0.4; // sát người, chưa chắc là người
    const r = maskToAlpha(m, 20, 20)!;
    expect(r.alpha[10 * 20 + 4]).toBeGreaterThan(0);
    expect(r.alpha[10 * 20 + 4]).toBeLessThan(255);
  });

  it('không thấy người (mảng quá nhỏ) thì không tách', () => {
    expect(maskToAlpha(mask(50, 50, [[0, 0, 4, 4]]), 50, 50)).toBeNull();
    expect(maskToAlpha(new Float32Array(100), 10, 10)).toBeNull();
  });

  it('người đặt vừa khung, chạm đáy, giữa ngang', () => {
    const tall = fitBox({ x: 0, y: 0, w: 100, h: 400 });
    expect([tall.y + tall.h, tall.h]).toEqual([CUT_H, CUT_H]);
    expect(Math.abs(tall.x * 2 + tall.w - CUT_W)).toBeLessThanOrEqual(1);
    const wide = fitBox({ x: 0, y: 0, w: 400, h: 100 });
    expect([wide.w, wide.y + wide.h]).toEqual([CUT_W, CUT_H]);
  });

  it('lưu được lựa chọn giữ khung tròn, sai kiểu thì báo lỗi', () => {
    const s = (frame: unknown) => ({ ...emptyState(), settings: { ...emptyState().settings, readerCustom: { name: 'A', ta: 'cô', voice: 'nu', frame } } });
    expect(parsePersisted(JSON.parse(JSON.stringify(s(true)))).ok).toBe(true);
    expect(parsePersisted(s('co')).ok).toBe(false);
  });

  it('Cài đặt: có ảnh tách nền thì xem trước người đứng tự do, chọn được khung tròn', async () => {
    const data: Record<string, string> = { [READER_PHOTO_KEY]: 'data:image/jpeg;base64,AA', [READER_CUTOUT_KEY]: 'data:image/webp;base64,BB' };
    const kv = { get: async (k: string) => data[k] ?? null, set: async (k: string, v: string) => { data[k] = v; }, remove: async (k: string) => { delete data[k]; }, keys: async () => Object.keys(data) } as unknown as KV;
    await loadReaderPhoto(kv);
    const store = createStore<PersistedState>({ ...emptyState(), settings: { ...emptyState().settings, reader: 'custom' } });
    const { container } = render(<AppProvider store={store}><ReaderSection voices={[]} /></AppProvider>);
    const stage = screen.getByRole('img', { name: /Xem trước/ });
    expect(stage.querySelector('img')!.getAttribute('src')).toContain('webp');
    fireEvent.click(screen.getByRole('radio', { name: 'Khung tròn' }));
    expect(store.getState().settings.readerCustom?.frame).toBe(true);
    expect(stage.querySelector('img')!.getAttribute('src')).toContain('jpeg');
    fireEvent.click(screen.getByRole('radio', { name: 'Đứng tự do' }));
    expect(store.getState().settings.readerCustom?.frame).toBeUndefined();
    await act(() => removeReaderPhoto(kv));
    expect(data).toEqual({});
    expect(container.querySelector('[role="img"]')).toBeNull();
  });
});
