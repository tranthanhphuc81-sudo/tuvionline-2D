/* Hỏi chuyện Thầy (ARCHITECTURE 16.3): bảy câu hỏi, câu trả lời chỉ ghép kết quả đã có. */
import { describe, it, expect } from 'vitest';
import { profileSummary, tongHopOf } from '../src/core';
import { analyze, toNguHanhChart } from '../src/core/nguhanh';
import { ASK_QUESTIONS, askAnswer } from '../src/content/ask';
import { BANNED_TERMS, COLOR_SOURCE_NOTE } from '../src/content/nguhanh/vocab';
import { ASK_LINES, CULTURE_LINE } from '../src/content/reader/templates';
import { TODAY_NOTE } from '../src/content/today';

const profile = (i: number) => ({
  id: 'p' + i, name: 'An', gender: (i % 2 ? 'M' : 'F') as 'M' | 'F', calendar: 'solar' as const,
  day: 1 + (i * 7) % 28, month: 1 + (i * 5) % 12, year: 1950 + (i * 3) % 60, leapMonth: false, hourIdx: i % 12, lateTy: false, createdAt: 't', updatedAt: 't',
});
const ctxs = Array.from({ length: 24 }, (_, i) => profileSummary(profile(i))).flatMap((r) => (r.ok ? [{ tongHop: tongHopOf(r.birth), nguHanh: analyze(toNguHanhChart(r.summary.battu.chart)), now: new Date(2026, 10, 16) }] : []));

describe('câu trả lời', () => {
  it('mọi câu hỏi, mọi lá số: có nội dung, câu cuối là lời nhắc văn hoá, không có câu rỗng', () => {
    expect(ctxs.length).toBeGreaterThan(20);
    for (const c of ctxs) for (const q of ASK_QUESTIONS) {
      const a = askAnswer(q.id, c);
      expect(a.length, q.id).toBeGreaterThanOrEqual(2);
      expect(a[a.length - 1]).toBe(CULTURE_LINE);
      for (const t of a) expect(t.trim().length, q.id).toBeGreaterThan(5);
      for (const t of a) expect(t, q.id).not.toMatch(/<\/?[a-z]/);
    }
  });
  it('mỗi câu lấy đúng nguồn: màu hướng kèm ghi chú ba cách tính, nghề từ Tổng hợp, ngày năm kèm "không phải lời báo trước"', () => {
    const c = ctxs[0];
    expect(askAnswer('mau-huong', c)).toContain(COLOR_SOURCE_NOTE);
    expect(askAnswer('nghe', c)[0]).toMatch(/^Nghề nghiệp/);
    expect(askAnswer('hom-nay', c)).toContain(TODAY_NOTE);
    expect(askAnswer('nam-nay', c).join(' ')).toContain('không phải lời báo trước');
    expect(askAnswer('nam-nay', c)[0]).toMatch(/^Năm 2026 Bính Ngọ/);
    expect(askAnswer('nam-thuan', c)[0]).toMatch(/12 năm tới/);
    expect(askAnswer('menh', c)[0]).toContain('Nạp Âm');
  });
  it('lời mới của Thầy không có từ cấm, mỗi loại ≥ 2 biến thể', () => {
    const mine = [...Object.values(ASK_LINES).flat(), ...ASK_QUESTIONS.map((q) => q.label)].join(' ').toLowerCase();
    for (const w of BANNED_TERMS) expect(mine, w).not.toContain(w.toLowerCase());
    for (const k of Object.keys(ASK_LINES) as (keyof typeof ASK_LINES)[]) expect(ASK_LINES[k].length).toBeGreaterThanOrEqual(2);
  });
});
