/* Áp chủ đề: data-theme trên <html> (system → bỏ thuộc tính, theo prefers-color-scheme), cập nhật thẻ theme-color. */
import type { Theme } from '../state/schema';

export function applyTheme(theme: Theme, doc: Document = document): void {
  const root = doc.documentElement;
  if (theme === 'system') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', theme);
  const bg = getComputedStyle(root).getPropertyValue('--bg').trim();
  let meta = doc.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (!meta) {
    meta = doc.createElement('meta');
    meta.name = 'theme-color';
    doc.head.appendChild(meta);
  }
  if (bg) meta.content = bg;
}

/** Gọi lại `cb` khi chủ đề hệ thống đổi (chỉ có ý nghĩa với theme = 'system'). */
export function onSystemThemeChange(cb: () => void): () => void {
  if (typeof matchMedia !== 'function') return () => {};
  const mq = matchMedia('(prefers-color-scheme: light)');
  mq.addEventListener('change', cb);
  return () => mq.removeEventListener('change', cb);
}
