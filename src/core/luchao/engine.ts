/* Lục Hào (Kinh Dịch, Phần 3): lập quẻ, Nạp Giáp, Lục Thân, Thế/Ứng, quẻ biến. */
import { monthChiFromDate } from '../calendar';
import { CAN, CHI, mod, dayCanChiIndex, type ChiIdx } from '../canchi';
import type { Quai } from '../types';
import { HEXA_ROWS, NAP_GIAP } from './hexagrams';
import type { HexaStep, Hao, HaoHoa, LhHanhIdx, LucHaoResult, LucThan, Season, Toss, VuongSuy } from './types';

/** Thứ tự hành RIÊNG của Lục Hào — khác Bát Tự (ARCHITECTURE.md mục 5.3 điểm 2). */
export const LH_HANH_ORDER = ['Kim', 'Thuỷ', 'Mộc', 'Hoả', 'Thổ'] as const;
const HANH5 = LH_HANH_ORDER;
/** Hành của 12 Chi theo LH_HANH_ORDER. */
export const CHI_HANH_IDX: readonly LhHanhIdx[] = [1, 4, 2, 2, 4, 3, 3, 4, 0, 0, 4, 1];
export const TRI: readonly Quai[] = ['Càn', 'Khảm', 'Cấn', 'Chấn', 'Tốn', 'Ly', 'Khôn', 'Đoài'];
const BITS: Record<Quai, readonly [number, number, number]> = {
  Càn: [1, 1, 1], Khảm: [0, 1, 0], Cấn: [0, 0, 1], Chấn: [1, 0, 0], Tốn: [0, 1, 1], Ly: [1, 0, 1], Khôn: [0, 0, 0], Đoài: [1, 1, 0],
};
export const TRI_TUONG: Record<Quai, string> = { Càn: 'Thiên', Khôn: 'Địa', Chấn: 'Lôi', Cấn: 'Sơn', Tốn: 'Phong', Khảm: 'Thuỷ', Ly: 'Hoả', Đoài: 'Trạch' };
const TRI_CUNG_HANH_IDX: Record<Quai, LhHanhIdx> = { Càn: 0, Đoài: 0, Chấn: 2, Tốn: 2, Khảm: 1, Ly: 3, Cấn: 4, Khôn: 4 };

function bitsToTri(b: readonly number[]): Quai {
  for (const name of TRI) { const t = BITS[name]; if (t[0] === b[0] && t[1] === b[1] && t[2] === b[2]) return name; }
  throw new Error('bitsToTri: bộ hào không hợp lệ');
}

const STEP_THE_UNG: Record<HexaStep, readonly [number, number]> = {
  'Bản cung': [6, 3], 'Nhất thế': [1, 4], 'Nhị thế': [2, 5], 'Tam thế': [3, 6],
  'Tứ thế': [4, 1], 'Ngũ thế': [5, 2], 'Du hồn': [4, 1], 'Quy hồn': [3, 6],
};

const HEXA_MAP: Record<string, { cung: Quai; step: HexaStep; name: string }> = {};
for (const [cung, step, ha, thuong, name] of HEXA_ROWS) HEXA_MAP[ha + '|' + thuong] = { cung, step, name };

const LUC_THAN: readonly LucThan[] = ['Huynh Đệ', 'Tử Tôn', 'Thê Tài', 'Quan Quỷ', 'Phụ Mẫu'];
export function lucThan(taHanhIdx: LhHanhIdx, hanhIdx: LhHanhIdx): LucThan {
  return LUC_THAN[mod(hanhIdx - taHanhIdx, 5)];
}

function napGiapHexagram(haName: Quai, thName: Quai): { can: number; chi: ChiIdx }[] {
  const ha = NAP_GIAP[haName], th = NAP_GIAP[thName];
  const hao: { can: number; chi: ChiIdx }[] = [];
  for (let i = 0; i < 3; i++) hao.push({ can: ha.noi[i][0], chi: ha.noi[i][1] });
  for (let i = 0; i < 3; i++) hao.push({ can: th.ngoai[i][0], chi: th.ngoai[i][1] });
  return hao;
}

/** Lập quẻ từ 6 lần gieo (hào 1 → hào 6). */
export function calcQuai(tosses: readonly Toss[]): LucHaoResult {
  const amDuong: number[] = tosses.map((s) => (s === 7 || s === 9 ? 1 : 0));
  const dong = tosses.map((s) => s === 6 || s === 9);
  const haName = bitsToTri([amDuong[0], amDuong[1], amDuong[2]]);
  const thName = bitsToTri([amDuong[3], amDuong[4], amDuong[5]]);
  const info = HEXA_MAP[haName + '|' + thName];
  const [theHao, ungHao] = STEP_THE_UNG[info.step];
  const cungHanhIdx = TRI_CUNG_HANH_IDX[info.cung];
  const hao: Hao[] = napGiapHexagram(haName, thName).map((h, i) => {
    const hanhIdx = CHI_HANH_IDX[h.chi];
    return {
      idx: i + 1, can: h.can, chi: h.chi, hanhIdx, toss: tosses[i],
      amDuong: amDuong[i], dong: dong[i], lucThan: lucThan(cungHanhIdx, hanhIdx),
      isThe: (i + 1) === theHao, isUng: (i + 1) === ungHao,
    };
  });
  let bien: LucHaoResult['bien'] = null;
  const dongIdx: number[] = [];
  for (let i = 0; i < 6; i++) if (dong[i]) dongIdx.push(i);
  if (dongIdx.length > 0) {
    const bAmDuong = amDuong.slice();
    for (const i of dongIdx) bAmDuong[i] = 1 - bAmDuong[i];
    const bHaName = bitsToTri([bAmDuong[0], bAmDuong[1], bAmDuong[2]]), bThName = bitsToTri([bAmDuong[3], bAmDuong[4], bAmDuong[5]]);
    const bInfo = HEXA_MAP[bHaName + '|' + bThName];
    const bHaoAll = napGiapHexagram(bHaName, bThName);
    const hoaList: HaoHoa[] = dongIdx.map((i) => {
      const nc = bHaoAll[i];
      const newHanhIdx = CHI_HANH_IDX[nc.chi];
      return {
        haoIdx: i + 1, tuCan: hao[i].can, tuChi: hao[i].chi, tuLucThan: hao[i].lucThan,
        denCan: nc.can, denChi: nc.chi, denLucThan: lucThan(cungHanhIdx, newHanhIdx),
      };
    });
    bien = { name: bInfo.name, cung: bInfo.cung, step: bInfo.step, hoaList };
  }
  return { haName, thName, cung: info.cung, step: info.step, name: info.name, hao, theHao, ungHao, cungHanhIdx, bien };
}

/** Vượng – Tướng – Hưu – Tù – Tử theo mùa, xếp theo LH_HANH_ORDER [Kim, Thuỷ, Mộc, Hoả, Thổ]. */
export const VTHTT: Record<Season, readonly VuongSuy[]> = {
  xuan: ['Tù', 'Hưu', 'Vượng', 'Tướng', 'Tử'], ha: ['Tử', 'Tù', 'Hưu', 'Vượng', 'Tướng'],
  thu: ['Vượng', 'Tướng', 'Tử', 'Tù', 'Hưu'], dong: ['Hưu', 'Vượng', 'Tướng', 'Tử', 'Tù'],
  tuquy: ['Tướng', 'Tử', 'Tù', 'Hưu', 'Vượng'],
};
export function seasonOfMonthChi(chiIdx: ChiIdx): Season {
  if (chiIdx === 2 || chiIdx === 3) return 'xuan';
  if (chiIdx === 5 || chiIdx === 6) return 'ha';
  if (chiIdx === 8 || chiIdx === 9) return 'thu';
  if (chiIdx === 11 || chiIdx === 0) return 'dong';
  return 'tuquy';
}
const LUC_XUNG: readonly (readonly [ChiIdx, ChiIdx])[] = [[0, 6], [1, 7], [2, 8], [3, 9], [4, 10], [5, 11]];
const LUC_HOP: readonly (readonly [ChiIdx, ChiIdx])[] = [[0, 1], [2, 11], [3, 10], [4, 9], [5, 8], [6, 7]];
export function chiRelation(a: ChiIdx, b: ChiIdx): 'xung' | 'hop' | null {
  if (a === b) return null;
  if (LUC_XUNG.some((p) => (p[0] === a && p[1] === b) || (p[0] === b && p[1] === a))) return 'xung';
  if (LUC_HOP.some((p) => (p[0] === a && p[1] === b) || (p[0] === b && p[1] === a))) return 'hop';
  return null;
}

export const LucHaoEngine = {
  CAN, CHI, HANH5, TRI, TRI_TUONG, calcQuai, dayCanChiIndex, monthChiFromDate,
  VTHTT, seasonOfMonthChi, chiRelation, lucThan, mod, CHI_HANH_IDX,
};
export default LucHaoEngine;
