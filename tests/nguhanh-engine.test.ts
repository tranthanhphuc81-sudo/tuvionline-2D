/* Engine ngũ hành (Phase 3C.2): chứng minh bảng dùng lại khớp bản tham chiếu, bản port giữ nguyên thuật toán v0.2,
   năm mẫu của demo.ts, phân xử bằng quá khứ (năm và Đại Vận), bất biến ARCHITECTURE 14.9 và số so sánh với legacy. */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { LucHaoEngine, batTuChart, batTuReading } from '../src/core';
import { BT_HANH_ORDER, CAN_HANH, TANG_CAN, seasonHanh } from '../src/core/battu/engine';
import {
  BRANCH_CLASHES, BRANCH_SIX_COMBOS, ELEMENTS, analyze, compareWithLegacy, daiVanYears, evaluatePeriod, hiddenStems, resolveWithFeedback,
  seasonClimate, seasonElement, stemElement, toNguHanhChart, verificationQuestions, pillarOfYear,
  type Element, type FeedbackAnswer, type NguHanhAnalysis, type NguHanhChart,
} from '../src/core/nguhanh';

const FIXTURE = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'fixtures', 'nguhanh-reference.json'), 'utf8')) as { cases: RefCase[] };

/* ----- Bảng của bản tham chiếu docs/ngu-hanh-engine/src/data.ts (chép nguyên, dùng id chuỗi không dấu) ----- */
const REF_STEMS = ['Giap', 'At', 'Binh', 'Dinh', 'Mau', 'Ky', 'Canh', 'Tan', 'Nham', 'Quy'];
const REF_BRANCHES = ['Ty', 'Suu', 'Dan', 'Mao', 'Thin', 'Ti', 'Ngo', 'Mui', 'Than', 'Dau', 'Tuat', 'Hoi'];
const REF_ELEMENTS = ['Moc', 'Hoa', 'Tho', 'Kim', 'Thuy'];
const REF_HIDDEN: Record<string, string[]> = {
  Ty: ['Quy'], Suu: ['Ky', 'Quy', 'Tan'], Dan: ['Giap', 'Binh', 'Mau'], Mao: ['At'], Thin: ['Mau', 'At', 'Quy'], Ti: ['Binh', 'Canh', 'Mau'],
  Ngo: ['Dinh', 'Ky'], Mui: ['Ky', 'Dinh', 'At'], Than: ['Canh', 'Nham', 'Mau'], Dau: ['Tan'], Tuat: ['Mau', 'Tan', 'Dinh'], Hoi: ['Nham', 'Giap'],
};
const REF_SEASON: Record<string, string> = {
  Dan: 'Moc', Mao: 'Moc', Ti: 'Hoa', Ngo: 'Hoa', Than: 'Kim', Dau: 'Kim', Hoi: 'Thuy', Ty: 'Thuy', Thin: 'Tho', Tuat: 'Tho', Suu: 'Tho', Mui: 'Tho',
};
const REF_CLIMATE: Record<string, string> = {
  Hoi: 'lanh', Ty: 'lanh', Suu: 'lanh', Ti: 'nong', Ngo: 'nong', Mui: 'nong', Dan: 'on', Mao: 'on', Thin: 'on', Than: 'on', Dau: 'on', Tuat: 'on',
};
const REF_SIX: Array<[string, string, string]> = [['Ty', 'Suu', 'Tho'], ['Dan', 'Hoi', 'Moc'], ['Mao', 'Tuat', 'Hoa'], ['Thin', 'Dau', 'Kim'], ['Ti', 'Than', 'Thuy'], ['Ngo', 'Mui', 'Hoa']];
const EL_VI: Record<string, Element> = { Moc: 'Mộc', Hoa: 'Hoả', Tho: 'Thổ', Kim: 'Kim', Thuy: 'Thuỷ' };

describe('Bảng dùng lại của app khớp bảng của bản tham chiếu', () => {
  it('thứ tự hành của engine = BT_HANH_ORDER, tên hành theo chính tả của app', () => {
    expect([...ELEMENTS]).toEqual([...BT_HANH_ORDER]);
    expect(REF_ELEMENTS.map((e) => EL_VI[e])).toEqual([...ELEMENTS]);
  });
  it('hành của Thiên can', () => {
    REF_STEMS.forEach((_, i) => expect(stemElement(i as never)).toBe(EL_VI[REF_ELEMENTS[Math.floor(i / 2)]]));
    REF_STEMS.forEach((_, i) => expect(BT_HANH_ORDER[CAN_HANH[i]]).toBe(stemElement(i as never)));
  });
  it('tàng can (thứ tự bản khí, trung khí, dư khí)', () => {
    REF_BRANCHES.forEach((b, i) => {
      expect(hiddenStems(i as never).map((s) => REF_STEMS[s])).toEqual(REF_HIDDEN[b]);
      expect(TANG_CAN[i].map((t) => REF_STEMS[t[0]])).toEqual(REF_HIDDEN[b]);
    });
  });
  it('hành chủ của mùa theo chi tháng và khí hậu', () => {
    REF_BRANCHES.forEach((b, i) => {
      expect(seasonElement(i as never)).toBe(EL_VI[REF_SEASON[b]]);
      expect(BT_HANH_ORDER[seasonHanh(i as never)]).toBe(EL_VI[REF_SEASON[b]]);
      expect(seasonClimate(i as never)).toBe(REF_CLIMATE[b]);
    });
  });
  it('lục xung, lục hợp khớp chiRelation của Lục Hào', () => {
    for (let a = 0; a < 12; a++) {
      for (let b = 0; b < 12; b++) {
        const clash = BRANCH_CLASHES.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
        const six = BRANCH_SIX_COMBOS.some(({ pair: [x, y] }) => (x === a && y === b) || (x === b && y === a));
        const rel = LucHaoEngine.chiRelation(a as never, b as never);
        expect(clash, `xung ${a}-${b}`).toBe(rel === 'xung');
        expect(six, `hợp ${a}-${b}`).toBe(rel === 'hop');
      }
    }
    expect(BRANCH_SIX_COMBOS.map(({ pair: [x, y], to }) => [REF_BRANCHES[x], REF_BRANCHES[y], to])).toEqual(REF_SIX.map(([x, y, t]) => [x, y, EL_VI[t]]));
  });
});

/* ----- So với kết quả của engine tham chiếu ----- */
interface RefCase {
  input: { gender: 'M' | 'F'; dd: number; mm: number; yy: number; hourIdx: number };
  scores: Record<string, number>; shares: Record<string, number>; total: number; seasonElement: string;
  dayMaster: { dayMaster: string; supportRatio: number; strength: string; byTenGod: Record<string, number>; deLenh: boolean };
  follow: null | { kind: string; grade: string; confidence: number; checks: [string, number][]; followGroups: string[]; breakers: string[] };
  readings: Array<{ id: string; weight: number; ug: { method: string; dung: string; hy: string; ky: string; cuu: string | null; secondary: { method: string; element: string }[] } }>;
  timing: number[][]; verificationYears: number[];
  resolve: null | { years: number[]; weights: [string, number][]; decided: boolean };
}
const chartOf = (i: RefCase['input']) => toNguHanhChart(batTuChart(i as never));

describe('Bản port giữ nguyên thuật toán v0.2 (500 lá số so với docs/ngu-hanh-engine)', () => {
  it('có đủ ca tòng, nhiều cách luận và phân xử', () => {
    expect(FIXTURE.cases.length).toBe(500);
    expect(FIXTURE.cases.filter((c) => c.follow).length).toBeGreaterThan(80);
    expect(FIXTURE.cases.filter((c) => c.readings.length > 1).length).toBeGreaterThan(25);
    expect(FIXTURE.cases.filter((c) => c.resolve?.decided).length).toBeGreaterThan(0);
  });
  it('điểm, vượng/nhược, tòng cách, Dụng/Hỷ/Kỵ/Cừu, đánh giá năm, câu hỏi và phân xử', () => {
    for (const c of FIXTURE.cases) {
      const a = analyze(chartOf(c.input));
      const at = `${c.input.dd}/${c.input.mm}/${c.input.yy} h${c.input.hourIdx}`;
      expect(a.score.scores, at).toEqual(c.scores);
      expect(a.score.shares, at).toEqual(c.shares);
      expect(a.score.total, at).toBe(c.total);
      expect(a.score.seasonElement, at).toBe(c.seasonElement);
      expect(a.dayMaster, at).toEqual(c.dayMaster);
      expect(a.follow ? { kind: a.follow.kind, grade: a.follow.grade, confidence: a.follow.confidence, checks: a.follow.checks.map((k) => [k.id, k.score]), followGroups: a.follow.followGroups, breakers: a.follow.breakers } : null, at).toEqual(c.follow);
      expect(a.readings.map((r) => ({
        id: r.id, weight: r.weight,
        ug: { method: r.usefulGod.method, dung: r.usefulGod.dung, hy: r.usefulGod.hy, ky: r.usefulGod.ky, cuu: r.usefulGod.cuu, secondary: r.usefulGod.secondary.map((s) => ({ method: s.method, element: s.element })) },
      })), at).toEqual(c.readings);
      expect([2021, 2022, 2023, 2024, 2025].map((y) => a.readings.map((r) => evaluatePeriod(pillarOfYear(y), r.usefulGod).score)), at).toEqual(c.timing);
      // v0.2: tuổi tối thiểu = năm sinh + 15 (tương ứng minAge 16), tối đa 4 năm, không hỏi Đại Vận
      const vq = verificationQuestions(a, { nowYear: 2026 });
      expect(vq.map((q) => (q.target as { year: number }).year), at).toEqual(c.verificationYears);
      if (c.resolve) {
        const OUT = ['tot', 'xau', 'binh', 'tot'] as const;
        const res = resolveWithFeedback(a, vq.map((q, i): FeedbackAnswer => ({ target: q.target, outcome: OUT[i % 4] })));
        expect(res.analysis.readings.map((r) => [r.id, r.weight]), at).toEqual(c.resolve.weights);
        expect(res.decided, at).toBe(c.resolve.decided);
      }
    }
  });
});

/* ----- Năm lá số mẫu của docs/ngu-hanh-engine/demo.ts ----- */
const chartFrom = (y: [string, string], m: [string, string], d: [string, string], h: [string, string]): NguHanhChart => {
  const p = ([s, b]: [string, string]) => ({ stem: REF_STEMS.indexOf(s) as never, branch: REF_BRANCHES.indexOf(b) as never });
  return { year: p(y), month: p(m), day: p(d), hour: p(h), daiVan: [], khoiVanYears: 5, tietYear: 1990 };
};
const SAMPLES = {
  chanTongSat: chartFrom(['Nham', 'Than'], ['Nham', 'Ty'], ['Binh', 'Ty'], ['Mau', 'Ty']),
  giaTong: chartFrom(['Nham', 'Than'], ['Nham', 'Ty'], ['Binh', 'Thin'], ['Mau', 'Ty']),
  khongThanh: chartFrom(['Nham', 'Than'], ['Nham', 'Ty'], ['Binh', 'Ty'], ['At', 'Mui']),
  chanKhucTruc: chartFrom(['Quy', 'Hoi'], ['Giap', 'Dan'], ['Giap', 'Thin'], ['Dinh', 'Mao']),
  thuong: chartFrom(['Binh', 'Dan'], ['Giap', 'Ngo'], ['Canh', 'Tuat'], ['Dinh', 'Hoi']),
};

describe('Năm lá số mẫu của demo.ts', () => {
  it('Chân Tòng Sát', () => {
    const a = analyze(SAMPLES.chanTongSat);
    expect(a.follow).toMatchObject({ type: 'tong-sat', grade: 'chan', kind: 'tong' });
    expect(a.readings[0]).toMatchObject({ id: 'thuan-the', weight: 0.95 });
    expect(a.usefulGod.method).toBe('tong-cach');
  });
  it('Giả tòng, trọng số 65/35', () => {
    const a = analyze(SAMPLES.giaTong);
    expect(a.follow).toMatchObject({ type: 'tong-sat', grade: 'gia' });
    expect(a.readings.map((r) => [r.id, r.weight])).toEqual([['thuan-the', 0.65], ['thong-thuong', 0.35]]);
  });
  it('Không thành cách: chỉ luận thông thường, vẫn giải thích vì sao', () => {
    const a = analyze(SAMPLES.khongThanh);
    expect(a.follow?.grade).toBe('khong-thanh');
    expect(a.readings.map((r) => [r.id, r.weight])).toEqual([['thong-thuong', 1]]);
    expect(a.follow!.checks.some((c) => c.gate && c.score === 0)).toBe(true);
  });
  it('Chân Khúc Trực', () => {
    const a = analyze(SAMPLES.chanKhucTruc);
    expect(a.follow).toMatchObject({ type: 'khuc-truc', grade: 'chan', kind: 'chuyen-vuong' });
  });
  it('Lá thường: không xét tòng', () => {
    const a = analyze(SAMPLES.thuong);
    expect(a.follow).toBeNull();
    expect(a.readings).toHaveLength(1);
  });
  it('kết quả là mã và số, không có câu văn', () => {
    const a = analyze(SAMPLES.giaTong);
    const json = JSON.stringify([a.score.trace, a.usefulGod.reasons, a.follow!.summary, a.follow!.checks, a.readings.map((r) => r.label)]);
    expect(json).toMatch(/"code":"trace\.raw"/);
    expect(json).toMatch(/"code":"reason\.followHead"/);
    // mọi chuỗi trong kết quả là mã (chữ Latin, dấu chấm, gạch nối) hoặc tên hành, không có câu văn
    const strings: string[] = [];
    JSON.parse(json, (_k, v) => { if (typeof v === 'string') strings.push(v); return v; });
    for (const s of strings) expect(/^[A-Za-z.-]+$/.test(s) || (ELEMENTS as readonly string[]).includes(s), s).toBe(true);
  });
});

/* ----- Phân xử bằng quá khứ ----- */
const answersMatching = (a: NguHanhAnalysis, qs: ReturnType<typeof verificationQuestions>, readingId: 'thuan-the' | 'thong-thuong'): FeedbackAnswer[] =>
  qs.map((q) => ({ target: q.target, outcome: q.predictions.find((p) => p.readingId === readingId)!.score > 0 ? 'tot' : 'xau' }));

describe('resolveWithFeedback', () => {
  const a = analyze(SAMPLES.giaTong);
  const qs = verificationQuestions(a, { nowYear: 2026 });
  it('4/4 câu khớp thì kết luận', () => {
    expect(qs).toHaveLength(4);
    const r = resolveWithFeedback(a, answersMatching(a, qs, 'thong-thuong'));
    expect(r.decided).toBe(true);
    expect(r.conclusion.code).toBe('resolve.decided');
    expect(r.analysis.readings[0].id).toBe('thong-thuong');
    expect(r.analysis.readings[0].weight).toBeGreaterThanOrEqual(0.8);
  });
  it('2/3 câu khớp thì chưa phân định', () => {
    const good = answersMatching(a, qs, 'thong-thuong').slice(0, 2);
    const bad = answersMatching(a, qs, 'thuan-the').slice(2, 3);
    const r = resolveWithFeedback(a, [...good, ...bad]);
    expect(r.decided).toBe(false);
    expect(r.conclusion.code).toBe('resolve.undecided');
  });
  it('dưới 3 câu thì chưa đủ dữ liệu', () => {
    const r = resolveWithFeedback(a, answersMatching(a, qs, 'thong-thuong').slice(0, 2));
    expect(r.decided).toBe(false);
    expect(r.conclusion).toEqual({ code: 'resolve.insufficient', p: { total: 2, needed: 3 } });
  });
  it('không có câu trả lời nào thì giữ nguyên trọng số', () => {
    const r = resolveWithFeedback(a, []);
    expect(r.analysis.readings.map((x) => x.weight)).toEqual(a.readings.map((x) => x.weight));
  });
  it('Đại Vận không tồn tại thì bị bỏ qua, không tính vào ngưỡng', () => {
    const r = resolveWithFeedback(a, [{ target: { kind: 'daiVan', index: 99 }, outcome: 'tot' }]);
    expect(r.conclusion.code).toBe('resolve.insufficient');
    expect(r.analysis.resolution!.answers).toHaveLength(0);
  });
});

describe('Đại Vận trong kiểm chứng', () => {
  // lá số thật có nhiều cách luận và có Đại Vận đã đi hết
  const pickDaiVan = () => {
    for (const c of FIXTURE.cases.filter((x) => x.readings.length > 1)) {
      const a = analyze(chartOf(c.input));
      const qs = verificationQuestions(a, { nowYear: 2026, minAge: 18, maxYears: 3, maxDaiVan: 2 });
      if (qs.some((q) => q.target.kind === 'daiVan')) return { a, qs };
    }
    throw new Error('không có lá số mẫu nào có câu hỏi Đại Vận');
  };
  it('câu hỏi Đại Vận chỉ trỏ tới giai đoạn đã đi hết, từ 12 tuổi, đứng trước các câu hỏi năm', () => {
    const { a, qs } = pickDaiVan();
    const kinds = qs.map((q) => q.target.kind);
    expect(kinds.indexOf('nam')).toBeGreaterThan(kinds.lastIndexOf('daiVan'));
    for (const q of qs) {
      if (q.target.kind === 'daiVan') {
        const span = daiVanYears(a.chart, q.target.index);
        expect(span.toYear).toBeLessThan(2026);
        expect(span.fromAge).toBeGreaterThanOrEqual(12);
      }
    }
  });
  it('một Đại Vận khớp cách luận A thì trọng số A tăng, ngược lại thì giảm', () => {
    const { a, qs } = pickDaiVan();
    const q = qs.find((x) => x.target.kind === 'daiVan')!;
    const [r0, r1] = a.readings;
    const f0 = q.predictions.find((p) => p.readingId === r0.id)!.score;
    const toward0 = resolveWithFeedback(a, [{ target: q.target, outcome: f0 > 0 ? 'tot' : 'xau' }]);
    const toward1 = resolveWithFeedback(a, [{ target: q.target, outcome: f0 > 0 ? 'xau' : 'tot' }]);
    const w = (r: typeof toward0, id: string) => r.analysis.readings.find((x) => x.id === id)!.weight;
    expect(w(toward0, r0.id)).toBeGreaterThan(r0.weight);
    expect(w(toward1, r0.id)).toBeLessThan(r0.weight);
    expect(w(toward0, r0.id) + w(toward0, r1.id)).toBeCloseTo(1, 2);
  });
});

/* ----- Bất biến (ARCHITECTURE 14.9) trên 500 lá số sinh từ batTuChart ----- */
describe('Bất biến trên 500 lá số', () => {
  it('tổng trọng số = 1, dụng ≠ kỵ, cừu khác dụng và hỷ, Chân thì không cổng nào trượt, Giả thì ≤ giaMaxWeight, câu hỏi đúng ngưỡng', () => {
    for (const c of FIXTURE.cases) {
      const a = analyze(chartOf(c.input));
      const sum = a.readings.reduce((s, r) => s + r.weight, 0);
      expect(sum).toBeGreaterThan(0.99); expect(sum).toBeLessThan(1.01);
      for (const r of a.readings) {
        const u = r.usefulGod;
        expect(u.dung).not.toBe(u.ky);
        expect(u.hy).not.toBe(u.ky);
        if (u.cuu) { expect(u.cuu).not.toBe(u.dung); expect(u.cuu).not.toBe(u.hy); }
      }
      if (a.follow?.grade === 'chan') expect(a.follow.checks.filter((k) => k.gate).every((k) => k.score > 0)).toBe(true);
      if (a.follow?.grade === 'gia') expect(a.readings.find((r) => r.id === 'thuan-the')!.weight).toBeLessThanOrEqual(0.65);
      const qs = verificationQuestions(a, { nowYear: 2026, minAge: 18, maxYears: 3, maxDaiVan: 2 });
      expect(qs.length).toBeLessThanOrEqual(5);
      if (a.readings.length < 2) expect(qs).toEqual([]);
      for (const q of qs) {
        if (q.target.kind === 'nam') {
          expect(q.target.year).toBeLessThan(2026);
          expect(q.target.year - a.chart.tietYear + 1).toBeGreaterThanOrEqual(18);
        } else {
          const span = daiVanYears(a.chart, q.target.index);
          expect(span.toYear).toBeLessThan(2026);
          expect(span.fromAge).toBeGreaterThanOrEqual(12);
        }
      }
    }
  });
});

/* ----- So sánh với legacy (số trong docs/NGU-HANH-SO-SANH.md) ----- */
describe('compareWithLegacy trên 3000 lá số (seed 20261111)', () => {
  it('ra đúng số của bảng so sánh và bảng nguyên nhân ở ARCHITECTURE 14', () => {
    let seed = 20261111; const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
    const N = 3000; let same = 0, inDung = 0, flip = 0; const flipBy: Record<string, number> = {}; const allBy: Record<string, number> = {};
    let alt = 0, follow = 0;
    for (let i = 0; i < N; i++) {
      const yy = 1950 + Math.floor(rnd() * 60), mm = 1 + Math.floor(rnd() * 12), dd = 1 + Math.floor(rnd() * 28), h = Math.floor(rnd() * 12); rnd();
      const ch = batTuChart({ gender: 'M', dd, mm, yy, hourIdx: h } as never);
      const leg = batTuReading(ch, 2026);
      const a = analyze(toNguHanhChart(ch));
      const cmp = compareWithLegacy(leg, a.usefulGod, a.dayMaster.strength);
      if (leg.primary === a.usefulGod.dung) same++;
      if (leg.dung.includes(a.usefulGod.dung)) inDung++;
      allBy[cmp.cause] = (allBy[cmp.cause] ?? 0) + 1;
      if (cmp.match === 'nguoc') { flip++; flipBy[cmp.cause] = (flipBy[cmp.cause] ?? 0) + 1; }
      if (a.readings.length > 1) alt++;
      if (a.follow) follow++;
    }
    const p = (n: number) => (100 * n / N).toFixed(1);
    expect([p(same), p(inDung), p(flip)]).toEqual(['36.1', '61.2', '40.5']);
    expect(flip).toBe(1216);
    expect(flipBy).toEqual({ 'vuong-nhuoc': 504, 'trung-hoa': 400, 'dieu-hau': 159, 'tong-cach': 100, 'khac-chon': 53 });
    expect(alt).toBe(132);
    expect(follow).toBe(688);
  });
});
