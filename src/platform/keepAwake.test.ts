// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const env = vi.hoisted(() => ({ native: false }));
const device = vi.hoisted(() => ({ keepScreenOn: vi.fn() }));
const reading = vi.hoisted(() => ({ state: null as { paused: boolean } | null, notify: () => {} }));
vi.mock('./native', () => ({ isNative: () => env.native }));
vi.mock('./device', () => ({ LySoDevice: device }));
vi.mock('./tts', () => ({
  readingState: () => reading.state,
  subscribeReading: (f: () => void) => { reading.notify = f; return () => {}; },
}));

const release = vi.fn(async () => {});
const request = vi.fn();
const flush = () => new Promise((r) => setTimeout(r));
const set = async (state: { paused: boolean } | null) => { reading.state = state; reading.notify(); await flush(); };

beforeEach(async () => {
  vi.resetModules();
  env.native = false;
  reading.state = null;
  release.mockClear();
  device.keepScreenOn.mockReset();
  device.keepScreenOn.mockResolvedValue(undefined);
  request.mockReset();
  request.mockImplementation(async () => ({ release, addEventListener: () => {} }));
  Object.defineProperty(navigator, 'wakeLock', { value: { request }, configurable: true });
  (await import('./keepAwake')).keepScreenOnWhileReading();
});
afterEach(() => { Reflect.deleteProperty(navigator, 'wakeLock'); });

describe('giữ màn hình sáng khi thầy đọc', () => {
  it('chưa đọc thì không giữ', async () => {
    await set(null);
    expect(request).not.toHaveBeenCalled();
  });

  it('đọc thì giữ, qua đoạn mới không xin lại, đọc xong thì thả', async () => {
    await set({ paused: false });
    await set({ paused: false });
    expect(request).toHaveBeenCalledTimes(1);
    expect(request).toHaveBeenCalledWith('screen');
    await set(null);
    expect(release).toHaveBeenCalledTimes(1);
  });

  it('tạm dừng thì thả, đọc tiếp thì giữ lại', async () => {
    await set({ paused: false });
    await set({ paused: true });
    expect(release).toHaveBeenCalledTimes(1);
    await set({ paused: false });
    expect(request).toHaveBeenCalledTimes(2);
  });

  it('đọc dừng ngay khi đang xin khoá: thả luôn khoá vừa có', async () => {
    reading.state = { paused: false }; reading.notify();
    await set(null);
    expect(release).toHaveBeenCalledTimes(1);
  });

  it('bị từ chối hoặc không hỗ trợ: không lỗi', async () => {
    request.mockRejectedValueOnce(new Error('NotAllowedError'));
    await expect(set({ paused: false })).resolves.toBeUndefined();
    await set(null);
    Reflect.deleteProperty(navigator, 'wakeLock');
    await expect(set({ paused: false })).resolves.toBeUndefined();
  });

  it('Android gọi plugin, không dùng Wake Lock; APK cũ thiếu lệnh cũng không lỗi', async () => {
    env.native = true;
    await set({ paused: false });
    expect(device.keepScreenOn).toHaveBeenLastCalledWith({ on: true });
    device.keepScreenOn.mockRejectedValue(new Error('not implemented'));
    await set(null);
    expect(device.keepScreenOn).toHaveBeenLastCalledWith({ on: false });
    expect(request).not.toHaveBeenCalled();
  });
});
