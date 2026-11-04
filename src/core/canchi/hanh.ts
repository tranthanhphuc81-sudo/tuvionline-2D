/** Ngũ Hành, dạng chuỗi ở biên công khai. Bảng chỉ số nội bộ để trong từng module (xem ARCHITECTURE.md mục 5.3 điểm 2). */
export type Hanh = 'Kim' | 'Thuỷ' | 'Mộc' | 'Hoả' | 'Thổ';

/** Thứ tự tương sinh: Kim → Thuỷ → Mộc → Hoả → Thổ → Kim. */
export const HANH_ORDER: readonly Hanh[] = ['Kim', 'Thuỷ', 'Mộc', 'Hoả', 'Thổ'];

/** Hành mà `h` sinh ra. */
export function sinhOf(h: Hanh): Hanh {
  return HANH_ORDER[(((HANH_ORDER.indexOf(h) + 1) % 5) + 5) % 5];
}
/** Hành mà `h` khắc. */
export function khacOf(h: Hanh): Hanh {
  return HANH_ORDER[(((HANH_ORDER.indexOf(h) + 2) % 5) + 5) % 5];
}
