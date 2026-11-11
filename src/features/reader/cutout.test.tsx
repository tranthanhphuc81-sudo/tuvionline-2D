// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent, act } from '@testing-library/react';
import { AppProvider } from '../../app/context';
import { createStore } from '../../state/store';
import { emptyState, parsePersisted, type PersistedState } from '../../state/schema';
import { ReaderSection } from '../settings/ReaderSection';
import { CUT_H, CUT_W, fitBox, headClip, maskToAlpha } from './cutout';
import { loadReaderPhoto, READER_CUTOUT_KEY, READER_HEAD_KEY, READER_PHOTO_KEY, removeReaderPhoto } from './customPhoto';
import { withFace } from './faceRig';
import { chosenLook, faceBody, shownLook } from './ReaderFigure';
import thay from '../../assets/journey/character/thay.json';
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

  it('cắt đầu: giữ mặt và tóc, bỏ cổ vai; không có mặt nạ người thì cắt hình bầu dục', () => {
    const face = { x: 100, y: 100, w: 100, h: 100 };
    expect(headClip(150, 150, face, true)).toBe(1);
    expect(headClip(150, 230, face, true)).toBe(0); // cổ dưới cằm
    expect(headClip(60, 190, face, true)).toBe(0); // vai
    expect(headClip(150, 40, face, true)).toBe(1); // tóc cao trên đỉnh vẫn giữ theo mặt nạ
    expect(headClip(150, 40, face, false)).toBe(0);
    expect(headClip(70, 60, face, true)).toBe(1); // tóc xoà ngang
    expect(headClip(-40, 60, face, true)).toBe(0);
  });

  it('ghép mặt: bỏ nét vẽ của đầu, thêm lớp ảnh gắn vào đầu để cử động theo', () => {
    const out = withFace(thay, 'data:image/webp;base64,AA');
    const head = out.layers.find((l) => l.nm === 'đầu')!;
    const face = out.layers.find((l) => l.nm === 'mặt người dùng') as unknown as { ty: number; parent: number; refId: string };
    expect(head.shapes).toEqual([]);
    expect([face.ty, face.parent, face.refId]).toEqual([2, head.ind, 'userHead']);
    expect(out.layers.indexOf(face as never)).toBe(out.layers.indexOf(head) - 1); // ngay trên lớp đầu
    expect(out.assets).toContainEqual(expect.objectContaining({ id: 'userHead', p: 'data:image/webp;base64,AA', e: 1 }));
    expect(thay.layers.find((l) => l.nm === 'đầu')!.shapes.length).toBeGreaterThan(0); // không sửa file gốc
    const noHead = { layers: [{ nm: 'thân' }] };
    expect(withFace(noHead, 'x')).toBe(noHead);
  });

  it('cách hiện: theo lựa chọn, thiếu bản nào thì lùi về bản có', () => {
    const all = { photo: 'p', cutout: 'c', head: 'h' };
    expect(chosenLook(undefined)).toBe('stand');
    expect(chosenLook({ name: 'A', ta: 'cô', voice: 'nu', frame: true })).toBe('frame');
    expect(chosenLook({ name: 'A', ta: 'cô', voice: 'nu', frame: true, look: 'face' })).toBe('face');
    expect(shownLook('face', all)).toBe('face');
    expect(shownLook('face', { ...all, head: null })).toBe('stand');
    expect(shownLook('face', { ...all, head: null, cutout: null })).toBe('frame');
    expect(shownLook('stand', { ...all, cutout: null })).toBe('frame');
    expect(shownLook('frame', all)).toBe('frame');
    expect(shownLook('stand', { photo: null, cutout: null, head: null })).toBeNull();
    expect([faceBody({ name: 'A', ta: 'cô', voice: 'nu' }), faceBody(undefined)]).toEqual(['co-do', 'thay']);
  });

  it('lưu được cách hiện ảnh, sai kiểu thì báo lỗi', () => {
    const s = (extra: object) => ({ ...emptyState(), settings: { ...emptyState().settings, readerCustom: { name: 'A', ta: 'cô', voice: 'nu', ...extra } } });
    expect(parsePersisted(JSON.parse(JSON.stringify(s({ frame: true })))).ok).toBe(true);
    expect(parsePersisted(JSON.parse(JSON.stringify(s({ look: 'face' })))).ok).toBe(true);
    expect(parsePersisted(s({ frame: 'co' })).ok).toBe(false);
    expect(parsePersisted(s({ look: 'mat' })).ok).toBe(false);
  });

  it('Cài đặt: xem trước người đứng tự do, chọn được ghép mặt (có màu áo) và khung tròn', async () => {
    const data: Record<string, string> = { [READER_PHOTO_KEY]: 'data:image/jpeg;base64,AA', [READER_CUTOUT_KEY]: 'data:image/webp;base64,BB', [READER_HEAD_KEY]: 'data:image/webp;base64,CC' };
    const kv = { get: async (k: string) => data[k] ?? null, set: async (k: string, v: string) => { data[k] = v; }, remove: async (k: string) => { delete data[k]; }, keys: async () => Object.keys(data) } as unknown as KV;
    await loadReaderPhoto(kv);
    const store = createStore<PersistedState>({ ...emptyState(), settings: { ...emptyState().settings, reader: 'custom' } });
    const { container } = render(<AppProvider store={store}><ReaderSection voices={[]} /></AppProvider>);
    const stage = screen.getByRole('img', { name: /Xem trước/ });
    expect(stage.querySelector('img')!.getAttribute('src')).toContain('webp');
    expect(screen.queryByRole('radiogroup', { name: 'Màu áo' })).toBeNull();
    fireEvent.click(screen.getByRole('radio', { name: 'Ghép mặt' }));
    expect(store.getState().settings.readerCustom?.look).toBe('face');
    expect(stage.querySelector('img')).toBeNull(); // nhân vật Lottie thay cho ảnh
    fireEvent.click(screen.getByRole('radio', { name: /^Đỏ son/ }));
    expect(store.getState().settings.readerRobe).toBe('son');
    fireEvent.click(screen.getByRole('radio', { name: 'Khung tròn' }));
    expect(store.getState().settings.readerCustom?.look).toBe('frame');
    expect(stage.querySelector('img')!.getAttribute('src')).toContain('jpeg');
    fireEvent.click(screen.getByRole('radio', { name: 'Đứng tự do' }));
    expect(store.getState().settings.readerCustom?.look).toBe('stand');
    await act(() => removeReaderPhoto(kv));
    expect(data).toEqual({});
    expect(container.querySelector('[role="img"]')).toBeNull();
  });
});
