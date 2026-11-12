/* Mọi thay đổi trạng thái đi qua các hàm đặt tên rõ ở đây — test được không cần React (ARCHITECTURE.md mục 2). */
import { resolveBirth, type BirthError } from '../core';
import type { Store } from './store';
import type { Huong } from '../core';
import { newId } from './ids';
import { PALM_SESSION_VERSION, birthKeyOf, type NguHanhAnswer, type NguHanhOutcome, type NguHanhTarget, type PalmSession, type PersistedState, type Profile, type Settings } from './schema';

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
    const old = s.profiles.find((p) => p.id === id)!;
    const next = { ...old, ...clean(input), updatedAt: now };
    // Đổi ngày giờ sinh thì câu trả lời kiểm chứng ngũ hành cũ không còn dùng được (ARCHITECTURE 14.6)
    const nguHanhAnswers = birthKeyOf(next) === birthKeyOf(old) ? s.nguHanhAnswers : s.nguHanhAnswers.filter((a) => a.profileId !== id);
    return { ...s, profiles: s.profiles.map((p) => (p.id === id ? next : p)), nguHanhAnswers };
  });
}

/** Ghi câu trả lời kiểm chứng cho một mốc đã qua; trả lời lại cùng mốc thì ghi đè. */
export function setNguHanhAnswer(store: AppStore, profileId: string, target: NguHanhTarget, outcome: NguHanhOutcome, now = nowIso()): void {
  store.setState((s) => {
    const p = s.profiles.find((x) => x.id === profileId);
    if (!p) return s;
    const same = (a: NguHanhAnswer) => a.profileId === profileId && a.target.kind === target.kind
      && (a.target.kind === 'nam' ? a.target.year === (target as { year: number }).year : a.target.index === (target as { index: number }).index);
    return { ...s, nguHanhAnswers: [...s.nguHanhAnswers.filter((a) => !same(a)), { profileId, birthKey: birthKeyOf(p), target, outcome, answeredAt: now }] };
  });
}

/** "Làm lại": xoá mọi câu trả lời kiểm chứng ngũ hành của một hồ sơ. */
export function clearNguHanhAnswers(store: AppStore, profileId: string): void {
  store.setState((s) => (s.nguHanhAnswers.some((a) => a.profileId === profileId) ? { ...s, nguHanhAnswers: s.nguHanhAnswers.filter((a) => a.profileId !== profileId) } : s));
}

/** Câu trả lời còn dùng được của hồ sơ: cùng dấu ngày giờ sinh với hồ sơ hiện tại. */
export function nguHanhAnswersOf(s: PersistedState, profileId: string): NguHanhAnswer[] {
  const p = s.profiles.find((x) => x.id === profileId);
  return p ? s.nguHanhAnswers.filter((a) => a.profileId === profileId && a.birthKey === birthKeyOf(p)) : [];
}

/** Xoá hồ sơ; nếu đang xem thì chuyển sang hồ sơ đầu tiên còn lại; bỏ cặp hợp hôn có hồ sơ này. */
export function removeProfile(store: AppStore, id: string): void {
  store.setState((s) => {
    if (!s.profiles.some((p) => p.id === id)) return s;
    const profiles = s.profiles.filter((p) => p.id !== id);
    const activeProfileId = s.activeProfileId === id ? (profiles[0]?.id ?? null) : s.activeProfileId;
    const tools = { ...s.tools };
    if (tools.napAmPair?.includes(id)) delete tools.napAmPair;
    return { ...s, profiles, activeProfileId, tools, palmSessions: s.palmSessions.filter((x) => x.profileId !== id), nguHanhAnswers: s.nguHanhAnswers.filter((x) => x.profileId !== id) };
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

/** Ghi lúc thắp hương. Chỉ dùng để vẽ nén hương, không ảnh hưởng kết quả nào. */
export function setIncenseLit(store: AppStore, now = nowIso()): void {
  store.setState((s) => ({ ...s, tools: { ...s.tools, incenseLitAt: now } }));
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

/** Ghi nhận đã xem hướng dẫn chạm đường chỉ tay, để lần sau không tự mở nữa. */
export function markPalmGuideSeen(store: AppStore): void {
  store.setState((s) => (s.tools.palmGuideSeen ? s : { ...s, tools: { ...s.tools, palmGuideSeen: true } }));
}

/** Lưu độ lệch hiệu chỉnh của La Bàn (−45…45). */
export function setLaBanCalib(store: AppStore, deg: number): void {
  store.setState((s) => ({ ...s, tools: { ...s.tools, laBanCalib: deg } }));
}

export type PalmSessionInput = Omit<PalmSession, 'id' | 'date' | 'version'>;

/** Số lần xem giữ lại cho mỗi hồ sơ và mỗi vai (tay hiện tại, tay bẩm sinh), để so sánh qua thời gian. Mỗi lần chỉ vài KB. */
export const PALM_HISTORY_MAX = 12;

/** Lưu một lần xem chỉ tay, giữ các lần trước làm lịch sử; quá PALM_HISTORY_MAX thì bỏ lần cũ nhất. Trả id. */
export function savePalmSession(store: AppStore, input: PalmSessionInput, now = nowIso()): string {
  const id = newId();
  store.setState((s) => {
    if (!s.profiles.some((p) => p.id === input.profileId)) throw new Error('Hồ sơ không tồn tại');
    const same = (x: PalmSession) => x.profileId === input.profileId && x.role === input.role;
    const drop = new Set(s.palmSessions.filter(same).sort((a, b) => b.date.localeCompare(a.date)).slice(PALM_HISTORY_MAX - 1).map((x) => x.id));
    return { ...s, palmSessions: [...s.palmSessions.filter((x) => !drop.has(x.id)), { ...input, id, date: now, version: PALM_SESSION_VERSION }] };
  });
  return id;
}

/** Các lần xem của một hồ sơ, mới nhất trước. */
export function palmHistory(sessions: readonly PalmSession[], profileId: string): PalmSession[] {
  return sessions.filter((x) => x.profileId === profileId).sort((a, b) => b.date.localeCompare(a.date));
}

export function removePalmSession(store: AppStore, id: string): void {
  store.setState((s) => (s.palmSessions.some((x) => x.id === id) ? { ...s, palmSessions: s.palmSessions.filter((x) => x.id !== id) } : s));
}

/** Thay toàn bộ dữ liệu bằng tài liệu đã kiểm tra (khôi phục sao lưu, xoá toàn bộ). */
export function replaceState(store: AppStore, next: PersistedState): void {
  store.setState(next);
}

export function selectActiveProfile(s: PersistedState): Profile | null {
  return s.profiles.find((p) => p.id === s.activeProfileId) ?? null;
}
