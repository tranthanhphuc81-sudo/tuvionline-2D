/* Mục "Lá số cổ giống bạn" (src/content/nguhanh/books.ts): luật chọn lá giống và câu chữ, phủ cả ba mức giống. */
import { describe, expect, it } from 'vitest';
import { batTuChart } from '../src/core';
import { analyze, toNguHanhChart, type NguHanhChart } from '../src/core/nguhanh';
import { BatTuEngine } from '../src/core';
import * as NH from '../src/content/nguhanh';
import { sectionPlainText } from '../src/content/rich';

const { CAN, CHI } = BatTuEngine;
const BAD = /undefined|NaN|\[object|\{\w+\}/;
const chartOf = (pillars: string[]): NguHanhChart => {
  const [year, month, day, hour] = pillars.map((s) => { const [a, b] = s.split(' '); return { stem: CAN.indexOf(a), branch: CHI.indexOf(b) } as NguHanhChart['year']; });
  return { year, month, day, hour, daiVan: [], khoiVanYears: 0, tietYear: 0 };
};

describe('Lá số cổ giống bạn', () => {
  it('bộ dữ liệu: 121 lá, mỗi can ngày đều có lá, có nguồn và trang', () => {
    expect(NH.BOOK_CHARTS.length).toBe(121);
    for (const s of CAN) expect(NH.BOOK_CHARTS.some((c) => c.pillars[2].startsWith(s + ' ')), s).toBe(true);
    for (const c of NH.BOOK_CHARTS) { expect(NH.bookSource(c)).toMatch(/trang \S+/); expect(c.note.length).toBeGreaterThan(10); }
  });

  it('lá trong sách tự tìm ra chính nó đầu tiên (cùng tháng, trùng 4 trụ)', () => {
    for (const c of NH.BOOK_CHARTS) {
      const top = NH.similarBookCharts(chartOf(c.pillars))[0];
      expect(top.c.id, c.id).toBe(c.id);
      expect(top).toMatchObject({ tier: 1, samePillars: 4 });
    }
  });

  it('luật chọn: luôn cùng Nhật chủ; có lá cùng tháng hay cùng mùa thì không lấy lá khác mùa; không có thì lấy tối đa 2 lá gần tháng nhất', () => {
    let seed = 20261117; const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
    const tiers = new Set<number>();
    for (let i = 0; i < 2000; i++) {
      const yy = 1940 + Math.floor(rnd() * 80), mm = 1 + Math.floor(rnd() * 12), dd = 1 + Math.floor(rnd() * 28), h = Math.floor(rnd() * 12);
      const ch = toNguHanhChart(batTuChart({ gender: 'M', dd, mm, yy, hourIdx: h } as never));
      const ms = NH.similarBookCharts(ch);
      expect(ms.length).toBeGreaterThanOrEqual(1);
      expect(ms.length).toBeLessThanOrEqual(3);
      for (const m of ms) expect(m.c.pillars[2].split(' ')[0]).toBe(CAN[ch.day.stem]);
      // sắp theo mức giống tăng dần
      for (let k = 1; k < ms.length; k++) expect(ms[k].tier).toBeGreaterThanOrEqual(ms[k - 1].tier);
      if (ms.some((m) => m.tier === 3)) { expect(ms.every((m) => m.tier === 3)).toBe(true); expect(ms.length).toBeLessThanOrEqual(2); }
      ms.forEach((m) => tiers.add(m.tier));
    }
    expect([...tiers].sort()).toEqual([1, 2, 3]);
  });

  it('câu chữ: đủ ba mức giống, có nguồn, so với Dụng thần của lá đang xem, không từ cấm, không chữ hỏng', () => {
    let seed = 20261118; const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
    const seen = { 1: false, 2: false, 3: false, trung: false, khac: false };
    for (let i = 0; i < 800; i++) {
      const yy = 1940 + Math.floor(rnd() * 80), mm = 1 + Math.floor(rnd() * 12), dd = 1 + Math.floor(rnd() * 28), h = Math.floor(rnd() * 12);
      const a = analyze(toNguHanhChart(batTuChart({ gender: rnd() < 0.5 ? 'M' : 'F', dd, mm, yy, hourIdx: h } as never)));
      for (const r of a.readings) {
        const { blocks, matches } = NH.bookBlocks(a.chart, r);
        const text = sectionPlainText({ id: 'x', title: '', blocks });
        expect(text).not.toMatch(BAD);
        expect(NH.hasBannedTerm(text), text).toBe(false);
        expect(text).toMatch(/không phải kết luận cho lá của bạn/);
        for (const m of matches) {
          seen[m.tier] = true;
          expect(text).toContain(NH.bookSource(m.c));
          if (m.c.dung === r.usefulGod.dung) seen.trung = true; else seen.khac = true;
        }
        if (matches[0].tier === 3) expect(text).toMatch(/chưa có lá cùng Nhật chủ mà cùng mùa sinh/);
      }
    }
    expect(seen).toEqual({ 1: true, 2: true, 3: true, trung: true, khac: true });
  });

  it('báo cáo ngũ hành có mục "Lá số cổ giống bạn", Thầy không đọc, nằm trước lời nhắc cuối', () => {
    const a = analyze(toNguHanhChart(batTuChart({ gender: 'M', dd: 11, mm: 3, yy: 1985, hourIdx: 0 } as never)));
    const ss = NH.practicalReport(a, { nowYear: 2026 });
    const i = ss.findIndex((x) => x.id === 'nguhanh.books');
    expect(i).toBeGreaterThan(0);
    expect(ss.at(-1)!.id).toBe('nguhanh.closing');
    expect(ss[i].blocks.every((b) => b.tags?.includes('no-speech'))).toBe(true);
  });
});
