/* Lưu trữ khoá–giá trị. Trên Android dùng @capacitor/preferences (SharedPreferences native);
   trên web plugin tự dùng localStorage. Test dùng createMemoryKV(). (ARCHITECTURE.md mục 3) */
import { Preferences } from '@capacitor/preferences';

export interface KV {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
  keys(): Promise<string[]>;
}

export const preferencesKV: KV = {
  async get(key) { return (await Preferences.get({ key })).value; },
  async set(key, value) { await Preferences.set({ key, value }); },
  async remove(key) { await Preferences.remove({ key }); },
  async keys() { return (await Preferences.keys()).keys; },
};

export function createMemoryKV(init: Record<string, string> = {}): KV & { data: Map<string, string> } {
  const data = new Map(Object.entries(init));
  return {
    data,
    async get(key) { return data.has(key) ? data.get(key)! : null; },
    async set(key, value) { data.set(key, value); },
    async remove(key) { data.delete(key); },
    async keys() { return [...data.keys()]; },
  };
}

/** Đọc thẳng localStorage của WebView (bản cũ của app lưu `lyso-shared-v1`, `lyso-theme` ở đây). */
export function removeLocalStorage(key: string): void {
  try {
    if (typeof localStorage !== 'undefined') localStorage.removeItem(key);
  } catch {
    // WebView chặn localStorage thì không có gì để xoá
  }
}

export function readLocalStorage(key: string): string | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage.getItem(key);
  } catch {
    return null;
  }
}
