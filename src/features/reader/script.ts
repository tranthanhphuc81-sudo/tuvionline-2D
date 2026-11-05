/* Dựng kịch bản đọc cho thầy (ARCHITECTURE.md mục 12.6–12.8). Hàm thuần, không gọi engine: màn hình truyền kết quả đã tính vào. */
import { hasNoSpeech } from '../../content/noSpeech';
import { T, TOOL_NAME, fill, type ReaderTool } from '../../content/reader/templates';
import type { Section } from '../../content/rich';
import { cellsSpeech, chunkSpeech, normalizeForSpeech, sectionsSpeech, splitSentences } from '../../content/speech';
import type { SpeechItem } from '../../platform/tts';
import type { Huong } from '../../core';
import type { Relation, XungHoSetting } from '../../state/schema';

export interface CueFocus { palace?: number; hao?: number; pillar?: number; huong?: Huong }
export interface Cue extends SpeechItem { id: string; focus?: CueFocus }

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
    if (hasNoSpeech(s)) { flush(); out.push({ text: '', caption: s + ' ' + fill(T.noSpeech, { goi }), focus }); } else clean += ' ' + s;
  }
  flush();
  return out;
}
type SpeechItemDraft = Omit<Cue, 'id'>;

export interface ScriptInput {
  cells?: readonly (readonly [string, string])[];
  /** lời dẫn tô sáng trên lá số, đọc ngay sau các chỉ số */
  leads?: readonly { text: string; focus: CueFocus }[];
  /** đoạn văn thêm trước phần tổng kết, ví dụ lời nhận định */
  prose?: readonly string[];
  sections: readonly Section[];
}

/** Câu mở (có lời nhắc văn hoá) → chỉ số → lời dẫn → luận giải nguyên văn → câu kết. */
export function buildScript(tool: ReaderTool, who: Who, input: ScriptInput): Cue[] {
  const { name, owned } = TOOL_NAME[tool];
  const vars = { goi: who.goi, tool: name, ten: who.name };
  const say = (text: string, focus?: CueFocus): SpeechItemDraft[] => chunkSpeech(normalizeForSpeech(text)).map((t) => ({ text: t, caption: text, focus }));
  const open = !owned || !who.name ? T.openPlain : who.third ? T.openOther : T.openSelf;
  const draft: SpeechItemDraft[] = [
    ...say(fill(open, vars)),
    ...(input.cells?.length ? [...say(T.leadCells), ...proseCues(cellsSpeech(input.cells), who.goi)] : []),
    ...(input.leads ?? []).flatMap((l) => say(l.text, l.focus)),
    ...(input.prose ?? []).flatMap((p) => proseCues(p, who.goi)),
    ...say(T.leadSections),
    ...proseCues(sectionsSpeech(input.sections), who.goi),
    ...say(T.close),
  ];
  return draft.map((c, i) => ({ ...c, id: `${tool}-${i}` }));
}

export const tuViLead = (menhChi: number, chiName: string, stars: readonly string[]) => ({
  text: fill(T.tuviMenh, { cung: chiName, sao: stars.length ? ', có ' + stars.join(', ') : '' }), focus: { palace: menhChi },
});
export const batTuLead = (pillar: number, nhatChu: string) => ({ text: fill(T.battuNhatChu, { nhatChu }), focus: { pillar } });
export const lucHaoLead = (hao: number, shown: number) => ({ text: fill(T.luchaoThe, { hao: shown }), focus: { hao } });
export const batTrachLead = (huong: Huong, sao: string) => ({ text: fill(T.battrachHuong, { huong, sao }), focus: { huong } });
