import { describe, expect, it } from 'vitest';
import { BALANCE, balanceStep, distanceToEquilibrium, rankIntervention } from '../src/core/nguhanh';

import { balanceBlocks } from '../src/content/nguhanh';

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
