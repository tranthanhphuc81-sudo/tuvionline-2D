/* Câu chữ "Lục thân trong lá số" (ARCHITECTURE 15.8): quy ước của sách (trụ nào, sao nào ứng với ai), và từ 13/11/2026 thêm
   lời luận của sách viết nhẹ: nói điều sách thấy kèm việc nên làm, không nói sinh tử, bệnh tật, không dùng từ nặng
   (danh sách ở LUC_THAN_TU_TRANH, test chặn). Tắt phần lời luận bằng LUC_THAN_LOI_LUAN = false. */
import { BatTuEngine, type CungXung, type DauCode, type LucThanDau, type LucThanItem, type ThanNhan } from '../../core';
import { list, note, p, type Block, type Section } from '../rich';

const { CAN } = BatTuEngine;
const TRU = ['trụ năm', 'trụ tháng', 'trụ ngày', 'trụ giờ'];
const WHO: Record<ThanNhan, string> = { cha: 'Cha', me: 'Mẹ', anhEm: 'Anh chị em, bạn bè', phoiNgau: 'Người bạn đời', con: 'Con cái' };

export const CUNG_VI = [
  'Trụ năm: gốc gia đình, ông bà và những năm thơ ấu.',
  'Trụ tháng: cha mẹ, anh chị em, và tuổi thanh niên.',
  'Trụ ngày: can ngày là chính mình; chi ngày là cung của người bạn đời.',
  'Trụ giờ: con cái, và những năm về già.',
];

function viTriText(it: LucThanItem): string {
  if (!it.viTri.length) return 'không thấy trong bốn trụ. Sách không xem đó là điều xấu: sao vắng thì xét cung vị và các năm vận.';
  const lo = it.viTri.filter((v) => v.lo), an = it.viTri.filter((v) => !v.lo);
  const fmt = (vs: typeof it.viTri) => vs.map((v) => CAN[v.can] + ' ở ' + TRU[v.pillar]).join(', ');
  return [lo.length ? 'lộ trên can: ' + fmt(lo) : '', an.length ? 'tàng trong chi: ' + fmt(an) : ''].filter(Boolean).join('; ') + '.';
}

/** Công tắc phần lời luận của sách. false: mục chỉ còn quy ước như trước 13/11/2026 (phòng khi Google Play hay chủ dự án thấy không hợp). */
export const LUC_THAN_LOI_LUAN = true;

/** Từ không được xuất hiện trong lời luận (test chặn, cùng NO_SPEECH_TERMS và BANNED_TERMS). */
export const LUC_THAN_TU_TRANH: readonly string[] = [
  'khắc', 'goá', 'góa', 'yểu', 'mất', 'chết', 'ly hôn', 'ly dị', 'chia ly', 'hiếm muộn', 'tuyệt tự', 'cô độc', 'bệnh', 'tai hoạ', 'tai họa', 'đoản', 'bạc mệnh', 'hại',
];

const NHOM_VI: Record<string, string> = { TyKiep: 'Tỷ Kiếp (anh em, bạn bè)', An: 'Ấn', ThucThuong: 'Thực Thương', Tai: 'Tài', QuanSat: 'Quan Sát' };
const WHO_SAO: Record<ThanNhan, string> = { cha: 'Sao của cha', me: 'Sao của mẹ', anhEm: 'Sao anh chị em', phoiNgau: 'Sao người bạn đời', con: 'Sao con cái' };
const WHO_GAN: Record<ThanNhan, string> = { cha: 'người cha', me: 'người mẹ', anhEm: 'anh chị em, bạn bè', phoiNgau: 'người bạn đời', con: 'con cái' };

/** Câu viết nhẹ cho một mã. Mọi câu nói "sách xưa xem/khuyên" và kèm một việc nên làm. */
export function dauText(d: LucThanDau, code: DauCode, gender: 'M' | 'F'): string {
  const w = d.who;
  switch (code) {
    case 'ro': return WHO_SAO[w] + ' lộ ra và có gốc trong chi: sách xưa xem ' + WHO_GAN[w] + ' có vai trò rõ trong đời bạn; nên trân trọng và giữ gìn mối gắn bó này.';
    case 'an': return WHO_SAO[w] + ' chỉ ẩn trong chi: sách xưa xem mối gắn bó với ' + WHO_GAN[w] + ' là kín đáo, cần thời gian và sự chủ động để bộc lộ.';
    case 'vang': return WHO_SAO[w] + ' không thấy trong bốn trụ: sách xưa không xem đó là điều xấu, chỉ là phần này được xét thêm qua cung vị và các năm vận.';
    case 'biChe': {
      const by = NHOM_VI[d.nhomChe];
      if (w === 'cha') return 'Sao của cha bị ' + by + ' chế mạnh: sách xưa xem là ít được dựa vào cha, nên sớm tự lập và chủ động thăm hỏi.';
      if (w === 'me') return 'Sao của mẹ bị ' + by + ' chế mạnh: sách xưa xem là công việc, tiền bạc dễ cuốn bạn xa mẹ; nên dành thời gian gần gũi, chăm lo cho mẹ.';
      if (w === 'anhEm') return 'Sao anh chị em bị ' + by + ' chế mạnh: sách xưa xem là anh chị em mỗi người một hướng, ít dựa vào nhau; nên chủ động giữ liên lạc.';
      if (w === 'phoiNgau') return gender === 'M'
        ? 'Sao người bạn đời bị ' + by + ' tranh: sách xưa xem đây là mối quan hệ cần vun đắp và nhường nhịn nhiều hơn; nên rõ ràng chuyện tiền bạc chung và dành thời gian riêng cho hai người.'
        : 'Sao người bạn đời bị ' + by + ' chế: sách xưa xem là hai người dễ có lời qua tiếng lại; nên giữ lời nói mềm mỏng và tôn trọng ý kiến của nhau.';
      return gender === 'M'
        ? 'Sao con cái bị ' + by + ' chế: sách xưa xem chuyện con cái là phần cần kiên nhẫn chăm lo; nên dành nhiều thời gian cho con.'
        : 'Sao con cái bị ' + by + ' chế: sách xưa xem chuyện con cái là phần cần kiên nhẫn chăm lo; nên bớt lo xa và để con tự lập dần.';
    }
    case 'honTap': return 'Chính Quan và Thất Sát cùng lộ: sách xưa xem là chuyện tình cảm dễ phân vân giữa nhiều lựa chọn; nên thong thả, rõ ràng trước khi quyết định.';
    case 'tranhTai': return 'Sao anh em vượng mà sao Tài yếu: sách xưa khuyên rõ ràng chuyện tiền bạc với anh em, bạn bè, có thoả thuận từ đầu.';
  }
}

const POS_CHI = ['năm', 'tháng', 'ngày', 'giờ'];
export function xungText(x: CungXung): string {
  if (x.cung === 'thang') return 'Chi tháng (cung cha mẹ, anh em) gặp xung với chi ' + POS_CHI[x.voi] + ': sách xưa xem là sớm rời nhà hoặc mỗi người một nơi; nên giữ thói quen thăm hỏi.';
  if (x.voi === 3) return 'Chi ngày (cung bạn đời) gặp xung với chi giờ (cung con cái): sách xưa xem là việc nhà dễ bận rộn, mỗi người một nhịp; nên dành thời gian cố định cho gia đình.';
  return 'Chi ngày (cung bạn đời) gặp xung với chi tháng: sách xưa xem là hai người dễ khác nhịp; nên dành thời gian cho nhau và tránh quyết định khi đang giận.';
}

/** Các câu lời luận (không kể quy ước); rỗng khi tắt công tắc. */
export function loiLuanLines(dau: readonly LucThanDau[], cungXung: readonly CungXung[], gender: 'M' | 'F', on = LUC_THAN_LOI_LUAN): string[] {
  if (!on) return [];
  // 'vang' đã nói ở phần quy ước ngay trên ("không thấy trong bốn trụ… không xem là điều xấu"), không nhắc lại
  return [...dau.flatMap((d) => d.codes.filter((c) => c !== 'vang').map((c) => dauText(d, c, gender))), ...cungXung.map(xungText)];
}

export function lucThanSection(items: readonly LucThanItem[], gender: 'M' | 'F', signs?: { dau: readonly LucThanDau[]; cungXung: readonly CungXung[] }): Section {
  const blocks: Block[] = [
    p('lucthan.cungvi', '<b>Cung vị:</b> mỗi trụ ứng với một lớp người thân.<ul>' + CUNG_VI.map((c) => '<li>' + c + '</li>').join('') + '</ul>'),
    p('lucthan.sao', '<b>Sao đại diện</b> (theo quy ước của sách cho lá số ' + (gender === 'M' ? 'nam' : 'nữ') + '):'),
    ...items.map((it, i) => p('lucthan.' + i, '<b>' + WHO[it.who] + '</b> là ' + it.sao.join(' hoặc ') + ': ' + viTriText(it))),
    ...(() => {
      const lines = signs ? loiLuanLines(signs.dau, signs.cungXung, gender) : [];
      return lines.length ? [p('lucthan.loiluan', '<b>Sách xưa luận thêm</b> (viết nhẹ, để tham khảo):'), list('lucthan.loiluan.list', lines)] : [];
    })(),
    note('lucthan.note', 'Đây là quy ước và lời luận truyền thống, chia theo giới tính như sách cổ, chỉ để tham khảo. App không đoán sức khoẻ, sinh tử hay chuyện riêng của ai; mối quan hệ trong đời thật do cách mỗi người sống và vun đắp với nhau.'),
  ];
  return { id: 'lucthan', title: '', blocks };
}
