/* Bảng 30 Nạp Âm (Lục Thập Hoa Giáp) — Tử Vi (tính Cục) và công cụ Nạp Âm dùng chung. Phụ lục Nạp Âm, tài liệu Phần 4. */
import type { CanIdx, ChiIdx } from '../types';
import type { Hanh } from './hanh';

/** [Can đầu cặp, Chi đầu cặp, hành, tên] — mỗi dòng phủ 2 năm liền nhau. */
export type NapAmRow = readonly [can: CanIdx, chi: ChiIdx, hanh: Hanh, ten: string];

export const NAPAM: readonly NapAmRow[] = [
  [0, 0, 'Kim', 'Hải Trung Kim'], [2, 2, 'Hoả', 'Lư Trung Hoả'], [4, 4, 'Mộc', 'Đại Lâm Mộc'],
  [6, 6, 'Thổ', 'Lộ Bàng Thổ'], [8, 8, 'Kim', 'Kiếm Phong Kim'], [0, 10, 'Hoả', 'Sơn Đầu Hoả'],
  [2, 0, 'Thuỷ', 'Giản Hạ Thuỷ'], [4, 2, 'Thổ', 'Thành Đầu Thổ'], [6, 4, 'Kim', 'Bạch Lạp Kim'],
  [8, 6, 'Mộc', 'Dương Liễu Mộc'], [0, 8, 'Thuỷ', 'Tuyền Trung Thuỷ'], [2, 10, 'Thổ', 'Ốc Thượng Thổ'],
  [4, 0, 'Hoả', 'Tích Lịch Hoả'], [6, 2, 'Mộc', 'Tùng Bách Mộc'], [8, 4, 'Thuỷ', 'Trường Lưu Thuỷ'],
  [0, 6, 'Kim', 'Sa Trung Kim'], [2, 8, 'Hoả', 'Sơn Hạ Hoả'], [4, 10, 'Mộc', 'Bình Địa Mộc'],
  [6, 0, 'Thổ', 'Bích Thượng Thổ'], [8, 2, 'Kim', 'Kim Bạc Kim'], [0, 4, 'Hoả', 'Phú Đăng Hoả'],
  [2, 6, 'Thuỷ', 'Thiên Hà Thuỷ'], [4, 8, 'Thổ', 'Đại Trạch Thổ'], [6, 10, 'Kim', 'Thoa Xuyến Kim'],
  [8, 0, 'Mộc', 'Tang Đố Mộc'], [0, 2, 'Thuỷ', 'Đại Khê Thuỷ'], [2, 4, 'Thổ', 'Sa Trung Thổ'],
  [4, 6, 'Hoả', 'Thiên Thượng Hoả'], [6, 8, 'Mộc', 'Thạch Lựu Mộc'], [8, 10, 'Thuỷ', 'Đại Hải Thuỷ'],
];

/** Dòng Nạp Âm của một cặp Can Chi; `null` nếu cặp không hợp lệ (khác âm dương). */
export function napAmLookup(canIdx: CanIdx, chiIdx: ChiIdx): NapAmRow | null {
  for (const row of NAPAM) {
    const [c0, h0] = row;
    if (c0 === canIdx && h0 === chiIdx) return row;
    if ((c0 + 1) % 10 === canIdx && (h0 + 1) % 12 === chiIdx) return row;
  }
  return null;
}
