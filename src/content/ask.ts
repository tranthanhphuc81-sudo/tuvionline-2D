/* "Hỏi chuyện Thầy" ở Tĩnh thất (ARCHITECTURE 16.3): các câu hỏi có sẵn, câu trả lời CHỈ ghép lại kết quả và câu chữ các công cụ
   đã có (Tổng hợp, ngũ hành, lời hôm nay), không tạo lời luận mới. Nhóm "Việc hôm nay" (hôm nay làm việc X được không) ở askDay.ts. Viết với "bạn"; màn hình đổi theo cách Thầy gọi (xungHoPlain).
   Câu dính từ cấm đọc vẫn hiện chữ nhưng Thầy không đọc (buildPlainCues). Không có câu "hợp tuổi": app chưa có câu chữ cho phần này.
   Nhóm "Đời sống" (16.3.2) ghép đoạn "Từng mảng cuộc sống" của Tử Vi và mục Lục thân của Bát Tự, nguyên chữ. */
import { pillarOfYear, evaluatePeriod, type NguHanhAnalysis } from '../core/nguhanh';
import { BatTuEngine, lifeAreas, lucThan, lucThanDau, type AreaKey, type BatTuChart, type ChiIdx, type CungXung, type ThanNhan, type TongHopReading, type TuViChart } from '../core';
import { CUNG_PLAIN } from './interp/tuvi';
import { AREA_LABEL, areaText } from './tuvi/tongket';
import { LUC_THAN_NOTE, lucThanLines } from './cachcuc/lucthan';
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
  { id: 'doi-song', label: 'Đời sống' },
  { id: 'viec', label: 'Việc hôm nay' },
] as const;

export const ASK_QUESTIONS = [
  { id: 'nam-nay', label: 'Năm nay thế nào?', group: 'la-so' },
  { id: 'nam-thuan', label: 'Năm nào thuận nhất sắp tới?', group: 'la-so' },
  { id: 'tinh', label: 'Tính cách ra sao?', group: 'la-so' },
  { id: 'mau-huong', label: 'Hợp màu gì, hướng nào?', group: 'la-so' },
  { id: 'nghe', label: 'Hợp nghề gì?', group: 'la-so' },
  { id: 'menh', label: 'Mệnh là gì?', group: 'la-so' },
  { id: 'tien-bac', label: 'Chuyện tiền bạc ra sao?', group: 'doi-song' },
  { id: 'cong-viec', label: 'Công việc, sự nghiệp thế nào?', group: 'doi-song' },
  { id: 'tinh-duyen', label: 'Tình duyên, hôn nhân thế nào?', group: 'doi-song' },
  { id: 'suc-khoe', label: 'Sức khoẻ cần để ý gì?', group: 'doi-song' },
  { id: 'nha-cua', label: 'Nhà cửa, chỗ ở ra sao?', group: 'doi-song' },
  { id: 'ra-ngoai', label: 'Đi xa, giao thiệp có thuận không?', group: 'doi-song' },
  { id: 'gia-dinh', label: 'Cha mẹ, anh chị em thế nào?', group: 'doi-song' },
  { id: 'con-cai', label: 'Chuyện con cái ra sao?', group: 'doi-song' },
  { id: 'hom-nay', label: 'Hôm nay thế nào?', group: 'viec' },
  ...DAY_TASKS.map((t) => ({ id: t.id, label: t.label, group: 'viec' as const })),
] as const satisfies readonly { id: string; label: string; group: (typeof ASK_GROUPS)[number]['id'] }[];
export type AskId = (typeof ASK_QUESTIONS)[number]['id'];
const isTask = (id: AskId): id is DayTaskId => DAY_TASKS.some((t) => t.id === id);

/** Lá số Tử Vi, Bát Tự và giới tính của hồ sơ, cho nhóm "Đời sống" (mảng cuộc sống, Lục thân). */
export interface LifeContext { tuvi: TuViChart; battu: BatTuChart; gender: 'M' | 'F' }
/** `birthChi`: chi năm âm của hồ sơ (tuổi), để câu theo lịch truyền thống nói được ngày có xung tuổi không. */
export interface AskContext { tongHop: TongHopReading; nguHanh: NguHanhAnalysis; now: Date; birthChi?: ChiIdx; life: LifeContext }

/** Câu hỏi ứng với một mảng trong "Từng mảng cuộc sống" của Tử Vi. */
const AREA_OF: Partial<Record<AskId, AreaKey>> = { 'tien-bac': 'tai', 'cong-viec': 'quan', 'tinh-duyen': 'phu', 'suc-khoe': 'tat', 'nha-cua': 'dien', 'ra-ngoai': 'di' };
/** Câu mới của nhóm "Đời sống" (LOI-THAY.md, chờ duyệt); không có từ cấm (test). */
export const LIFE_LINES = {
  areaHead: (cung: string, plainName: string, label: string) => `Theo Tử Vi, chuyện ${plainName} xem ở cung ${cung}; mảng này của bạn được chấm: ${label}.`,
  areaMore: 'Muốn xem kỹ thì mở tab Tử Vi, phần "Từng mảng cuộc sống".',
  health: 'Đây là lưu ý theo dân gian, không thay cho lời khuyên của bác sĩ; thấy khó chịu kéo dài thì nên đi khám.',
  spouse: 'Bát Tự xem người bạn đời qua sao đại diện và chi ngày:',
  family: (g: 'M' | 'F') => `Bát Tự xem cha mẹ, anh chị em qua sao đại diện và trụ tháng, theo quy ước của sách cho lá số ${g === 'M' ? 'nam' : 'nữ'}:`,
  children: (g: 'M' | 'F') => `Bát Tự xem con cái qua sao đại diện và trụ giờ, theo quy ước của sách cho lá số ${g === 'M' ? 'nam' : 'nữ'}:`,
  lucThanMore: 'Muốn xem kỹ thì mở tab Bát Tự, phần "Lục thân trong lá số".',
} as const;

function lifeAnswer(id: AskId, { tuvi, battu, gender }: LifeContext): string[] | null {
  const lt = () => ({ items: lucThan(battu, gender), signs: lucThanDau(battu, gender) });
  const lines = (whos: readonly ThanNhan[], xung: (x: CungXung) => boolean) => { const { items, signs } = lt(); return lucThanLines(items, gender, signs, whos, xung); };
  const key = AREA_OF[id];
  if (key) {
    const a = lifeAreas(tuvi).find((x) => x.key === key)!;
    const out = [LIFE_LINES.areaHead(a.cung, CUNG_PLAIN[a.cung], AREA_LABEL[a.tone]), plain(areaText(tuvi, a))];
    if (id === 'suc-khoe') out.push(LIFE_LINES.health);
    if (id === 'tinh-duyen') {
      const ls = lines(['phoiNgau'], (x) => x.cung === 'ngay' && x.voi !== 3);
      if (ls.length) out.push(LIFE_LINES.spouse, ...ls, LUC_THAN_NOTE);
    }
    return [...out, LIFE_LINES.areaMore];
  }
  if (id === 'gia-dinh') return [LIFE_LINES.family(gender), ...lines(['cha', 'me', 'anhEm'], (x) => x.cung === 'thang'), LUC_THAN_NOTE, LIFE_LINES.lucThanMore];
  if (id === 'con-cai') return [LIFE_LINES.children(gender), ...lines(['con'], (x) => x.cung === 'ngay' && x.voi === 3), LUC_THAN_NOTE, LIFE_LINES.lucThanMore];
  return null;
}

const plain = (html: string) => toPlainText(parseRich(html)).replace(/\s+/g, ' ').trim();
/** Chữ của các khối trong một mục "Tóm lại về bạn" (đoạn văn hoặc danh sách). */
function blockTexts(sections: readonly Section[], id: string): string[] {
  const sec = sections.find((s) => s.id === id);
  if (!sec) return [];
  return sec.blocks.flatMap((b) => (b.kind === 'p' ? [toPlainText(b.rich)] : b.kind === 'list' ? b.items.map(toPlainText) : [])).map((t) => t.replace(/\s+/g, ' ').trim());
}

/** Câu trả lời của một câu hỏi: vài câu, câu cuối là lời nhắc văn hoá. */
export function askAnswer(id: AskId, { tongHop: r, nguHanh: a, now, birthChi, life }: AskContext): string[] {
  if (isTask(id)) return [...taskAnswer(id, a, now, birthChi), CULTURE_LINE];
  const lifeOut = lifeAnswer(id, life);
  if (lifeOut) return [...lifeOut, CULTURE_LINE];
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
    default: // nhóm "Đời sống" đã trả lời ở lifeAnswer
      out = [];
  }
  return [...out, CULTURE_LINE];
}
