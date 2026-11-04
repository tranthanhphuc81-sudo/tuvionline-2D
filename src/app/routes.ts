/* Danh sách tab và route có kiểu (ARCHITECTURE.md mục 1). Phase 3 thêm route con của từng công cụ. */
export type TabId = 'home' | 'tuvi' | 'battu' | 'luchao' | 'phongthuy';

export const TABS: readonly { id: TabId; icon: string; label: string }[] = [
  { id: 'home', icon: '🏠', label: 'Tổng hợp' },
  { id: 'tuvi', icon: '🔮', label: 'Tử Vi' },
  { id: 'battu', icon: '📜', label: 'Bát Tự' },
  { id: 'luchao', icon: '☯', label: 'Lục Hào' },
  { id: 'phongthuy', icon: '🧭', label: 'Phong thủy' },
];

export type PhongThuySub = 'battrach' | 'laban' | 'napam';

export type Route =
  | { name: 'home' }
  | { name: 'tuvi' }
  | { name: 'battu' }
  | { name: 'luchao' }
  | { name: 'phongthuy'; sub?: PhongThuySub }
  | { name: 'profiles' }
  | { name: 'profiles.edit'; id?: string }
  | { name: 'settings' };

export function rootRoute(tab: TabId): Route {
  return { name: tab } as Route;
}
