/* Giữ màn hình sáng khi thầy đang đọc, vì người nghe không chạm vào máy nên màn hình dễ tự tắt và làm dừng đọc.
   Tạm dừng thì thôi giữ. Android dùng FLAG_KEEP_SCREEN_ON qua plugin nội bộ, trình duyệt dùng Wake Lock.
   Máy không làm được thì màn hình tắt theo cài đặt của máy, đọc thành lời vẫn chạy như thường. */
import { LySoDevice } from './device';
import { isNative } from './native';
import { readingState, subscribeReading } from './tts';

let wanted = false;
let lock: WakeLockSentinel | null = null;

async function lockBrowser(): Promise<void> {
  if (!('wakeLock' in navigator) || lock) return;
  try {
    const got = await navigator.wakeLock.request('screen');
    if (wanted) { lock = got; got.addEventListener('release', () => { if (lock === got) lock = null; }); }
    else void got.release(); // đọc đã dừng trong lúc chờ
  } catch { /* ví dụ máy đang tiết kiệm pin */ }
}

function setAwake(on: boolean): void {
  if (on === wanted) return;
  wanted = on;
  if (isNative()) { void LySoDevice.keepScreenOn({ on }).catch(() => { /* APK cũ chưa có lệnh này */ }); return; }
  if (on) { void lockBrowser(); return; }
  void lock?.release();
  lock = null;
}

/** Theo dõi trạng thái đọc từ lúc app khởi động. */
export function keepScreenOnWhileReading(): () => void {
  return subscribeReading(() => {
    const r = readingState();
    setAwake(!!r && !r.paused);
  });
}
