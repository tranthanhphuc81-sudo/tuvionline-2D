/* Lục thân theo cung vị và Thập Thần (src/core/cachcuc/lucthan.ts): chỉ quy ước, không đoán. */
import { describe, it, expect } from 'vitest';
import { batTuChart, lucThan, lucThanDau, resolveBirth } from '../src/core';
import { LUC_THAN_TU_TRANH, dauText, loiLuanLines, lucThanSection, xungText } from '../src/content/cachcuc/lucthan';
import { BANNED_TERMS } from '../src/content/nguhanh';
import { NO_SPEECH_TERMS } from '../src/content/noSpeech';
import { sectionPlainText } from '../src/content/rich';

const chartOf = (gender: 'M' | 'F') => {
  const b = resolveBirth({ gender, calendar: 'solar', day: 15, month: 6, year: 1996, leapMonth: false, hourIdx: 6, lateTy: false });
  if (!b.ok) throw new Error('hồ sơ mẫu phải hợp lệ');
  return batTuChart(b.input);
};

describe('lục thân', () => {
  it('nam: vợ là Chính Tài, con là Quan Sát; nữ: chồng là Chính Quan, con là Thực Thương', () => {
    const m = lucThan(chartOf('M'), 'M'), f = lucThan(chartOf('F'), 'F');
    expect(m.find((x) => x.who === 'phoiNgau')?.sao).toEqual(['Chính Tài']);
    expect(m.find((x) => x.who === 'con')?.sao).toEqual(['Chính Quan', 'Thất Sát']);
    expect(f.find((x) => x.who === 'phoiNgau')?.sao).toEqual(['Chính Quan']);
    expect(f.find((x) => x.who === 'con')?.sao).toEqual(['Thực Thần', 'Thương Quan']);
  });
  it('vị trí sao đúng với Thập Thần của can lộ và can tàng; can ngày không tính', () => {
    for (const it of lucThan(chartOf('M'), 'M')) for (const v of it.viTri) {
      expect(it.sao).toContain(v.than);
      if (v.lo) expect(v.pillar).not.toBe(2);
    }
  });
  it('câu chữ: không có từ cấm đọc, có lời nhắc không đoán', () => {
    const t = sectionPlainText(lucThanSection(lucThan(chartOf('F'), 'F'), 'F'));
    expect(t).toContain('App không đoán');
    for (const w of NO_SPEECH_TERMS) expect(t.toLowerCase()).not.toContain(w);
  });
});

describe('lục thân: lời luận của sách, viết nhẹ (ARCHITECTURE 15.8, 13/11/2026)', () => {
  const charts = (n: number, seed: number) => {
    let s = seed; const rnd = () => (s = (s * 1103515245 + 12345) % 2147483648) / 2147483648;
    return Array.from({ length: n }, () => {
      const g = rnd() < 0.5 ? 'M' : 'F';
      return { g, ch: batTuChart({ gender: g, dd: 1 + Math.floor(rnd() * 28), mm: 1 + Math.floor(rnd() * 12), yy: 1940 + Math.floor(rnd() * 80), hourIdx: Math.floor(rnd() * 12) } as never) } as const;
    });
  };
  it('phủ mọi trường hợp: đủ các mã cho cả nam và nữ, đủ hai loại cung gặp xung', () => {
    const seen = new Set<string>();
    for (const { g, ch } of charts(3000, 20261113)) {
      const { dau, cungXung } = lucThanDau(ch, g);
      expect(dau.map((d) => d.who)).toEqual(['cha', 'me', 'anhEm', 'phoiNgau', 'con']);
      for (const d of dau) {
        expect(d.codes.filter((c) => c === 'ro' || c === 'an' || c === 'vang').length, 'đúng một mã có mặt').toBe(1);
        for (const c of d.codes) seen.add(`${g}.${d.who}.${c}`);
      }
      for (const x of cungXung) seen.add(`xung.${x.cung}.${x.voi}`);
    }
    const need = ['ro', 'an', 'vang', 'biChe'].flatMap((c) => (['M', 'F'] as const).flatMap((g) => ['cha', 'me', 'anhEm', 'phoiNgau', 'con'].map((w) => `${g}.${w}.${c}`)))
      .filter((k) => !/\.(cha|me)\.vang$/.test(k)); // cha (Thiên Tài), mẹ (Chính Ấn) có thể vắng nhưng hiếm; kiểm riêng ở dưới
    need.push('F.phoiNgau.honTap', 'M.anhEm.tranhTai', 'F.anhEm.tranhTai', 'xung.ngay.1', 'xung.ngay.3', 'xung.thang.0', 'xung.thang.2');
    const missing = need.filter((k) => !seen.has(k));
    expect(missing, 'nhánh chưa gặp: ' + missing.join(', ')).toEqual([]);
  });
  it('mọi câu: có "sách xưa", không từ nặng, không từ cấm đọc hay cấm hiện, không chữ hỏng', () => {
    const bad = [...LUC_THAN_TU_TRANH, ...NO_SPEECH_TERMS, ...BANNED_TERMS];
    const all = new Set<string>();
    for (const { g, ch } of charts(1500, 20261114)) {
      const { dau, cungXung } = lucThanDau(ch, g);
      for (const line of loiLuanLines(dau, cungXung, g, true)) all.add(line);
    }
    // cả các câu hiếm, dựng trực tiếp
    for (const g of ['M', 'F'] as const) for (const who of ['cha', 'me', 'anhEm', 'phoiNgau', 'con'] as const)
      for (const c of ['ro', 'an', 'vang', 'biChe', 'honTap', 'tranhTai'] as const) all.add(dauText({ who, codes: [c], luc: 0, che: 3, nhomChe: 'TyKiep' }, c, g));
    for (const x of [{ cung: 'ngay', voi: 1 }, { cung: 'ngay', voi: 3 }, { cung: 'thang', voi: 0 }, { cung: 'thang', voi: 2 }] as const) all.add(xungText(x));
    for (const line of all) {
      expect(line, line).toMatch(/sách xưa/);
      expect(line).not.toMatch(/undefined|NaN/);
      for (const w of bad) expect(line.toLowerCase(), `"${w}" trong: ${line}`).not.toMatch(new RegExp('(?<!\\p{L})' + w + '(?!\\p{L})', 'u'));
    }
  });
  it('mục hiển thị lời luận khi bật; tắt công tắc thì chỉ còn quy ước', () => {
    const ch = chartOf('F');
    const signs = lucThanDau(ch, 'F');
    const on = sectionPlainText(lucThanSection(lucThan(ch, 'F'), 'F', signs));
    expect(on).toContain('Sách xưa luận thêm');
    expect(on).toContain('App không đoán');
    expect(loiLuanLines(signs.dau, signs.cungXung, 'F', false)).toEqual([]);
    expect(sectionPlainText(lucThanSection(lucThan(ch, 'F'), 'F'))).not.toContain('Sách xưa luận thêm');
  });
});
