/* Lưu trữ khoá–giá trị. Trên Android dùng @capacitor/preferences (SharedPreferences native);
   trên web plugin tự dùng localStorage. Test dùng createMemoryKV(). (ARCHITECTURE.md mục 3) */
import { Preferences } from '@capacitor/preferences';

export interface KV {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
}

export const preferencesKV: KV = {
  async get(key) { return (await Preferences.get({ key })).value; },
  async set(key, value) { await Preferences.set({ key, value }); },
  async remove(key) { await Preferences.remove({ key }); },
};

export function createMemoryKV(init: Record<string, string> = {}): KV & { data: Map<string, string> } {
  const data = new Map(Object.entries(init));
  return {
    data,
    async get(key) { return data.has(key) ? data.get(key)! : null; },
    async set(key, value) { data.set(key, value); },
    async remove(key) { data.delete(key); },
  };
}

/** Đọc thẳng localStorage của WebView (trang legacy cùng origin lưu `lyso-shared-v1`, `lyso-theme` ở đây). */
export function readLocalStorage(key: string): string | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage.getItem(key);
  } catch {
    return null;
  }
}
