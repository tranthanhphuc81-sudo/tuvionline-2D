/* Thông tin máy qua plugin nội bộ LySoDevice (ARCHITECTURE.md mục 12.2). */
import { registerPlugin } from '@capacitor/core';
import { isNative } from './native';

interface LySoDevicePlugin {
  ringerMode(): Promise<{ mode: 'normal' | 'vibrate' | 'silent' }>;
  keepScreenOn(options: { on: boolean }): Promise<void>;
}
export const LySoDevice = registerPlugin<LySoDevicePlugin & Record<string, unknown>>('LySoDevice');

/** Nhạc nền chỉ phát khi chuông đang bật. Không đọc được chế độ của máy thì im lặng cho chắc. Trình duyệt luôn cho phép. */
export async function soundAllowed(): Promise<boolean> {
  if (!isNative()) return true;
  try {
    return (await LySoDevice.ringerMode()).mode === 'normal';
  } catch {
    return false;
  }
}
