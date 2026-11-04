/* Phần TÍNH TOÁN của luận giải Bát Tự, chuyển từ legacy (lyso-toolkit.html: assessThan, countGiupHao, renderVuongSuy,
   doYearLookup của tab Bát Tự; batTu, thapThanProfile của LySoInterp). Giữ nguyên quy tắc và thứ tự xét.
   Chỉ trả số liệu/mã; câu chữ ở src/content/battu. */
import { mod, yearCanChiIndex, type CanChi, type CanIdx, type ChiIdx, type Hanh } from '../canchi';
import { BT_HANH_ORDER, CAN_HANH, CHI_HANH, GIUP_THAN, TANG_CAN, seasonHanh, thapThan } from './engine';
import type { BatTuChart, ThapThan } from './types';

export type VuongSuyState = 'Vượng' | 'Tướng' | 'Hưu' | 'Tù' | 'Tử';
export type Mua = 'Xuân' | 'Hạ' | 'Thu' | 'Đông' | 'Tứ quý';
export type ThapThanFamily = 'Tỷ Kiếp' | 'Thực Thương' | 'Tài' | 'Quan Sát' | 'Ấn';
export const FAMILY_GODS: Record<ThapThanFamily, readonly ThapThan[]> = {
  'Tỷ Kiếp': ['Tỷ Kiên', 'Kiếp Tài'],
  'Thực Thương': ['Thực Thần', 'Thương Quan'],
  'Tài': ['Chính Tài', 'Thiên Tài'],
  'Quan Sát': ['Chính Quan', 'Thất Sát'],
  'Ấn': ['Chính Ấn', 'Thiên Ấn'],
};
const FAMILIES = Object.keys(FAMILY_GODS) as ThapThanFamily[];
export function familyOf(god: ThapThan): ThapThanFamily {
  return FAMILIES.find((f) => FAMILY_GODS[f].includes(god))!;
}

const hanhName = (i: number): Hanh => BT_HANH_ORDER[i];

/** Thập Thần của 3 Can lộ (Năm, Tháng, Giờ) so với Nhật Chủ. */
export function locThapThan(ch: BatTuChart): ThapThan[] {
  return [ch.yearCC.can, ch.monthCanIdx, ch.gioCanIdx].map((c) => thapThan(ch.nhatChu, c));
}

export interface ThanAssessment {
  nhatChuHanh: Hanh;
  trangThai: VuongSuyState;
  dacLenh: boolean;
  giup: number;
  hao: number;
  thanVuong: boolean;
}

/** Legacy assessThan: trạng thái theo mùa, Đắc Lệnh, đếm 3 Can lộ giúp/hao, kết luận Thân vượng/nhược. */
export function assessThan(ch: BatTuChart): ThanAssessment {
  const nhatChuHanh = CAN_HANH[ch.nhatChu];
  const vuongHanh = seasonHanh(ch.monthChiIdx);
  let trangThai: VuongSuyState;
  if (nhatChuHanh === vuongHanh) trangThai = 'Vượng';
  else if (nhatChuHanh === mod(vuongHanh + 1, 5)) trangThai = 'Tướng';
  else if (nhatChuHanh === mod(vuongHanh + 4, 5)) trangThai = 'Hưu';
  else if (nhatChuHanh === mod(vuongHanh + 3, 5)) trangThai = 'Tù';
  else trangThai = 'Tử';
  const dacLenh = trangThai === 'Vượng' || trangThai === 'Tướng';
  let giup = 0, hao = 0;
  for (const t of locThapThan(ch)) { if (GIUP_THAN.includes(t)) giup++; else hao++; }
  return { nhatChuHanh: hanhName(nhatChuHanh), trangThai, dacLenh, giup, hao, thanVuong: dacLenh && giup >= hao };
}

export function muaOf(monthChi: ChiIdx): Mua {
  if ([2, 3].includes(monthChi)) return 'Xuân';
  if ([5, 6].includes(monthChi)) return 'Hạ';
  if ([8, 9].includes(monthChi)) return 'Thu';
  if ([11, 0].includes(monthChi)) return 'Đông';
  return 'Tứ quý';
}

/** Gợi ý Dụng Thần sơ bộ (legacy renderVuongSuy): mẫu "Sát trọng dụng Ấn" trước, rồi theo Thân vượng/nhược. */
export function dungThanPattern(ch: BatTuChart, a: ThanAssessment): { kind: 'sat-an' | 'vuong' | 'nhuoc'; soQuanSat: number } {
  const lt = locThapThan(ch);
  const soQuanSat = lt.filter((t) => t === 'Thất Sát' || t === 'Chính Quan').length;
  const coAn = lt.some((t) => t === 'Thiên Ấn' || t === 'Chính Ấn');
  return { kind: soQuanSat >= 2 && coAn ? 'sat-an' : a.thanVuong ? 'vuong' : 'nhuoc', soQuanSat };
}

/* ===== Hồ sơ Thập Thần (legacy thapThanProfile) ===== */
export type ThapThanCombo = 'thuc-thuong-sinh-tai' | 'quan-an' | 'thuong-quan-gap-quan' | 'ty-kiep-gap-tai' | 'sat-an' | 'an-nhieu-thieu-thuc-thuong';
export interface ThapThanProfile {
  /** phần trăm làm tròn của 5 nhóm */
  pct: Record<ThapThanFamily, number>;
  /** 5 nhóm xếp giảm dần (giữ thứ tự gốc khi bằng nhau) */
  order: ThapThanFamily[];
  /** 2 Thập Thần nặng nhất */
  topGods: ThapThan[];
  combos: ThapThanCombo[];
  /** nhóm gần như vắng (< 6%) */
  missing: ThapThanFamily[];
}
export function thapThanProfile(ch: BatTuChart): ThapThanProfile {
  const w: Partial<Record<ThapThan, number>> = {};
  const fam = Object.fromEntries(FAMILIES.map((f) => [f, 0])) as Record<ThapThanFamily, number>;
  const add = (god: ThapThan, x: number) => { w[god] = (w[god] || 0) + x; fam[familyOf(god)] += x; };
  [ch.yearCC.can, ch.monthCanIdx, ch.gioCanIdx].forEach((c) => add(thapThan(ch.nhatChu, c), 1));
  const LV: Record<string, number> = { 'Bản khí': 1, 'Trung khí': 0.5, 'Dư khí': 0.3 };
  ch.pillars.forEach((p) => (TANG_CAN[p.chi] || []).forEach((t) => add(thapThan(ch.nhatChu, t[0]), LV[t[1]] || 0.3)));
  let total = 0;
  FAMILIES.forEach((f) => { total += fam[f]; });
  const pct = Object.fromEntries(FAMILIES.map((f) => [f, Math.round(fam[f] / total * 100)])) as Record<ThapThanFamily, number>;
  const godPct: Partial<Record<ThapThan, number>> = {};
  (Object.keys(w) as ThapThan[]).forEach((g) => { godPct[g] = w[g]! / total * 100; });
  const order = [...FAMILIES].sort((a, b) => fam[b] - fam[a]);
  const topGods = (Object.keys(w) as ThapThan[]).sort((a, b) => w[b]! - w[a]!).slice(0, 2);
  const P = (f: ThapThanFamily) => pct[f], G = (g: ThapThan) => godPct[g] || 0;
  const combos: ThapThanCombo[] = [];
  if (P('Thực Thương') >= 20 && P('Tài') >= 20) combos.push('thuc-thuong-sinh-tai');
  if (P('Quan Sát') >= 20 && P('Ấn') >= 20) combos.push('quan-an');
  if (G('Thương Quan') >= 15 && G('Chính Quan') >= 12) combos.push('thuong-quan-gap-quan');
  if (P('Tỷ Kiếp') >= 30 && P('Tài') >= 12) combos.push('ty-kiep-gap-tai');
  if (G('Thất Sát') >= 18 && P('Ấn') >= 15) combos.push('sat-an');
  if (P('Ấn') >= 30 && P('Thực Thương') <= 10) combos.push('an-nhieu-thieu-thuc-thuong');
  const missing = FAMILIES.filter((f) => pct[f] < 6);
  return { pct, order, topGods, combos, missing };
}

/* ===== Tổng kết (legacy batTu) ===== */
const SINH_ORDER: readonly Hanh[] = ['Mộc', 'Hoả', 'Thổ', 'Kim', 'Thuỷ'];
const ix = (h: Hanh) => SINH_ORDER.indexOf(h);
export const sinhRa = (h: Hanh) => SINH_ORDER[(ix(h) + 1) % 5];
export const khacDi = (h: Hanh) => SINH_ORDER[(ix(h) + 2) % 5];
export const biKhacBoi = (h: Hanh) => SINH_ORDER[(ix(h) + 3) % 5];
export const duocSinhBoi = (h: Hanh) => SINH_ORDER[(ix(h) + 4) % 5];

export interface HanhPeriod { canChi: CanChi; hanhCan: Hanh; hanhChi: Hanh; score: number }
export interface BatTuReading {
  assessment: ThanAssessment;
  /** số chữ của mỗi hành trong 8 chữ, theo thứ tự Mộc, Hoả, Thổ, Kim, Thuỷ */
  count: Record<Hanh, number>;
  thieu: Hanh[];
  nhieu: Hanh[];
  satAn: boolean;
  dung: Hanh[];
  ky: Hanh[];
  /** Dụng Thần chính = hành trong `dung` ít chữ nhất */
  primary: Hanh;
  daiVanNow: (HanhPeriod & { index: number; tuoiStart: number }) | null;
  yearNow: HanhPeriod & { year: number };
  profile: ThapThanProfile;
}

export function batTuReading(ch: BatTuChart, nowYear: number): BatTuReading {
  const a = assessThan(ch);
  const nc = a.nhatChuHanh;
  const count = Object.fromEntries(BT_HANH_ORDER.map((h) => [h, 0])) as Record<Hanh, number>;
  ch.pillars.forEach((p) => { count[hanhName(CAN_HANH[p.can])]++; count[hanhName(CHI_HANH[p.chi])]++; });
  const thieu = BT_HANH_ORDER.filter((h) => count[h] === 0);
  const nhieu = BT_HANH_ORDER.filter((h) => count[h] >= 3);
  const satAn = dungThanPattern(ch, a).kind === 'sat-an';
  let dung: Hanh[], ky: Hanh[];
  if (satAn) { dung = [duocSinhBoi(nc), nc]; ky = [biKhacBoi(nc)]; }
  else if (a.thanVuong) { dung = [sinhRa(nc), khacDi(nc), biKhacBoi(nc)]; ky = [duocSinhBoi(nc), nc]; }
  else { dung = [duocSinhBoi(nc), nc]; ky = [biKhacBoi(nc), khacDi(nc)]; }
  const primary = dung.slice().sort((x, y) => count[x] - count[y])[0];
  const scoreHanh = (h: Hanh) => (dung.includes(h) ? 1 : ky.includes(h) ? -1 : 0);
  const period = (cc: CanChi): HanhPeriod => {
    const hanhCan = hanhName(CAN_HANH[cc.can]), hanhChi = hanhName(CHI_HANH[cc.chi]);
    return { canChi: cc, hanhCan, hanhChi, score: scoreHanh(hanhCan) + scoreHanh(hanhChi) };
  };
  const tuoi = nowYear - ch.tietYear + 1;
  const dvIdx = Math.floor((tuoi - ch.khoiVanYears) / 10);
  const daiVanNow = dvIdx >= 0 && dvIdx < ch.daiVan.length
    ? { ...period(ch.daiVan[dvIdx]), index: dvIdx, tuoiStart: ch.khoiVanYears + dvIdx * 10 } : null;
  return {
    assessment: a, count, thieu, nhieu, satAn, dung, ky, primary, daiVanNow,
    yearNow: { ...period(yearCanChiIndex(nowYear)), year: nowYear }, profile: thapThanProfile(ch),
  };
}

/** Bảng "Tra Lưu Niên theo năm" (legacy doYearLookup của Bát Tự). Tuổi tính theo năm tiết (Lập Xuân). */
export interface BatTuYearLookup { year: number; tuoi: number; yearCC: CanChi; thapThan: ThapThan; daiVan: CanChi | null; daiVanIndex: number | null }
export function batTuYearLookup(ch: BatTuChart, year: number): BatTuYearLookup {
  const yc = yearCanChiIndex(year);
  const tuoi = year - ch.tietYear + 1;
  const dvIdx = Math.floor((tuoi - ch.khoiVanYears) / 10);
  const ok = dvIdx >= 0 && dvIdx < ch.daiVan.length;
  return { year, tuoi, yearCC: yc, thapThan: thapThan(ch.nhatChu, yc.can), daiVan: ok ? ch.daiVan[dvIdx] : null, daiVanIndex: ok ? dvIdx : null };
}

/** Tàng Can của một Chi kèm Thập Thần so với Nhật Chủ (thẻ trụ). */
export function tangCanOf(ch: BatTuChart, chi: ChiIdx): { can: CanIdx; level: string; thapThan: ThapThan }[] {
  return (TANG_CAN[chi] || []).map(([c, level]) => ({ can: c, level, thapThan: thapThan(ch.nhatChu, c) }));
}
