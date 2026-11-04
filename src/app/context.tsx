/* Ngữ cảnh app: store dữ liệu (hồ sơ, cài đặt) + store điều hướng. Component đọc bằng useApp/useNav. */
import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { createStore, useStore, type Store } from '../state/store';
import type { PersistedState } from '../state/schema';
import type { BootNotice } from '../state/migrations';
import { currentRoute, goTo, initialRouter, pop, push, replaceTop, selectTab, type RouterState } from './router';
import type { Route, TabId } from './routes';

export interface AppCtx {
  store: Store<PersistedState>;
  nav: Store<RouterState>;
  notice: BootNotice | undefined;
}

const Ctx = createContext<AppCtx | null>(null);

export function AppProvider({ store, nav, notice, children }: { store: Store<PersistedState>; nav?: Store<RouterState>; notice?: BootNotice; children: ReactNode }) {
  const navStore = useMemo(() => nav ?? createStore(initialRouter()), [nav]);
  const value = useMemo(() => ({ store, nav: navStore, notice }), [store, navStore, notice]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppCtx(): AppCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error('Thiếu AppProvider');
  return c;
}

/** Đọc một phần dữ liệu app. */
export function useApp<S>(selector: (s: PersistedState) => S): S {
  return useStore(useAppCtx().store, selector);
}

export interface Nav {
  tab: TabId;
  route: Route;
  depth: number;
  selectTab(t: TabId): void;
  push(r: Route): void;
  replace(r: Route): void;
  back(): void;
  goTo(t: TabId, r: Route): void;
}

export function useNav(): Nav {
  const { nav } = useAppCtx();
  const s = useStore(nav, (x) => x);
  return useMemo(() => ({
    tab: s.tab,
    route: currentRoute(s),
    depth: s.stacks[s.tab].length,
    selectTab: (t) => nav.setState((x) => selectTab(x, t)),
    push: (r) => nav.setState((x) => push(x, r)),
    replace: (r) => nav.setState((x) => replaceTop(x, r)),
    back: () => nav.setState((x) => pop(x)),
    goTo: (t, r) => nav.setState((x) => goTo(x, t, r)),
  }), [s, nav]);
}
