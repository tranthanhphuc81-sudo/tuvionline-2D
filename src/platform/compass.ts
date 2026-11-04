/* Cảm biến la bàn (ARCHITECTURE.md mục 11). Android: plugin nội bộ LySoDevice (có độ tin cậy). Trình duyệt: `deviceorientationabsolute`,
   chỉ để chạy `npm run dev`. KHÔNG dùng `deviceorientation` thường vì không phải hướng Bắc. */
import type { PluginListenerHandle } from '@capacitor/core';
import { LySoDevice } from './device';
import { isNative } from './native';
import { onResume } from './lifecycle';

export interface CompassReading {
  /** 0–360°, Bắc từ, đã tính theo chiều màn hình */
  heading: number;
  /** SensorManager: −1, 0 không tin cậy · 1 thấp · 2 vừa · 3 cao; null = không biết */
  accuracy: number | null;
  headingErrorDeg: number | null;
  /** máy dựng đứng, hướng kém ổn định */
  tilted: boolean;
}
export type CompassStart = { ok: true; stop(): void } | { ok: false };

interface NativeReading { heading: number; accuracy?: number; headingErrorDeg?: number; tilted: boolean }
interface LySoCompassPlugin {
  start(): Promise<{ available: boolean }>;
  stop(): Promise<void>;
  addListener(event: 'heading', cb: (r: NativeReading) => void): Promise<PluginListenerHandle>;
}
const Native = LySoDevice as unknown as LySoCompassPlugin;

async function startNative(onReading: (r: CompassReading) => void): Promise<CompassStart> {
  const handle = await Native.addListener('heading', (r) => onReading({
    heading: r.heading, accuracy: r.accuracy ?? null, headingErrorDeg: r.headingErrorDeg ?? null, tilted: r.tilted,
  }));
  const { available } = await Native.start();
  if (!available) { void handle.remove(); return { ok: false }; }
  return { ok: true, stop() { void handle.remove(); void Native.stop(); } };
}

function startWeb(onReading: (r: CompassReading) => void): CompassStart {
  if (!('ondeviceorientationabsolute' in window)) return { ok: false };
  const fn = (e: DeviceOrientationEvent) => {
    if (e.alpha === null) return;
    onReading({ heading: (360 - e.alpha + (screen.orientation?.angle ?? 0)) % 360, accuracy: null, headingErrorDeg: null, tilted: false });
  };
  const target = window as unknown as { addEventListener(t: string, f: typeof fn, c: boolean): void; removeEventListener(t: string, f: typeof fn, c: boolean): void };
  target.addEventListener('deviceorientationabsolute', fn, true);
  return { ok: true, stop() { target.removeEventListener('deviceorientationabsolute', fn, true); } };
}

/** Bắt đầu đo. `{ ok: false }` = máy không có cảm biến hướng. Không bao giờ ném lỗi. */
export async function startCompass(onReading: (r: CompassReading) => void): Promise<CompassStart> {
  try {
    return isNative() ? await startNative(onReading) : startWeb(onReading);
  } catch {
    return { ok: false };
  }
}

/** Giữ màn hình sáng khi đang đo; hàm trả về để thôi giữ. Hệ thống tự nhả khi app vào nền nên phải xin lại khi quay về. */
export function keepScreenOn(): () => void {
  let lock: WakeLockSentinel | null = null;
  let done = false;
  const acquire = async () => {
    try {
      const l = await navigator.wakeLock.request('screen');
      if (done) void l.release(); else lock = l;
    } catch { /* máy không hỗ trợ: màn hình tắt theo cài đặt của máy */ }
  };
  void acquire();
  const off = onResume(() => { void acquire(); });
  return () => { done = true; off(); void lock?.release(); };
}
