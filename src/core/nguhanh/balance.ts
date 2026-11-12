/* Mô hình cân bằng 5 hành (ARCHITECTURE 14.11): hệ động lực tuyến tính 5 nút, CHỈ ĐỂ MINH HOẠ.
   Trạng thái x = tỷ lệ 5 hành (tổng 1), thứ tự Mộc, Hoả, Thổ, Kim, Thuỷ (nút i sinh nút i+1, khắc nút i+2).
   Mỗi bước:  x'_i = x_i + S·(x_{i-1} − x_i) − K·x_{i-2}   rồi chuẩn hoá lại cho tổng bằng 1
   (cạnh sinh là hệ số +S chảy từ hành mẹ sang hành con, cạnh khắc là hệ số −K từ hành khắc).
   Vì vòng đối xứng nên điểm cân bằng là mỗi hành 20%. "Can thiệp tối thiểu": thử thêm một lượng nhỏ DELTA vào từng
   hành một, chạy STEPS bước, hành nào đưa lá số về gần cân bằng nhất thì xếp hạng 1. Mô hình bỏ qua mùa sinh và Nhật Chủ,
   nên không thay Dụng thần; chỉ cho biết Dụng thần có hợp với trực giác "bù chỗ lệch" hay không. */
import type { Element } from './data';

export const CYCLE_ORDER: readonly Element[] = ['Mộc', 'Hoả', 'Thổ', 'Kim', 'Thuỷ'];
export const BALANCE = { S: 0.3, K: 0.05, DELTA: 0.1, STEPS: 5, EQUILIBRIUM: 0.2 } as const;

type Vec = number[];
const norm = (x: Vec): Vec => { const t = x.reduce((a, b) => a + b, 0) || 1; return x.map((v) => v / t); };

/** Một bước của hệ (đã chuẩn hoá, không âm). */
export function balanceStep(x: Vec, S: number = BALANCE.S, K: number = BALANCE.K): Vec {
  return norm(x.map((v, i) => Math.max(0, v + S * (x[(i + 4) % 5] - v) - K * x[(i + 3) % 5])));
}

/** Khoảng cách Euclid tới điểm cân bằng 20% mỗi hành. */
export const distanceToEquilibrium = (x: Vec): number => Math.sqrt(x.reduce((a, v) => a + (v - BALANCE.EQUILIBRIUM) ** 2, 0));

export interface InterventionRank {
  /** hạng của hành đã cho trong 5 lựa chọn, 1 = đưa về gần cân bằng nhất */
  rank: number;
  /** khoảng cách tới cân bằng sau STEPS bước cho từng hành khi thêm DELTA vào hành đó (thứ tự CYCLE_ORDER) */
  scores: number[];
  /** hành đứng đầu */
  best: Element;
}

/** Xếp hạng việc "thêm một ít hành e" (e là Dụng thần) theo mô hình cân bằng. */
export function rankIntervention(shares: Record<Element, number>, e: Element): InterventionRank {
  const x0 = norm(CYCLE_ORDER.map((el) => shares[el]));
  const scores = CYCLE_ORDER.map((_, i) => {
    let x = norm(x0.map((v, j) => v + (i === j ? BALANCE.DELTA : 0)));
    for (let t = 0; t < BALANCE.STEPS; t++) x = balanceStep(x);
    return distanceToEquilibrium(x);
  });
  const idx = CYCLE_ORDER.indexOf(e);
  const rank = 1 + scores.filter((s, i) => s < scores[idx] - 1e-12 || (Math.abs(s - scores[idx]) <= 1e-12 && i < idx)).length;
  const best = CYCLE_ORDER[scores.indexOf(Math.min(...scores))];
  return { rank, scores, best };
}
