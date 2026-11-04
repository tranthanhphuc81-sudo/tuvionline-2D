/* Nút Back: Android dùng @capacitor/app `backButton`; trình duyệt dùng phím Esc và popstate (nút Back của trình duyệt). */
import { App } from '@capacitor/app';
import { createBackStack } from './backStack';
import { isNative } from './native';

export const backStack = createBackStack();

function run() {
  if (backStack.dispatch() === 'minimize' && isNative()) void App.minimizeApp();
}

let started = false;
/** Gắn listener một lần khi app khởi động. */
export function initBackButton(): void {
  if (started) return;
  started = true;
  if (isNative()) {
    void App.addListener('backButton', run);
    return;
  }
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !e.defaultPrevented) run();
  });
  // Giữ một mục lịch sử "bẫy" để nút Back của trình duyệt đi qua cùng bảng quy tắc.
  history.pushState({ lysoTrap: true }, '');
  window.addEventListener('popstate', () => {
    run();
    history.pushState({ lysoTrap: true }, '');
  });
}
