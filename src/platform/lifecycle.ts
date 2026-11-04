/* Vòng đời app: phát `pause` khi app vào nền (ghi dữ liệu ngay, Phase 5–6 dừng đọc/âm thanh). */
import { App } from '@capacitor/app';
import { isNative } from './native';

type Unsub = () => void;

export function onPause(cb: () => void): Unsub {
  if (isNative()) {
    const h = App.addListener('pause', cb);
    return () => { void h.then((x) => x.remove()); };
  }
  const vis = () => { if (document.visibilityState === 'hidden') cb(); };
  document.addEventListener('visibilitychange', vis);
  window.addEventListener('pagehide', cb);
  return () => { document.removeEventListener('visibilitychange', vis); window.removeEventListener('pagehide', cb); };
}

export function onResume(cb: () => void): Unsub {
  if (isNative()) {
    const h = App.addListener('resume', cb);
    return () => { void h.then((x) => x.remove()); };
  }
  const vis = () => { if (document.visibilityState === 'visible') cb(); };
  document.addEventListener('visibilitychange', vis);
  return () => document.removeEventListener('visibilitychange', vis);
}
