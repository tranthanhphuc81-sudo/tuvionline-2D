/* Mô hình cân bằng 5 hành (ARCHITECTURE 14.11): hệ động lực tuyến tính 5 nút, CHỈ ĐỂ MINH HOẠ.
   Trạng thái x = tỷ lệ 5 hành (tổng 1), thứ tự Mộc, Hoả, Thổ, Kim, Thuỷ (nút i sinh nút i+1, khắc nút i+2).
   Mỗi bước:  x'_i = x_i + S·(x_{i-1} − x_i) − K·x_{i-2}   rồi chuẩn hoá lại cho tổng bằng 1
   (cạnh sinh là hệ số +S chảy từ hành mẹ sang hành con, cạnh khắc là hệ số −K từ hành khắc).
   Vì vòng đối xứng nên điểm cân bằng là mỗi hành 20%. "Can thiệp tối thiểu": thử thêm một lượng nhỏ DELTA vào từng
   hành một, chạy STEPS bước, hành nào đưa lá số về gần cân bằng nhất thì xếp hạng 1. Mô hình bỏ qua mùa sinh và Nhật Chủ,
   nên không thay Dụng thần; chỉ cho biết Dụng thần có hợp với trực giác "bù chỗ lệch" hay không. */
import type { Climate, Element } from './data';
import type { Strength } from './engine';

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

/** Cách viết mô hình: sai phân (bước rời rạc) hoặc hệ vi phân liên tục dx/dt = S·(P − I)·x − K·P²·x, tích phân bằng RK4 trong STEPS đơn vị thời gian. */
export type BalanceMode = 'roi-rac' | 'vi-phan';

const deriv = (x: Vec, S: number, K: number): Vec => x.map((v, i) => S * (x[(i + 4) % 5] - v) - K * x[(i + 3) % 5]);
const addScaled = (x: Vec, d: Vec, h: number): Vec => x.map((v, i) => v + h * d[i]);

/** Chạy hệ vi phân từ x trong thời gian T (RK4, bước DT), trả về tỷ lệ đã chuẩn hoá. Tổng thô giảm theo e^(−K·t) nên phải chuẩn hoá. */
export function flowContinuous(x0: Vec, T: number = BALANCE.STEPS, S: number = BALANCE.S, K: number = BALANCE.K, DT = 0.05): Vec {
  let x = x0.slice();
  const n = Math.round(T / DT);
  for (let t = 0; t < n; t++) {
    const k1 = deriv(x, S, K), k2 = deriv(addScaled(x, k1, DT / 2), S, K), k3 = deriv(addScaled(x, k2, DT / 2), S, K), k4 = deriv(addScaled(x, k3, DT), S, K);
    x = x.map((v, i) => v + (DT / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]));
  }
  return norm(x.map((v) => Math.max(0, v)));
}

export interface InterventionRank {
  /** hạng của hành đã cho trong 5 lựa chọn, 1 = đưa về gần cân bằng nhất */
  rank: number;
  /** khoảng cách tới cân bằng sau STEPS bước cho từng hành khi thêm DELTA vào hành đó (thứ tự CYCLE_ORDER) */
  scores: number[];
  /** hành đứng đầu */
  best: Element;
}

/** Xếp hạng việc "thêm một ít hành e" (e là Dụng thần) theo mô hình cân bằng. */
/* ===== Điểm cân bằng theo lá số (tuỳ chọn) =====
   Thay vì 20% đều, điểm cân bằng τ dịch theo mùa sinh (điều hậu) và độ vượng suy của Nhật Chủ (phù ức). Mức dịch là hệ số TỰ ĐẶT:
   - mùa lạnh (Hợi, Tý, Sửu): Hoả +CLIMATE; mùa nóng (Tỵ, Ngọ, Mùi): Thuỷ +CLIMATE;
   - Thân nhược: hành Nhật Chủ và hành sinh ra nó +STRENGTH; Thân vượng: hành Nhật Chủ sinh ra và hành Nhật Chủ khắc +STRENGTH;
   - Cực vượng (chuyên vượng) thuận theo thế mạnh như Thân nhược; Cực nhược (tòng) thuận theo thế yếu như Thân vượng; Trung hoà không dịch.
   Rồi chuẩn hoá tổng 1. Hệ chạy trên y = x/τ (đã chuẩn hoá): y đều nhau thì x = τ, nên τ là điểm đứng yên. */
export const TARGET = { CLIMATE: 0.05, STRENGTH: 0.04 } as const;
export interface TargetInput { dayMaster: Element; strength: Strength; climate: Climate }

const at5 = (e: Element, k: number) => CYCLE_ORDER[(CYCLE_ORDER.indexOf(e) + k + 5) % 5];

/** Điểm cân bằng τ theo mùa sinh và Nhật Chủ (tổng 1). */
export function balanceTarget(t: TargetInput): Record<Element, number> {
  const v: Record<Element, number> = { Mộc: 0.2, Hoả: 0.2, Thổ: 0.2, Kim: 0.2, Thuỷ: 0.2 };
  if (t.climate === 'lanh') v.Hoả += TARGET.CLIMATE;
  if (t.climate === 'nong') v.Thuỷ += TARGET.CLIMATE;
  if (t.strength === 'nhuoc' || t.strength === 'chuyen-vuong') { v[t.dayMaster] += TARGET.STRENGTH; v[at5(t.dayMaster, -1)] += TARGET.STRENGTH; }
  if (t.strength === 'vuong' || t.strength === 'tong-nhuoc') { v[at5(t.dayMaster, 1)] += TARGET.STRENGTH; v[at5(t.dayMaster, 2)] += TARGET.STRENGTH; }
  const sum = CYCLE_ORDER.reduce((a, e) => a + v[e], 0);
  for (const e of CYCLE_ORDER) v[e] /= sum;
  return v;
}

/** Xếp hạng việc "thêm một ít hành e"; target bỏ trống thì điểm cân bằng là 20% đều. */
export function rankIntervention(shares: Record<Element, number>, e: Element, mode: BalanceMode = 'roi-rac', target?: Record<Element, number>): InterventionRank {
  const x0 = norm(CYCLE_ORDER.map((el) => shares[el]));
  const tau = target ? CYCLE_ORDER.map((el) => target[el]) : CYCLE_ORDER.map(() => BALANCE.EQUILIBRIUM);
  const scores = CYCLE_ORDER.map((_, i) => {
    const x = norm(x0.map((v, j) => v + (i === j ? BALANCE.DELTA : 0)));
    let y = norm(x.map((v, j) => v / tau[j]));
    if (mode === 'vi-phan') y = flowContinuous(y);
    else for (let t = 0; t < BALANCE.STEPS; t++) y = balanceStep(y);
    const xe = norm(y.map((v, j) => v * tau[j]));
    return Math.sqrt(xe.reduce((a, v, j) => a + (v - tau[j]) ** 2, 0));
  });
  const idx = CYCLE_ORDER.indexOf(e);
  const rank = 1 + scores.filter((s, i) => s < scores[idx] - 1e-12 || (Math.abs(s - scores[idx]) <= 1e-12 && i < idx)).length;
  const best = CYCLE_ORDER[scores.indexOf(Math.min(...scores))];
  return { rank, scores, best };
}
