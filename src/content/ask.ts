/* "Hỏi chuyện Thầy" ở Tĩnh thất (ARCHITECTURE 16.3): các câu hỏi có sẵn, câu trả lời CHỈ ghép lại kết quả và câu chữ các công cụ
   đã có (Tổng hợp, ngũ hành, lời hôm nay), không tạo lời luận mới. Nhóm "Việc hôm nay" (hôm nay làm việc X được không) ở askDay.ts. Viết với "bạn"; màn hình đổi theo cách Thầy gọi (xungHoPlain).
   Câu dính từ cấm đọc vẫn hiện chữ nhưng Thầy không đọc (buildPlainCues). Không có câu "hợp tuổi": app chưa có câu chữ cho phần này. */
import { pillarOfYear, evaluatePeriod, type NguHanhAnalysis } from '../core/nguhanh';
import { BatTuEngine, type ChiIdx, type TongHopReading } from '../core';
import { parseRich, toPlainText, type Section } from './rich';
import { tongHopTomLai } from './tonghop/tongket';
import { describePillar, plainBlocks } from './nguhanh/plain';
import { COLOR_SOURCE_NOTE } from './nguhanh/vocab';
import { CULTURE_LINE } from './reader/templates';
import { TODAY_NOTE, todayReading } from './today';
import { DAY_TASKS, taskAnswer, type DayTaskId } from './askDay';

const { CAN, CHI } = BatTuEngine;

/** Hai nhóm câu hỏi, hiện thành hai khối trong khung hỏi đáp. */
export const ASK_GROUPS = [
  { id: 'la-so', label: 'Về lá số' },
  { id: 'viec', label: 'Việc hôm nay' },
] as const;

export const ASK_QUESTIONS = [
  { id: 'nam-nay', label: 'Năm nay thế nào?', group: 'la-so' },
  { id: 'nam-thuan', label: 'Năm nào thuận nhất sắp tới?', group: 'la-so' },
  { id: 'tinh', label: 'Tính cách ra sao?', group: 'la-so' },
  { id: 'mau-huong', label: 'Hợp màu gì, hướng nào?', group: 'la-so' },
  { id: 'nghe', label: 'Hợp nghề gì?', group: 'la-so' },
  { id: 'menh', label: 'Mệnh là gì?', group: 'la-so' },
  { id: 'hom-nay', label: 'Hôm nay thế nào?', group: 'viec' },
  ...DAY_TASKS.map((t) => ({ id: t.id, label: t.label, group: 'viec' as const })),
] as const satisfies readonly { id: string; label: string; group: (typeof ASK_GROUPS)[number]['id'] }[];
export type AskId = (typeof ASK_QUESTIONS)[number]['id'];
const isTask = (id: AskId): id is DayTaskId => DAY_TASKS.some((t) => t.id === id);

/** `birthChi`: chi năm âm của hồ sơ (tuổi), để câu theo lịch truyền thống nói được ngày có xung tuổi không. */
export interface AskContext { tongHop: TongHopReading; nguHanh: NguHanhAnalysis; now: Date; birthChi?: ChiIdx }

const plain = (html: string) => toPlainText(parseRich(html)).replace(/\s+/g, ' ').trim();
/** Chữ của các khối trong một mục "Tóm lại về bạn" (đoạn văn hoặc danh sách). */
function blockTexts(sections: readonly Section[], id: string): string[] {
  const sec = sections.find((s) => s.id === id);
  if (!sec) return [];
  return sec.blocks.flatMap((b) => (b.kind === 'p' ? [toPlainText(b.rich)] : b.kind === 'list' ? b.items.map(toPlainText) : [])).map((t) => t.replace(/\s+/g, ' ').trim());
}

/** Câu trả lời của một câu hỏi: vài câu, câu cuối là lời nhắc văn hoá. */
export function askAnswer(id: AskId, { tongHop: r, nguHanh: a, now, birthChi }: AskContext): string[] {
  if (isTask(id)) return [...taskAnswer(id, a, now, birthChi), CULTURE_LINE];
  const tom = tongHopTomLai(r);
  const ug = a.readings[0].usefulGod;
  let out: string[];
  switch (id) {
    case 'nam-nay': {
      const y = now.getFullYear(), pl = pillarOfYear(y), ev = evaluatePeriod(pl, ug);
      const level = ev.favor === 'rat-tot' || ev.favor === 'tot' ? 'Năm nay nghiêng về thuận, hợp để đẩy những việc đã chuẩn bị.'
        : ev.favor === 'binh' ? 'Năm nay không nghiêng hẳn về bên nào, làm đều tay là được.'
        : 'Năm nay nên giữ nhịp an toàn, chưa vội mở rộng hay nhận thêm cam kết lớn.';
      out = [`Năm ${y} ${CAN[pl.stem]} ${CHI[pl.branch]}: ${describePillar(pl, ug)}.`, level, 'Đây là gợi ý sắp xếp nhịp làm việc, không phải lời báo trước.'];
      break;
    }
    case 'nam-thuan': {
      const b = plainBlocks(a, a.readings[0], now.getFullYear()).blocks.find((x) => x.id === 'nguhanh.plain.years');
      out = b && b.kind === 'p' ? [toPlainText(b.rich).replace(/\s+/g, ' ').trim()] : [];
      break;
    }
    case 'hom-nay':
      out = [todayReading(a, now).text.replace(' ' + TODAY_NOTE, ''), TODAY_NOTE];
      break;
    case 'tinh':
      out = blockTexts(tom, 'tonghop.tomlai').filter((t) => !t.startsWith('Mạng (Nạp Âm)'));
      break;
    case 'mau-huong':
      out = [...blockTexts(tom, 'tonghop.tomlai.manh'), COLOR_SOURCE_NOTE];
      break;
    case 'nghe':
      out = blockTexts(tom, 'tonghop.tomlai.khuyen').filter((t) => t.startsWith('Nghề nghiệp'));
      break;
    case 'menh': {
      const { tuvi, battu, battrach, napam } = r;
      out = [
        `Theo Nạp Âm năm sinh, bạn mạng ${napam.ten}, hành ${napam.hanh}.`,
        `Tử Vi xếp bạn vào ${tuvi.cucTen}; Nhật Chủ Bát Tự là ${battu.nhatChuCan}, hành ${battu.nhatChuHanh}; Bát Trạch cho Mệnh Quái ${battrach.quai}, hành ${battrach.hanh}, thuộc ${battrach.nhom}.`,
        plain('Bốn hệ dùng bốn mốc tính khác nhau nên hành có thể không trùng nhau, đó là chuyện bình thường, không phải mâu thuẫn.'),
      ];
      break;
    }
  }
  return [...out, CULTURE_LINE];
}
