/* Phân tích gộp, kiểm chứng bằng quá khứ (năm và Đại Vận) và cập nhật trọng số các cách luận.
   Port từ docs/ngu-hanh-engine/src/{engine,advice}.ts (v0.2). Công thức cập nhật (exp(k × mức khớp), kẹp ±1, sàn 2%) và
   ngưỡng kết luận (≥ 3 câu, trọng số ≥ 80%, khớp ≥ 75%) GIỮ NGUYÊN. Khác v0.2 theo ARCHITECTURE mục 14.5:
   - năm lấy theo Lập Xuân của app (yearCanChiIndex), không dùng yearPillar() theo năm dương lịch;
   - câu trả lời và câu hỏi có thể là một năm hoặc một Đại Vận;
   - độ tuổi tối thiểu và số câu là tham số (mặc định = hành vi v0.2: năm sinh + 15, tối đa 4 năm, không hỏi Đại Vận). */
import { yearCanChiIndex } from '../canchi';
import { DEFAULT_CONFIG, type ScoringConfig } from './config';
import { buildReadings, classifyDayMaster, evaluatePeriod, scoreElements, type DayMasterInfo, type Favor, type Reading, type ScoreResult } from './engine';
import { assessFollow, type FollowAssessment } from './follow';
import { msg, type Msg, type NguHanhChart, type Pillar } from './types';

export type Outcome = 'tot' | 'binh' | 'xau';
/** Một mốc thời gian đã qua: một năm dương lịch (theo Lập Xuân) hoặc Đại Vận thứ `index` của lá số. */
export type PeriodTarget = { kind: 'nam'; year: number } | { kind: 'daiVan'; index: number };
export interface FeedbackAnswer { target: PeriodTarget; outcome: Outcome }

export interface LogEntry {
  target: PeriodTarget;
  outcome: Outcome;
  predictions: Array<{ readingId: Reading['id']; favor: Favor }>;
}
export interface Resolution {
  decided: boolean;
  /** `resolve.decided` | `resolve.insufficient` | `resolve.undecided`, kèm số liệu */
  conclusion: Msg;
  answers: FeedbackAnswer[];
  log: LogEntry[];
}

export interface NguHanhAnalysis {
  config: { id: string; name: string };
  /** lá số đã phân tích (cần cho Đại Vận và năm tính theo Lập Xuân) */
  chart: NguHanhChart;
  score: ScoreResult;
  dayMaster: DayMasterInfo;
  follow: FollowAssessment | null;
  readings: Reading[];
  /** Dụng thần của cách luận chính (= readings[0].usefulGod) */
  usefulGod: Reading['usefulGod'];
  /** Có giá trị sau khi gọi resolveWithFeedback() */
  resolution?: Resolution;
}

export function analyze(chart: NguHanhChart, cfg: ScoringConfig = DEFAULT_CONFIG): NguHanhAnalysis {
  const sr = scoreElements(chart, cfg);
  const dmi = classifyDayMaster(chart, sr, cfg);
  const follow = assessFollow(chart, sr, dmi, cfg);
  const readings = buildReadings(chart, sr, dmi, follow, cfg);
  return { config: { id: cfg.id, name: cfg.name }, chart, score: sr, dayMaster: dmi, follow, readings, usefulGod: readings[0].usefulGod };
}

/* ===== Mốc thời gian ===== */

/** Trụ Can Chi của năm dương lịch `year`, theo Lập Xuân (yearCanChiIndex của app). */
export function pillarOfYear(year: number): Pillar {
  const cc = yearCanChiIndex(year);
  return { stem: cc.can, branch: cc.chi };
}

/** Tuổi (âm, tính theo năm Lập Xuân) của người sinh ở `year`. */
export const ageInYear = (chart: NguHanhChart, year: number) => year - chart.tietYear + 1;

/** Khoảng năm dương lịch mà Đại Vận thứ `index` phủ (10 năm, tuổi `khoiVanYears + 10·index` đến `+9`). */
export function daiVanYears(chart: NguHanhChart, index: number): { fromAge: number; toAge: number; fromYear: number; toYear: number } {
  const fromAge = chart.khoiVanYears + index * 10;
  return { fromAge, toAge: fromAge + 9, fromYear: chart.tietYear + fromAge - 1, toYear: chart.tietYear + fromAge + 8 };
}

/** Trụ cần chấm cho một mốc thời gian; null nếu Đại Vận không tồn tại. */
export function pillarOfTarget(chart: NguHanhChart, t: PeriodTarget): Pillar | null {
  return t.kind === 'nam' ? pillarOfYear(t.year) : (chart.daiVan[t.index] ?? null);
}

/* ===== Câu hỏi kiểm chứng ===== */

export interface VerificationQuestion {
  target: PeriodTarget;
  pillar: Pillar;
  predictions: Array<{ readingId: Reading['id']; favor: Favor; score: number }>;
}

export interface VerificationOptions {
  /** năm hiện tại (dương lịch); chỉ hỏi các mốc đã qua */
  nowYear: number;
  /** số năm nhìn lại, mặc định 20 */
  lookback?: number;
  /** tuổi (âm) tối thiểu của năm được hỏi; mặc định 16 (= năm sinh + 15 của v0.2), app dùng 18 */
  minAge?: number;
  /** số năm tối đa, mặc định 4 (như v0.2) */
  maxYears?: number;
  /** số Đại Vận đã đi hết tối đa, mặc định 0 (như v0.2), app dùng 2 */
  maxDaiVan?: number;
  /** tuổi (âm) tối thiểu lúc bắt đầu Đại Vận được hỏi, mặc định 12 */
  daiVanMinAge?: number;
}

const OPPOSITE = 0.35;

/**
 * Chọn các mốc đã qua mà hai cách luận dự đoán NGƯỢC chiều nhau nhiều nhất để hỏi người dùng.
 * Đại Vận đứng trước, năm đứng sau; mỗi nhóm lấy các mốc chênh lệch lớn nhất. Không còn hai cách luận thì trả rỗng.
 */
export function verificationQuestions(a: NguHanhAnalysis, opts: VerificationOptions): VerificationQuestion[] {
  const [r0, r1] = a.readings;
  if (!r1) return [];
  const chart = a.chart;
  const make = (target: PeriodTarget, pillar: Pillar) => {
    const e0 = evaluatePeriod(pillar, r0.usefulGod), e1 = evaluatePeriod(pillar, r1.usefulGod);
    const opposite = (e0.score >= OPPOSITE && e1.score <= -OPPOSITE) || (e0.score <= -OPPOSITE && e1.score >= OPPOSITE);
    if (!opposite) return null;
    return {
      diff: Math.abs(e0.score - e1.score),
      q: {
        target, pillar,
        predictions: [
          { readingId: r0.id, favor: e0.favor, score: e0.score },
          { readingId: r1.id, favor: e1.favor, score: e1.score },
        ],
      } as VerificationQuestion,
    };
  };

  // Đại Vận đã đi hết, bắt đầu từ tuổi daiVanMinAge trở lên
  const dvMinAge = opts.daiVanMinAge ?? 12;
  const dvCands: Array<{ diff: number; q: VerificationQuestion }> = [];
  for (let i = 0; i < chart.daiVan.length; i++) {
    const span = daiVanYears(chart, i);
    if (span.fromAge < dvMinAge || span.toYear >= opts.nowYear) continue;
    const c = make({ kind: 'daiVan', index: i }, chart.daiVan[i]);
    if (c) dvCands.push(c);
  }
  const daiVan = dvCands
    .sort((x, y) => y.diff - x.diff)
    .slice(0, opts.maxDaiVan ?? 0)
    .sort((x, y) => (y.q.target as { index: number }).index - (x.q.target as { index: number }).index)
    .map((c) => c.q);

  // Năm: nhìn lại `lookback` năm, từ tuổi minAge
  const minYear = Math.max(opts.nowYear - (opts.lookback ?? 20), chart.tietYear + (opts.minAge ?? 16) - 1);
  const yCands: Array<{ diff: number; q: VerificationQuestion }> = [];
  for (let y = opts.nowYear - 1; y >= minYear; y--) {
    const c = make({ kind: 'nam', year: y }, pillarOfYear(y));
    if (c) yCands.push(c);
  }
  const years = yCands
    .sort((x, y) => y.diff - x.diff)
    .slice(0, opts.maxYears ?? 4)
    .sort((x, y) => (y.q.target as { year: number }).year - (x.q.target as { year: number }).year)
    .map((c) => c.q);

  return [...daiVan, ...years];
}

/* ===== Phân xử bằng câu trả lời ===== */

const OUTCOME_VALUE: Record<Outcome, number> = { tot: 1, binh: 0, xau: -1 };

/**
 * Cập nhật trọng số các cách luận từ câu trả lời (cập nhật kiểu Bayes đơn giản): mỗi câu nhân trọng số của cách luận
 * với exp(k × mức khớp) rồi chuẩn hoá. Câu trả lời "không nhớ" KHÔNG được truyền vào đây. Trả về phân tích mới.
 */
export function resolveWithFeedback(a: NguHanhAnalysis, answers: FeedbackAnswer[], k = 0.7) {
  const log: LogEntry[] = [];
  const logW = a.readings.map((r) => Math.log(Math.max(r.weight, 1e-3)));
  const wins = a.readings.map(() => 0);
  const valid = answers.filter((x) => pillarOfTarget(a.chart, x.target) !== null);

  for (const ans of valid) {
    const p = pillarOfTarget(a.chart, ans.target)!;
    const o = OUTCOME_VALUE[ans.outcome];
    const predictions: LogEntry['predictions'] = [];
    const agrees = a.readings.map((r, i) => {
      const ev = evaluatePeriod(p, r.usefulGod);
      // Mốc "bình thường" ủng hộ cách luận dự đoán gần 0; mốc tốt/xấu ủng hộ cách luận cùng dấu.
      // Kẹp ±1 để một câu không quyết định tất cả (trí nhớ có thể sai).
      const agree = Math.max(-1, Math.min(1, o === 0 ? -Math.abs(ev.score) * 0.5 : o * ev.score));
      logW[i] += k * agree;
      predictions.push({ readingId: r.id, favor: ev.favor });
      return agree;
    });
    const best = agrees.indexOf(Math.max(...agrees));
    if (agrees.filter((x) => x === agrees[best]).length === 1) wins[best]++;
    log.push({ target: ans.target, outcome: ans.outcome, predictions });
  }

  const maxLog = Math.max(...logW);
  const exps = logW.map((x) => Math.exp(x - maxLog));
  const sum = exps.reduce((x, y) => x + y, 0);
  // Sàn 2%: dữ liệu tự báo của người dùng có thể nhầm, không loại hẳn cách luận nào
  const floored = exps.map((x) => Math.max(x / sum, 0.02));
  const fsum = floored.reduce((x, y) => x + y, 0);
  const readings: Reading[] = a.readings
    .map((r, i) => ({ ...r, weight: Math.round((floored[i] / fsum) * 1000) / 1000 }))
    .sort((x, y) => y.weight - x.weight);

  const top = readings[0];
  const topWins = wins[a.readings.findIndex((r) => r.id === top.id)];
  const n = valid.length;
  const matchRate = n ? topWins / n : 0;
  // Kết luận khi: đủ 3 câu, trọng số ≥ 80% VÀ cách luận đó khớp ≥ 75% số câu (2 đúng 1 sai chưa đủ)
  const decided = n >= 3 && top.weight >= 0.8 && matchRate >= 0.75;
  const conclusion = decided
    ? msg('resolve.decided', { reading: top.id, wins: topWins, total: n, weight: top.weight })
    : n < 3
      ? msg('resolve.insufficient', { total: n, needed: 3 })
      : msg('resolve.undecided', { reading: top.id, wins: topWins, total: n, weight: top.weight });

  const resolution: Resolution = { decided, conclusion, answers: [...(a.resolution?.answers ?? []), ...valid], log };
  return { analysis: { ...a, readings, usefulGod: top.usefulGod, resolution } as NguHanhAnalysis, decided, conclusion, log };
}
