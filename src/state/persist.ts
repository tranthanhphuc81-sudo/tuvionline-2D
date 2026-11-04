/* Ghi store xuống bộ nhớ: gộp các lần ghi trong 300ms, ghi ngay khi app vào nền (ARCHITECTURE.md mục 3). */
import type { KV } from '../platform/storage';
import type { Store } from './store';
import { STATE_KEY, type PersistedState } from './schema';

export const WRITE_DEBOUNCE_MS = 300;

export function startPersistence(
  store: Store<PersistedState>,
  kv: KV,
  onPause: (cb: () => void) => () => void,
): { flush(force?: boolean): Promise<void>; stop(): void } {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let dirty = false;
  const flush = async (force = false) => {
    if (timer) { clearTimeout(timer); timer = null; }
    if (!dirty && !force) return;
    dirty = false;
    await kv.set(STATE_KEY, JSON.stringify(store.getState()));
  };
  const unsub = store.subscribe(() => {
    dirty = true;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => { void flush(); }, WRITE_DEBOUNCE_MS);
  });
  const unPause = onPause(() => { void flush(); });
  return { flush, stop() { unsub(); unPause(); if (timer) clearTimeout(timer); } };
}
