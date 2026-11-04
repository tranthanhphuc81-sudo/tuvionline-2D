/* Store tự viết (ARCHITECTURE.md mục 2): getState / setState / subscribe, React đọc qua useSyncExternalStore. */
import { useSyncExternalStore } from 'react';

export interface Store<T> {
  getState(): T;
  setState(next: T | ((prev: T) => T)): void;
  subscribe(listener: () => void): () => void;
}

export function createStore<T>(initial: T): Store<T> {
  let state = initial;
  const listeners = new Set<() => void>();
  return {
    getState: () => state,
    setState(next) {
      const n = typeof next === 'function' ? (next as (p: T) => T)(state) : next;
      if (Object.is(n, state)) return;
      state = n;
      for (const l of [...listeners]) l();
    },
    subscribe(l) {
      listeners.add(l);
      return () => { listeners.delete(l); };
    },
  };
}

/** Đọc một phần store; component chỉ render lại khi phần đó đổi (so bằng Object.is). */
export function useStore<T, S>(store: Store<T>, selector: (s: T) => S): S {
  return useSyncExternalStore(store.subscribe, () => selector(store.getState()), () => selector(store.getState()));
}
