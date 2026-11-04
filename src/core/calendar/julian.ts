/* Số ngày Julius (JD). Thuật toán lịch âm của Hồ Ngọc Đức (Astronomical Algorithms, Jean Meeus 1998),
   https://www.informatik.uni-leipzig.de/~duc/amlich/ — giữ nguyên từng phép tính của bản web đã kiểm chứng. */

export type DMY = [day: number, month: number, year: number];

export function INT(d: number): number {
  return Math.floor(d);
}

/** Ngày dương → JD nguyên (quy ước giữa trưa). Trước 15/10/1582 tính theo lịch Julius. */
export function jdFromDate(dd: number, mm: number, yy: number): number {
  const a = INT((14 - mm) / 12), y = yy + 4800 - a, m = mm + 12 * a - 3;
  let jd = dd + INT((153 * m + 2) / 5) + 365 * y + INT(y / 4) - INT(y / 100) + INT(y / 400) - 32045;
  if (jd < 2299161) jd = dd + INT((153 * m + 2) / 5) + 365 * y + INT(y / 4) - 32083;
  return jd;
}

/** JD nguyên → [ngày, tháng, năm]; JD ≤ 2299160 tính theo lịch Julius. Bản dùng cho lịch âm (Tử Vi, Bát Tự). */
export function jdToDate(jd: number): DMY {
  let b: number, c: number;
  if (jd > 2299160) { const a = jd + 32044; b = INT((4 * a + 3) / 146097); c = a - INT((b * 146097) / 4); }
  else { b = 0; c = jd + 32082; }
  const d = INT((4 * c + 3) / 1461), e = c - INT((1461 * d) / 4), m = INT((5 * e + 2) / 153);
  const day = e - INT((153 * m + 2) / 5) + 1, month = m + 3 - 12 * INT(m / 10), year = b * 100 + d - 4800 + INT(m / 10);
  return [day, month, year];
}

/** Biến thể của Bát Trạch (chỉ để hiển thị): LÀM TRÒN JD trước, luôn dùng lịch Gregory, trả object.
    Cố ý khác `jdToDate` — xem ARCHITECTURE.md mục 5.3 điểm 1. */
export function jdToDateRounded(jdIn: number): { dd: number; mm: number; yy: number } {
  const jd = Math.round(jdIn);
  const a = jd + 32044, b = INT((4 * a + 3) / 146097), c = a - INT((146097 * b) / 4);
  const d0 = INT((4 * c + 3) / 1461), e = c - INT((1461 * d0) / 4), m0 = INT((5 * e + 2) / 153);
  const dd = e - INT((153 * m0 + 2) / 5) + 1;
  const mm = m0 + 3 - 12 * INT(m0 / 10);
  const yy = 100 * b + d0 - 4800 + INT(m0 / 10);
  return { dd, mm, yy };
}
