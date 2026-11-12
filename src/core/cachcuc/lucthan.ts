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
