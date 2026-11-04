/** Lịch âm Việt Nam: từ 1968 tính theo kinh tuyến 105°Đ (UTC+7); trước 1968 theo kinh tuyến 120°Đ (UTC+8). */
export function lunarTzForSolarYear(yy: number): 7 | 8 {
  return yy < 1968 ? 8 : 7;
}
export function lunarTzForLunarYear(ly: number): 7 | 8 {
  return ly < 1968 ? 8 : 7;
}
