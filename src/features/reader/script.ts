/* Dựng kịch bản đọc cho thầy (ARCHITECTURE.md mục 12.6–12.8). Hàm thuần, không gọi engine: màn hình truyền kết quả đã tính vào. */
import { hasNoSpeech } from '../../content/noSpeech';
import { LEADS, NO_SPEECH_LINE, TOOL_LINES, fill, pick, type ReaderTool } from '../../content/reader/templates';
import type { Section } from '../../content/rich';
import { cellsSpeech, chunkSpeech, normalizeForSpeech, sectionsSpeech, splitSentences } from '../../content/speech';
import type { SpeechItem } from '../../platform/tts';
import type { Huong } from '../../core';
import type { Relation, XungHoSetting } from '../../state/schema';

export interface CueFocus { palace?: number; hao?: number; pillar?: number; huong?: Huong }
export type CueGesture = 'point' | 'turnPage' | 'nod';
export interface Cue extends SpeechItem { id: string; focus?: CueFocus; gesture?: CueGesture }

/** Người được đọc cho. `third` = hồ sơ của người khác: thầy nói ngôi thứ ba, không gọi hồ sơ đó là "con". */
export interface Who { goi: string; third: boolean; name: string }

const WORD: Record<Exclude<XungHoSetting, 'tu-dong'>, string> = { con: 'con', anh: 'anh', chi: 'chị', co: 'cô', chu: 'chú', ban: 'bạn' };

export function xungHo(profile: { name: string; gender: 'M' | 'F'; year: number; relation?: Relation } | null, setting: XungHoSetting, nowYear: number): Who {
  const forced = setting === 'tu-dong' ? null : WORD[setting];
  if (!profile) return { goi: forced ?? 'bạn', third: false, name: '' };
  const third = !!profile.relation && profile.relation !== 'self';
  if (forced) return { goi: forced, third, name: profile.name };
  if (third) return { goi: 'bạn', third, name: profile.name };
  const age = nowYear - profile.year;
  const goi = age < 40 ? 'con' : age < 55 ? (profile.gender === 'M' ? 'anh' : 'chị') : profile.gender === 'M' ? 'chú' : 'cô';
  return { goi, third, name: profile.name };
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
  const vars = { goi: who.goi, cuaAi, ten: who.name };
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
