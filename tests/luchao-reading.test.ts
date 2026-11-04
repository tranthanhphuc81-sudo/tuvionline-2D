/* Phần tính toán luận đoán Lục Hào (src/core/luchao/reading.ts). Câu chữ kiểm ở tests/parity/luchao.test.ts. */
import { describe, it, expect } from 'vitest';
import { LucHaoEngine, castContext, castHexagram, findDungThanHao, haoViews, lucHaoReading, randomToss, randomTosses, verdictHaos } from '../src/core';

const { CAN, CHI } = LucHaoEngine;

describe('gieo quẻ', () => {
  it('số mặt hình quyết định điểm hào: 0 → 6, 3 → 9', () => {
    expect(randomToss(() => false)).toBe(6);
    expect(randomToss(() => true)).toBe(9);
    let i = 0;
    expect(randomToss(() => (i++ % 3) === 0)).toBe(7);
  });
  it('6 hào luôn nằm trong 6…9', () => {
    for (let k = 0; k < 50; k++) for (const t of randomTosses()) expect([6, 7, 8, 9]).toContain(t);
  });
});

describe('ví dụ Chương 10 (7,7,9,8,6,8), xem ngày 6/2/2021', () => {
  const r = castHexagram([7, 7, 9, 8, 6, 8]);
  const ctx = castContext(6, 2, 2021);
  it('Nhật thần Ất Dậu, Nguyệt lệnh Dần (Xuân)', () => {
    expect([CAN[ctx.nhat.can] + ' ' + CHI[ctx.nhat.chi], CHI[ctx.thangChi], ctx.season]).toEqual(['Ất Dậu', 'Dần', 'xuan']);
  });
  it('Dụng Thần "Thế" là hào 3; trạng thái và quan hệ Nhật thần có đủ cho 6 hào', () => {
    expect(findDungThanHao(r, 'the').map((h) => h.idx)).toEqual([3]);
    const v = haoViews(r, ctx, 'the');
    expect(v).toHaveLength(6);
    expect(v.filter((x) => x.isDungThan).map((x) => x.hao.idx)).toEqual([3]);
  });
  it('hỏi "Ứng": so với Thế có quan hệ sinh khắc; hỏi Thế thì không so', () => {
    expect(verdictHaos(r, ctx, 'ung')[0].theRel).not.toBeNull();
    expect(verdictHaos(r, ctx, 'the')[0].theRel).toBeNull();
  });
  it('điểm luận đoán khớp nhãn', () => {
    for (const key of ['the', 'ung', 'Thê Tài', 'Quan Quỷ'] as const) {
      const g = lucHaoReading(r, ctx, key);
      expect(g.tone).toBe(g.score >= 2 ? 'ok' : g.score >= 0 ? 'mid' : 'warn');
    }
  });
});

describe('quẻ thiếu Lục Thân đang hỏi', () => {
  it('Dụng Thần không có trong quẻ → điểm -1, chưa thuận', () => {
    let found = false;
    for (let n = 0; n < 4096 && !found; n++) {
      const t: number[] = [];
      for (let i = 0, x = n; i < 6; i++, x >>= 2) t.push(6 + (x & 3));
      const r = castHexagram(t);
      const missing = (['Phụ Mẫu', 'Huynh Đệ', 'Tử Tôn', 'Thê Tài', 'Quan Quỷ'] as const).find((k) => findDungThanHao(r, k).length === 0);
      if (!missing) continue;
      found = true;
      const g = lucHaoReading(r, castContext(1, 1, 2025), missing);
      expect([g.dt, g.score, g.tone]).toEqual([null, -1, 'warn']);
    }
    expect(found).toBe(true);
  });
});
