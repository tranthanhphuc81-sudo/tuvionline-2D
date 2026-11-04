import type { CanIdx, ChiIdx, Quai } from '../types';

/** Kết quả một lần gieo cho một hào: 6 = lão âm (động), 7 = thiếu dương, 8 = thiếu âm, 9 = lão dương (động). */
export type Toss = number;

export type HexaStep = 'Bản cung' | 'Nhất thế' | 'Nhị thế' | 'Tam thế' | 'Tứ thế' | 'Ngũ thế' | 'Du hồn' | 'Quy hồn';
export type LucThan = 'Huynh Đệ' | 'Tử Tôn' | 'Thê Tài' | 'Quan Quỷ' | 'Phụ Mẫu';
/** Chỉ số hành theo thứ tự RIÊNG của Lục Hào: 0 Kim, 1 Thuỷ, 2 Mộc, 3 Hoả, 4 Thổ (LH_HANH_ORDER). */
export type LhHanhIdx = number;
export type VuongSuy = 'Vượng' | 'Tướng' | 'Hưu' | 'Tù' | 'Tử';
export type Season = 'xuan' | 'ha' | 'thu' | 'dong' | 'tuquy';

export interface Hao {
  /** 1…6, tính từ dưới lên */
  idx: number;
  can: CanIdx;
  chi: ChiIdx;
  hanhIdx: LhHanhIdx;
  toss: Toss;
  /** 1 = dương, 0 = âm */
  amDuong: number;
  dong: boolean;
  lucThan: LucThan;
  isThe: boolean;
  isUng: boolean;
}

export interface HaoHoa {
  haoIdx: number;
  tuCan: CanIdx;
  tuChi: ChiIdx;
  tuLucThan: LucThan;
  denCan: CanIdx;
  denChi: ChiIdx;
  denLucThan: LucThan;
}

export interface QueBien { name: string; cung: Quai; step: HexaStep; hoaList: HaoHoa[] }

export interface LucHaoResult {
  haName: Quai;
  thName: Quai;
  cung: Quai;
  step: HexaStep;
  name: string;
  hao: Hao[];
  theHao: number;
  ungHao: number;
  cungHanhIdx: LhHanhIdx;
  bien: QueBien | null;
}
