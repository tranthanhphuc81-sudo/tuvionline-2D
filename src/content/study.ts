/* Câu chữ của Tĩnh thất (ARCHITECTURE.md mục 12.11). Chưa dùng xưng hô riêng: bảng xưng hô (12.6) còn chờ chủ dự án duyệt, Phase 6.5 sẽ thay. */
import { lunarOfSolar, yearCanChiName } from '../core';

/** Nhãn thanh trên: ngày tháng âm và năm Can Chi của hôm nay. */
export function studyTitle(now: Date): string {
  const dd = now.getDate(), mm = now.getMonth() + 1, yy = now.getFullYear();
  const l = lunarOfSolar(dd, mm, yy);
  return `${l.day}/${l.month}${l.leap ? ' nhuận' : ''} ${yearCanChiName(l.year)}`;
}

/** `id` của lần đọc ở Tĩnh thất; thanh đọc chung ẩn với id này vì màn hình đã có điều khiển riêng. */
export const STUDY_READING_ID = 'thay';

export const STUDY_GREETING = 'Mời bạn chọn một vật trên án thư, hoặc bấm "Thầy đọc" để nghe phần tổng hợp.';
export const STUDY_INVALID = 'Hồ sơ này có ngày sinh chưa đúng nên thầy chưa đọc được. Hãy sửa lại trong mục Quản lý hồ sơ.';

export const INTAKE_INTRO = 'Chào bạn, xin mời vào. Thầy xin hỏi vài điều để lập hồ sơ. Mọi thứ chỉ lưu trên máy này.';
export const INTAKE_ASK = {
  name: 'Xin cho biết họ tên hoặc biệt danh?',
  gender: 'Hồ sơ này là của nam hay nữ?',
  date: 'Ngày tháng năm sinh là khi nào?',
  hour: 'Sinh vào giờ nào?',
} as const;

/** Đồ vật trên án thư. `label` hiện trên màn hình, `aria` đọc cho trình đọc màn hình. */
export const STUDY_OBJECTS = {
  laso: { label: 'Tử Vi', aria: 'Tờ lá số giấy dó: mở Tử Vi' },
  thetre: { label: 'Bát Tự', aria: 'Bốn thẻ tre: mở Bát Tự' },
  xu: { label: 'Lục Hào', aria: 'Ba đồng xu và mai rùa: mở Lục Hào' },
  laban: { label: 'Bát Trạch, La Bàn', aria: 'La bàn gỗ: mở Bát Trạch và La Bàn' },
  sach: { label: 'Nạp Âm', aria: 'Sách cổ: mở Nạp Âm và hợp hôn' },
  so: { label: 'Tổng hợp', aria: 'Sổ tổng hợp: mở phần đọc tổng hợp' },
} as const;
export type StudyObjectId = keyof typeof STUDY_OBJECTS;
