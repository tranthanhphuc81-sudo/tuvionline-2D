import { Capacitor } from '@capacitor/core';

/** Đang chạy trong app Android (Capacitor) hay trên trình duyệt (`npm run dev`). */
export function isNative(): boolean {
  return Capacitor.isNativePlatform();
}
