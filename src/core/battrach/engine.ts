/* Bát Trạch — đối chiếu tài liệu Phần 4 (Chương 2/4/10). */
import { jdFromDate, jdToDateRounded as jdToDate, lapXuanJD } from '../calendar';
import type { Hanh } from '../canchi/hanh';
import type { DuNienStar, Gender, Huong, LySoYear, Nhom, Quai, StarName } from './types';

/** "Năm lý số" dùng cho Mệnh Quái: sinh trước tiết Lập Xuân của năm thì lấy năm trước (mục 2.2 Phần 4).
    So theo quy ước JD giữa trưa, không có giờ sinh (ARCHITECTURE.md mục 5.3 điểm 4). */
export function lySoYear(dd: number, mm: number, yy: number, tz: number): LySoYear {
  const birthJD = jdFromDate(dd, mm, yy);
  const lx = lapXuanJD(yy, tz);
  return { year: birthJD < lx ? yy - 1 : yy, beforeLapXuan: birthJD < lx };
}

function digitSum(n: number): number {
  while (n >= 10) n = String(n).split('').reduce((a, d) => a + +d, 0);
  return n;
}

const QUAI_BY_NUM: Record<number, Quai> = { 1: 'Khảm', 2: 'Khôn', 3: 'Chấn', 4: 'Tốn', 6: 'Càn', 7: 'Đoài', 8: 'Cấn', 9: 'Ly' };

export function menhQuai(year: number, gender: Gender): Quai {
  const last2 = ((year % 100) + 100) % 100;
  const S = digitSum(last2);
  let num: number;
  if (year < 2000) num = gender === 'M' ? 10 - S : 5 + S;
  else num = gender === 'M' ? 9 - S : 6 + S;
  if (num > 9) num = digitSum(num);
  if (num === 0) num = 9;
  if (num === 5) return gender === 'M' ? 'Khôn' : 'Cấn';
  return QUAI_BY_NUM[num];
}

type Bits = readonly [number, number, number];
const TRI: Record<Quai, Bits> = {
  'Càn': [1, 1, 1], 'Khảm': [0, 1, 0], 'Cấn': [0, 0, 1], 'Chấn': [1, 0, 0], 'Tốn': [0, 1, 1], 'Ly': [1, 0, 1], 'Khôn': [0, 0, 0], 'Đoài': [1, 1, 0],
};
export const HANH: Record<Quai, Hanh> = {
  'Càn': 'Kim', 'Khảm': 'Thuỷ', 'Cấn': 'Thổ', 'Chấn': 'Mộc', 'Tốn': 'Mộc', 'Ly': 'Hoả', 'Khôn': 'Thổ', 'Đoài': 'Kim',
};
const DONG_TU: readonly Quai[] = ['Khảm', 'Ly', 'Chấn', 'Tốn'];

export function nhom(q: Quai): Nhom {
  return DONG_TU.includes(q) ? 'Đông Tứ Mệnh' : 'Tây Tứ Mệnh';
}

function bitsToTri(b: readonly number[]): Quai {
  for (const [name, t] of Object.entries(TRI) as [Quai, Bits][]) if (t[0] === b[0] && t[1] === b[1] && t[2] === b[2]) return name;
  throw new Error('bitsToTri: bộ hào không hợp lệ');
}
function flip(bits: Bits, positions: readonly number[]): number[] {
  const r = [...bits];
  positions.forEach((p) => { r[p] = 1 - r[p]; });
  return r;
}

/** 8 sao Du Niên: đảo các hào của quái gốc. */
export const STARS: readonly { name: StarName; flip: readonly number[]; good: boolean }[] = [
  { name: 'Phục Vị', flip: [], good: true },
  { name: 'Sinh Khí', flip: [2], good: true },
  { name: 'Thiên Y', flip: [0, 1], good: true },
  { name: 'Diên Niên', flip: [0, 1, 2], good: true },
  { name: 'Tuyệt Mệnh', flip: [1], good: false },
  { name: 'Lục Sát', flip: [0, 2], good: false },
  { name: 'Hoạ Hại', flip: [0], good: false },
  { name: 'Ngũ Quỷ', flip: [1, 2], good: false },
];

export function duNien(base: Quai): DuNienStar[] {
  const bits = TRI[base];
  return STARS.map((s) => {
    const quai = bitsToTri(flip(bits, s.flip));
    return { star: s.name, good: s.good, quai, hanh: HANH[quai] };
  });
}

export const HAU_THIEN: Record<Huong, Quai> = {
  'Bắc': 'Khảm', 'Đông Bắc': 'Cấn', 'Đông': 'Chấn', 'Đông Nam': 'Tốn', 'Nam': 'Ly', 'Tây Nam': 'Khôn', 'Tây': 'Đoài', 'Tây Bắc': 'Càn',
};
export const QUAI_TO_HUONG = Object.fromEntries(Object.entries(HAU_THIEN).map(([h, q]) => [q, h])) as Record<Quai, Huong>;
export const DOI_HUONG: Record<Huong, Huong> = {
  'Bắc': 'Nam', 'Nam': 'Bắc', 'Đông': 'Tây', 'Tây': 'Đông', 'Đông Bắc': 'Tây Nam', 'Tây Nam': 'Đông Bắc', 'Đông Nam': 'Tây Bắc', 'Tây Bắc': 'Đông Nam',
};

export const HANH_COLOR: Record<Hanh, { mau: string[]; hex: string[] }> = {
  'Mộc': { mau: ['Xanh lá', 'Xanh lục'], hex: ['#3f8f4f', '#5fab6c'] },
  'Hoả': { mau: ['Đỏ', 'Cam', 'Hồng', 'Tím'], hex: ['#c9432f', '#e08a2b'] },
  'Thổ': { mau: ['Vàng đất', 'Nâu', 'Be'], hex: ['#b98a3d', '#8a6a3d'] },
  'Kim': { mau: ['Trắng', 'Xám', 'Ánh kim'], hex: ['#cfcfcf', '#e8d98a'] },
  'Thuỷ': { mau: ['Đen', 'Xanh dương/Navy'], hex: ['#1c1c1c', '#2b4a7a'] },
};
/** a sinh H: SINH_PREV[H] = a */
export const SINH_PREV: Record<Hanh, Hanh> = { 'Hoả': 'Mộc', 'Thổ': 'Hoả', 'Kim': 'Thổ', 'Thuỷ': 'Kim', 'Mộc': 'Thuỷ' };
/** a khắc H: KHAC_PREV[H] = a */
export const KHAC_PREV: Record<Hanh, Hanh> = { 'Thổ': 'Mộc', 'Thuỷ': 'Thổ', 'Hoả': 'Thuỷ', 'Kim': 'Hoả', 'Mộc': 'Kim' };
/** H khắc b: KHAC_NEXT[H] = b */
export const KHAC_NEXT: Record<Hanh, Hanh> = { 'Mộc': 'Thổ', 'Thổ': 'Thuỷ', 'Thuỷ': 'Hoả', 'Hoả': 'Kim', 'Kim': 'Mộc' };

export const PhongThuyEngine = {
  menhQuai, HANH, nhom, duNien, HAU_THIEN, QUAI_TO_HUONG, DOI_HUONG, HANH_COLOR, SINH_PREV, KHAC_PREV, KHAC_NEXT,
  lySoYear, lapXuanJD, jdFromDate, jdToDate,
};
export default PhongThuyEngine;
