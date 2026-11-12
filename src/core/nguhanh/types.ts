/* Kiểu chung của engine ngũ hành. Engine trả MÃ và SỐ, không trả câu văn (quy tắc src/core);
   câu chữ dựng ở src/content/nguhanh (bước 3C.3) từ `Msg`. */
import type { Branch, Element, Stem } from './data';

/** Một thông điệp dạng mã: `code` chọn mẫu câu, `p` là tham số (hành, chỉ số can chi, số liệu). */
export type MsgParam = string | number | boolean | null | MsgParam[] | { [k: string]: MsgParam };
export type Msg = { code: string; p?: { [k: string]: MsgParam } };
export const msg = (code: string, p?: Msg['p']): Msg => (p ? { code, p } : { code });

export interface Pillar { stem: Stem; branch: Branch }
/** Tứ trụ đã an sẵn kèm Đại Vận. `tietYear` là năm tính theo Lập Xuân (tuổi = năm − tietYear + 1). */
export interface NguHanhChart {
  year: Pillar; month: Pillar; day: Pillar; hour: Pillar;
  daiVan: Pillar[];
  khoiVanYears: number;
  tietYear: number;
}

export type Scores = Record<Element, number>;
