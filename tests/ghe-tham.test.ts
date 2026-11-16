/* Ghé thăm mỗi ngày (ARCHITECTURE 16.2): lời hôm nay theo lá số, câu chào theo ngày âm, sổ ghé thăm. */
import { describe, it, expect } from 'vitest';
import { dayCanChiIndex, profileSummary } from '../src/core';
import { analyze, evaluatePeriod, toNguHanhChart, type Pillar } from '../src/core/nguhanh';
import { BANNED_TERMS } from '../src/content/nguhanh/vocab';
import { DAY_LINES } from '../src/content/reader/templates';
import { TODAY_NOTE, dayGreeting, lastDays, todayReading } from '../src/content/today';
import { addDay, dayKey } from '../src/state/actions';
import { emptyState, parsePersisted, VISITS_MAX } from '../src/state/schema';

const profile = (i: number) => ({
  id: 'p' + i, name: 'An', gender: (i % 2 ? 'M' : 'F') as 'M' | 'F', calendar: 'solar' as const,
  day: 1 + (i * 7) % 28, month: 1 + (i * 5) % 12, year: 1950 + (i * 3) % 60, leapMonth: false, hourIdx: i % 12, lateTy: false, createdAt: 't', updatedAt: 't',
});
const analyses = Array.from({ length: 30 }, (_, i) => profileSummary(profile(i))).flatMap((r) => (r.ok ? [analyze(toNguHanhChart(r.summary.battu.chart))] : []));

describe('lời hôm nay', () => {
  it('mức ngày đúng như evaluatePeriod của trụ ngày; đủ ba mức; luôn có câu "không phải lời báo trước"; không từ cấm', () => {
    const seen = new Set<string>();
    for (const a of analyses) for (let k = 0; k < 40; k++) {
      const d = new Date(2026, 10, 1 + k);
      const r = todayReading(a, d);
      const cc = dayCanChiIndex(d.getDate(), d.getMonth() + 1, d.getFullYear());
      const ev = evaluatePeriod({ stem: cc.can, branch: cc.chi } as Pillar, a.readings[0].usefulGod);
      const want = ev.favor === 'rat-tot' || ev.favor === 'tot' ? 'thuan' : ev.favor === 'binh' ? 'binh' : 'giu';
      expect(r.level).toBe(want);
      expect(r.text).toContain(TODAY_NOTE);
      expect(r.text).toContain('Hôm nay ngày ' + r.canChi);
      for (const w of BANNED_TERMS) expect(r.text.toLowerCase(), w).not.toContain(w.toLowerCase());
      seen.add(r.level);
    }
    expect([...seen].sort()).toEqual(['binh', 'giu', 'thuan']);
  });
});

describe('câu chào theo ngày âm', () => {
  it('Tết, rằm, mùng một có câu riêng (≥ 2 biến thể), ngày thường không có', () => {
    for (const k of ['tet', 'ram', 'mung1'] as const) {
      expect(DAY_LINES[k].length).toBeGreaterThanOrEqual(2);
      expect(dayGreeting(k, { goi: 'con', ta: 'thầy' }, 1)).toMatch(/^\p{Lu}/u);
    }
    expect(dayGreeting(null, { goi: 'con' }, 1)).toBe('');
  });
});

describe('sổ ghé thăm', () => {
  it('7 ngày gần nhất, ngày cuối là hôm nay, qua được đầu tháng', () => {
    expect(lastDays(new Date(2026, 11, 2))).toEqual(['2026-11-26', '2026-11-27', '2026-11-28', '2026-11-29', '2026-11-30', '2026-12-01', '2026-12-02']);
    expect(dayKey(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
  it('thêm ngày: không trùng, tăng dần, giữ tối đa 60 ngày mới nhất', () => {
    expect(addDay(['2026-11-02'], '2026-11-02')).toEqual(['2026-11-02']);
    expect(addDay(['2026-11-03'], '2026-11-01')).toEqual(['2026-11-01', '2026-11-03']);
    const many = Array.from({ length: VISITS_MAX }, (_, i) => dayKey(new Date(2026, 0, 1 + i)));
    const next = addDay(many, '2026-12-31');
    expect(next).toHaveLength(VISITS_MAX);
    expect(next[next.length - 1]).toBe('2026-12-31');
    expect(next[0]).toBe(many[1]);
  });
  it('lược đồ: dữ liệu cũ không có sổ vẫn hợp lệ; sổ đúng dạng được nhận; sai dạng bị từ chối', () => {
    const base = emptyState();
    expect(parsePersisted(base).ok).toBe(true);
    expect(parsePersisted({ ...base, tools: { visits: ['2026-11-16'], incenseDays: [] } }).ok).toBe(true);
    expect(parsePersisted({ ...base, tools: { visits: ['16/11/2026'] } }).ok).toBe(false);
    expect(parsePersisted({ ...base, tools: { incenseDays: 'hôm nay' } }).ok).toBe(false);
  });
});
