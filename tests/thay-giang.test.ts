/* Thầy giảng riêng một cung Tử Vi, một trụ Bát Tự khi người dùng chạm (ARCHITECTURE 16.1). */
import { describe, it, expect } from 'vitest';
import { BatTuEngine, TuViEngine, brightness, cungNameFor, profileSummary, tangCanOf } from '../src/core';
import { NO_SPEECH_TERMS } from '../src/content/noSpeech';
import { BANNED_TERMS } from '../src/content/nguhanh/vocab';
import { CULTURE_LINE, LEADS } from '../src/content/reader/templates';
import { CUNG_PLAIN, STAR } from '../src/content/interp/tuvi';
import { CUNG_VI } from '../src/content/cachcuc/lucthan';
import { hanhAmDuong } from '../src/features/battu/Pillars';
import { palaceCues, pillarCues, type Cue, type Who } from '../src/features/reader/script';

const { CHI } = TuViEngine;
const { CAN } = BatTuEngine;
const who: Who = { goi: 'con', third: false, name: 'An', ta: 'thầy' };
const profile = (i: number) => ({
  id: 'p' + i, name: 'An', gender: (i % 2 ? 'M' : 'F') as 'M' | 'F', calendar: 'solar' as const,
  day: 1 + (i * 7) % 28, month: 1 + (i * 5) % 12, year: 1950 + (i * 3) % 60, leapMonth: false, hourIdx: i % 12, lateTy: false, createdAt: 't', updatedAt: 't',
});
const charts = Array.from({ length: 24 }, (_, i) => profileSummary(profile(i))).flatMap((r) => (r.ok ? [r.summary] : []));

function palace(ch: (typeof charts)[number]['tuvi']['chart'], chi: number): Cue[] {
  const cung = cungNameFor(ch.menhChi, chi), opp = (chi + 6) % 12;
  const dh = ch.daiHan.find((d) => d.chi === chi)!;
  return palaceCues(who, {
    chi, chiName: CHI[chi], cung, plain: CUNG_PLAIN[cung], than: chi === ch.thanChi,
    stars: (ch.stars[chi] || []).map((x) => ({ name: x, net: STAR[x]?.net, bright: (brightness(x, chi) || undefined) as 1 | -1 | undefined })),
    opposite: { cung: cungNameFor(ch.menhChi, opp), chiName: CHI[opp] }, daiHan: [dh.tuoiStart, dh.tuoiEnd],
  }, 1);
}
function pillar(ch: (typeof charts)[number]['battu']['chart'], i: number): Cue[] {
  const pl = ch.pillars[i];
  return pillarCues(who, {
    index: i, tru: pl.role.toLowerCase(), canChi: CAN[pl.can] + ' ' + TuViEngine.CHI[pl.chi], hanh: hanhAmDuong(pl.can), viTri: CUNG_VI[i],
    thapThan: pl.isNhatChu ? null : BatTuEngine.thapThan(ch.nhatChu, pl.can),
    hidden: tangCanOf(ch, pl.chi).map((t) => ({ can: t.can, name: CAN[t.can], level: t.level, thapThan: t.thapThan })),
  }, 1);
}
const spoken = (cues: Cue[]) => cues.map((c) => c.text).join(' ').toLowerCase();
const shown = (cues: Cue[]) => cues.map((c) => c.caption ?? c.text).join(' ');

describe('Thầy giảng một cung', () => {
  it('đủ 12 cung trên nhiều lá số: tô sáng đúng cung suốt bài, chỉ tay ở đầu, gật đầu ở cuối, có lời nhắc văn hoá', () => {
    expect(charts.length).toBeGreaterThan(20);
    for (const s of charts) for (let chi = 0; chi < 12; chi++) {
      const cues = palace(s.tuvi.chart, chi);
      expect(cues.every((c) => c.focus?.palace === chi)).toBe(true);
      expect(cues[0].gesture).toBe('point');
      expect(cues[cues.length - 1].gesture).toBe('nod');
      expect(shown(cues)).toContain(CULTURE_LINE);
      expect(shown(cues)).toContain('Đại hạn đi qua cung này');
      for (const w of NO_SPEECH_TERMS) expect(spoken(cues), w).not.toContain(w.toLowerCase());
    }
  });
  it('cung vô chính diệu thì nhắc xem cung đối diện; cung có sao thì đọc từng sao', () => {
    let empty = 0, withStars = 0;
    for (const s of charts) for (let chi = 0; chi < 12; chi++) {
      const n = (s.tuvi.chart.stars[chi] || []).length;
      const text = shown(palace(s.tuvi.chart, chi));
      if (n === 0) { empty++; expect(text).toContain('vô chính diệu'); } else { withStars++; for (const x of s.tuvi.chart.stars[chi]) expect(text).toContain('Sao ' + x); }
    }
    expect(empty).toBeGreaterThan(0);
    expect(withStars).toBeGreaterThan(0);
  });
});

describe('câu mới của Thầy', () => {
  it('lời dẫn và câu kết mới không dùng từ cấm (câu sao, nghĩa cung là nguyên văn legacy, giữ nguyên)', () => {
    const mine = [...LEADS.tuviCung, ...LEADS.tuviCungKet, ...LEADS.battuTru, ...LEADS.battuTruKet].join(' ').toLowerCase();
    for (const w of BANNED_TERMS) expect(mine, w).not.toContain(w.toLowerCase());
    for (const k of ['tuviCung', 'tuviCungKet', 'battuTru', 'battuTruKet'] as const) expect(LEADS[k].length, k).toBeGreaterThanOrEqual(2);
  });
});

describe('Thầy giảng một trụ', () => {
  it('bốn trụ: nói trụ đó về gì (cung vị), tô sáng trụ, tô từng can tàng khi đọc tới', () => {
    for (const s of charts) for (let i = 0; i < 4; i++) {
      const cues = pillar(s.battu.chart, i);
      expect(cues.every((c) => c.focus?.pillar === i)).toBe(true);
      expect(shown(cues)).toContain(CUNG_VI[i]);
      expect(shown(cues)).toContain(CULTURE_LINE);
      const tang = tangCanOf(s.battu.chart, s.battu.chart.pillars[i].chi);
      for (const t of tang) expect(cues.some((c) => c.focus?.hidden?.[0] === t.can)).toBe(true);
      for (const w of NO_SPEECH_TERMS) expect(spoken(cues), w).not.toContain(w.toLowerCase());
    }
  });
  it('trụ ngày nói Nhật Chủ là chính người xem; trụ khác nói Thập Thần', () => {
    const ch = charts[0].battu.chart;
    expect(shown(pillar(ch, 2))).toContain('Nhật Chủ');
    expect(shown(pillar(ch, 2))).toContain('chính con');
    expect(shown(pillar(ch, 0))).toContain('so với Nhật Chủ là');
    expect(shown(pillar(ch, 0)).startsWith('Con xem trụ năm') || shown(pillar(ch, 0)).includes('Đây là trụ năm')).toBe(true);
  });
});
