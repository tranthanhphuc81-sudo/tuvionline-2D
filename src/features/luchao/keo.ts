/* Xin keo trước khi gieo quẻ (ARCHITECTURE 16.4). Hai miếng keo hình bán nguyệt: một sấp một ngửa là "thuận" thì gieo; hai mặt
   giống nhau thì xin lại; tối đa KEO_MAX lần rồi vẫn cho gieo, không chặn ai (nguyên tắc 12.1). Chỉ là nghi thức, không ảnh
   hưởng quẻ: quẻ vẫn gieo bằng xu như cũ. */
export type KeoFace = 'sap' | 'ngua';
export type KeoResult = 'thuan' | 'cung-ngua' | 'cung-sap';
export const KEO_MAX = 3;

export function tossKeo(rand: () => number = Math.random): { faces: [KeoFace, KeoFace]; result: KeoResult } {
  const faces: [KeoFace, KeoFace] = [rand() < 0.5 ? 'sap' : 'ngua', rand() < 0.5 ? 'sap' : 'ngua'];
  const result: KeoResult = faces[0] !== faces[1] ? 'thuan' : faces[0] === 'ngua' ? 'cung-ngua' : 'cung-sap';
  return { faces, result };
}

/** Sau lần xin thứ `tries` (tính từ 1): thuận, xin lại, hay đã đủ số lần nên cứ gieo. */
export function keoNext(result: KeoResult, tries: number): 'thuan' | 'lai' | 'du' {
  if (result === 'thuan') return 'thuan';
  return tries >= KEO_MAX ? 'du' : 'lai';
}
