// @vitest-environment jsdom
/* Màn nạp khi cần (ARCHITECTURE 4.2, 27/11/2026). */
import { describe, it, expect, afterEach } from 'vitest';
import { Suspense, useState } from 'react';
import { render, screen, act, cleanup, fireEvent } from '@testing-library/react';
import { lazyScreen } from './lazyScreen';
import { ScreenBoundary } from './ScreenBoundary';

afterEach(cleanup);

function Counter({ label }: { label: string }) {
  const [n, setN] = useState(0);
  return <button type="button" onClick={() => setN(n + 1)}>{label} {n}</button>;
}
const deferred = () => { let resolve!: (m: { Counter: typeof Counter }) => void; const p = new Promise<{ Counter: typeof Counter }>((r) => { resolve = r; }); return { p, resolve }; };

describe('lazyScreen', () => {
  it('chưa tải: hiện màn chờ của Suspense rồi tới màn thật; tải một lần dù gọi nhiều lần', async () => {
    const d = deferred(); let calls = 0;
    const S = lazyScreen(() => { calls++; return d.p; }, (m) => m.Counter);
    render(<Suspense fallback={<p>Đang mở</p>}><S label="A" /></Suspense>);
    expect(screen.getByText('Đang mở')).toBeTruthy();
    void S.preload(); void S.preload();
    await act(async () => { d.resolve({ Counter }); await d.p; });
    expect(screen.getByRole('button', { name: 'A 0' })).toBeTruthy();
    expect(calls).toBe(1);
  });

  it('đã tải sẵn: dựng ngay, không qua màn chờ', async () => {
    const S = lazyScreen(() => Promise.resolve({ Counter }), (m) => m.Counter);
    await S.preload();
    render(<Suspense fallback={<p>Đang mở</p>}><S label="B" /></Suspense>);
    expect(screen.queryByText('Đang mở')).toBeNull();
    expect(screen.getByRole('button', { name: 'B 0' })).toBeTruthy();
  });

  it('dựng trước khi tải xong: gói về rồi dựng lại vẫn giữ trạng thái (không đổi loại component giữa chừng)', async () => {
    const d = deferred();
    const S = lazyScreen(() => d.p, (m) => m.Counter);
    const { rerender } = render(<Suspense fallback={<p>Đang mở</p>}><S label="C" /></Suspense>);
    await act(async () => { d.resolve({ Counter }); await d.p; });
    fireEvent.click(screen.getByRole('button', { name: 'C 0' }));
    rerender(<Suspense fallback={<p>Đang mở</p>}><S label="C" /></Suspense>);
    expect(screen.getByRole('button', { name: 'C 1' })).toBeTruthy();
  });

  it('tải lỗi (mất mạng) thì lần sau thử lại', async () => {
    let n = 0;
    const S = lazyScreen(() => (++n === 1 ? Promise.reject(new Error('mạng')) : Promise.resolve({ Counter })), (m) => m.Counter);
    await expect(S.preload()).rejects.toThrow('mạng');
    await S.preload();
    expect(n).toBe(2);
  });

  it('ScreenBoundary: tải gói lỗi thì chỉ màn đó báo lỗi kèm "Thử lại"; thử lại được thì hiện màn', async () => {
    let n = 0;
    const S = lazyScreen(() => (++n === 1 ? Promise.reject(new Error('mạng')) : Promise.resolve({ Counter })), (m) => m.Counter);
    const quiet = console.error; console.error = () => {};
    try {
      render(<div><p>phần khác của app</p><ScreenBoundary what="Bát Tự" retry={S.preload}><S label="D" /></ScreenBoundary></div>);
      expect(screen.getByRole('status').textContent).toBe('Đang mở Bát Tự…');
      await act(async () => { await S.preload().catch(() => {}); await new Promise((r) => setTimeout(r, 0)); });
      expect(screen.getByRole('alert').textContent).toMatch(/^Chưa mở được Bát Tự/);
      expect(screen.getByText('phần khác của app')).toBeTruthy();
      await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Thử lại' })); await new Promise((r) => setTimeout(r, 0)); });
      expect(screen.getByRole('button', { name: 'D 0' })).toBeTruthy();
      expect(screen.queryByRole('alert')).toBeNull();
    } finally { console.error = quiet; }
  });
});
