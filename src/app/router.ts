/* Router nhỏ tự viết (ARCHITECTURE.md mục 1.2): mỗi tab một ngăn xếp màn hình, không dùng URL.
   Các hàm ở đây là hàm thuần trên RouterState — test được; App giữ state trong một Store. */
import { rootRoute, TABS, type Route, type TabId } from './routes';

export interface RouterState { tab: TabId; stacks: Record<TabId, Route[]> }

export function initialRouter(): RouterState {
  const stacks = {} as Record<TabId, Route[]>;
  for (const t of TABS) stacks[t.id] = [rootRoute(t.id)];
  return { tab: 'home', stacks };
}

export function currentRoute(s: RouterState): Route {
  const st = s.stacks[s.tab];
  return st[st.length - 1];
}

/** Chuyển tab. Chạm lại tab đang mở thì về gốc tab đó. */
export function selectTab(s: RouterState, tab: TabId): RouterState {
  if (tab === s.tab) {
    if (s.stacks[tab].length === 1) return s;
    return { ...s, stacks: { ...s.stacks, [tab]: [s.stacks[tab][0]] } };
  }
  return { ...s, tab };
}

/** Mở màn hình con trên tab hiện tại. */
export function push(s: RouterState, route: Route): RouterState {
  return { ...s, stacks: { ...s.stacks, [s.tab]: [...s.stacks[s.tab], route] } };
}

/** Thay màn hình trên cùng (ví dụ đổi tab con Bát Trạch/La Bàn/Nạp Âm). */
export function replaceTop(s: RouterState, route: Route): RouterState {
  const st = s.stacks[s.tab];
  return { ...s, stacks: { ...s.stacks, [s.tab]: [...st.slice(0, -1), route] } };
}

export function pop(s: RouterState): RouterState {
  const st = s.stacks[s.tab];
  if (st.length <= 1) return s;
  return { ...s, stacks: { ...s.stacks, [s.tab]: st.slice(0, -1) } };
}

/** Bảng quy tắc Back (mục 1.3, bước 2–4) sau khi các trình xử lý đăng ký (bảng chọn, hộp thoại) đã bỏ qua:
    còn màn hình con → lùi; đang ở tab khác → về Tổng hợp; ở gốc Tổng hợp → thu nhỏ app. */
export function routerBack(s: RouterState): { state: RouterState; action: 'handled' | 'minimize' } {
  if (s.stacks[s.tab].length > 1) return { state: pop(s), action: 'handled' };
  if (s.tab !== 'home') return { state: { ...s, tab: 'home' }, action: 'handled' };
  return { state: s, action: 'minimize' };
}
