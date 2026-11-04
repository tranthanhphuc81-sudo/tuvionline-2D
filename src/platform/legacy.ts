/* Mở trang legacy (bản web đầy đủ đã kiểm chứng) trong lúc chưa dựng xong màn hình mới (Phase 2–3).
   Trước khi mở, ghi hồ sơ đang xem vào `lyso-shared-v1` để trang legacy tự điền và tính luôn.
   Back trên Android: trang legacy là tài liệu khác nên Capacitor dùng history.back() → quay về app. */
export interface LegacySharedInput {
  gender: 'M' | 'F'; calendar: 'solar' | 'lunar'; day: number; month: number; year: number;
  leapMonth: boolean; hourIdx: number; lateTy: boolean;
}

export function toLegacyShared(p: LegacySharedInput) {
  return { gender: p.gender, calType: p.calendar, dd: p.day, mm: p.month, yy: p.year, leap: p.calendar === 'lunar' && p.leapMonth ? 1 : 0, hourIdx: p.hourIdx, lateTy: p.lateTy };
}

export function openLegacy(path: string, profile: LegacySharedInput | null): void {
  try {
    if (profile) localStorage.setItem('lyso-shared-v1', JSON.stringify(toLegacyShared(profile)));
  } catch { /* localStorage có thể bị chặn — trang legacy vẫn mở với ví dụ mẫu */ }
  window.location.href = path;
}
