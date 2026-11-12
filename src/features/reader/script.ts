/* Dựng kịch bản đọc cho thầy (ARCHITECTURE.md mục 12.6–12.8). Hàm thuần, không gọi engine: màn hình truyền kết quả đã tính vào. */
import { hasNoSpeech } from '../../content/noSpeech';
import { LEADS, NO_SPEECH_LINE, TOOL_LINES, fill, pick, type ReaderTool } from '../../content/reader/templates';
import type { Section } from '../../content/rich';
import { cellsSpeech, chunkSpeech, normalizeForSpeech, sectionsSpeech, splitSentences } from '../../content/speech';
import type { SpeechItem } from '../../platform/tts';
import type { Huong, MarkType, MountId } from '../../core';
import type { Relation, XungHoSetting } from '../../state/schema';

/** Phần bàn tay Thầy đang nói tới: gò, đường chính, dấu (ARCHITECTURE 13.1). Sơ đồ tô sáng phần này, phần còn lại mờ đi. */
export interface PalmFocus { zones?: readonly MountId[]; lines?: readonly ('sinh' | 'tri' | 'tam' | 'dinh')[]; marks?: readonly MarkType[] }
export interface CueFocus { palace?: number; hao?: number; pillar?: number; huong?: Huong; line?: 'sinh' | 'tri' | 'tam' | 'dinh'; palm?: PalmFocus; /** chỉ số Can tàng của trụ `pillar` được tô, dùng khi Thầy giải thích gốc của Nhật Chủ (3C.6) */ hidden?: number[] }
export type CueGesture = 'point' | 'turnPage' | 'nod';
export interface Cue extends SpeechItem { id: string; focus?: CueFocus; gesture?: CueGesture }

/** Người được đọc cho. `third` = hồ sơ của người khác: thầy nói ngôi thứ ba, không gọi hồ sơ đó là "con". */
export interface Who { goi: string; third: boolean; name: string; /** người đọc tự xưng (thầy, cô, bà…); không có = thầy */ ta?: string }

const WORD: Record<Exclude<XungHoSetting, 'tu-dong'>, string> = { con: 'con', anh: 'anh', chi: 'chị', co: 'cô', chu: 'chú', ban: 'bạn' };

/** `reader`: người đọc đã chọn; người đọc trẻ (`elder` false) thì tự động gọi người xem là "bạn" chứ không gọi "con". */
export function xungHo(profile: { name: string; gender: 'M' | 'F'; year: number; relation?: Relation } | null, setting: XungHoSetting, nowYear: number, reader: { ta: string; elder: boolean } = { ta: 'thầy', elder: true }): Who {
  const forced = setting === 'tu-dong' ? null : WORD[setting];
  const ta = reader.ta;
  if (!profile) return { goi: forced ?? 'bạn', third: false, name: '', ta };
  const third = !!profile.relation && profile.relation !== 'self';
  if (forced) return { goi: forced, third, name: profile.name, ta };
  if (third || !reader.elder) return { goi: 'bạn', third, name: profile.name, ta };
  const age = nowYear - profile.year;
  const goi = age < 40 ? 'con' : age < 55 ? (profile.gender === 'M' ? 'anh' : 'chị') : profile.gender === 'M' ? 'chú' : 'cô';
  return { goi, third, name: profile.name, ta };
}

/** Câu luận giải thành cue: phụ đề giữ chữ gốc, tiếng đọc đã chuẩn hoá. Câu dính từ cấm đọc thì im lặng, chỉ hiện chữ. */
function proseCues(raw: string, goi: string, focus?: CueFocus): SpeechItemDraft[] {
  const out: SpeechItemDraft[] = [];
  let clean = '';
  const flush = () => {
    for (const caption of chunkSpeech(clean, 150)) for (const text of chunkSpeech(normalizeForSpeech(caption))) out.push({ text, caption, focus });
    clean = '';
  };
  for (const s of splitSentences(raw)) {
    if (hasNoSpeech(s)) { flush(); out.push({ text: '', caption: s + ' ' + fill(NO_SPEECH_LINE, { goi }), focus }); } else clean += ' ' + s;
  }
  flush();
  return out;
}
type SpeechItemDraft = Omit<Cue, 'id'>;

export interface Lead { lines: readonly string[]; vars: Record<string, string | number>; focus: CueFocus }

export interface ScriptInput {
  cells?: readonly (readonly [string, string])[];
  /** lời dẫn tô sáng trên lá số, đọc ngay sau các chỉ số */
  leads?: readonly Lead[];
  /** đoạn văn thêm trước phần tổng kết, ví dụ lời nhận định */
  prose?: readonly string[];
  sections: readonly Section[];
}

/** Câu mở (có lời nhắc văn hoá) → chỉ số → lời dẫn → luận giải nguyên văn → câu kết. `seed` chọn biến thể câu, mặc định đổi theo ngày để đỡ lặp. */
export function buildScript(tool: ReaderTool, who: Who, input: ScriptInput, seed = new Date().getDate()): Cue[] {
  const lines = TOOL_LINES[tool];
  const cuaAi = who.third ? 'của ' + who.name : 'của ' + who.goi;
  const vars = { goi: who.goi, cuaAi, ten: who.name, ta: who.ta ?? 'thầy' };
  const say = (text: string, focus?: CueFocus, gesture?: CueGesture): SpeechItemDraft[] => chunkSpeech(normalizeForSpeech(text)).map((t) => ({ text: t, caption: text, focus, gesture }));
  const draft: SpeechItemDraft[] = [
    ...say(fill(pick(lines.open, seed), vars)),
    ...(input.cells?.length ? [...say(fill(pick(lines.cells, seed), vars)), ...proseCues(cellsSpeech(input.cells), who.goi)] : []),
    ...(input.leads ?? []).flatMap((l) => say(fill(pick(l.lines, seed), { ...vars, ...l.vars }), l.focus, 'point')),
    ...(input.prose ?? []).flatMap((p) => proseCues(p, who.goi)),
    ...(input.sections.length ? [...say(fill(pick(lines.sections, seed), vars), undefined, 'turnPage'), ...proseCues(sectionsSpeech(input.sections), who.goi)] : []),
    ...say(fill(pick(lines.close, seed), vars), undefined, 'nod'),
  ];
  return draft.map((c, i) => ({ ...c, id: `${tool}-${i}` }));
}

export const tuViLead = (menhChi: number, chiName: string, stars: readonly string[]): Lead => ({
  lines: LEADS.tuviMenh, vars: { cung: chiName, sao: stars.length ? ', có ' + stars.join(', ') : '' }, focus: { palace: menhChi },
});
export const batTuLead = (pillar: number, nhatChu: string): Lead => ({ lines: LEADS.battuNhatChu, vars: { nhatChu }, focus: { pillar } });
export const lucHaoLead = (hao: number, shown: number): Lead => ({ lines: LEADS.luchaoThe, vars: { hao: shown }, focus: { hao } });
export const laBanLead = (huong: Huong): Lead => ({ lines: LEADS.labanHuong, vars: { huong }, focus: { huong } });
export const batTrachLead = (huong: Huong, sao: string): Lead => ({ lines: LEADS.battrachHuong, vars: { huong, sao }, focus: { huong } });

/** Một câu luận chỉ tay: `speak` false thì chỉ hiện chữ (câu nhạy cảm hoặc dữ liệu đánh dấu không đọc). */
export interface PalmSpoken { text: string; speak: boolean; /** gò, đường, dấu mà câu này nói tới */ focus?: PalmFocus }
export interface PalmScriptInput {
  /** tóm tắt theo chủ đề */
  summary: readonly { title: string; items: readonly PalmSpoken[] }[];
  /** bốn đường chính theo thứ tự đọc: tô sáng đường trên sơ đồ rồi đọc các câu của đường đó */
  lines: readonly { line: NonNullable<CueFocus['line']>; name: string; items: readonly PalmSpoken[] }[];
  /** các mục còn lại: tổng quan bàn tay, ngón, đường phụ, gò */
  sections: readonly { title: string; items: readonly PalmSpoken[] }[];
}

/** Vài câu rời (không có câu mở, câu kết): lời hỏi đáp của Thầy ở Tĩnh thất. Câu dính từ cấm đọc thì im lặng, chỉ hiện chữ. */
export function buildPlainCues(who: Who, texts: readonly string[], id: string): Cue[] {
  return texts.flatMap((t) => proseCues(t, who.goi)).map((c, i) => ({ ...c, id: `${id}-${i}` }));
}

/** Kịch bản thầy đọc chỉ tay: câu mở → tóm tắt → từng đường chính (có tô sáng) → các mục còn lại → câu kết. */
export function buildPalmScript(who: Who, input: PalmScriptInput, seed = new Date().getDate()): Cue[] {
  const lines = TOOL_LINES.chitay;
  const vars = { goi: who.goi, cuaAi: who.third ? 'của ' + who.name : 'của ' + who.goi, ten: who.name, ta: who.ta ?? 'thầy' };
  const say = (text: string, focus?: CueFocus, gesture?: CueGesture): SpeechItemDraft[] => chunkSpeech(normalizeForSpeech(text)).map((t) => ({ text: t, caption: text, focus, gesture }));
  const read = (items: readonly PalmSpoken[], focus?: CueFocus) => items.flatMap((it) => {
    const f: CueFocus | undefined = it.focus ? { ...focus, palm: it.focus } : focus;
    return it.speak ? proseCues(it.text, who.goi, f) : [{ text: '', caption: it.text + ' ' + fill(NO_SPEECH_LINE, { goi: who.goi }), focus: f }];
  });
  const draft: SpeechItemDraft[] = [
    ...say(fill(pick(lines.open, seed), vars)),
    ...(input.summary.length ? [...say(fill(pick(lines.cells, seed), vars)), ...input.summary.flatMap((x) => [...say(x.title + '.'), ...read(x.items)])] : []),
    ...input.lines.flatMap((l) => (l.items.length ? [...say(fill(pick(LEADS.chitayDuong, seed), { ...vars, duong: l.name }), { line: l.line }, 'point'), ...read(l.items, { line: l.line })] : [])),
    ...(input.sections.some((x) => x.items.length) ? say(fill(pick(lines.sections, seed), vars), undefined, 'turnPage') : []),
    ...input.sections.flatMap((x) => (x.items.length ? [...say(x.title + '.'), ...read(x.items)] : [])),
    ...say(fill(pick(lines.close, seed), vars), undefined, 'nod'),
  ];
  return draft.map((c, i) => ({ ...c, id: `chitay-${i}` }));
}
