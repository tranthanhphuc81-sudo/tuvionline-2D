/* Đọc riêng từng năm (Lưu niên) — câu chữ NGUYÊN VĂN từ legacy tuViYear / tuViYearHtml. Phép chấm ở src/core/tuvi/reading.ts. */
import { TuViEngine, type TuViChart, type TuViYearReading } from '../../core';
import { list, note, p, type Section, type Tone, parseRich } from '../rich';
import { CUNG_PLAIN, KY_ADVICE, STAR } from '../interp/tuvi';

const { CHI } = TuViEngine;
export const HOA_NAME = { loc: 'Hoá Lộc', quyen: 'Hoá Quyền', khoa: 'Hoá Khoa', ky: 'Hoá Kỵ' } as const;

export function yearLabel(y: TuViYearReading): string {
  return y.tone === 'ok' ? 'Năm khá thuận' : y.tone === 'warn' ? 'Năm cần thận trọng' : 'Năm bình thường';
}

/** Các dòng nhận định và lời khuyên của một năm, đúng thứ tự legacy. */
export function yearLines(ch: TuViChart, y: TuViYearReading): { lines: string[]; tips: string[] } {
  const lines: string[] = [], tips: string[] = [];
  lines.push('Năm <b>' + y.year + ' (' + y.canChi + ')</b> — bạn <b>' + y.age + ' tuổi</b> (tuổi âm).');
  lines.push('Thái Tuế năm nay đóng ở <b>cung ' + y.thaiTueCung + '</b>: chuyện ' + CUNG_PLAIN[y.thaiTueCung] + ' là chủ đề nổi bật của cả năm, dễ có việc phát sinh — tốt hay xấu tuỳ cách bạn chuẩn bị.');
  lines.push('Tiểu Hạn (trọng tâm riêng của bạn trong năm) ở <b>cung ' + y.tieuHanCung + '</b>: chuyện ' + CUNG_PLAIN[y.tieuHanCung]
    + (y.tieuHanStars.length ? '; sao chính ở đây: ' + y.tieuHanStars.map((x) => x + (STAR[x] ? ' (' + STAR[x].net + ')' : '')).join(', ') : '') + '.');
  if (y.tieuHanSat.length) lines.push('Cung Tiểu Hạn có ' + y.tieuHanSat.join(', ') + ' — năm có sóng gió nhỏ, nên chậm mà chắc.');
  const hoaParts: string[] = [];
  for (const h of y.luuHoa) {
    hoaParts.push(HOA_NAME[h.key] + ' vào ' + h.star + ' (cung ' + h.cung + ')');
    if (h.key === 'ky') tips.push('Năm nay ' + KY_ADVICE[h.cung].replace(/^Hoá Kỵ ở [^:]+: /, ''));
    else if (h.key === 'loc') tips.push('Năm nay có Hoá Lộc ở cung ' + h.cung + ' — nên đầu tư công sức cho chuyện ' + CUNG_PLAIN[h.cung] + ', dễ thấy kết quả.');
  }
  if (hoaParts.length) lines.push('Tứ Hoá của năm: ' + hoaParts.join('; ') + '.');
  if (y.namTuoi) {
    lines.push('Đây là <b>năm tuổi</b> của bạn (năm ' + CHI[y.yearCC.chi] + ').');
    tips.push('Năm tuổi: theo dân gian nên sống chậm lại, giữ sức khoẻ, cẩn thận đi lại — không cần quá lo lắng, chỉ cần thận trọng hơn bình thường.');
  }
  if (y.menhRel === 'xung') {
    lines.push('Năm ' + CHI[y.yearCC.chi] + ' xung với cung Mệnh (' + CHI[ch.menhChi] + ') — năm nhiều biến động, thay đổi.');
    tips.push('Năm xung Mệnh: hạn chế quyết định lớn vội vàng (đổi việc, chuyển nhà, đầu tư lớn); nếu buộc phải làm thì chuẩn bị thật kỹ.');
  } else if (y.menhRel === 'hop') {
    lines.push('Năm ' + CHI[y.yearCC.chi] + ' hợp với cung Mệnh (' + CHI[ch.menhChi] + ') — năm có nhiều trợ lực.');
  }
  if (!tips.length) tips.push('Giữ nhịp đều: hoàn thành tốt những việc đang làm, chuẩn bị cho chặng tiếp theo.');
  return { lines, tips };
}

/** Khối "Đọc nhanh năm …" (legacy tuViYearHtml). `y` = null khi năm trước năm sinh. */
export function tuViYearSections(ch: TuViChart, y: TuViYearReading | null): Section[] {
  if (!y) return [{ id: 'tuvi.year', title: '', blocks: [p('tuvi.year.none', 'Năm này trước năm sinh — chưa có lưu niên để xem.')] }];
  const { lines, tips } = yearLines(ch, y);
  return [
    {
      id: 'tuvi.year', title: 'Đọc nhanh năm ' + y.year + ' (' + y.canChi + ')', tone: y.tone as Tone,
      blocks: [
        { id: 'tuvi.year.verdict', kind: 'verdict', tone: y.tone, rich: parseRich('<b>' + yearLabel(y) + '.</b>') },
        ...lines.map((l, i) => p('tuvi.year.line.' + i, l)),
      ],
    },
    { id: 'tuvi.year.tips', title: '🎯 Nên làm trong năm', blocks: [list('tuvi.year.tips.list', tips)] },
    { id: 'tuvi.year.note', title: '', blocks: [note('tuvi.year.note.0', 'Nhãn năm do công cụ tự chấm theo quy tắc dân gian (Thái Tuế, Tiểu Hạn, Tứ Hoá của năm, năm tuổi, năm xung) — không phải xác suất hay dự báo chắc chắn.')] },
  ];
}
