/* Đối chiếu Dụng thần của engine ngũ hành với gợi ý sơ bộ của legacy (ARCHITECTURE mục 14.1).
   Chỉ trả mã; câu hiện cho người dùng dựng ở src/content/nguhanh. Định nghĩa "đảo chiều" trùng scripts/compare-dung-than.ts. */
import type { BatTuReading } from '../battu/reading';
import type { UsefulGod } from './engine';

export type LegacyMatch = 'trung' | 'gan' | 'khac' | 'nguoc';
export type LegacyCause = 'tong-cach' | 'dieu-hau' | 'trung-hoa' | 'vuong-nhuoc' | 'khac-chon';
export interface LegacyComparison { match: LegacyMatch; cause: LegacyCause }

/**
 * Xét theo thứ tự (đảo chiều được xét trước, để không báo "trùng" khi kỵ của engine lại nằm trong danh sách dụng của legacy):
 * - `nguoc`: dụng của engine nằm trong `ky` của legacy, hoặc kỵ của engine nằm trong `dung` của legacy;
 * - `trung`: không ngược, Dụng thần chính của engine = `primary` của legacy;
 * - `gan`: không ngược, dụng của engine nằm trong `dung` của legacy;
 * - `khac`: còn lại (không ngược nhưng ngoài danh sách dụng của legacy).
 * `cause` theo thứ tự ưu tiên: cách cục đặc biệt, Điều hậu, trung hoà, kết luận vượng/nhược ngược nhau, còn lại.
 */
export function compareWithLegacy(legacy: BatTuReading, ug: UsefulGod, strength: 'tong-nhuoc' | 'nhuoc' | 'trung-hoa' | 'vuong' | 'chuyen-vuong'): LegacyComparison {
  const flip = legacy.ky.includes(ug.dung) || legacy.dung.includes(ug.ky);
  const match: LegacyMatch = flip ? 'nguoc' : legacy.primary === ug.dung ? 'trung' : legacy.dung.includes(ug.dung) ? 'gan' : 'khac';
  const engStrong = strength === 'vuong' || strength === 'chuyen-vuong';
  const engWeak = strength === 'nhuoc' || strength === 'tong-nhuoc';
  const lv = legacy.assessment.thanVuong;
  const cause: LegacyCause =
    ug.method === 'tong-cach' ? 'tong-cach'
    : ug.method === 'dieu-hau' ? 'dieu-hau'
    : ug.method === 'trung-hoa' ? 'trung-hoa'
    : (lv && engWeak) || (!lv && engStrong) ? 'vuong-nhuoc' : 'khac-chon';
  return { match, cause };
}
