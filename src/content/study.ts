/* Câu chữ của Tĩnh thất (ARCHITECTURE.md mục 12.11). */
import { lunarOfSolar, yearCanChiName } from '../core';
import { STUDY_LINES, fill, pick } from './reader/templates';

/** Nhãn thanh trên: ngày tháng âm và năm Can Chi của hôm nay. */
export function studyTitle(now: Date): string {
  const dd = now.getDate(), mm = now.getMonth() + 1, yy = now.getFullYear();
  const l = lunarOfSolar(dd, mm, yy);
  return `${l.day}/${l.month}${l.leap ? ' nhuận' : ''} ${yearCanChiName(l.year)}`;
}

/** `id` của lần đọc ở Tĩnh thất; thanh đọc chung ẩn với id này vì màn hình đã có điều khiển riêng. */
export const STUDY_READING_ID = 'thay';

/** Lời chào khi chưa đọc gì, đổi theo ngày cho đỡ lặp. */
export function studyGreeting(goi: string, ten: string, third: boolean, seed: number): string {
  return fill(pick(third ? STUDY_LINES.other : STUDY_LINES.self, seed), { goi, ten });
}
export const STUDY_INVALID = 'Hồ sơ này có ngày sinh chưa đúng nên thầy chưa đọc được. Hãy sửa lại trong mục Quản lý hồ sơ.';

export const INCENSE_TEXT = {
  hold: 'Chạm giữ để thắp hương',
  burning: 'Hương đang cháy',
  ash: 'Hương đã tàn',
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
