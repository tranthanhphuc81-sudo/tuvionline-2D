/**
 * Kiểm tra điều kiện Tòng cách (tòng nhược) và Chuyên vượng (cực vượng).
 *
 * Thay vì một ngưỡng % duy nhất, chấm 4 điều kiện theo sách Tử Bình:
 *   1. Gốc (thông căn)     — phe cứu nhật chủ (tòng) / phe khắc nhật chủ (chuyên vượng) có gốc ở địa chi không
 *   2. Can lộ               — phe đó có thấu can không, và nếu có thì đã bị hợp/khắc vô hiệu chưa
 *   3. Thế của phe được theo — đủ áp đảo và có đắc lệnh / thành cục không
 *   4. Hướng                — theo một hành rõ ràng (nhất hành) hay hỗn hợp (tòng thế)
 *
 * Điều kiện 1 và 2 là "cổng cứng": trượt hẳn thì không thành cách dù tổng điểm cao.
 * Kết quả: Chân / Giả / Không thành + độ tin cậy 0..1 + danh sách hành có thể "phá cách".
 */

import {
  BRANCH_TRIADS, BRANCH_VI, ELEMENT_VI, HIDDEN_STEMS, STEM_COMBOS, STEM_VI, TEN_GOD_VI,
  controlledBy, elementOfTenGod, generatedBy, stemElement,
  type Branch, type Element, type Stem, type TenGodGroup,
} from "./data.ts";
import type { ScoringConfig } from "./config.ts";
import type { Chart, DayMasterInfo, ScoreResult } from "./engine.ts";

export type FollowKind = "tong" | "chuyen-vuong";
export type FollowGrade = "chan" | "gia" | "khong-thanh";

export const FOLLOW_GRADE_VI: Record<FollowGrade, string> = {
  chan: "Chân (thành cách rõ)",
  gia: "Giả (thành cách nhưng dễ bị phá)",
  "khong-thanh": "Không thành cách",
};

export interface FollowCheck {
  id: "root" | "exposed" | "dominant" | "direction";
  label: string;
  /** 1 = đạt trọn, 0 < x < 1 = đạt một phần, 0 = trượt */
  score: number;
  /** Cổng cứng: score = 0 thì không thành cách bất kể tổng điểm */
  gate: boolean;
  detail: string;
}

export interface FollowAssessment {
  kind: FollowKind;
  /** Tên cách: Tòng Sát, Tòng Tài, Tòng Nhi, Tòng Thế, Khúc Trực, Viêm Thượng... */
  typeName: string;
  grade: FollowGrade;
  confidence: number;
  checks: FollowCheck[];
  /** Nhóm thập thần được theo (với tòng) — 1 phần tử nếu nhất hành, 2 nếu tòng thế */
  followGroups: TenGodGroup[];
  /** Hành mà khi đến (năm, đại vận) sẽ phá cách */
  breakers: Element[];
  summary: string;
}

const POS = ["year", "month", "day", "hour"] as const;
type Pos = (typeof POS)[number];
const POS_VI: Record<Pos, string> = { year: "năm", month: "tháng", day: "ngày", hour: "giờ" };

const round = (n: number, d = 2) => Math.round(n * 10 ** d) / 10 ** d;
const pct = (x: number) => `${Math.round(x * 100)}%`;

const CHUYEN_VUONG_NAMES: Record<Element, string> = {
  Moc: "Khúc Trực", Hoa: "Viêm Thượng", Tho: "Giá Sắc", Kim: "Tòng Cách (Kim chuyên vượng)", Thuy: "Nhuận Hạ",
};
const TONG_NAMES: Partial<Record<TenGodGroup, string>> = { QuanSat: "Tòng Sát", Tai: "Tòng Tài", ThucThuong: "Tòng Nhi" };

function pillars(chart: Chart): Array<{ pos: Pos; stem: Stem; branch: Branch }> {
  return POS.flatMap((p) => (chart[p] ? [{ pos: p, ...chart[p]! }] : []));
}

// ───────────────────── Điều kiện 1: gốc ở địa chi ─────────────────────

function rootCheck(chart: Chart, targets: Element[], cfg: ScoringConfig, kind: FollowKind): FollowCheck & { rootScore: number } {
  const f = cfg.follow;
  let rootScore = 0;
  const found: string[] = [];
  for (const p of pillars(chart)) {
    const mult = p.pos === "month" ? f.monthRootMultiplier : p.pos === "day" ? f.dayRootMultiplier : 1;
    HIDDEN_STEMS[p.branch].forEach((hs, k) => {
      if (!targets.includes(stemElement(hs))) return;
      const w = f.rootWeights[k] * mult;
      rootScore += w;
      const lvl = ["bản khí", "trung khí", "dư khí"][k];
      found.push(`${STEM_VI[hs]} (${lvl}) trong chi ${POS_VI[p.pos]} ${BRANCH_VI[p.branch]} = ${round(w)}`);
    });
  }
  const who = kind === "tong" ? "Ấn/Tỷ (phe cứu nhật chủ)" : "Quan Sát (phe chế nhật chủ)";
  const score = rootScore === 0 ? 1 : rootScore <= f.weakRootMax ? 0.5 : 0;
  const detail = rootScore === 0
    ? `${who} không có gốc ở địa chi nào`
    : `${who} có gốc: ${found.join("; ")} → tổng ${round(rootScore)} (${score === 0.5 ? `≤ ${f.weakRootMax}: gốc yếu` : `> ${f.weakRootMax}: có gốc thật`})`;
  return { id: "root", label: "Gốc ở địa chi (thông căn)", score, gate: true, detail, rootScore: round(rootScore) };
}

// ───────────────────── Điều kiện 2: can lộ và có bị chế không ─────────────────────

function exposedCheck(chart: Chart, targets: Element[], kind: FollowKind): FollowCheck {
  const ps = pillars(chart);
  const stemsInOrder = ps.map((p) => p.stem);
  const notes: string[] = [];
  let worst = 1;

  ps.forEach((p, i) => {
    if (p.pos === "day") return; // nhật can là nhật chủ
    const el = stemElement(p.stem);
    if (!targets.includes(el)) return;

    const neighbours = [i - 1, i + 1].filter((j) => j >= 0 && j < ps.length);
    // (a) bị hợp
    const comboWith = neighbours.find((j) =>
      STEM_COMBOS.some(({ pair: [x, y] }) => (x === p.stem && y === stemsInOrder[j]) || (y === p.stem && x === stemsInOrder[j])));
    // (b) bị khắc bởi can kề, và tự nó không có gốc ở chi cùng trụ
    const hasOwnRoot = HIDDEN_STEMS[p.branch].some((hs) => stemElement(hs) === el);
    const clashedBy = neighbours.find((j) => stemElement(stemsInOrder[j]) === controlledBy(el));

    let s: number, why: string;
    if (comboWith !== undefined && ps[comboWith].pos !== "day") {
      s = 1; why = `bị hợp với ${STEM_VI[stemsInOrder[comboWith]]} → vô hiệu`;
    } else if (comboWith !== undefined) {
      s = 0.5; why = `hợp với nhật chủ ${STEM_VI[stemsInOrder[comboWith]]} → bị trói nhưng vẫn "hữu tình" với nhật chủ`;
    } else if (clashedBy !== undefined && !hasOwnRoot) {
      s = 1; why = `bị ${STEM_VI[stemsInOrder[clashedBy]]} khắc, ngồi trên ${BRANCH_VI[p.branch]} không gốc → vô hiệu`;
    } else if (clashedBy !== undefined) {
      s = 0.5; why = `bị ${STEM_VI[stemsInOrder[clashedBy]]} khắc nhưng có gốc tại ${BRANCH_VI[p.branch]} → còn lực`;
    } else {
      s = 0; why = hasOwnRoot ? `có gốc tại ${BRANCH_VI[p.branch]}, không bị chế` : "không bị hợp hay khắc";
    }
    worst = Math.min(worst, s);
    notes.push(`${STEM_VI[p.stem]} (trụ ${POS_VI[p.pos]}) ${why}`);
  });

  const who = kind === "tong" ? "Ấn/Tỷ" : "Quan Sát";
  return {
    id: "exposed",
    label: `${who} thấu can`,
    score: worst,
    gate: true,
    detail: notes.length ? notes.join("; ") : `Không có ${who} thấu can`,
  };
}

// ───────────────────── Điều kiện 3: thế của phe được theo ─────────────────────

function hasMomentum(chart: Chart, sr: ScoreResult, e: Element): string | null {
  if (sr.seasonElement === e) return `đắc lệnh (sinh mùa ${ELEMENT_VI[e]})`;
  if (generatedBy(e) === sr.seasonElement) return `được lệnh tháng sinh (mùa ${ELEMENT_VI[sr.seasonElement]} sinh ${ELEMENT_VI[e]})`;
  const branches = pillars(chart).map((p) => p.branch);
  for (const t of BRANCH_TRIADS) {
    if (t.to !== e) continue;
    const n = t.set.filter((b) => branches.includes(b)).length;
    if (n === 3) return `thành tam hợp cục ${ELEMENT_VI[e]}`;
    if (n === 2 && branches.includes(t.set[1])) return `bán hợp hướng ${ELEMENT_VI[e]}`;
  }
  return null;
}

// ───────────────────── Đánh giá tổng ─────────────────────

function grade(checks: FollowCheck[], cfg: ScoringConfig): { confidence: number; grade: FollowGrade } {
  const w = cfg.follow.checkWeights;
  const confidence = round(checks.reduce((a, c) => a + c.score * w[c.id], 0) / (w.root + w.exposed + w.dominant + w.direction), 3);
  const gateFailed = checks.some((c) => c.gate && c.score === 0);
  const allGatesFull = checks.filter((c) => c.gate).every((c) => c.score === 1);
  const g: FollowGrade = gateFailed ? "khong-thanh"
    : confidence >= cfg.follow.chanMin && allGatesFull ? "chan"
    : confidence >= cfg.follow.giaMin ? "gia" : "khong-thanh";
  return { confidence, grade: g };
}

export function assessFollow(chart: Chart, sr: ScoreResult, dmi: DayMasterInfo, cfg: ScoringConfig): FollowAssessment | null {
  const f = cfg.follow;
  const dm = dmi.dayMaster;
  const g = dmi.byTenGod;
  const all = Object.values(g).reduce((a, b) => a + b, 0);

  if (dmi.supportRatio < f.candidateWeak) {
    // ── Tòng nhược ──
    const helpers = [dm, generatedBy(dm)];
    const drains = (["QuanSat", "Tai", "ThucThuong"] as TenGodGroup[]).sort((x, y) => g[y] - g[x]);
    const [top, second] = drains;
    const topEl = elementOfTenGod(dm, top);
    const drainShare = (g.QuanSat + g.Tai + g.ThucThuong) / all;

    const root = rootCheck(chart, helpers, cfg, "tong");
    const exposed = exposedCheck(chart, helpers, "tong");

    const mom = hasMomentum(chart, sr, topEl);
    const domScore = drainShare >= f.dominantMinShare ? (mom ? 1 : 0.6) : 0;
    const dominant: FollowCheck = {
      id: "dominant", label: "Thế của phe được theo", score: domScore, gate: false,
      detail: `Phe khắc/tiết nhật chủ chiếm ${pct(drainShare)} (cần ≥ ${pct(f.dominantMinShare)}); ${TEN_GOD_VI[top]} ${ELEMENT_VI[topEl]} ${mom ?? "không đắc lệnh, không thành cục"}`,
    };

    const ratio = g[second] > 0 ? g[top] / g[second] : Infinity;
    const single = ratio >= f.singleDirectionRatio;
    const direction: FollowCheck = {
      id: "direction", label: "Hướng theo", score: single ? 1 : 0.6, gate: false,
      detail: single
        ? `Theo một hướng rõ: ${TEN_GOD_VI[top]} gấp ${ratio === Infinity ? "∞" : round(ratio, 1)} lần ${TEN_GOD_VI[second]}`
        : `Hỗn hợp: ${TEN_GOD_VI[top]} (${g[top]}) và ${TEN_GOD_VI[second]} (${g[second]}) ngang ngửa → tòng thế`,
    };

    const checks: FollowCheck[] = [root, exposed, dominant, direction];
    const { confidence, grade: gr } = grade(checks, cfg);
    const typeName = single ? TONG_NAMES[top]! : "Tòng Thế";
    const followGroups = single ? [top] : [top, second];
    return {
      kind: "tong", typeName, grade: gr, confidence, checks, followGroups,
      breakers: helpers,
      summary: summarize("tong", typeName, gr, confidence, helpers),
    };
  }

  if (dmi.supportRatio > f.candidateStrong) {
    // ── Chuyên vượng ──
    const opposers = [controlledBy(dm)];
    const root = rootCheck(chart, opposers, cfg, "chuyen-vuong");
    const exposed = exposedCheck(chart, opposers, "chuyen-vuong");

    const mom = hasMomentum(chart, sr, dm);
    const supportShare = (g.TyKiep + g.An) / all;
    const dominant: FollowCheck = {
      id: "dominant", label: "Thế của nhật chủ", score: supportShare >= f.dominantMinShare ? (mom ? 1 : 0.5) : 0, gate: false,
      detail: `Tỷ Kiếp + Ấn chiếm ${pct(supportShare)}; nhật chủ ${ELEMENT_VI[dm]} ${mom ?? "không đắc lệnh, không thành cục"}`,
    };
    const selfLed = g.TyKiep >= g.An;
    const direction: FollowCheck = {
      id: "direction", label: "Hướng theo", score: selfLed ? 1 : 0.7, gate: false,
      detail: selfLed ? "Tỷ Kiếp làm chủ → chuyên vượng đúng nghĩa" : "Ấn nhiều hơn Tỷ Kiếp → nghiêng về Tòng Cường",
    };

    const checks: FollowCheck[] = [root, exposed, dominant, direction];
    const { confidence, grade: gr } = grade(checks, cfg);
    const typeName = selfLed ? CHUYEN_VUONG_NAMES[dm] : "Tòng Cường";
    return {
      kind: "chuyen-vuong", typeName, grade: gr, confidence, checks, followGroups: ["TyKiep"],
      breakers: opposers,
      summary: summarize("chuyen-vuong", typeName, gr, confidence, opposers),
    };
  }

  return null;
}

function summarize(kind: FollowKind, typeName: string, g: FollowGrade, conf: number, breakers: Element[]): string {
  const b = breakers.map((e) => ELEMENT_VI[e]).join(", ");
  if (g === "chan") return `Thành ${typeName} rõ ràng (tin cậy ${pct(conf)}). Năm/vận gặp ${b} là lúc dễ biến động vì phá cách.`;
  if (g === "gia") return `Có thể là ${typeName} nhưng chưa trọn (tin cậy ${pct(conf)}): nên xem cả hai cách luận và kiểm chứng bằng các năm đã qua. Khi gặp ${b}, cục có xu hướng quay về luận ${kind === "tong" ? "thân nhược" : "thân vượng"} thông thường.`;
  return `Có dấu hiệu ${typeName} nhưng không đạt điều kiện (tin cậy ${pct(conf)}) → luận theo ${kind === "tong" ? "thân nhược" : "thân vượng"} thông thường.`;
}
