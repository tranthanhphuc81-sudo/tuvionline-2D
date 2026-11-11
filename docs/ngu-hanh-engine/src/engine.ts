/**
 * Động cơ tính điểm Ngũ hành cho Bát Tự và chọn Dụng thần.
 *
 * Luồng: chart → scoreElements() → classifyDayMaster() → pickUsefulGod()
 * Mỗi bước ghi lại `trace` để app hiển thị "vì sao ra kết quả này".
 */

import {
  TEN_GOD_VI, BRANCH_CLASHES, BRANCH_SIX_COMBOS, BRANCH_TRIADS, BRANCH_VI, ELEMENTS, ELEMENT_VI,
  HIDDEN_STEMS, SEASON_CLIMATE, SEASON_ELEMENT, STEM_COMBOS, STEM_VI,
  controlledBy, controls, elementOfTenGod, generatedBy, generates, stemElement, tenGodOf,
  type Branch, type Element, type Stem, type TenGodGroup,
} from "./data.ts";
import { DEFAULT_CONFIG, type ScoringConfig } from "./config.ts";
import { FOLLOW_GRADE_VI, assessFollow, type FollowAssessment } from "./follow.ts";

export interface Pillar { stem: Stem; branch: Branch }
export interface Chart { year: Pillar; month: Pillar; day: Pillar; hour?: Pillar }

export type Scores = Record<Element, number>;

const emptyScores = (): Scores => ({ Moc: 0, Hoa: 0, Tho: 0, Kim: 0, Thuy: 0 });
const round = (n: number, d = 2) => Math.round(n * 10 ** d) / 10 ** d;
const total = (s: Scores) => ELEMENTS.reduce((a, e) => a + s[e], 0);

// ───────────────────────── 1. Tính điểm ─────────────────────────

/** Trạng thái Vượng/Tướng/Hưu/Tù/Tử của hành e trong mùa có hành s */
export function seasonalState(e: Element, s: Element): keyof ScoringConfig["seasonal"] {
  if (e === s) return "vuong";
  if (e === generates(s)) return "tuong"; // mùa sinh ra nó
  if (e === generatedBy(s)) return "huu";  // nó sinh ra mùa → hao
  if (e === controls(s)) return "tuDie";   // mùa khắc nó → Tử
  return "tu";                              // nó khắc mùa → Tù
}

const SEASONAL_VI = { vuong: "Vượng", tuong: "Tướng", huu: "Hưu", tu: "Tù", tuDie: "Tử" } as const;

export interface ScoreResult {
  scores: Scores;
  shares: Scores;
  total: number;
  seasonElement: Element;
  trace: string[];
}

export function scoreElements(chart: Chart, cfg: ScoringConfig = DEFAULT_CONFIG): ScoreResult {
  const trace: string[] = [];
  const raw = emptyScores();
  const seasonEl = SEASON_ELEMENT[chart.month.branch];
  const pw = cfg.positionWeight;

  type Slot = { pos: keyof typeof pw; stem?: Stem; branch?: Branch };
  const slots: Slot[] = [
    { pos: "yearStem", stem: chart.year.stem }, { pos: "yearBranch", branch: chart.year.branch },
    { pos: "monthStem", stem: chart.month.stem }, { pos: "monthBranch", branch: chart.month.branch },
    { pos: "dayStem", stem: chart.day.stem }, { pos: "dayBranch", branch: chart.day.branch },
  ];
  if (chart.hour) {
    slots.push({ pos: "hourStem", stem: chart.hour.stem }, { pos: "hourBranch", branch: chart.hour.branch });
  }

  // Lục xung: giảm điểm 2 chi xung
  const branchFactor = new Map<keyof typeof pw, number>();
  const branchSlots = slots.filter((s) => s.branch);
  for (let i = 0; i < branchSlots.length; i++) {
    for (let j = i + 1; j < branchSlots.length; j++) {
      const a = branchSlots[i].branch!, b = branchSlots[j].branch!;
      if (BRANCH_CLASHES.some(([x, y]) => (x === a && y === b) || (x === b && y === a))) {
        branchFactor.set(branchSlots[i].pos, (branchFactor.get(branchSlots[i].pos) ?? 1) * cfg.interactions.clashFactor);
        branchFactor.set(branchSlots[j].pos, (branchFactor.get(branchSlots[j].pos) ?? 1) * cfg.interactions.clashFactor);
        trace.push(`Lục xung ${BRANCH_VI[a]}–${BRANCH_VI[b]}: giảm lực hai chi ×${cfg.interactions.clashFactor}`);
      }
    }
  }

  // Thiên can hợp kề nhau (năm-tháng, tháng-ngày, ngày-giờ): giảm lực
  const stemFactor = new Map<keyof typeof pw, number>();
  const stemOrder: Array<[keyof typeof pw, Stem | undefined]> = [
    ["yearStem", chart.year.stem], ["monthStem", chart.month.stem],
    ["dayStem", chart.day.stem], ["hourStem", chart.hour?.stem],
  ];
  for (let i = 0; i < stemOrder.length - 1; i++) {
    const [pa, a] = stemOrder[i], [pb, b] = stemOrder[i + 1];
    if (!a || !b) continue;
    const combo = STEM_COMBOS.find(({ pair: [x, y] }) => (x === a && y === b) || (x === b && y === a));
    if (combo) {
      stemFactor.set(pa, (stemFactor.get(pa) ?? 1) * cfg.interactions.stemComboFactor);
      stemFactor.set(pb, (stemFactor.get(pb) ?? 1) * cfg.interactions.stemComboFactor);
      trace.push(`Can hợp ${STEM_VI[a]}–${STEM_VI[b]} (hướng hóa ${ELEMENT_VI[combo.to]}): hai can bị "trói" ×${cfg.interactions.stemComboFactor}`);
    }
  }

  // Điểm gốc
  for (const s of slots) {
    const posW = pw[s.pos];
    if (posW === 0) continue;
    if (s.stem) {
      const e = stemElement(s.stem);
      const v = cfg.stemWeight * posW * (stemFactor.get(s.pos) ?? 1);
      raw[e] += v;
    }
    if (s.branch) {
      const hidden = HIDDEN_STEMS[s.branch];
      const ratios = cfg.hiddenRatios[hidden.length as 1 | 2 | 3];
      const f = branchFactor.get(s.pos) ?? 1;
      hidden.forEach((hs, k) => {
        raw[stemElement(hs)] += cfg.branchWeight * ratios[k] * posW * f;
      });
    }
  }
  trace.push("Điểm thô (chưa xét mùa): " + fmt(raw));

  // Tam hợp / bán hợp / lục hợp
  const branches = branchSlots.map((s) => s.branch!);
  for (const t of BRANCH_TRIADS) {
    const present = t.set.filter((b) => branches.includes(b));
    if (present.length === 3) {
      raw[t.to] += cfg.interactions.triadBonus;
      trace.push(`Tam hợp ${t.set.map((b) => BRANCH_VI[b]).join("-")} cục ${ELEMENT_VI[t.to]}: +${cfg.interactions.triadBonus}`);
    } else if (present.length === 2 && present.includes(t.set[1])) {
      raw[t.to] += cfg.interactions.halfTriadBonus;
      trace.push(`Bán hợp ${present.map((b) => BRANCH_VI[b]).join("-")} hướng ${ELEMENT_VI[t.to]}: +${cfg.interactions.halfTriadBonus}`);
    }
  }
  for (let i = 0; i < branches.length - 1; i++) {
    const a = branches[i], b = branches[i + 1];
    const c = BRANCH_SIX_COMBOS.find(({ pair: [x, y] }) => (x === a && y === b) || (x === b && y === a));
    if (c) {
      raw[c.to] += cfg.interactions.sixComboBonus;
      trace.push(`Lục hợp ${BRANCH_VI[a]}–${BRANCH_VI[b]} hướng ${ELEMENT_VI[c.to]}: +${cfg.interactions.sixComboBonus}`);
    }
  }

  // Hệ số mùa
  const scores = emptyScores();
  const states: string[] = [];
  for (const e of ELEMENTS) {
    const st = seasonalState(e, seasonEl);
    scores[e] = raw[e] * cfg.seasonal[st];
    states.push(`${ELEMENT_VI[e]} ${SEASONAL_VI[st]}×${cfg.seasonal[st]}`);
  }
  trace.push(`Sinh tháng ${BRANCH_VI[chart.month.branch]} (mùa ${ELEMENT_VI[seasonEl]}): ${states.join(", ")}`);

  const t = total(scores);
  const shares = emptyScores();
  for (const e of ELEMENTS) {
    scores[e] = round(scores[e]);
    shares[e] = round(scores[e] / t, 3);
  }
  trace.push("Điểm cuối: " + fmt(scores));
  return { scores, shares, total: round(t), seasonElement: seasonEl, trace };
}

// ───────────────────────── 2. Vượng / nhược ─────────────────────────

export type Strength = "tong-nhuoc" | "nhuoc" | "trung-hoa" | "vuong" | "chuyen-vuong";

export const STRENGTH_VI: Record<Strength, string> = {
  "tong-nhuoc": "Cực nhược",
  nhuoc: "Thân nhược",
  "trung-hoa": "Trung hòa",
  vuong: "Thân vượng",
  "chuyen-vuong": "Cực vượng",
};

export interface DayMasterInfo {
  dayMaster: Element;
  supportRatio: number;
  strength: Strength;
  byTenGod: Record<TenGodGroup, number>;
  deLenh: boolean; // nhật chủ đắc lệnh (mùa cùng hành hoặc mùa sinh nhật chủ)
}

export function classifyDayMaster(chart: Chart, sr: ScoreResult, cfg: ScoringConfig = DEFAULT_CONFIG): DayMasterInfo {
  const dm = stemElement(chart.day.stem);
  // Nhật chủ tự có một phần lực của chính nó (bản thân can ngày)
  const selfBase = cfg.stemWeight;
  const byTenGod: Record<TenGodGroup, number> = { TyKiep: selfBase, An: 0, ThucThuong: 0, Tai: 0, QuanSat: 0 };
  for (const e of ELEMENTS) byTenGod[tenGodOf(dm, e)] += sr.scores[e];

  const all = Object.values(byTenGod).reduce((a, b) => a + b, 0);
  const support = byTenGod.TyKiep + byTenGod.An;
  const ratio = support / all;
  const th = cfg.thresholds;
  const strength: Strength =
    ratio < th.followWeak ? "tong-nhuoc" :
    ratio < th.weak ? "nhuoc" :
    ratio > th.followStrong ? "chuyen-vuong" :
    ratio > th.strong ? "vuong" : "trung-hoa";

  const deLenh = sr.seasonElement === dm || sr.seasonElement === generatedBy(dm);
  for (const k of Object.keys(byTenGod) as TenGodGroup[]) byTenGod[k] = round(byTenGod[k]);
  return { dayMaster: dm, supportRatio: round(ratio, 3), strength, byTenGod, deLenh };
}

// ───────────────────────── 3. Dụng thần ─────────────────────────

export type Method = "phu-uc" | "dieu-hau" | "thong-quan" | "tong-cach" | "trung-hoa";

export const METHOD_VI: Record<Method, string> = {
  "phu-uc": "Phù ức (bổ yếu, chế mạnh)",
  "dieu-hau": "Điều hậu (cân bằng nóng/lạnh)",
  "thong-quan": "Thông quan (nối hai hành đang xung khắc)",
  "tong-cach": "Thuận thế (tòng/chuyên vượng)",
  "trung-hoa": "Giữ trung hòa",
};

export interface UsefulGod {
  method: Method;
  dung: Element;        // Dụng thần: hành cần nhất
  hy: Element;          // Hỷ thần: hành hỗ trợ dụng thần
  ky: Element;          // Kỵ thần: hành gây hại chính cho cục
  cuu: Element | null;  // Cừu thần: hành tiếp sức cho kỵ thần (null nếu trùng dụng/hỷ)
  secondary: Array<{ method: Method; element: Element; reason: string }>;
  reasons: string[];
}

/**
 * Hỷ/Kỵ KHÔNG thể suy máy móc từ Dụng thần ("kỵ = hành khắc dụng") vì sẽ sai trong
 * điều hậu và phù ức (vd. thân nhược dùng Thủy điều hậu thì Thổ-Ấn vẫn là hành tốt).
 * Mỗi phương pháp truyền vào hy/ky của riêng nó; ở đây chỉ kiểm tra va chạm.
 */
function finalize(
  method: Method,
  roles: { dung: Element; hy: Element; ky: Element },
  reasons: string[],
  secondary: UsefulGod["secondary"],
): UsefulGod {
  const { dung, ky } = roles;
  const hy = roles.hy === ky ? generatedBy(dung) : roles.hy;
  const cuuCandidate = generatedBy(ky);
  const cuu = cuuCandidate === dung || cuuCandidate === hy ? null : cuuCandidate;
  return { method, dung, hy, ky, cuu, secondary, reasons };
}

/** Ghi chú phụ: điều hậu và thông quan — dùng chung cho mọi cách luận */
function secondaryNotes(chart: Chart, sr: ScoreResult, cfg: ScoringConfig) {
  const secondary: UsefulGod["secondary"] = [];
  const climate = SEASON_CLIMATE[chart.month.branch];
  let climateNeed: Element | null = null;
  if (climate === "lanh" && sr.shares.Hoa < cfg.climateMinShare) climateNeed = "Hoa";
  if (climate === "nong" && sr.shares.Thuy < cfg.climateMinShare) climateNeed = "Thuy";
  if (climateNeed) {
    const r = climate === "lanh"
      ? `Sinh mùa lạnh (tháng ${BRANCH_VI[chart.month.branch]}) mà Hỏa chỉ chiếm ${pct(sr.shares.Hoa)} → cục "hàn", cần Hỏa sưởi ấm`
      : `Sinh mùa nóng (tháng ${BRANCH_VI[chart.month.branch]}) mà Thủy chỉ chiếm ${pct(sr.shares.Thuy)} → cục "táo", cần Thủy nhuận`;
    secondary.push({ method: "dieu-hau", element: climateNeed, reason: r });
  }
  for (const a of ELEMENTS) {
    const b = controls(a);
    if (sr.shares[a] >= cfg.bridgeMinShare && sr.shares[b] >= cfg.bridgeMinShare * 0.8) {
      const bridge = generates(a);
      secondary.push({
        method: "thong-quan",
        element: bridge,
        reason: `${ELEMENT_VI[a]} (${pct(sr.shares[a])}) đang khắc mạnh ${ELEMENT_VI[b]} (${pct(sr.shares[b])}) → dùng ${ELEMENT_VI[bridge]} làm cầu nối (${ELEMENT_VI[a]} sinh ${ELEMENT_VI[bridge]}, ${ELEMENT_VI[bridge]} sinh ${ELEMENT_VI[b]})`,
      });
    }
  }
  return { secondary, climateNeed };
}

/** Cách luận "thuận thế": Tòng cách / Chuyên vượng, dựa trên kết quả kiểm tra điều kiện */
export function followGod(dmi: DayMasterInfo, fa: FollowAssessment, secondary: UsefulGod["secondary"]): UsefulGod {
  const dm = dmi.dayMaster;
  const reasons = [`${fa.typeName} — ${FOLLOW_GRADE_VI[fa.grade]}, tin cậy ${pct(fa.confidence)}`];

  if (fa.kind === "chuyen-vuong") {
    reasons.push(`Nhật chủ ${ELEMENT_VI[dm]} chiếm ${pct(dmi.supportRatio)} lực → thuận theo thế vượng; dùng Thực Thương ${ELEMENT_VI[generates(dm)]} để thoát khí, kỵ Quan Sát ${ELEMENT_VI[controlledBy(dm)]} nghịch thế`);
    return finalize("tong-cach", { dung: generates(dm), hy: dm, ky: controlledBy(dm) }, reasons, secondary);
  }

  // Tòng nhất hành: theo hành mạnh nhất.
  // Tòng thế (hỗn hợp): ưu tiên Tài làm trung gian — Thực Thương sinh Tài, Tài sinh Quan.
  const groups = fa.followGroups;
  const main: TenGodGroup = groups.length > 1 && groups.includes("Tai") ? "Tai" : groups[0];
  const dung = elementOfTenGod(dm, main);
  const hy = main === "ThucThuong" ? controls(dm) : generatedBy(dung);
  const ky = main === "Tai" ? dm : main === "QuanSat" ? generates(dm) : generatedBy(dm);
  reasons.push(groups.length > 1
    ? `Phe tiết/khắc hỗn hợp (${groups.map((x) => TEN_GOD_VI[x]).join(" + ")}) → theo thế chung, lấy ${TEN_GOD_VI[main]} ${ELEMENT_VI[dung]} làm trục`
    : `Nhật chủ ${ELEMENT_VI[dm]} chỉ có ${pct(dmi.supportRatio)} lực, không gốc → không "cứu", thuận theo ${TEN_GOD_VI[main]} ${ELEMENT_VI[dung]}`);
  return finalize("tong-cach", { dung, hy, ky }, reasons, secondary);
}

/** Cách luận thông thường: Điều hậu (nếu cấp bách) → Phù ức. Cực nhược/cực vượng được luận như nhược/vượng. */
export function balanceGod(chart: Chart, sr: ScoreResult, dmi: DayMasterInfo, cfg: ScoringConfig = DEFAULT_CONFIG): UsefulGod {
  const dm = dmi.dayMaster;
  const g = dmi.byTenGod;
  const reasons: string[] = [];
  const { secondary, climateNeed } = secondaryNotes(chart, sr, cfg);

  if (climateNeed && sr.shares[climateNeed] < cfg.climateMinShare / 2) {
    reasons.push(secondary.find((s) => s.method === "dieu-hau")!.reason);
    reasons.push("Thiếu trầm trọng nên ưu tiên Điều hậu trước Phù ức (theo tinh thần Cùng Thông Bảo Giám)");
    // Kỵ là hành gây ra cái nóng/lạnh thái quá, KHÔNG phải "hành khắc dụng thần" một cách máy móc
    const ky: Element = climateNeed === "Thuy" ? "Hoa" : "Thuy";
    return finalize("dieu-hau", { dung: climateNeed, hy: generatedBy(climateNeed), ky }, reasons,
      secondary.filter((s) => s.method !== "dieu-hau"));
  }

  if (dmi.strength === "trung-hoa") {
    const sorted = [...ELEMENTS].sort((x, y) => sr.scores[x] - sr.scores[y]);
    const weakest = sorted[0], strongest = sorted[4];
    const hy = generatedBy(weakest) === strongest ? sorted[1] : generatedBy(weakest);
    reasons.push(`Nhật chủ trung hòa (${pct(dmi.supportRatio)} hỗ trợ) → không cần can thiệp mạnh: bù hành yếu nhất ${ELEMENT_VI[weakest]}, hãm hành dư nhất ${ELEMENT_VI[strongest]}`);
    return finalize("trung-hoa", { dung: weakest, hy, ky: strongest }, reasons, secondary);
  }

  if (dmi.strength === "vuong" || dmi.strength === "chuyen-vuong") {
    let pick: TenGodGroup;
    if (g.An > g.TyKiep) {
      pick = "Tai";
      reasons.push(`Thân vượng chủ yếu do Ấn nhiều (${g.An} > Tỷ Kiếp ${g.TyKiep}) → dùng Tài ${ELEMENT_VI[controls(dm)]} để chế Ấn`);
    } else if (g.QuanSat >= 1) {
      pick = "QuanSat";
      reasons.push(`Thân vượng do Tỷ Kiếp nhiều, trong cục có Quan Sát (${g.QuanSat}) → dùng Quan Sát ${ELEMENT_VI[controlledBy(dm)]} để chế thân`);
    } else {
      pick = "ThucThuong";
      reasons.push(`Thân vượng do Tỷ Kiếp, Quan Sát yếu/không có → dùng Thực Thương ${ELEMENT_VI[generates(dm)]} để tiết khí (an toàn hơn đưa Quan vào khắc)`);
    }
    const dung = elementOfTenGod(dm, pick);
    // Tài ← Thực Thương sinh; Quan ← Tài sinh; Thực Thương: mẹ là nhật chủ nên hỷ là Tài
    const hy = pick === "ThucThuong" ? controls(dm) : generatedBy(dung);
    return finalize("phu-uc", { dung, hy, ky: controlledBy(dung) }, reasons, secondary);
  }

  // nhược / cực nhược
  const drains: Array<[TenGodGroup, number]> = [["QuanSat", g.QuanSat], ["Tai", g.Tai], ["ThucThuong", g.ThucThuong]];
  drains.sort((a, b) => b[1] - a[1]);
  const main = drains[0][0];
  let pick: TenGodGroup;
  if (main === "Tai") {
    pick = "TyKiep";
    reasons.push(`Thân nhược do Tài nặng (${g.Tai}) → dùng Tỷ Kiếp ${ELEMENT_VI[dm]} để gánh Tài (Ấn bị Tài khắc nên kém hiệu quả)`);
  } else if (main === "QuanSat") {
    pick = "An";
    reasons.push(`Thân nhược do Quan Sát nặng (${g.QuanSat}) → dùng Ấn ${ELEMENT_VI[generatedBy(dm)]}: Quan sinh Ấn, Ấn sinh thân (vừa hóa sát vừa bổ thân)`);
  } else {
    pick = "An";
    reasons.push(`Thân nhược do Thực Thương tiết khí (${g.ThucThuong}) → dùng Ấn ${ELEMENT_VI[generatedBy(dm)]} để chế Thực Thương và bổ thân`);
  }
  const dung = elementOfTenGod(dm, pick);
  // Dụng Ấn → hỷ Tỷ Kiếp, kỵ Tài; Dụng Tỷ Kiếp → hỷ Ấn, kỵ Quan Sát
  const hy = pick === "An" ? dm : generatedBy(dm);
  return finalize("phu-uc", { dung, hy, ky: controlledBy(dung) }, reasons, secondary);
}

// ───────────────────────── 3b. Nhiều cách luận ─────────────────────────

export interface Reading {
  id: "thuan-the" | "thong-thuong";
  label: string;
  /** Trọng số 0..1, tổng các reading = 1 */
  weight: number;
  usefulGod: UsefulGod;
}

/**
 * Trả về danh sách cách luận, cách chính đứng đầu.
 *  - Không có dấu hiệu tòng/chuyên vượng → 1 cách luận thông thường.
 *  - Chân → thuận thế là chính; vẫn giữ cách thông thường với trọng số thấp để minh bạch.
 *  - Giả  → cả hai, trọng số theo độ tin cậy; app nên hiện song song + câu hỏi kiểm chứng.
 *  - Không thành → chỉ luận thông thường (kèm lý do không thành trong follow).
 */
export function buildReadings(chart: Chart, sr: ScoreResult, dmi: DayMasterInfo, fa: FollowAssessment | null, cfg: ScoringConfig = DEFAULT_CONFIG): Reading[] {
  const normalLabel = dmi.supportRatio < 0.5 ? "Luận thân nhược thông thường" : "Luận thân vượng thông thường";
  const normal = balanceGod(chart, sr, dmi, cfg);
  if (!fa || fa.grade === "khong-thanh") {
    return [{ id: "thong-thuong", label: normalLabel, weight: 1, usefulGod: normal }];
  }
  const { secondary } = secondaryNotes(chart, sr, cfg);
  const follow = followGod(dmi, fa, secondary);
  // Luôn giữ cách luận thiểu số ≥ 5% để minh bạch: không cách luận nào chắc chắn tuyệt đối
  const cap = fa.grade === "gia" ? cfg.follow.giaMaxWeight : 0.95;
  const w = Math.min(cap, Math.max(0.05, fa.confidence));
  const list: Reading[] = [
    { id: "thuan-the", label: `Luận ${fa.typeName}`, weight: round(w, 3), usefulGod: follow },
    { id: "thong-thuong", label: normalLabel, weight: round(1 - w, 3), usefulGod: normal },
  ];
  return list.sort((a, b) => b.weight - a.weight);
}

/** Giữ API cũ: trả về dụng thần của cách luận chính */
export function pickUsefulGod(chart: Chart, sr: ScoreResult, dmi: DayMasterInfo, cfg: ScoringConfig = DEFAULT_CONFIG): UsefulGod {
  return buildReadings(chart, sr, dmi, assessFollow(chart, sr, dmi, cfg), cfg)[0].usefulGod;
}

// ───────────────────────── 4. Đánh giá một năm / đại vận ─────────────────────────

export type Favor = "rat-tot" | "tot" | "binh" | "xau" | "rat-xau";

export function evaluatePeriod(p: Pillar, ug: UsefulGod, cfg: ScoringConfig = DEFAULT_CONFIG) {
  const contrib = emptyScores();
  contrib[stemElement(p.stem)] += cfg.stemWeight;
  const hidden = HIDDEN_STEMS[p.branch];
  const ratios = cfg.hiddenRatios[hidden.length as 1 | 2 | 3];
  hidden.forEach((hs, k) => (contrib[stemElement(hs)] += cfg.branchWeight * ratios[k]));

  const value: Record<Element, number> = emptyScores();
  value[ug.dung] = 2; value[ug.hy] = 1; value[ug.ky] = -2; if (ug.cuu) value[ug.cuu] = -1;
  const t = total(contrib);
  const score = ELEMENTS.reduce((a, e) => a + (contrib[e] / t) * value[e], 0);
  const favor: Favor = score >= 1 ? "rat-tot" : score >= 0.35 ? "tot" : score > -0.35 ? "binh" : score > -1 ? "xau" : "rat-xau";
  return { score: round(score), favor, contrib: Object.fromEntries(ELEMENTS.map((e) => [e, round(contrib[e])])) as Scores };
}

// ───────────────────────── helpers ─────────────────────────

export const pct = (x: number) => `${Math.round(x * 100)}%`;
function fmt(s: Scores) {
  return ELEMENTS.map((e) => `${ELEMENT_VI[e]} ${round(s[e])}`).join(" · ");
}

export interface Resolution {
  decided: boolean;
  conclusion: string;
  answers: Array<{ year: number; outcome: "tot" | "binh" | "xau" }>;
  log: string[];
}

/** API gộp cho app */
export function analyze(chart: Chart, cfg: ScoringConfig = DEFAULT_CONFIG) {
  const sr = scoreElements(chart, cfg);
  const dmi = classifyDayMaster(chart, sr, cfg);
  const follow = assessFollow(chart, sr, dmi, cfg);
  const readings = buildReadings(chart, sr, dmi, follow, cfg);
  return {
    config: { id: cfg.id, name: cfg.name },
    score: sr,
    dayMaster: dmi,
    follow,
    readings,
    /** Dụng thần của cách luận chính (= readings[0].usefulGod) */
    usefulGod: readings[0].usefulGod,
    /** Có giá trị sau khi gọi resolveWithFeedback() */
    resolution: undefined as Resolution | undefined,
  };
}
export type Analysis = ReturnType<typeof analyze>;
