/* "Hỏi chuyện Thầy", nhóm "Việc hôm nay" (ARCHITECTURE 16.3.1): hôm nay làm việc X được không.
   Không có công thức mới: mỗi việc ứng với một nhóm Thập Thần (tài sản → Tài, giấy tờ và học thi → Ấn, hợp tác → Tỷ Kiếp,
   xin việc và cấp trên → Quan Sát, trình bày và ra mắt → Thực Thương), hành của nhóm đó lấy bằng `elementOfTenGod`.
   Ngày được chấm bằng đúng cách của lời hôm nay (`evaluatePeriod` trụ ngày với Dụng thần), cộng thêm một bậc khi khí ngày
   (can hoặc bản khí của chi) mang đúng hành của việc mà hành ấy có lợi, trừ một bậc khi hành ấy nên tiết chế.
   Câu viết với "bạn"; không dùng từ cấm (vocab.ts) nên nhãn nói "sắm" chứ không nói chữ kia. Không nêu giờ, hướng, vật phẩm. */
import { BatTuEngine, dayCanChiIndex, dayInfo, lunarOfSolar, viecVerdict, type ChiIdx, type ViecId } from '../core';
import { elementOfTenGod, evaluatePeriod, hiddenStems, stemElement, type Element, type NguHanhAnalysis, type Pillar, type TenGodGroup } from '../core/nguhanh';
import { describePillar, elementRole } from './nguhanh/plain';
import { TODAY_NOTE } from './today';
import { THAN_VI, TRUC_VI } from './xemngay';

const { CAN, CHI } = BatTuEngine;

interface DayTask { id: string; label: string; group: TenGodGroup; topic: string; tip: string }

/** Các việc hỏi được. `topic` là chủ ngữ của câu "… ứng với hành X"; `tip` là lời dặn thực tế, không phụ thuộc lá số. */
export const DAY_TASKS = [
  {
    id: 'tai-san', label: 'Hôm nay sắm tài sản lớn được không?', group: 'Tai', topic: 'Chuyện tiền bạc, tài sản',
    tip: 'Việc chi tiền lớn nên quyết theo khả năng tài chính, giấy tờ pháp lý rõ ràng và giá đã so sánh kỹ; ngày tháng chỉ là phần phụ.',
  },
  {
    id: 'giay-to', label: 'Hôm nay đi làm giấy tờ được không?', group: 'An', topic: 'Chuyện giấy tờ, hồ sơ, con dấu',
    tip: 'Mang đủ bản gốc và bản sao, hỏi trước giờ làm việc của nơi cần đến, đọc kỹ từng trang trước khi ký.',
  },
  {
    id: 'hoc-thi', label: 'Hôm nay thi cử, học việc mới được không?', group: 'An', topic: 'Chuyện học hành, thi cử',
    tip: 'Ngủ đủ đêm trước, ôn lại phần chính thay vì học dồn, đến sớm một chút để tâm được yên.',
  },
  {
    id: 'cap-tren', label: 'Hôm nay xin việc, gặp cấp trên được không?', group: 'QuanSat', topic: 'Chuyện cấp trên, công việc có khuôn khổ, chức danh',
    tip: 'Chuẩn bị trước điều muốn nói, đến đúng giờ và giữ thái độ điềm tĩnh là phần quyết định nhiều nhất.',
  },
  {
    id: 'hop-tac', label: 'Hôm nay bàn chuyện hợp tác được không?', group: 'TyKiep', topic: 'Chuyện bạn bè, cộng sự, góp sức cùng làm',
    tip: 'Hợp tác nên ghi rõ ai góp gì, ai hưởng gì ngay từ đầu, kể cả với người quen.',
  },
  {
    id: 'trinh-bay', label: 'Hôm nay ra mắt việc mới, trình bày được không?', group: 'ThucThuong', topic: 'Chuyện thể hiện, nói, viết, làm ra cái mới',
    tip: 'Tập trước phần trình bày một lượt và nghĩ sẵn câu trả lời cho vài câu hỏi khó.',
  },
] as const satisfies readonly DayTask[];
export type DayTaskId = (typeof DAY_TASKS)[number]['id'];

export type TaskVerdict = 'thuan' | 'binh' | 'giu';

export const TASK_VERDICT_LINES: Record<TaskVerdict, string> = {
  thuan: 'Với việc này, hôm nay khá thuận; đã chuẩn bị kỹ thì cứ làm.',
  binh: 'Với việc này, hôm nay không nghiêng hẳn về bên nào; làm được, miễn chuẩn bị chu đáo.',
  giu: 'Với việc này, hôm nay nên giữ nhịp; không gấp thì dời sang ngày thuận hơn, buộc phải làm thì xem kỹ từng bước, đừng quyết vội.',
};

/** Số ngày nhìn tới khi tìm ngày thuận hơn. */
export const TASK_LOOKAHEAD = 14;

const WEEKDAY = ['Chủ nhật', 'thứ Hai', 'thứ Ba', 'thứ Tư', 'thứ Năm', 'thứ Sáu', 'thứ Bảy'];

const dayPillar = (d: Date): Pillar => {
  const cc = dayCanChiIndex(d.getDate(), d.getMonth() + 1, d.getFullYear());
  return { stem: cc.can as Pillar['stem'], branch: cc.chi as Pillar['branch'] };
};
const carries = (pl: Pillar, e: Element) => stemElement(pl.stem) === e || stemElement(hiddenStems(pl.branch)[0]) === e;

/** Chấm một ngày cho một việc. */
export function taskVerdict(a: NguHanhAnalysis, group: TenGodGroup, d: Date): TaskVerdict {
  const ug = a.readings[0].usefulGod;
  const pl = dayPillar(d);
  const fav = evaluatePeriod(pl, ug).favor;
  let score = fav === 'rat-tot' || fav === 'tot' ? 1 : fav === 'binh' ? 0 : -1;
  const e = elementOfTenGod(a.dayMaster.dayMaster, group);
  if (carries(pl, e)) score += e === ug.dung || e === ug.hy ? 1 : e === ug.ky || e === ug.cuu ? -1 : 0;
  return score >= 1 ? 'thuan' : score <= -1 ? 'giu' : 'binh';
}

function dayLabel(d: Date): string {
  const pl = dayPillar(d);
  const l = lunarOfSolar(d.getDate(), d.getMonth() + 1, d.getFullYear());
  const ld = l.day <= 10 ? `mùng ${l.day}` : l.day === 15 ? 'rằm' : `${l.day}`;
  return `${WEEKDAY[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1} (ngày ${CAN[pl.stem]} ${CHI[pl.branch]}, ${ld} tháng ${l.month}${l.leap ? ' nhuận' : ''} âm lịch)`;
}

/** Việc tương ứng ở màn Xem ngày (`TRUC_VIEC`) và cách gọi trong câu; học thi không có việc tương ứng (ARCHITECTURE 16.3.1). */
export const TASK_VIEC: Record<DayTaskId, { id: ViecId; phrase: string } | null> = {
  'tai-san': { id: 'sam-sua', phrase: 'sắm sửa đồ lớn' },
  'giay-to': { id: 'ky-ket', phrase: 'ký kết, giao dịch' },
  'hoc-thi': null,
  'cap-tren': { id: 'nhan-viec', phrase: 'nhận việc, nhậm chức' },
  'hop-tac': { id: 'ky-ket', phrase: 'ký kết, giao dịch' },
  'trinh-bay': { id: 'khai-truong', phrase: 'khai trương, mở hàng' },
};

/** Một câu theo lịch truyền thống (thần trực ngày, trực, xung tuổi). Không đổi mức chấm theo lá số. `birthChi`: chi năm âm của hồ sơ. */
export function calendarLine(id: DayTaskId, now: Date, birthChi?: ChiIdx): string {
  const d = dayInfo(now.getDate(), now.getMonth() + 1, now.getFullYear(), birthChi);
  const head = `Theo lịch truyền thống, hôm nay là ngày ${d.hoangDao ? 'Hoàng đạo' : 'Hắc đạo'} (${THAN_VI[d.than]}), trực ${TRUC_VI[d.truc].name}`;
  const viec = TASK_VIEC[id];
  let tail = '.';
  if (d.person?.xung) tail = `, lại xung tuổi ${CHI[d.person.birthChi]} của bạn, nên lịch xưa khuyên việc lớn chọn ngày khác.`;
  else if (viec) {
    const v = viecVerdict(d, viec.id);
    tail = v === 'hop' ? `; lịch xưa coi ngày này hợp cho việc ${viec.phrase}.`
      : v === 'ky' ? `; lịch xưa kỵ trực này cho việc ${viec.phrase}.`
        : '; lịch xưa không nghiêng hẳn về bên nào cho việc này.';
  }
  return `${head}${tail} Đó là cách chấm chung cho mọi người, khác cách chấm theo lá số ở trên; muốn xem kỹ thì mở mục Xem ngày tốt xấu ở Tĩnh thất.`;
}

/** Câu trả lời cho "hôm nay làm việc X được không" (chưa có lời nhắc văn hoá; askAnswer thêm vào cuối). */
export function taskAnswer(id: DayTaskId, a: NguHanhAnalysis, now: Date, birthChi?: ChiIdx): string[] {
  const t = DAY_TASKS.find((x) => x.id === id)!;
  const ug = a.readings[0].usefulGod;
  const pl = dayPillar(now);
  const e = elementOfTenGod(a.dayMaster.dayMaster, t.group);
  const verdict = taskVerdict(a, t.group, now);
  const link = `${t.topic} ứng với hành ${e} trong lá số của bạn, là ${elementRole(e, ug)}.`
    + (carries(pl, e) ? ` Khí ngày hôm nay mang hành ${e}, nên ảnh hưởng tới việc này rõ hơn ngày thường.` : '');
  const out = [`Hôm nay ngày ${CAN[pl.stem]} ${CHI[pl.branch]}: ${describePillar(pl, ug)}.`, link, TASK_VERDICT_LINES[verdict]];
  if (verdict !== 'thuan') {
    let next: Date | null = null;
    for (let k = 1; k <= TASK_LOOKAHEAD && !next; k++) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + k);
      if (taskVerdict(a, t.group, d) === 'thuan') next = d;
    }
    out.push(next ? `Nếu muốn chọn ngày, ngày thuận hơn gần nhất trong hai tuần tới là ${dayLabel(next)}.`
      : 'Hai tuần tới chưa có ngày nào nổi trội hơn cho việc này, nên cứ chọn ngày tiện cho mình và chuẩn bị kỹ.');
  }
  return [...out, calendarLine(id, now, birthChi), t.tip, TODAY_NOTE];
}
