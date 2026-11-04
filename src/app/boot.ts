/* Khởi động: nạp + nâng cấp dữ liệu, bật ghi tự động, áp chủ đề, gắn nút Back vào bảng quy tắc của router. */
import { createStore, type Store } from '../state/store';
import type { PersistedState } from '../state/schema';
import { LEGACY_SHARED_KEY, LEGACY_THEME_KEY, loadState, type BootNotice } from '../state/migrations';
import { startPersistence } from '../state/persist';
import { preferencesKV, readLocalStorage } from '../platform/storage';
import { onPause } from '../platform/lifecycle';
import { backStack, initBackButton } from '../platform/back';
import { applyTheme, onSystemThemeChange } from '../ui/theme';
import { initialRouter, routerBack, type RouterState } from './router';

export interface Booted { store: Store<PersistedState>; nav: Store<RouterState>; notice?: BootNotice }

export async function boot(): Promise<Booted> {
  const loaded = await loadState(preferencesKV, { shared: readLocalStorage(LEGACY_SHARED_KEY), theme: readLocalStorage(LEGACY_THEME_KEY) });
  const store = createStore(loaded.state);
  const persist = startPersistence(store, preferencesKV, onPause);
  // Lần đầu (hoặc vừa chuyển từ bản 0.1 / dữ liệu hỏng): ghi ngay để không chạy lại migration.
  if (!loaded.fromStorage) await persist.flush(true);

  let theme = store.getState().settings.theme;
  applyTheme(theme);
  store.subscribe(() => {
    const t = store.getState().settings.theme;
    if (t !== theme) { theme = t; applyTheme(t); }
  });
  onSystemThemeChange(() => applyTheme(store.getState().settings.theme));

  const nav = createStore(initialRouter());
  backStack.setFallback(() => {
    const r = routerBack(nav.getState());
    nav.setState(r.state);
    return r.action;
  });
  initBackButton();
  return { store, nav, notice: loaded.notice };
}
