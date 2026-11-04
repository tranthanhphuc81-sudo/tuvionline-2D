/* Danh sách ca kiểm thử dùng cho bản chụp kết quả engine (tests/core-snapshot.test.ts).
   Mục đích: khoá TOÀN BỘ đầu ra của engine trước khi gộp/chuyển sang TypeScript (Phase 1.2),
   để chắc chắn mọi công thức giữ nguyên. Danh sách ca phải ổn định — đổi danh sách thì phải sinh lại bản chụp
   từ một phiên bản engine đã được tin cậy. */

export interface SolarDate { dd: number; mm: number; yy: number }

function addDays(d: SolarDate, n: number): SolarDate {
  const t = new Date(Date.UTC(d.yy, d.mm - 1, d.dd + n));
  return { dd: t.getUTCDate(), mm: t.getUTCMonth() + 1, yy: t.getUTCFullYear() };
}

/** Ngày đều đặn từ 1/1/1900 đến 31/12/2100, cách nhau `step` ngày. */
export function spreadDates(step: number): SolarDate[] {
  const out: SolarDate[] = [];
  for (let d: SolarDate = { dd: 1, mm: 1, yy: 1900 }; d.yy <= 2100; d = addDays(d, step)) out.push(d);
  return out;
}

/** Các ngày quanh Lập Xuân (2–6/2) mỗi năm — nơi Trụ Năm và Mệnh Quái đổi năm. */
export function lapXuanDates(): SolarDate[] {
  const out: SolarDate[] = [];
  for (let yy = 1900; yy <= 2100; yy++) for (let dd = 2; dd <= 6; dd++) out.push({ dd, mm: 2, yy });
  return out;
}

/** Quanh các tiết đầu tháng (ngày 4–9 mỗi tháng) của một số năm, kể cả trước 1968. */
export function tietDates(): SolarDate[] {
  const out: SolarDate[] = [];
  for (const yy of [1901, 1945, 1966, 1967, 1968, 1969, 1999, 2000, 2024, 2033, 2099]) {
    for (let mm = 1; mm <= 12; mm++) for (let dd = 4; dd <= 9; dd++) out.push({ dd, mm, yy });
  }
  return out;
}

/** Tất cả 4^6 = 4096 tổ hợp gieo quẻ (mỗi hào 6/7/8/9). */
export function allTosses(): number[][] {
  const out: number[][] = [];
  for (let n = 0; n < 4096; n++) {
    const t: number[] = [];
    for (let i = 0, x = n; i < 6; i++, x >>= 2) t.push(6 + (x & 3));
    out.push(t);
  }
  return out;
}
