/* Lục thân theo cung vị và Thập Thần (TBCT ch.23 "cung phân dụng thần phối lục thân", ch.24; TTT phần II ch.1–4).
   ARCHITECTURE 15.8. Chỉ phần giáo dục: trụ nào, sao nào ứng với ai. KHÔNG đoán sinh tử, hôn nhân, con cái. */
import { TANG_CAN, thapThan } from '../battu/engine';
import type { BatTuChart, ThapThan } from '../battu/types';
import type { CanIdx, Gender } from '../types';

export type ThanNhan = 'cha' | 'me' | 'anhEm' | 'phoiNgau' | 'con';

/** Sao đại diện theo quy ước truyền thống của sách, khác nhau theo giới tính của người xem lá số. */
export const SAO_THAN_NHAN: Record<Gender, Record<ThanNhan, readonly ThapThan[]>> = {
  M: { cha: ['Thiên Tài'], me: ['Chính Ấn'], anhEm: ['Tỷ Kiên', 'Kiếp Tài'], phoiNgau: ['Chính Tài'], con: ['Chính Quan', 'Thất Sát'] },
  F: { cha: ['Thiên Tài'], me: ['Chính Ấn'], anhEm: ['Tỷ Kiên', 'Kiếp Tài'], phoiNgau: ['Chính Quan'], con: ['Thực Thần', 'Thương Quan'] },
};

export interface ViTriSao { pillar: number; can: CanIdx; than: ThapThan; /** lộ trên can, hay tàng trong chi */ lo: boolean }
export interface LucThanItem { who: ThanNhan; sao: readonly ThapThan[]; viTri: ViTriSao[] }

/** Tìm các sao đại diện trong bốn trụ (can năm, tháng, giờ và can tàng của cả bốn chi; can ngày là chính mình). */
export function lucThan(ch: BatTuChart, gender: Gender): LucThanItem[] {
  const dm = ch.nhatChu;
  const spots: ViTriSao[] = [];
  ch.pillars.forEach((p, i) => {
    if (i !== 2) spots.push({ pillar: i, can: p.can, than: thapThan(dm, p.can), lo: true });
    for (const [c] of TANG_CAN[p.chi]) spots.push({ pillar: i, can: c, than: thapThan(dm, c), lo: false });
  });
  const map = SAO_THAN_NHAN[gender];
  return (Object.keys(map) as ThanNhan[]).map((who) => ({ who, sao: map[who], viTri: spots.filter((s) => map[who].includes(s.than)) }));
}

/* ===== Dấu hiệu theo sách (ARCHITECTURE 15.8, đổi 13/11/2026): engine chỉ trả MÃ, câu chữ viết nhẹ ở src/content/cachcuc/lucthan.ts =====
   Lực một nhóm sao: can lộ 1; can tàng bản khí 1, trung khí 0,5, dư khí 0,3 (cùng thang với cachcuc). */
type Nhom = 'TyKiep' | 'An' | 'ThucThuong' | 'Tai' | 'QuanSat';
const NHOM_OF: Record<ThapThan, Nhom> = {
  'Tỷ Kiên': 'TyKiep', 'Kiếp Tài': 'TyKiep', 'Thiên Ấn': 'An', 'Chính Ấn': 'An', 'Thực Thần': 'ThucThuong', 'Thương Quan': 'ThucThuong',
  'Thiên Tài': 'Tai', 'Chính Tài': 'Tai', 'Thất Sát': 'QuanSat', 'Chính Quan': 'QuanSat',
};
const KHI_W: Record<string, number> = { 'Bản khí': 1, 'Trung khí': 0.5, 'Dư khí': 0.3 };
/** Nhóm chế (khắc) sao của từng người thân, theo giới tính. */
const NHOM_CHE: Record<Gender, Record<ThanNhan, Nhom>> = {
  M: { cha: 'TyKiep', me: 'Tai', anhEm: 'QuanSat', phoiNgau: 'TyKiep', con: 'ThucThuong' },
  F: { cha: 'TyKiep', me: 'Tai', anhEm: 'QuanSat', phoiNgau: 'ThucThuong', con: 'An' },
};
export const DAU_NGUONG = { CHE: 2.5, SAO_YEU: 1.5, TRANH_TY: 3, TRANH_TAI: 1 } as const;

/** ro: sao lộ và có gốc; an: chỉ ẩn trong chi; vang: không có. biChe: nhóm chế mạnh mà sao không vững.
    honTap: (nữ) Chính Quan và Thất Sát cùng lộ. tranhTai: (anh em) Tỷ Kiếp vượng mà Tài yếu. */
export type DauCode = 'ro' | 'an' | 'vang' | 'biChe' | 'honTap' | 'tranhTai';
export interface LucThanDau { who: ThanNhan; codes: DauCode[]; luc: number; che: number; nhomChe: Nhom }
/** Cung vị gặp xung với chi kề bên: chi ngày (cung bạn đời; xung với chi giờ thì chạm cả cung con cái), chi tháng (cung cha mẹ, anh em). */
export interface CungXung { cung: 'ngay' | 'thang'; voi: number }

export function lucThanDau(ch: BatTuChart, gender: Gender): { dau: LucThanDau[]; cungXung: CungXung[] } {
  const dm = ch.nhatChu;
  const luc: Record<Nhom, number> = { TyKiep: 0, An: 0, ThucThuong: 0, Tai: 0, QuanSat: 0 };
  const lucThan_: Partial<Record<ThapThan, number>> = {};
  const add = (t: ThapThan, w: number) => { luc[NHOM_OF[t]] += w; lucThan_[t] = (lucThan_[t] ?? 0) + w; };
  ch.pillars.forEach((p, i) => {
    if (i !== 2) add(thapThan(dm, p.can), 1);
    for (const [c, role] of TANG_CAN[p.chi]) add(thapThan(dm, c), KHI_W[role] ?? 0.3);
  });
  const items = lucThan(ch, gender);
  const dau = items.map((it): LucThanDau => {
    const lo = it.viTri.some((v) => v.lo), an = it.viTri.some((v) => !v.lo);
    const own = it.sao.reduce((a, s) => a + (lucThan_[s] ?? 0), 0);
    const nhomChe = NHOM_CHE[gender][it.who];
    const codes: DauCode[] = [lo && an ? 'ro' : it.viTri.length ? 'an' : 'vang'];
    if (luc[nhomChe] >= DAU_NGUONG.CHE && own < DAU_NGUONG.SAO_YEU) codes.push('biChe');
    if (gender === 'F' && it.who === 'phoiNgau' && it.viTri.length) {
      const loCan = ch.pillars.filter((_, i) => i !== 2).map((p) => thapThan(dm, p.can));
      if (loCan.includes('Chính Quan') && loCan.includes('Thất Sát')) codes.push('honTap');
    }
    if (it.who === 'anhEm' && luc.TyKiep >= DAU_NGUONG.TRANH_TY && luc.Tai < DAU_NGUONG.TRANH_TAI) codes.push('tranhTai');
    return { who: it.who, codes, luc: Math.round(own * 100) / 100, che: Math.round(luc[nhomChe] * 100) / 100, nhomChe };
  });
  const chi = ch.pillars.map((p) => p.chi);
  const xung = (a: number, b: number) => (chi[a] + 6) % 12 === chi[b];
  const cungXung: CungXung[] = [];
  for (const j of [1, 3]) if (xung(2, j)) cungXung.push({ cung: 'ngay', voi: j });
  for (const j of [0, 2]) if (xung(1, j)) cungXung.push({ cung: 'thang', voi: j });
  return { dau, cungXung };
}
