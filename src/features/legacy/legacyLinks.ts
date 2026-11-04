/* Trang legacy dùng tạm cho công cụ chưa dựng lại (xoá ở Phase 3 khi có màn hình mới tương đương). */
export const LEGACY = {
  tuvi: 'legacy/lyso-toolkit.html#tuvi',
  battu: 'legacy/lyso-toolkit.html#battu',
  luchao: 'legacy/lyso-toolkit.html#kinhdich',
  battrach: 'legacy/lyso-toolkit.html#phongthuy',
  napam: 'legacy/lyso-toolkit.html#napam',
  tonghop: 'legacy/lyso-toolkit.html#tonghop',
  laban: 'legacy/la-ban-phong-thuy.html',
} as const;
export type LegacyKey = keyof typeof LEGACY;
