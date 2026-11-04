/* Mọi thay đổi trạng thái đi qua các hàm đặt tên rõ ở đây — test được không cần React (ARCHITECTURE.md mục 2). */
import { resolveBirth, type BirthError } from '../core';
import type { Store } from './store';
import type { Huong } from '../core';
import { newId } from './ids';
import type { PersistedState, Profile, Settings } from './schema';

export type AppStore = Store<PersistedState>;
export type ProfileInput = Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>;

/** Kiểm tra hồ sơ trước khi lưu: tên không rỗng, ngày có thật (âm lịch thì đổi qua lại). */
export function validateProfile(p: ProfileInput): { ok: true } | { ok: false; nameMissing: boolean; birth?: BirthError } {
  const nameMissing = p.name.trim() === '';
  const r = resolveBirth(p);
  if (!nameMissing && r.ok) return { ok: true };
  return { ok: false, nameMissing, birth: r.ok ? undefined : r.errors[0] };
}

function clean(p: ProfileInput): ProfileInput {
  return { ...p, name: p.name.trim(), leapMonth: p.calendar === 'lunar' && p.leapMonth, lateTy: p.hourIdx === 0 && p.lateTy };
}

const nowIso = () => new Date().toISOString();

/** Thêm hồ sơ; nếu chưa có ai đang xem thì chọn luôn hồ sơ mới. Trả id. Ném lỗi nếu hồ sơ không hợp lệ. */
export function addProfile(store: AppStore, input: ProfileInput, now = nowIso()): string {
  if (!validateProfile(input).ok) throw new Error('Hồ sơ không hợp lệ');
  const p: Profile = { ...clean(input), id: newId(), createdAt: now, updatedAt: now };
  store.setState((s) => ({ ...s, profiles: [...s.profiles, p], activeProfileId: s.activeProfileId ?? p.id }));
  return p.id;
}

export function updateProfile(store: AppStore, id: string, input: ProfileInput, now = nowIso()): void {
  if (!validateProfile(input).ok) throw new Error('Hồ sơ không hợp lệ');
  store.setState((s) => {
    if (!s.profiles.some((p) => p.id === id)) return s;
    return { ...s, profiles: s.profiles.map((p) => (p.id === id ? { ...p, ...clean(input), updatedAt: now } : p)) };
  });
}

/** Xoá hồ sơ; nếu đang xem thì chuyển sang hồ sơ đầu tiên còn lại; bỏ cặp hợp hôn có hồ sơ này. */
export function removeProfile(store: AppStore, id: string): void {
  store.setState((s) => {
    if (!s.profiles.some((p) => p.id === id)) return s;
    const profiles = s.profiles.filter((p) => p.id !== id);
    const activeProfileId = s.activeProfileId === id ? (profiles[0]?.id ?? null) : s.activeProfileId;
    const tools = { ...s.tools };
    if (tools.napAmPair?.includes(id)) delete tools.napAmPair;
    return { ...s, profiles, activeProfileId, tools };
  });
}

export function setActiveProfile(store: AppStore, id: string): void {
  store.setState((s) => (s.profiles.some((p) => p.id === id) && s.activeProfileId !== id ? { ...s, activeProfileId: id } : s));
}

export function setSetting<K extends keyof Settings>(store: AppStore, key: K, value: Settings[K]): void {
  store.setState((s) => (s.settings[key] === value ? s : { ...s, settings: { ...s.settings, [key]: value } }));
}

export function setLucHaoCast(
  store: AppStore, tosses: number[], now = nowIso(),
  extra: { method?: 'random' | 'manual'; date?: [number, number, number] } = {},
): void {
  if (tosses.length !== 6 || !tosses.every((t) => Number.isInteger(t) && t >= 6 && t <= 9)) throw new Error('Quẻ không hợp lệ');
  store.setState((s) => ({ ...s, tools: { ...s.tools, lucHaoLastCast: { tosses: [...tosses], castAt: now, ...extra } } }));
}

/** Đổi ngày xem của quẻ đang giữ (không gieo lại). */
export function setLucHaoDate(store: AppStore, date: [number, number, number]): void {
  store.setState((s) => (s.tools.lucHaoLastCast ? { ...s, tools: { ...s.tools, lucHaoLastCast: { ...s.tools.lucHaoLastCast, date } } } : s));
}

/** Lưu hướng cửa; `undefined` = chưa xét căn nhà cụ thể. */
export function setBatTrachHuongCua(store: AppStore, huong: Huong | undefined): void {
  store.setState((s) => {
    const tools = { ...s.tools };
    if (huong) tools.batTrachHuongCua = huong; else delete tools.batTrachHuongCua;
    return { ...s, tools };
  });
}

/** Lưu cặp hồ sơ hợp hôn; `undefined` = không còn đủ hai hồ sơ để lưu. */
export function setNapAmPair(store: AppStore, pair: [string, string] | undefined): void {
  store.setState((s) => {
    const tools = { ...s.tools };
    if (pair) tools.napAmPair = pair; else delete tools.napAmPair;
    return { ...s, tools };
  });
}

/** Ghi nhận đã qua lối vào. Bấm "Bỏ qua" cũng tính, để lần sau không bắt xem lại bản đầy đủ. */
export function markJourney(store: AppStore, today: string, full: boolean): void {
  store.setState((s) => ({ ...s, tools: { ...s.tools, journey: { firstDone: true, lastFullDate: full ? today : s.tools.journey?.lastFullDate } } }));
}

/** Lưu độ lệch hiệu chỉnh của La Bàn (−45…45). */
export function setLaBanCalib(store: AppStore, deg: number): void {
  store.setState((s) => ({ ...s, tools: { ...s.tools, laBanCalib: deg } }));
}

export function selectActiveProfile(s: PersistedState): Profile | null {
  return s.profiles.find((p) => p.id === s.activeProfileId) ?? null;
}
