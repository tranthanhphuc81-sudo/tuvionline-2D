/* Thầy đọc phần ngũ hành (Phase 3C.6): các điều kiện (a)–(e) của kit. */
import { describe, expect, it } from 'vitest';
import { batTuChart } from '../src/core';
import { analyze, resolveWithFeedback, toNguHanhChart, type NguHanhAnalysis } from '../src/core/nguhanh';
import { hasBannedTerm } from '../src/content/nguhanh';
import { hasNoSpeech } from '../src/content/noSpeech';
import { CULTURE_LINE } from '../src/content/reader/templates';
import type { NguHanhAnswer } from '../src/state/schema';
import { buildScript, type Cue, type Who } from '../src/features/reader/script';
import { nextNguHanhQuestion, nguHanhScriptInput } from '../src/features/reader/nguhanhScript';
import { hiddenStems } from '../src/core/nguhanh';

const who: Who = { goi: 'con', third: false, name: 'An' };
const NOW = 2026;

function charts(n: number, seed = 20261116) {
  let s = seed; const rnd = () => (s = (s * 1103515245 + 12345) % 2147483648) / 2147483648;
  return Array.from({ length: n }, () => {
    const yy = 1950 + Math.floor(rnd() * 60), mm = 1 + Math.floor(rnd() * 12), dd = 1 + Math.floor(rnd() * 28), h = Math.floor(rnd() * 12);
    return batTuChart({ gender: rnd() < 0.5 ? 'M' : 'F', dd, mm, yy, hourIdx: h } as never);
  });
}
const all = charts(1500).map((c) => ({ c, a: analyze(toNguHanhChart(c)) }));
const multi = all.filter((x) => x.a.readings.length > 1);
const plain = all.filter((x) => !x.a.follow);

const script = (a: NguHanhAnalysis, base: NguHanhAnalysis = a, answers: NguHanhAnswer[] = [], seed = 0): Cue[] => {
  const q = nextNguHanhQuestion(base, !!a.resolution?.decided, answers, NOW);
  return buildScript('nguhanh', who, nguHanhScriptInput({ a, ask: q ? { question: q, base } : undefined }, who, seed), seed);
};
const answerFor = (q: ReturnType<typeof nextNguHanhQuestion>, o: NguHanhAnswer['outcome']): NguHanhAnswer => ({ profileId: 'p', birthKey: 'k', target: q!.target, outcome: o, answeredAt: 't' });

describe('Thầy đọc ngũ hành', () => {
  it('có đủ lá số thường, Chân, Giả để thử', () => {
    expect(plain.length).toBeGreaterThan(300);
    expect(multi.length).toBeGreaterThan(20);
  });

  it('(a) không cue nào dài quá 180 ký tự', () => {
    for (const { a } of [...plain.slice(0, 200), ...multi]) {
      for (const seed of [0, 1, 2]) for (const c of script(a, a, [], seed)) {
        expect(c.text.length, c.text).toBeLessThanOrEqual(180);
      }
    }
  });

  it('(b) không cue đọc thành lời nào chứa từ cấm đọc hay từ cấm hiện', () => {
    for (const { a } of [...plain.slice(0, 200), ...multi]) {
      for (const c of script(a)) {
        if (!c.text) continue;
        expect(hasNoSpeech(c.text), c.text).toBe(false);
        expect(hasBannedTerm(c.text), c.text).toBe(false);
      }
    }
  });

  it('(c) câu mở và câu kết luôn có lời nhắc văn hoá; không đọc bảng, phần trăm hay danh sách thói quen', () => {
    for (const { a } of [...plain.slice(0, 100), ...multi]) {
      for (const seed of [0, 1, 2]) {
        const cues = script(a, a, [], seed);
        expect(cues[0].caption).toContain(CULTURE_LINE);
        expect(cues.at(-1)!.caption).toContain(CULTURE_LINE);
        const text = cues.map((c) => c.text).join(' ');
        expect(text).not.toMatch(/\d+%/);
        expect(text).not.toMatch(/Điểm thô|Điểm cuối|bản khí|trung khí/);
      }
    }
  });

  it('(d) chỉ có cue hỏi kiểm chứng khi có cách luận thay thế và chưa kết luận', () => {
    const askText = (cues: Cue[]) => cues.some((c) => /Lập Xuân|tuổi mụ|Giai đoạn từ khoảng/.test(c.caption ?? ''));
    for (const { a } of plain.slice(0, 200)) expect(askText(script(a)), 'lá thường').toBe(false);
    let asked = 0;
    for (const { a } of multi) {
      const q = nextNguHanhQuestion(a, false, [], NOW);
      if (!q) continue;
      asked++;
      expect(askText(script(a)), 'chưa trả lời').toBe(true);
      // đã trả lời hết các câu thì không hỏi nữa
      const answers: NguHanhAnswer[] = [];
      let cur = q;
      for (let i = 0; i < 8 && cur; i++) { answers.push(answerFor(cur, 'khong-nho')); cur = nextNguHanhQuestion(a, false, answers, NOW)!; }
      expect(nextNguHanhQuestion(a, false, answers, NOW)).toBeUndefined();
      expect(askText(script(a, a, answers))).toBe(false);
      // đã kết luận thì không hỏi
      expect(nextNguHanhQuestion(a, true, [], NOW)).toBeUndefined();
    }
    expect(asked).toBeGreaterThan(10);
  });

  it('khi đã có câu trả lời, Thầy nói kết luận hoặc nói chưa đủ để chắc', () => {
    let seen = 0;
    for (const { a } of multi) {
      const q = nextNguHanhQuestion(a, false, [], NOW);
      if (!q) continue;
      const r = resolveWithFeedback(a, [{ target: q.target, outcome: 'xau' }]).analysis;
      const text = script(r, a, [answerFor(q, 'xau')]).map((c) => c.caption ?? '').join(' ');
      expect(text).toMatch(/Chưa đủ dữ liệu|Chưa phân định|khớp với/);
      seen++;
    }
    expect(seen).toBeGreaterThan(10);
  });

  it('(e) focus.hidden chỉ trỏ tới Can tàng có thật của đúng trụ đó', () => {
    let checked = 0;
    for (const { a } of [...plain.slice(0, 200), ...multi]) {
      for (const c of script(a)) {
        const f = c.focus;
        if (!f?.hidden) continue;
        checked++;
        expect(f.pillar, 'phải kèm trụ').toBeDefined();
        const branch = [a.chart.year, a.chart.month, a.chart.day, a.chart.hour][f.pillar!].branch;
        expect(f.hidden.length).toBeGreaterThan(0);
        for (const h of f.hidden) expect(hiddenStems(branch)).toContain(h);
      }
    }
    expect(checked).toBeGreaterThan(100);
  });

  it('lời dẫn nguyệt lệnh tô trụ tháng', () => {
    const cues = script(plain[0].a);
    const lead = cues.find((c) => c.focus?.pillar === 1);
    expect(lead).toBeTruthy();
    expect(lead!.gesture).toBe('point');
  });
});
