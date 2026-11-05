/* Phần TÍNH TOÁN của La Bàn, chuyển từ legacy (la-ban-phong-thuy.html: nearestSectorIdx, refreshSectorColors, updateResultCard,
   angleFromEvent) kèm bộ lọc nhiễu và phép chấm độ tin cậy mới (ARCHITECTURE.md mục 11). Câu chữ ở src/content/laban. */
import { HUONG_LIST } from '../battrach/reading';
import { HANH, HAU_THIEN } from '../battrach/engine';
import type { DuNienStar, Huong, Quai } from '../battrach/types';
import type { Hanh } from '../canchi/hanh';

export const normDeg = (d: number): number => ((d % 360) + 360) % 360;

export interface LaBanSector {
  huong: Huong;
  /** góc giữa cung, 0 = Bắc, tăng theo chiều kim đồng hồ */
  bearing: number;
  quai: Quai;
  hanh: Hanh;
  /** sao Du Niên của hướng này; null khi chưa có Mệnh Quái */
  star: DuNienStar | null;
}

/** 8 cung la bàn; truyền bảng Du Niên để biết sao của từng cung. */
export function laBanSectors(dn: readonly DuNienStar[] | null): LaBanSector[] {
  return HUONG_LIST.map((huong, i) => {
    const quai = HAU_THIEN[huong];
    return { huong, bearing: i * 45, quai, hanh: HANH[quai], star: dn?.find((x) => x.quai === quai) ?? null };
  });
}

/** Cung gần nhất của một góc (legacy nearestSectorIdx). */
export function sectorOf(heading: number, sectors: readonly LaBanSector[]): LaBanSector {
  return sectors[Math.round(normDeg(heading) / 45) % 8];
}

/** Góc của điểm chạm so với tâm vòng la bàn (legacy angleFromEvent). */
export function angleFromCenter(dx: number, dy: number): number {
  return normDeg((Math.atan2(dx, -dy) * 180) / Math.PI);
}

/** Lọc nhiễu trên vòng tròn: trung bình sin/cos có trọng số `k` (0…1) nên qua được mốc 359° → 0°. */
export function smoothHeading(prev: number | null, next: number, k = 0.25): number {
  if (prev === null) return normDeg(next);
  const r = Math.PI / 180;
  const x = (1 - k) * Math.cos(prev * r) + k * Math.cos(next * r);
  const y = (1 - k) * Math.sin(prev * r) + k * Math.sin(next * r);
  return normDeg(Math.atan2(y, x) / r);
}

/** Từ ngưỡng này trở lên coi là cần hiệu chỉnh. Số tạm, chốt sau khi đo trên máy thật (ARCHITECTURE.md mục 11). */
export const HEADING_ERROR_LIMIT = 15;

/** Từ trường Trái Đất ở mặt đất khoảng 25–65 µT. Ngoài khoảng này là có vật khác gây nhiễu. Số tạm, chốt sau khi đo (ARCHITECTURE.md mục 11). */
export const FIELD_MIN_UT = 25;
export const FIELD_MAX_UT = 65;

/** Độ tin cậy của cảm biến. `accuracy` theo SensorManager: −1, 0 không tin cậy · 1 thấp · 2 vừa · 3 cao; null = không biết.
    `fieldUT` là độ lớn từ trường đo được: máy thật có thể vẫn báo `accuracy` cao khi để cạnh loa, nên phải xét riêng. */
export function compassTrust(accuracy: number | null, headingErrorDeg: number | null, fieldUT: number | null = null): 'ok' | 'calibrate' | 'interference' {
  if (fieldUT !== null && (fieldUT < FIELD_MIN_UT || fieldUT > FIELD_MAX_UT)) return 'interference';
  if (accuracy !== null && accuracy <= 1) return 'calibrate';
  return headingErrorDeg !== null && headingErrorDeg > HEADING_ERROR_LIMIT ? 'calibrate' : 'ok';
}
