/* Nạp Âm: lỗi nhập, ô tóm tắt, "Giải thích chỉ số", ghi chú — NGUYÊN VĂN legacy (tab Nạp Âm: resolvePerson, renderPerson, renderExplain). */
import type { NapAmInputError, NapAmPerson, NapAmYear } from '../../core';
import { p, type Section } from '../rich';

/** `label` là "Người 1" hoặc "Người 2". */
export function napAmInputErrorText(e: NapAmInputError, label: string): string {
  switch (e.code) {
    case 'year-range': return 'Năm sinh ' + label + ' cần nằm trong khoảng 1900 – 2100.';
    case 'partial-date': return label + ': nhập đủ cả ngày và tháng sinh, hoặc để trống cả hai (khi đó công cụ chỉ dùng năm).';
    case 'invalid-date': return label + ': ngày ' + e.dd + '/' + e.mm + '/' + e.yy + ' không tồn tại trên lịch dương.';
  }
}

/** Các ô tóm tắt của một người: [nhãn, giá trị có định dạng]. */
export function napAmPersonCells(x: NapAmPerson): [string, string][] {
  const r = x.res, l = x.lunar;
  return [
    ['Ngày sinh (dương lịch)', x.date && l
      ? x.date.dd + '/' + x.date.mm + '/' + x.date.yy + '<br><small>Âm lịch: ' + l.day + '/' + l.month + (l.leap ? ' (nhuận)' : '') + '/' + l.year + '</small>'
      : 'Chỉ nhập năm ' + x.solarY],
    ['Năm âm lịch dùng để tính', r.year + (x.shifted ? ' <small>(sinh trước Tết năm ' + x.solarY + ')</small>' : '')],
    ['Can Chi năm sinh', r.canChiTen],
    ['Ngũ hành Nạp Âm', r.hanh],
    ['Tên Nạp Âm (mạng)', r.ten],
  ];
}

export function napAmExplain(r1: NapAmYear, r2: NapAmYear | null): Section[] {
  const item = (id: string, title: string, body: string): Section => ({ id: 'napam.explain.' + id, title, blocks: [p('napam.explain.' + id + '.0', body)] });
  return [
    item('canchi', '1. Can Chi năm sinh', 'Mỗi năm âm lịch ứng với một cặp Can Chi lặp lại theo chu kỳ 60 năm (công thức Can = (năm − 4) mod 10, Chi = (năm − 4) mod 12). Năm âm lịch đổi vào ngày <b>Tết Nguyên Đán</b> (giống tuổi con giáp, giống Tử Vi) — khác với Bát Tự đổi năm theo tiết Lập Xuân. Vì vậy người sinh tháng 1 hoặc đầu tháng 2 dương lịch, trước Tết, vẫn thuộc năm âm lịch trước. Năm âm lịch ' + r1.year + ' của bạn ứng với <b>' + r1.canChiTen + '</b>.'),
    item('napam', '2. Nạp Âm là gì?', 'Cứ 2 năm liên tiếp trong chu kỳ 60 năm (một Can chẵn đi với Chi chẵn, ghép cặp với năm kế) lại được dân gian gán chung 1 cái tên Ngũ Hành mang tính thi vị — gọi là Nạp Âm — ví dụ "' + r1.ten + '" cho năm ' + r1.year + '. Đây là lớp Ngũ hành thứ hai, tách biệt hoàn toàn với Ngũ hành Cục dùng an sao Tử Vi (tính từ Cung Mệnh) hay Ngũ hành Nhật Chủ trong Bát Tự (tính từ ngày sinh) — ba hệ thống độc lập dù cùng dùng chung 5 tên Kim/Mộc/Thuỷ/Hoả/Thổ. Xem đầy đủ nguồn gốc và bảng tra 30 Nạp Âm trong Phụ lục Nạp Âm của tài liệu Phần 4.'),
    item('hophon', '3. Ý nghĩa khi so sánh 2 người (hợp hôn)', 'Cách xem phổ biến nhất: so Ngũ hành Nạp Âm của hai người theo nguyên tắc sinh khắc quen thuộc (Kim sinh Thuỷ, Thuỷ sinh Mộc, Mộc sinh Hoả, Hoả sinh Thổ, Thổ sinh Kim là tương sinh — tốt; Kim khắc Mộc, Mộc khắc Thổ, Thổ khắc Thuỷ, Thuỷ khắc Hoả, Hoả khắc Kim là tương khắc — cần cân nhắc; cùng hành là hoà hợp, ngang bằng). Ngoài ra dân gian còn truyền lại 4 ngoại lệ đặc biệt (ví dụ Kiếm Phong Kim/Sa Trung Kim CẦN Hoả để luyện thành khí cụ, nên gặp mạng Hoả không xem là khắc mà là có lợi) — công cụ này áp dụng đúng các ngoại lệ đó khi so sánh 2 người.' + (r2 ? '' : ' Nhập thêm năm sinh Người 2 ở form phía trên để xem kết quả so sánh cụ thể.')),
  ];
}

export function napAmNotes(): Section {
  return {
    id: 'napam.notes', title: '',
    blocks: [p('napam.notes.0', 'Nạp Âm năm sinh chỉ là <b>một lớp</b> trong nhiều yếu tố dân gian dùng khi xem tuổi kết hôn (còn xét tuổi xung theo Chi, Cung phi Bát Trạch ở tab "Bát Trạch"...) — không phải căn cứ duy nhất hay mang tính quyết định. Công cụ áp dụng đúng các ngoại lệ sinh khắc phổ biến nhất được dân gian truyền lại; một số sách cổ có ghi thêm các ngoại lệ khác ít phổ biến hơn, ngoài phạm vi công cụ này. Xem chi tiết và các ví dụ minh hoạ trong Phụ lục Nạp Âm của tài liệu Phần 4.')],
  };
}
