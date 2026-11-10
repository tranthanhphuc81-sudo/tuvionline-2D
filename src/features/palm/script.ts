/* Đổi kết quả chỉ tay (PalmView) thành đầu vào kịch bản thầy đọc. Câu nào dữ liệu đánh dấu không đọc (`tts: false`)
   hoặc dính từ cấm đọc riêng của chỉ tay (PALM_TTS_FORBIDDEN) thì chỉ hiện chữ. Từ cấm chung đã được lọc trong kịch bản. */
import { PALM_TTS_FORBIDDEN, type PalmReading, type PalmView } from '../../content/palm/index';
import { PALM_LINE_NAME } from '../../content/palm/ui';
import type { PalmScriptInput, PalmSpoken } from '../reader/script';

const MAIN = [['sinh', 'sinh'], ['tri', 'tri'], ['tam', 'tam'], ['dinhmang', 'dinh']] as const;

const quiet = (text: string) => { const t = text.toLocaleLowerCase('vi'); return PALM_TTS_FORBIDDEN.some((w) => t.includes(w.toLocaleLowerCase('vi'))); };
const spoken = (r: PalmReading): PalmSpoken => ({ text: r.text, speak: r.tts && !quiet(r.text) });

export function palmScriptInput(view: PalmView): PalmScriptInput {
  const readings = view.sections.flatMap((s) => s.items);
  const silentTexts = readings.filter((r) => !spoken(r).speak).map((r) => r.text.slice(1));
  return {
    // Câu tổng kết là câu luận viết lại ("Có xu hướng…"), nên so phần thân câu với các câu không được đọc
    summary: view.topics.map((t) => ({ title: t.title, items: t.lines.map((text) => ({ text, speak: !quiet(text) && !silentTexts.some((x) => text.includes(x)) })) })),
    lines: MAIN.map(([id, line]) => ({ line, name: PALM_LINE_NAME[line], items: readings.filter((r) => r.line === id).map(spoken) })),
    sections: view.sections.map((s) => ({ title: s.title, items: s.items.filter((r) => !MAIN.some(([id]) => id === r.line)).map(spoken) })),
  };
}
