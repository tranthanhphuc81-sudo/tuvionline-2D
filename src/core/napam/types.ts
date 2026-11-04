import type { CanIdx, ChiIdx } from '../types';
import type { Hanh } from '../canchi/hanh';

export interface NapAmYear {
  year: number;
  can: CanIdx;
  chi: ChiIdx;
  canChiTen: string;
  hanh: Hanh;
  ten: string;
}

/** Hai ngoại lệ "cần hành khắc mình" (Phụ lục Nạp Âm, mục 5). */
export type NapAmNeedsId = 'kim-tho' | 'hoa-troi';

export type NapAmRelationKind =
  | 'exc-dai-hai-sa-trung' // Đại Hải Thuỷ dung nạp Sa Trung Thổ
  | 'exc-needs' // Kiếm Phong/Sa Trung Kim cần Hoả; Thiên Thượng/Tích Lịch Hoả cần Thuỷ
  | 'same' // cùng hành
  | 'sinh' // `from` sinh `to`
  | 'khac' // `from` khắc `to`
  | 'unknown';

/** Quan hệ hợp hôn theo Nạp Âm: engine chỉ trả MÃ, câu văn ở src/content/napam/relation.ts.
    `from`/`to` là Người 1 hoặc Người 2 (với `exc-needs`, `from` là người mang ngoại lệ). */
export interface NapAmRelation {
  cls: 'ok' | 'warn';
  kind: NapAmRelationKind;
  from: 1 | 2;
  to: 1 | 2;
  needs?: NapAmNeedsId;
}
