/* Ngữ cảnh app: store dữ liệu (hồ sơ, cài đặt) + store điều hướng. Component đọc bằng useApp/useNav. */
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { createStore, useStore, type Store } from '../state/store';
import type { PersistedState } from '../state/schema';
import type { BootNotice } from '../state/migrations';
import { currentRoute, goTo, initialRouter, pop, push, replaceTop, selectTab, type RouterState } from './router';
import type { Route, TabId } from './routes';

export interface AppCtx {
  store: Store<PersistedState>;
  nav: Store<RouterState>;
  notice: BootNotice | undefined;
  /** tăng mỗi lần thay toàn bộ dữ liệu; App dùng làm key để dựng lại mọi màn hình */
  epoch: number;
  /** về màn hình đầu, bỏ mọi ô nhập và trạng thái tạm của dữ liệu cũ */
  resetScreens(): void;
}

const Ctx = createContext<AppCtx | null>(null);

export function AppProvider({ store, nav, notice, children }: { store: Store<PersistedState>; nav?: Store<RouterState>; notice?: BootNotice; children: ReactNode }) {
  const navStore = useMemo(() => nav ?? createStore(initialRouter()), [nav]);
  const [epoch, setEpoch] = useState(0);
  const resetScreens = useCallback(() => { navStore.setState(initialRouter()); setEpoch((e) => e + 1); }, [navStore]);
  const value = useMemo(() => ({ store, nav: navStore, notice, epoch, resetScreens }), [store, navStore, notice, epoch, resetScreens]);
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
