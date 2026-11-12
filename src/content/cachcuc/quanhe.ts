/* Câu chữ mục "Hình, xung, hội, hợp" (ARCHITECTURE 15.6). Nội dung mới, viết bằng lời của app. Không dùng chữ "hại" theo nghĩa doạ nạt:
   chỉ nói hai chữ "kỵ nhau", để người đọc hiểu là sức của chúng bị giảm. */
import { BatTuEngine, type QuanHe, type QuanHeKind } from '../../core';
import { note, p, type Block, type Section } from '../rich';

const { CAN, CHI } = BatTuEngine;
const TRU = ['năm', 'tháng', 'ngày', 'giờ'];

export const QUANHE_NAME: Record<QuanHeKind, string> = {
  'can-hop': 'Can hợp', 'can-xung': 'Can xung', 'tam-hoi': 'Tam hội', 'tam-hop': 'Tam hợp', 'ban-hop': 'Bán hợp', 'luc-hop': 'Lục hợp',
  xung: 'Lục xung', hinh: 'Tương hình', 'tu-hinh': 'Tự hình', hai: 'Lục hại',
};

const MEANING: Record<QuanHeKind, string> = {
  'can-hop': 'hai can hút nhau. Hợp rồi thì mỗi chữ bớt làm việc riêng của mình; có khi hoá thành hành khác, có khi chỉ "hợp mà không hoá"',
  'can-xung': 'hai can cùng âm dương, khắc thẳng nhau, sức của cả hai bị hao',
  'tam-hoi': 'ba chi cùng một phương gom lại, khí của hành đó rất mạnh',
  'tam-hop': 'ba chi kết thành một cục, khí của hành đó mạnh lên',
  'ban-hop': 'có chi giữa và một chi bên của tam hợp, cục kết chưa đủ, sức yếu hơn tam hợp',
  'luc-hop': 'hai chi kết đôi, làm dịu tính của nhau',
  xung: 'hai chi đối nhau trên vòng mười hai chi, va chạm làm khí trong chi bị lay động',
  hinh: 'các chi kỵ nhau, sách xem là dễ sinh trắc trở trong việc của các trụ đó',
  'tu-hinh': 'một chi gặp lại chính nó, tự làm khó mình',
  hai: 'hai chi kỵ nhau, sức của hợp hay của cục liên quan bị giảm',
};

const triName = (r: QuanHe, stems: readonly number[], branches: readonly number[]) =>
  r.kind === 'can-hop' || r.kind === 'can-xung'
    ? r.pillars.map((i) => CAN[stems[i]] + ' (trụ ' + TRU[i] + ')').join(' và ')
    : r.pillars.map((i) => CHI[branches[i]] + ' (trụ ' + TRU[i] + ')').join(', ');

export function quanHeLine(r: QuanHe, stems: readonly number[], branches: readonly number[]): string {
  let t = '<b>' + QUANHE_NAME[r.kind] + '</b>: ' + triName(r, stems, branches) + (r.to ? ', hợp về hành ' + r.to : '') + '. ' + MEANING[r.kind].charAt(0).toUpperCase() + MEANING[r.kind].slice(1) + '.';
  if (r.ke === false && (r.kind === 'can-hop' || r.kind === 'luc-hop' || r.kind === 'xung' || r.kind === 'can-xung')) t += ' Hai trụ không đứng cạnh nhau nên sức tác động nhẹ hơn.';
  if (r.giai) t += ' Một trong hai chi đang ở trong một hợp khác, theo sách xung này được hợp giải bớt.';
  return t;
}

/** Mục trên màn Bát Tự. Không có quan hệ nào thì nói rõ, không để trống. */
export function quanHeSection(list: readonly QuanHe[], stems: readonly number[], branches: readonly number[]): Section {
  const blocks: Block[] = list.length
    ? list.map((r, i) => p('quanhe.' + i, quanHeLine(r, stems, branches)))
    : [p('quanhe.none', 'Bốn trụ không có cặp hợp, xung, hình hay hại nào: các chữ đứng riêng, ít kéo đẩy nhau.')];
  blocks.push(note('quanhe.note', 'Hợp không phải lúc nào cũng tốt, xung không phải lúc nào cũng xấu: hợp có thể trói mất chữ đang cần, xung có thể đánh tan chữ đang gây hại. Muốn biết tốt hay xấu phải xem chữ đó có ích cho lá số không. Đây là kiến thức văn hoá để tham khảo.'));
  return { id: 'quanhe', title: '', blocks };
}
