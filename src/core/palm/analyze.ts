/* Luận giải chỉ tay theo CHI-TAY §14.2: câu trả lời → mã đặc điểm → xếp theo mục → tổng kết theo chủ đề → so sánh hai tay.
   Thuần, không ngẫu nhiên: cùng đầu vào luôn cùng kết quả. Câu chữ ghép ở src/content/palm. */
import { PALM_SECTIONS, PALM_TOPICS, type FingerPrint, type MarkType, type MountId, type PalmCompare, type PalmHandInput, type PalmInput, type PalmMeta, type PalmResult, type PalmSectionKey, type PalmTone, type PalmTopic, type PalmTopicSummary } from './types';

/** Tối đa số câu mỗi chủ đề trong phần tổng kết. */
export const TOPIC_MAX = 3;
const MAIN_LINES = new Set(['sinh', 'tri', 'tam', 'dinhmang']);

/** Tổ hợp vân tay có đúng 1 hoặc 3 ngón cùng loại (ngón 0 = cái … 4 = út). V01–V15 là vân móng thú, V16–V30 cùng thứ tự với vân xoáy. */
const PRINT_SETS: readonly (readonly number[])[] = [
  [0], [1], [2], [3], [4],
  [1, 2, 3], [1, 2, 4], [0, 2, 4], [0, 2, 3], [0, 1, 4], [0, 1, 3], [1, 3, 4], [0, 3, 4], [2, 3, 4], [0, 1, 2],
];
const pad2 = (n: number) => String(n).padStart(2, '0');

/** Tra vân tay: đủ 5 ngón và không có vân cung thì tìm tổ hợp V; có vân cung → P03; toàn móng thú → P01, toàn xoáy → P02. */
export function printReading(prints: readonly (FingerPrint | null)[] | undefined): string | null {
  if (!prints || prints.length !== 5 || prints.some((p) => p === null)) return null;
  if (prints.includes('arch')) return 'P03';
  const setOf = (kind: FingerPrint) => prints.flatMap((p, i) => (p === kind ? [i] : []));
  for (const [kind, base] of [['loop', 0], ['whorl', 15]] as const) {
    const set = setOf(kind);
    if (set.length !== 1 && set.length !== 3) continue;
    const at = PRINT_SETS.findIndex((s) => s.length === set.length && s.every((v, i) => v === set[i]));
    if (at >= 0) return 'V' + pad2(base + at + 1);
  }
  return setOf('loop').length === 5 ? 'P01' : 'P02';
}

/** Dấu trên gò → mã ô ma trận `G-<gò>.<dấu>` nếu có trong dữ liệu. */
export const markReading = (mount: MountId, type: MarkType) => `G-${mount}.${type}`;

function sectionOf(m: PalmMeta): PalmSectionKey {
  switch (m.group) {
    case 'hand': case 'combo': return 'tong-quan';
    case 'finger': case 'tip': case 'print': case 'combo-print': case 'nail': return 'ngon';
    case 'mount': case 'mark': return 'go-dau';
    case 'line': return m.line && MAIN_LINES.has(m.line) ? 'duong-chinh' : 'duong-phu';
    case 'extra': return 'duong-phu';
  }
}

const TONE_ORDER: Record<PalmTone, number> = { '+': 0, '=': 1, '!': 2 };

/** Mọi mã đặc điểm của một tay, theo thứ tự xuất hiện trong dữ liệu, bỏ trùng và bỏ mã không có hoặc đang ẩn. */
export function handIds(hand: PalmHandInput, catalog: ReadonlyMap<string, PalmMeta>): string[] {
  const raw: string[] = [];
  for (const v of Object.values(hand.answers)) {
    if (v === null || v === undefined) continue;
    raw.push(...(typeof v === 'string' ? [v] : v));
  }
  const print = printReading(hand.prints);
  if (print) raw.push(print);
  for (const m of hand.marks ?? []) raw.push(markReading(m.mount, m.type));
  const keep = new Set(raw.filter((id) => { const m = catalog.get(id); return m && !m.hidden; }));
  return [...catalog.keys()].filter((id) => keep.has(id));
}

function summarize(ids: readonly string[], catalog: ReadonlyMap<string, PalmMeta>, order: ReadonlyMap<string, number>): Partial<Record<PalmTopic, PalmTopicSummary>> {
  const out: Partial<Record<PalmTopic, PalmTopicSummary>> = {};
  for (const topic of PALM_TOPICS) {
    const items = ids.map((id) => catalog.get(id)!).filter((m) => m.topics.includes(topic));
    if (!items.length) continue;
    items.sort((a, b) => b.weight - a.weight || TONE_ORDER[a.tone] - TONE_ORDER[b.tone] || order.get(a.id)! - order.get(b.id)!);
    let top = items.slice(0, TOPIC_MAX);
    // Câu lưu ý không đứng một mình: có câu thuận hoặc trung tính thì phải có ít nhất một câu như thế
    if (top.every((m) => m.tone === '!')) {
      const calm = items.find((m) => m.tone !== '!');
      if (calm) top = [...top.slice(0, TOPIC_MAX - 1), calm];
    }
    // Một dấu hiệu chưa đủ để kết luận: cần từ 2 dấu hiệu cùng chiều
    const plus = items.filter((m) => m.tone === '+').length, caution = items.filter((m) => m.tone === '!').length;
    out[topic] = { ids: top.map((m) => m.id), confidence: plus >= 2 || caution >= 2 ? 'ro' : 'xu-huong' };
  }
  return out;
}

function compareHands(current: readonly string[], innate: readonly string[], catalog: ReadonlyMap<string, PalmMeta>): PalmCompare {
  const a = new Set(current), b = new Set(innate);
  const good = (id: string) => catalog.get(id)!.tone === '+';
  return {
    steady: current.filter((id) => b.has(id)),
    growing: current.filter((id) => !b.has(id) && good(id)),
    latent: innate.filter((id) => !a.has(id) && good(id)),
  };
}

export function analyzePalm(input: PalmInput, metas: readonly PalmMeta[]): PalmResult {
  const catalog = new Map(metas.map((m) => [m.id, m]));
  const order = new Map(metas.map((m, i) => [m.id, i]));
  const current = handIds(input.current, catalog);
  const sections = PALM_SECTIONS.map((key) => ({
    key,
    ids: current
      .filter((id) => sectionOf(catalog.get(id)!) === key)
      .sort((x, y) => catalog.get(y)!.weight - catalog.get(x)!.weight || order.get(x)! - order.get(y)!),
  })).filter((s) => s.ids.length > 0);
  const result: PalmResult = { sections, byTopic: summarize(current, catalog, order) };
  if (input.innate) result.compare = compareHands(current, handIds(input.innate, catalog), catalog);
  return result;
}
