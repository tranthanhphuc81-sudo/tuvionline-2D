/* Tính điểm ngũ hành, xếp loại nhật chủ, chọn Dụng/Hỷ/Kỵ/Cừu thần, nhiều cách luận, đánh giá một năm hay Đại Vận.
   Port từ docs/ngu-hanh-engine/src/engine.ts (v0.2): GIỮ NGUYÊN thuật toán và hệ số; chỉ đổi kiểu dữ liệu (chỉ số can chi,
   chính tả hành của app) và đổi câu văn thành mã `Msg`. Không dùng new Date(): mọi mốc thời gian là tham số. */
import { DEFAULT_CONFIG, type ScoringConfig } from './config';
import {
  BRANCH_CLASHES, BRANCH_SIX_COMBOS, BRANCH_TRIADS, ELEMENTS, STEM_COMBOS,
  controlledBy, controls, elementOfTenGod, generatedBy, generates, hiddenStems, seasonClimate, seasonElement, stemElement, tenGodOf,
  type Branch, type Element, type Stem, type TenGodGroup,
} from './data';
import { assessFollow, type FollowAssessment } from './follow';
import { msg, type Msg, type NguHanhChart, type Pillar, type Scores } from './types';

export const emptyScores = (): Scores => ({ 'Mộc': 0, 'Hoả': 0, 'Thổ': 0, 'Kim': 0, 'Thuỷ': 0 });
export const round = (n: number, d = 2) => Math.round(n * 10 ** d) / 10 ** d;
const total = (s: Scores) => ELEMENTS.reduce((a, e) => a + s[e], 0);

/* ===== 1. Tính điểm ===== */

export type SeasonalState = keyof ScoringConfig['seasonal'];
/** Trạng thái Vượng/Tướng/Hưu/Tù/Tử của hành e trong mùa có hành s. */
export function seasonalState(e: Element, s: Element): SeasonalState {
  if (e === s) return 'vuong';
  if (e === generates(s)) return 'tuong';
  if (e === generatedBy(s)) return 'huu';
  if (e === controls(s)) return 'tuDie';
  return 'tu';
}

export interface ScoreResult {
  scores: Scores;
  shares: Scores;
  total: number;
  seasonElement: Element;
  /** vết tính, mỗi dòng là một mã kèm số liệu, để hiện "vì sao ra kết quả này" */
  trace: Msg[];
}

type Pos = 'yearStem' | 'yearBranch' | 'monthStem' | 'monthBranch' | 'dayStem' | 'dayBranch' | 'hourStem' | 'hourBranch';
type PW = ScoringConfig['positionWeight'];
const rawScores = (s: Scores): Scores => ({ ...s });

export function scoreElements(chart: NguHanhChart, cfg: ScoringConfig = DEFAULT_CONFIG): ScoreResult {
  const trace: Msg[] = [];
  const raw = emptyScores();
  const seasonEl = seasonElement(chart.month.branch);
  const pw: PW = cfg.positionWeight;

  type Slot = { pos: Pos; stem?: Stem; branch?: Branch };
  const slots: Slot[] = [
    { pos: 'yearStem', stem: chart.year.stem }, { pos: 'yearBranch', branch: chart.year.branch },
    { pos: 'monthStem', stem: chart.month.stem }, { pos: 'monthBranch', branch: chart.month.branch },
    { pos: 'dayStem', stem: chart.day.stem }, { pos: 'dayBranch', branch: chart.day.branch },
    { pos: 'hourStem', stem: chart.hour.stem }, { pos: 'hourBranch', branch: chart.hour.branch },
  ];

  // Lục xung: giảm điểm 2 chi xung
  const branchFactor = new Map<Pos, number>();
  const branchSlots = slots.filter((s) => s.branch !== undefined);
  for (let i = 0; i < branchSlots.length; i++) {
    for (let j = i + 1; j < branchSlots.length; j++) {
      const a = branchSlots[i].branch!, b = branchSlots[j].branch!;
      if (BRANCH_CLASHES.some(([x, y]) => (x === a && y === b) || (x === b && y === a))) {
        branchFactor.set(branchSlots[i].pos, (branchFactor.get(branchSlots[i].pos) ?? 1) * cfg.interactions.clashFactor);
        branchFactor.set(branchSlots[j].pos, (branchFactor.get(branchSlots[j].pos) ?? 1) * cfg.interactions.clashFactor);
        trace.push(msg('trace.clash', { a, b, factor: cfg.interactions.clashFactor }));
      }
    }
  }

  // Thiên can hợp kề nhau (năm-tháng, tháng-ngày, ngày-giờ): giảm lực
  const stemFactor = new Map<Pos, number>();
  const stemOrder: Array<[Pos, Stem]> = [
    ['yearStem', chart.year.stem], ['monthStem', chart.month.stem], ['dayStem', chart.day.stem], ['hourStem', chart.hour.stem],
  ];
  for (let i = 0; i < stemOrder.length - 1; i++) {
    const [pa, a] = stemOrder[i], [pb, b] = stemOrder[i + 1];
    const combo = STEM_COMBOS.find(({ pair: [x, y] }) => (x === a && y === b) || (x === b && y === a));
    if (combo) {
      stemFactor.set(pa, (stemFactor.get(pa) ?? 1) * cfg.interactions.stemComboFactor);
      stemFactor.set(pb, (stemFactor.get(pb) ?? 1) * cfg.interactions.stemComboFactor);
      trace.push(msg('trace.stemCombo', { a, b, to: combo.to, factor: cfg.interactions.stemComboFactor }));
    }
  }

  // Điểm gốc
  for (const s of slots) {
    const posW = pw[s.pos];
    if (posW === 0) continue;
    if (s.stem !== undefined) {
      raw[stemElement(s.stem)] += cfg.stemWeight * posW * (stemFactor.get(s.pos) ?? 1);
    }
    if (s.branch !== undefined) {
      const hidden = hiddenStems(s.branch);
      const ratios = cfg.hiddenRatios[hidden.length as 1 | 2 | 3];
      const f = branchFactor.get(s.pos) ?? 1;
      hidden.forEach((hs, k) => { raw[stemElement(hs)] += cfg.branchWeight * ratios[k] * posW * f; });
    }
  }
  trace.push(msg('trace.raw', { scores: rawScores(raw) }));

  // Tam hợp / bán hợp / lục hợp
  const branches = branchSlots.map((s) => s.branch!);
  for (const t of BRANCH_TRIADS) {
    const present = t.set.filter((b) => branches.includes(b));
    if (present.length === 3) {
      raw[t.to] += cfg.interactions.triadBonus;
      trace.push(msg('trace.triad', { set: [...t.set], to: t.to, bonus: cfg.interactions.triadBonus }));
    } else if (present.length === 2 && present.includes(t.set[1])) {
      raw[t.to] += cfg.interactions.halfTriadBonus;
      trace.push(msg('trace.halfTriad', { present, to: t.to, bonus: cfg.interactions.halfTriadBonus }));
    }
  }
  for (let i = 0; i < branches.length - 1; i++) {
    const a = branches[i], b = branches[i + 1];
    const c = BRANCH_SIX_COMBOS.find(({ pair: [x, y] }) => (x === a && y === b) || (x === b && y === a));
    if (c) {
      raw[c.to] += cfg.interactions.sixComboBonus;
      trace.push(msg('trace.sixCombo', { a, b, to: c.to, bonus: cfg.interactions.sixComboBonus }));
    }
  }

  // Hệ số mùa
  const scores = emptyScores();
  const states: Record<string, { state: SeasonalState; mult: number }> = {};
  for (const e of ELEMENTS) {
    const st = seasonalState(e, seasonEl);
    scores[e] = raw[e] * cfg.seasonal[st];
    states[e] = { state: st, mult: cfg.seasonal[st] };
  }
  trace.push(msg('trace.season', { monthBranch: chart.month.branch, season: seasonEl, states }));

  const t = total(scores);
  const shares = emptyScores();
  for (const e of ELEMENTS) {
    scores[e] = round(scores[e]);
    shares[e] = round(scores[e] / t, 3);
  }
  trace.push(msg('trace.final', { scores: rawScores(scores) }));
  return { scores, shares, total: round(t), seasonElement: seasonEl, trace };
}

/* ===== 2. Vượng / nhược ===== */

export type Strength = 'tong-nhuoc' | 'nhuoc' | 'trung-hoa' | 'vuong' | 'chuyen-vuong';

export interface DayMasterInfo {
  dayMaster: Element;
  supportRatio: number;
  strength: Strength;
  byTenGod: Record<TenGodGroup, number>;
  /** nhật chủ đắc lệnh (mùa cùng hành hoặc mùa sinh nhật chủ) */
  deLenh: boolean;
}

export function classifyDayMaster(chart: NguHanhChart, sr: ScoreResult, cfg: ScoringConfig = DEFAULT_CONFIG): DayMasterInfo {
  const dm = stemElement(chart.day.stem);
  const byTenGod: Record<TenGodGroup, number> = { TyKiep: cfg.stemWeight, An: 0, ThucThuong: 0, Tai: 0, QuanSat: 0 };
  for (const e of ELEMENTS) byTenGod[tenGodOf(dm, e)] += sr.scores[e];

  const all = Object.values(byTenGod).reduce((a, b) => a + b, 0);
  const ratio = (byTenGod.TyKiep + byTenGod.An) / all;
  const th = cfg.thresholds;
  const strength: Strength =
    ratio < th.followWeak ? 'tong-nhuoc' :
    ratio < th.weak ? 'nhuoc' :
    ratio > th.followStrong ? 'chuyen-vuong' :
    ratio > th.strong ? 'vuong' : 'trung-hoa';

  const deLenh = sr.seasonElement === dm || sr.seasonElement === generatedBy(dm);
  for (const k of Object.keys(byTenGod) as TenGodGroup[]) byTenGod[k] = round(byTenGod[k]);
  return { dayMaster: dm, supportRatio: round(ratio, 3), strength, byTenGod, deLenh };
}

/* ===== 3. Dụng thần ===== */

export type Method = 'phu-uc' | 'dieu-hau' | 'thong-quan' | 'tong-cach' | 'trung-hoa';

export interface UsefulGod {
  method: Method;
  /** Dụng thần: hành cần nhất */
  dung: Element;
  /** Hỷ thần: hành hỗ trợ dụng thần */
  hy: Element;
  /** Kỵ thần: hành gây hại chính cho cục */
  ky: Element;
  /** Cừu thần: hành tiếp sức cho kỵ thần (null nếu trùng dụng/hỷ) */
  cuu: Element | null;
  secondary: Array<{ method: Method; element: Element; reason: Msg }>;
  reasons: Msg[];
}

/** Hỷ/Kỵ KHÔNG suy máy móc từ Dụng thần; mỗi phương pháp truyền hy/ky riêng, ở đây chỉ xử lý va chạm. */
function finalize(method: Method, roles: { dung: Element; hy: Element; ky: Element }, reasons: Msg[], secondary: UsefulGod['secondary']): UsefulGod {
  const { dung, ky } = roles;
  const hy = roles.hy === ky ? generatedBy(dung) : roles.hy;
  const cuuCandidate = generatedBy(ky);
  const cuu = cuuCandidate === dung || cuuCandidate === hy ? null : cuuCandidate;
  return { method, dung, hy, ky, cuu, secondary, reasons };
}

/** Ghi chú phụ: điều hậu và thông quan, dùng chung cho mọi cách luận. */
function secondaryNotes(chart: NguHanhChart, sr: ScoreResult, cfg: ScoringConfig) {
  const secondary: UsefulGod['secondary'] = [];
  const climate = seasonClimate(chart.month.branch);
  let climateNeed: Element | null = null;
  if (climate === 'lanh' && sr.shares['Hoả'] < cfg.climateMinShare) climateNeed = 'Hoả';
  if (climate === 'nong' && sr.shares['Thuỷ'] < cfg.climateMinShare) climateNeed = 'Thuỷ';
  if (climateNeed) {
    secondary.push({
      method: 'dieu-hau', element: climateNeed,
      reason: msg('secondary.dieuHau', { climate, monthBranch: chart.month.branch, element: climateNeed, share: sr.shares[climateNeed] }),
    });
  }
  for (const a of ELEMENTS) {
    const b = controls(a);
    if (sr.shares[a] >= cfg.bridgeMinShare && sr.shares[b] >= cfg.bridgeMinShare * 0.8) {
      const bridge = generates(a);
      secondary.push({
        method: 'thong-quan', element: bridge,
        reason: msg('secondary.thongQuan', { a, aShare: sr.shares[a], b, bShare: sr.shares[b], bridge }),
      });
    }
  }
  return { secondary, climateNeed };
}

/** Cách luận "thuận thế": Tòng cách / Chuyên vượng, dựa trên kết quả kiểm tra điều kiện. */
export function followGod(dmi: DayMasterInfo, fa: FollowAssessment, secondary: UsefulGod['secondary']): UsefulGod {
  const dm = dmi.dayMaster;
  const reasons: Msg[] = [msg('reason.followHead', { type: fa.type, grade: fa.grade, confidence: fa.confidence })];

  if (fa.kind === 'chuyen-vuong') {
    reasons.push(msg('reason.chuyenVuong', { dm, ratio: dmi.supportRatio, thoat: generates(dm), nghich: controlledBy(dm) }));
    return finalize('tong-cach', { dung: generates(dm), hy: dm, ky: controlledBy(dm) }, reasons, secondary);
  }

  const groups = fa.followGroups;
  const main: TenGodGroup = groups.length > 1 && groups.includes('Tai') ? 'Tai' : groups[0];
  const dung = elementOfTenGod(dm, main);
  const hy = main === 'ThucThuong' ? controls(dm) : generatedBy(dung);
  const ky = main === 'Tai' ? dm : main === 'QuanSat' ? generates(dm) : generatedBy(dm);
  reasons.push(groups.length > 1
    ? msg('reason.followMixed', { groups: [...groups], main, dung })
    : msg('reason.followSingle', { dm, ratio: dmi.supportRatio, main, dung }));
  return finalize('tong-cach', { dung, hy, ky }, reasons, secondary);
}

/** Cách luận thông thường: Điều hậu (nếu cấp bách) → Phù ức. Cực nhược/cực vượng được luận như nhược/vượng. */
export function balanceGod(chart: NguHanhChart, sr: ScoreResult, dmi: DayMasterInfo, cfg: ScoringConfig = DEFAULT_CONFIG): UsefulGod {
  const dm = dmi.dayMaster;
  const g = dmi.byTenGod;
  const reasons: Msg[] = [];
  const { secondary, climateNeed } = secondaryNotes(chart, sr, cfg);

  if (climateNeed && sr.shares[climateNeed] < cfg.climateMinShare / 2) {
    reasons.push(secondary.find((s) => s.method === 'dieu-hau')!.reason);
    reasons.push(msg('reason.dieuHauFirst'));
    // Kỵ là hành gây ra cái nóng/lạnh thái quá, KHÔNG phải "hành khắc dụng thần" một cách máy móc
    const ky: Element = climateNeed === 'Thuỷ' ? 'Hoả' : 'Thuỷ';
    return finalize('dieu-hau', { dung: climateNeed, hy: generatedBy(climateNeed), ky }, reasons,
      secondary.filter((s) => s.method !== 'dieu-hau'));
  }

  if (dmi.strength === 'trung-hoa') {
    const sorted = [...ELEMENTS].sort((x, y) => sr.scores[x] - sr.scores[y]);
    const weakest = sorted[0], strongest = sorted[4];
    const hy = generatedBy(weakest) === strongest ? sorted[1] : generatedBy(weakest);
    reasons.push(msg('reason.trungHoa', { ratio: dmi.supportRatio, weakest, strongest }));
    return finalize('trung-hoa', { dung: weakest, hy, ky: strongest }, reasons, secondary);
  }

  if (dmi.strength === 'vuong' || dmi.strength === 'chuyen-vuong') {
    let pick: TenGodGroup;
    if (g.An > g.TyKiep) {
      pick = 'Tai';
      reasons.push(msg('reason.vuong.an', { an: g.An, tyKiep: g.TyKiep, tai: controls(dm) }));
    } else if (g.QuanSat >= 1) {
      pick = 'QuanSat';
      reasons.push(msg('reason.vuong.quanSat', { quanSat: g.QuanSat, element: controlledBy(dm) }));
    } else {
      pick = 'ThucThuong';
      reasons.push(msg('reason.vuong.thucThuong', { element: generates(dm) }));
    }
    const dung = elementOfTenGod(dm, pick);
    const hy = pick === 'ThucThuong' ? controls(dm) : generatedBy(dung);
    return finalize('phu-uc', { dung, hy, ky: controlledBy(dung) }, reasons, secondary);
  }

  // nhược / cực nhược
  const drains: Array<[TenGodGroup, number]> = [['QuanSat', g.QuanSat], ['Tai', g.Tai], ['ThucThuong', g.ThucThuong]];
  drains.sort((a, b) => b[1] - a[1]);
  const main = drains[0][0];
  let pick: TenGodGroup;
  if (main === 'Tai') {
    pick = 'TyKiep';
    reasons.push(msg('reason.nhuoc.tai', { tai: g.Tai, element: dm }));
  } else if (main === 'QuanSat') {
    pick = 'An';
    reasons.push(msg('reason.nhuoc.quanSat', { quanSat: g.QuanSat, element: generatedBy(dm) }));
  } else {
    pick = 'An';
    reasons.push(msg('reason.nhuoc.thucThuong', { thucThuong: g.ThucThuong, element: generatedBy(dm) }));
  }
  const dung = elementOfTenGod(dm, pick);
  const hy = pick === 'An' ? dm : generatedBy(dm);
  return finalize('phu-uc', { dung, hy, ky: controlledBy(dung) }, reasons, secondary);
}

/* ===== 3b. Nhiều cách luận ===== */

export interface Reading {
  id: 'thuan-the' | 'thong-thuong';
  /** nhãn dạng mã: `reading.follow` {type} hoặc `reading.normal` {side: 'nhuoc' | 'vuong'} */
  label: Msg;
  /** trọng số 0..1, tổng các cách luận = 1 */
  weight: number;
  usefulGod: UsefulGod;
}

/**
 * Danh sách cách luận, cách chính đứng đầu.
 *  - Không có dấu hiệu tòng/chuyên vượng hoặc Không thành → 1 cách luận thông thường.
 *  - Chân → thuận thế là chính, vẫn giữ cách thông thường với trọng số thấp.
 *  - Giả  → cả hai, trọng số theo độ tin cậy.
 */
export function buildReadings(chart: NguHanhChart, sr: ScoreResult, dmi: DayMasterInfo, fa: FollowAssessment | null, cfg: ScoringConfig = DEFAULT_CONFIG): Reading[] {
  const normalLabel = msg('reading.normal', { side: dmi.supportRatio < 0.5 ? 'nhuoc' : 'vuong' });
  const normal = balanceGod(chart, sr, dmi, cfg);
  if (!fa || fa.grade === 'khong-thanh') {
    return [{ id: 'thong-thuong', label: normalLabel, weight: 1, usefulGod: normal }];
  }
  const { secondary } = secondaryNotes(chart, sr, cfg);
  const follow = followGod(dmi, fa, secondary);
  // Luôn giữ cách luận thiểu số ≥ 5% để minh bạch
  const cap = fa.grade === 'gia' ? cfg.follow.giaMaxWeight : 0.95;
  const w = Math.min(cap, Math.max(0.05, fa.confidence));
  const list: Reading[] = [
    { id: 'thuan-the', label: msg('reading.follow', { type: fa.type }), weight: round(w, 3), usefulGod: follow },
    { id: 'thong-thuong', label: normalLabel, weight: round(1 - w, 3), usefulGod: normal },
  ];
  return list.sort((a, b) => b.weight - a.weight);
}

/* ===== 4. Đánh giá một năm / Đại Vận ===== */

export type Favor = 'rat-tot' | 'tot' | 'binh' | 'xau' | 'rat-xau';

export function evaluatePeriod(p: Pillar, ug: UsefulGod, cfg: ScoringConfig = DEFAULT_CONFIG) {
  const contrib = emptyScores();
  contrib[stemElement(p.stem)] += cfg.stemWeight;
  const hidden = hiddenStems(p.branch);
  const ratios = cfg.hiddenRatios[hidden.length as 1 | 2 | 3];
  hidden.forEach((hs, k) => { contrib[stemElement(hs)] += cfg.branchWeight * ratios[k]; });

  const value = emptyScores();
  value[ug.dung] = 2; value[ug.hy] = 1; value[ug.ky] = -2; if (ug.cuu) value[ug.cuu] = -1;
  const t = total(contrib);
  const score = ELEMENTS.reduce((a, e) => a + (contrib[e] / t) * value[e], 0);
  const favor: Favor = score >= 1 ? 'rat-tot' : score >= 0.35 ? 'tot' : score > -0.35 ? 'binh' : score > -1 ? 'xau' : 'rat-xau';
  return { score: round(score), favor, contrib: Object.fromEntries(ELEMENTS.map((e) => [e, round(contrib[e])])) as Scores };
}
