/* Lục thân theo cung vị và Thập Thần (src/core/cachcuc/lucthan.ts): chỉ quy ước, không đoán. */
import { describe, it, expect } from 'vitest';
import { batTuChart, lucThan, resolveBirth } from '../src/core';
import { lucThanSection } from '../src/content/cachcuc/lucthan';
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
