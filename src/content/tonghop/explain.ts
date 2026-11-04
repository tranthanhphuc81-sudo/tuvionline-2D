/* Thẻ Ngũ hành, bảng so sánh và "Đọc tổng hợp thế nào?" của tab Tổng Hợp — NGUYÊN VĂN legacy renderTongHop, relHanhPair.
   Phép tính ở src/core/tonghop/reading.ts. Mỗi phần là một Section[] để Phase 6 đọc lại được. */
import type { HanhRel, TongHopReading } from '../../core';
import { note, p, parseRich, type Section } from '../rich';
import { tongHopTomLai } from './tongket';

export const TONGHOP_NOTE = 'Bảng tổng hợp này chỉ gộp hiển thị kết quả đã tính ở 4 tab — không tạo ra thông tin mới ngoài những gì các công cụ Tử Vi, Bát Tự, Bát Trạch, Nạp Âm đã tính riêng lẻ. Đây là công cụ mang tính văn hoá, giáo dục và tham khảo, không phải khoa học thực nghiệm hay căn cứ để đưa ra quyết định quan trọng trong đời sống thực tế.';

const dungThanNhom = (thanVuong: boolean) => (thanVuong ? 'Thực Thương / Tài / Quan Sát' : 'Ấn / Tỷ Kiếp');

export function tongHopOverview({ tuvi, battu, battrach, napam }: TongHopReading): Section[] {
  const card = (label: string, value: string, html: string) => ({ label, value, rich: parseRich(html) });
  return [{
    id: 'tonghop.overview', title: '',
    blocks: [{
      id: 'tonghop.overview.cards', kind: 'cards',
      cards: [
        card('Tử Vi · Cục (theo Cung Mệnh)', tuvi.cucHanh, tuvi.cucTen + ' (' + tuvi.napAmCucTen + ')<br>Cung Mệnh: ' + tuvi.menhChi + (tuvi.menhStars.length ? ' — ' + tuvi.menhStars.join(', ') : ' (Vô Chính Diệu)')),
        card('Bát Tự · Nhật Chủ (theo ngày sinh)', battu.nhatChuHanh, 'Can ngày: ' + battu.nhatChuCan + '<br>Trạng thái: ' + battu.trangThai + ' — Thân ' + (battu.thanVuong ? 'VƯỢNG' : 'NHƯỢC') + '<br>Dụng Thần nghiêng về: ' + dungThanNhom(battu.thanVuong)),
        card('Bát Trạch · Mệnh Quái (theo năm sinh)', battrach.hanh, 'Mệnh Quái: ' + battrach.quai + '<br>Nhóm: ' + battrach.nhom),
        card('Nạp Âm · theo năm sinh', napam.hanh, 'Can Chi: ' + napam.canChiTen + '<br>Tên Nạp Âm: ' + napam.ten),
      ],
    }],
  }];
}

export function tongHopCompare({ tuvi, battu, battrach, napam }: TongHopReading): Section[] {
  const row = (...cells: string[]) => cells.map(parseRich);
  return [{
    id: 'tonghop.compare', title: '',
    blocks: [{
      id: 'tonghop.compare.table', kind: 'table',
      head: ['Hệ thống', 'Cơ sở tính', 'Ngũ hành', 'Chi tiết'],
      rows: [
        row('<b>Tử Vi (Cục)</b>', 'Can Chi Cung Mệnh (phụ thuộc tháng, giờ sinh)', '<b>' + tuvi.cucHanh + '</b>', tuvi.cucTen),
        row('<b>Bát Tự (Nhật Chủ)</b>', 'Can của ngày sinh', '<b>' + battu.nhatChuHanh + '</b>', battu.nhatChuCan + ' — ' + battu.trangThai),
        row('<b>Bát Trạch (Mệnh Quái)</b>', 'Năm sinh + giới tính', '<b>' + battrach.hanh + '</b>', 'Quái ' + battrach.quai + ' — ' + battrach.nhom),
        row('<b>Nạp Âm</b>', 'Can Chi năm sinh', '<b>' + napam.hanh + '</b>', napam.ten),
      ],
    }],
  }];
}

function hanhRelText({ a, b, kind }: HanhRel, labelA: string, labelB: string): string {
  if (kind === 'same') return labelA + ' và ' + labelB + ' <b>cùng hành ' + a + '</b> — hoà hợp, ngang bằng.';
  const [x, lx, y, ly] = kind.startsWith('a') ? [a, labelA, b, labelB] : [b, labelB, a, labelA];
  return kind.includes('sinh')
    ? x + ' (' + lx + ') <b>sinh</b> ' + y + ' (' + ly + ') — tương sinh, thuận lợi.'
    : x + ' (' + lx + ') <b>khắc</b> ' + y + ' (' + ly + ') — tương khắc, cần cân nhắc.';
}

export function tongHopGuide({ rel }: TongHopReading): Section[] {
  const CUC = 'Cục Tử Vi', NC = 'Nhật Chủ Bát Tự', MQ = 'Mệnh Quái Bát Trạch', NA = 'Nạp Âm năm sinh';
  return [
    {
      id: 'tonghop.guide.why', title: 'Vì sao 4 con số Ngũ hành này có thể khác nhau?',
      blocks: [p('tonghop.guide.why.0', 'Đây là <b>4 hệ thống độc lập</b>, mỗi hệ dùng một mốc dữ liệu riêng để tính Ngũ hành: Tử Vi dùng Can Chi của <i>Cung Mệnh</i> (phụ thuộc cả tháng và giờ sinh), Bát Tự dùng Can của riêng <i>ngày sinh</i> (Nhật Chủ), Bát Trạch dùng <i>năm sinh và giới tính</i> (Mệnh Quái), còn Nạp Âm dùng <i>Can Chi năm sinh</i>. Vì mốc tính khác nhau nên việc 4 hành ra khác nhau là HOÀN TOÀN BÌNH THƯỜNG, không phải mâu thuẫn hay sai sót — dân gian xưa vốn cũng dùng riêng từng hệ cho từng mục đích khác nhau (Tử Vi/Bát Tự để luận tính cách và vận trình cả đời, Bát Trạch để chọn hướng nhà, Nạp Âm chủ yếu để xem tuổi hợp hôn).')],
    },
    {
      id: 'tonghop.guide.cross', title: 'Thử đối chiếu 4 hành với nhau (chỉ mang tính tham khảo thêm)',
      blocks: [
        p('tonghop.guide.cross.tuvi-battu', '• Cục Tử Vi so với Nhật Chủ Bát Tự: ' + hanhRelText(rel.tuViBatTu, CUC, NC)),
        p('tonghop.guide.cross.battu-napam', '• Nhật Chủ Bát Tự so với Nạp Âm năm sinh: ' + hanhRelText(rel.batTuNapAm, NC, NA)),
        p('tonghop.guide.cross.battrach-napam', '• Mệnh Quái Bát Trạch so với Nạp Âm năm sinh: ' + hanhRelText(rel.batTrachNapAm, MQ, NA)),
        note('tonghop.guide.cross.note', 'Việc đối chiếu chéo này KHÔNG nằm trong lý luận cổ điển chính thống của bất kỳ hệ nào (mỗi hệ vốn tự đủ trong phạm vi của mình) — đây chỉ là một cách nhìn tổng hợp cho vui và dễ hình dung, không nên xem là một phép luận đoán có căn cứ vững chắc.'),
      ],
    },
    { id: 'tonghop.note', title: '', blocks: [note('tonghop.note.0', TONGHOP_NOTE)] },
  ];
}

export interface TongHopPart { id: string; title: string; sections: Section[] }

/** Bốn phần của màn hình Tổng hợp, đúng thứ tự legacy. */
export function tongHopParts(r: TongHopReading): TongHopPart[] {
  return [
    { id: 'tomlai', title: 'Tóm lại về bạn (dễ hiểu)', sections: tongHopTomLai(r) },
    { id: 'overview', title: 'Ngũ hành theo từng hệ thống', sections: tongHopOverview(r) },
    { id: 'compare', title: 'Bảng so sánh 4 hệ thống', sections: tongHopCompare(r) },
    { id: 'guide', title: 'Đọc tổng hợp thế nào?', sections: tongHopGuide(r) },
  ];
}
