import { describe, expect, it } from 'vitest';
import { BALANCE, balanceStep, distanceToEquilibrium, flowContinuous, rankIntervention } from '../src/core/nguhanh';

import { balanceBlocks } from '../src/content/nguhanh';

describe('Hệ vi phân liên tục', () => {
  it('mỗi hành 20% đứng yên; lá số lệch được kéo về gần cân bằng; tổng 1', () => {
    flowContinuous([0.2, 0.2, 0.2, 0.2, 0.2]).forEach((v) => expect(v).toBeCloseTo(0.2, 9));
    const x0 = [0.7, 0.1, 0.1, 0.05, 0.05];
    const x = flowContinuous(x0, 60);
    expect(x.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 12);
    expect(distanceToEquilibrium(x)).toBeLessThan(distanceToEquilibrium(x0) * 0.1);
  });
  it('xếp hạng liên tục là hoán vị 1..5 và tương đồng với sai phân (hành tốt nhất giống nhau ở lá số lệch rõ)', () => {
    const shares = { Mộc: 0.02, Hoả: 0.1, Thổ: 0.2, Kim: 0.18, Thuỷ: 0.5 };
    const ranks = (['Mộc', 'Hoả', 'Thổ', 'Kim', 'Thuỷ'] as const).map((e) => rankIntervention(shares, e, 'vi-phan').rank).sort();
    expect(ranks).toEqual([1, 2, 3, 4, 5]);
    expect(rankIntervention(shares, 'Mộc', 'vi-phan').best).toBe(rankIntervention(shares, 'Mộc', 'roi-rac').best);
  });
});

describe('Mô hình cân bằng 5 hành', () => {
  it('lời trong app nói rõ đây là mô hình tự đặt, chưa kiểm chứng', () => {
    const text = JSON.stringify(balanceBlocks({ Mộc: 0.2, Hoả: 0.2, Thổ: 0.2, Kim: 0.2, Thuỷ: 0.2 }, 'Mộc'));
    expect(text).toMatch(/tự đặt/);
    expect(text).toMatch(/chưa được kiểm chứng/);
  });
  it('mỗi hành 20% là điểm đứng yên', () => {
    const x = [0.2, 0.2, 0.2, 0.2, 0.2];
    const y = balanceStep(x);
    y.forEach((v) => expect(v).toBeCloseTo(0.2, 12));
    expect(distanceToEquilibrium(x)).toBeCloseTo(0, 12);
  });
  it('luôn giữ tổng 1, không âm; lá số lệch được kéo dần về gần cân bằng', () => {
    let x = [0.7, 0.1, 0.1, 0.05, 0.05];
    const d0 = distanceToEquilibrium(x);
    for (let t = 0; t < 40; t++) {
      x = balanceStep(x);
      expect(x.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 12);
      for (const v of x) expect(v).toBeGreaterThanOrEqual(0);
    }
    expect(distanceToEquilibrium(x)).toBeLessThan(d0 * 0.2);
  });
  it('xếp hạng: hạng 1..5, hành đứng đầu có hạng 1, thêm vào hành đang thiếu nhất tốt hơn hành đang thừa nhất', () => {
    const shares = { Mộc: 0.02, Hoả: 0.1, Thổ: 0.2, Kim: 0.18, Thuỷ: 0.5 };
    const r = rankIntervention(shares, 'Mộc');
    expect(r.scores).toHaveLength(5);
    expect(rankIntervention(shares, r.best).rank).toBe(1);
    expect(rankIntervention(shares, 'Mộc').rank).toBeLessThan(rankIntervention(shares, 'Thuỷ').rank);
    const ranks = (['Mộc', 'Hoả', 'Thổ', 'Kim', 'Thuỷ'] as const).map((e) => rankIntervention(shares, e).rank).sort();
    expect(ranks).toEqual([1, 2, 3, 4, 5]);
    expect(BALANCE.EQUILIBRIUM).toBe(0.2);
  });
});

describe('Điểm cân bằng theo mùa sinh và Nhật Chủ', () => {
  it('tổng 1; sinh mùa đông, Mộc Thân nhược: Hoả, Mộc, Thuỷ cao hơn 20%; Trung hoà mùa ôn hoà vẫn đều', async () => {
    const { balanceTarget } = await import('../src/core/nguhanh');
    const t = balanceTarget({ dayMaster: 'Mộc', strength: 'nhuoc', climate: 'lanh' });
    expect(Object.values(t).reduce((a, b) => a + b, 0)).toBeCloseTo(1, 12);
    for (const e of ['Hoả', 'Mộc', 'Thuỷ'] as const) expect(t[e]).toBeGreaterThan(0.2);
    for (const e of ['Thổ', 'Kim'] as const) expect(t[e]).toBeLessThan(0.2);
    const v = balanceTarget({ dayMaster: 'Kim', strength: 'vuong', climate: 'nong' });
    expect(v.Thuỷ).toBeGreaterThan(v.Thổ); // Thuỷ được cả mùa nóng lẫn Kim sinh
    expect(v.Mộc).toBeGreaterThan(0.2);   // Kim khắc Mộc
    const u = balanceTarget({ dayMaster: 'Thổ', strength: 'trung-hoa', climate: 'on' });
    for (const x of Object.values(u)) expect(x).toBeCloseTo(0.2, 12);
  });
  it('điểm cân bằng 20% đều cho đúng kết quả cũ; với τ khác, lá số đang ở τ thì không cần bổ sung hành nào nhiều nhất', async () => {
    const { balanceTarget } = await import('../src/core/nguhanh');
    const shares = { Mộc: 0.02, Hoả: 0.1, Thổ: 0.2, Kim: 0.18, Thuỷ: 0.5 };
    const u = balanceTarget({ dayMaster: 'Thổ', strength: 'trung-hoa', climate: 'on' });
    for (const mode of ['roi-rac', 'vi-phan'] as const) {
      const a = rankIntervention(shares, 'Mộc', mode), b = rankIntervention(shares, 'Mộc', mode, u);
      a.scores.forEach((s, i) => expect(b.scores[i]).toBeCloseTo(s, 9));
    }
    // lá số thiếu Hoả rõ: khi điểm cân bằng đòi nhiều Hoả hơn (mùa đông), hạng của Hoả không tệ đi
    const cold = balanceTarget({ dayMaster: 'Mộc', strength: 'nhuoc', climate: 'lanh' });
    const lowFire = { Mộc: 0.3, Hoả: 0.05, Thổ: 0.25, Kim: 0.2, Thuỷ: 0.2 };
    expect(rankIntervention(lowFire, 'Hoả', 'roi-rac', cold).rank).toBeLessThanOrEqual(rankIntervention(lowFire, 'Hoả').rank);
  });
});
