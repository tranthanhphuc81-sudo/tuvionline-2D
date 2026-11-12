/* Kiểm tra điều kiện Tòng cách (tòng nhược) và Chuyên vượng (cực vượng).
   Port từ docs/ngu-hanh-engine/src/follow.ts (v0.2), giữ nguyên thuật toán; câu văn đổi thành mã `Msg`.

   Chấm 4 điều kiện: 1. gốc ở địa chi, 2. can lộ, 3. thế của phe được theo, 4. hướng theo.
   Điều kiện 1 và 2 là "cổng cứng": trượt hẳn thì không thành cách dù tổng điểm cao.
   Kết quả: Chân / Giả / Không thành + độ tin cậy 0..1 + danh sách hành có thể "phá cách". */
import type { ScoringConfig } from './config';
import {
  BRANCH_TRIADS, STEM_COMBOS, controlledBy, elementOfTenGod, generatedBy, hiddenStems, stemElement,
  type Branch, type Element, type Stem, type TenGodGroup,
} from './data';
import type { DayMasterInfo, ScoreResult } from './engine';
import { msg, type Msg, type NguHanhChart } from './types';

export type FollowKind = 'tong' | 'chuyen-vuong';
export type FollowGrade = 'chan' | 'gia' | 'khong-thanh';
/** Tên cách dạng mã: Tòng Sát, Tòng Tài, Tòng Nhi, Tòng Thế, Khúc Trực, Viêm Thượng, Giá Sắc, Tòng Cách (Kim chuyên vượng), Nhuận Hạ, Tòng Cường. */
export type FollowType =
  | 'tong-sat' | 'tong-tai' | 'tong-nhi' | 'tong-the'
  | 'khuc-truc' | 'viem-thuong' | 'gia-sac' | 'tong-cach-kim' | 'nhuan-ha' | 'tong-cuong';
export type FollowCheckId = 'root' | 'exposed' | 'dominant' | 'direction';

export interface FollowCheck {
  id: FollowCheckId;
  /** 1 = đạt trọn, 0 < x < 1 = đạt một phần, 0 = trượt */
  score: number;
  /** Cổng cứng: score = 0 thì không thành cách bất kể tổng điểm */
  gate: boolean;
  detail: Msg;
}

export interface FollowAssessment {
  kind: FollowKind;
  type: FollowType;
  grade: FollowGrade;
  confidence: number;
  checks: FollowCheck[];
  /** Nhóm Thập Thần được theo (với tòng): 1 phần tử nếu nhất hành, 2 nếu tòng thế */
  followGroups: TenGodGroup[];
  /** Hành mà khi đến (năm, Đại Vận) sẽ phá cách */
  breakers: Element[];
  summary: Msg;
}

const POS = ['year', 'month', 'day', 'hour'] as const;
type Pos = (typeof POS)[number];
const round = (n: number, d = 2) => Math.round(n * 10 ** d) / 10 ** d;

const CHUYEN_VUONG_TYPE: Record<Element, FollowType> = {
  'Mộc': 'khuc-truc', 'Hoả': 'viem-thuong', 'Thổ': 'gia-sac', 'Kim': 'tong-cach-kim', 'Thuỷ': 'nhuan-ha',
};
const TONG_TYPE: Partial<Record<TenGodGroup, FollowType>> = { QuanSat: 'tong-sat', Tai: 'tong-tai', ThucThuong: 'tong-nhi' };

function pillars(chart: NguHanhChart): Array<{ pos: Pos; stem: Stem; branch: Branch }> {
  return POS.map((p) => ({ pos: p, ...chart[p] }));
}

/* ----- Điều kiện 1: gốc ở địa chi ----- */

function rootCheck(chart: NguHanhChart, targets: Element[], cfg: ScoringConfig, kind: FollowKind): FollowCheck {
  const f = cfg.follow;
  let rootScore = 0;
  const found: Array<{ stem: Stem; level: number; pos: Pos; branch: Branch; weight: number }> = [];
  for (const p of pillars(chart)) {
    const mult = p.pos === 'month' ? f.monthRootMultiplier : p.pos === 'day' ? f.dayRootMultiplier : 1;
    hiddenStems(p.branch).forEach((hs, k) => {
      if (!targets.includes(stemElement(hs))) return;
      const w = f.rootWeights[k] * mult;
      rootScore += w;
      found.push({ stem: hs, level: k, pos: p.pos, branch: p.branch, weight: round(w) });
    });
  }
  const score = rootScore === 0 ? 1 : rootScore <= f.weakRootMax ? 0.5 : 0;
  const detail = rootScore === 0
    ? msg('root.none', { kind })
    : msg(score === 0.5 ? 'root.weak' : 'root.real', { kind, found, total: round(rootScore), weakRootMax: f.weakRootMax });
  return { id: 'root', score, gate: true, detail };
}

/* ----- Điều kiện 2: can lộ và có bị chế không ----- */

type ExposedWhy = 'combo-void' | 'combo-dm' | 'clash-noroot' | 'clash-root' | 'free-root' | 'free';

function exposedCheck(chart: NguHanhChart, targets: Element[], kind: FollowKind): FollowCheck {
  const ps = pillars(chart);
  const stemsInOrder = ps.map((p) => p.stem);
  const notes: Array<{ stem: Stem; pos: Pos; why: ExposedWhy; other: Stem | null; branch: Branch }> = [];
  let worst = 1;

  ps.forEach((p, i) => {
    if (p.pos === 'day') return; // nhật can là nhật chủ
    const el = stemElement(p.stem);
    if (!targets.includes(el)) return;

    const neighbours = [i - 1, i + 1].filter((j) => j >= 0 && j < ps.length);
    const comboWith = neighbours.find((j) =>
      STEM_COMBOS.some(({ pair: [x, y] }) => (x === p.stem && y === stemsInOrder[j]) || (y === p.stem && x === stemsInOrder[j])));
    const hasOwnRoot = hiddenStems(p.branch).some((hs) => stemElement(hs) === el);
    const clashedBy = neighbours.find((j) => stemElement(stemsInOrder[j]) === controlledBy(el));

    let s: number, why: ExposedWhy, other: Stem | null = null;
    if (comboWith !== undefined && ps[comboWith].pos !== 'day') {
      s = 1; why = 'combo-void'; other = stemsInOrder[comboWith];
    } else if (comboWith !== undefined) {
      s = 0.5; why = 'combo-dm'; other = stemsInOrder[comboWith];
    } else if (clashedBy !== undefined && !hasOwnRoot) {
      s = 1; why = 'clash-noroot'; other = stemsInOrder[clashedBy];
    } else if (clashedBy !== undefined) {
      s = 0.5; why = 'clash-root'; other = stemsInOrder[clashedBy];
    } else {
      s = 0; why = hasOwnRoot ? 'free-root' : 'free';
    }
    worst = Math.min(worst, s);
    notes.push({ stem: p.stem, pos: p.pos, why, other, branch: p.branch });
  });

  return {
    id: 'exposed', score: worst, gate: true,
    detail: notes.length ? msg('exposed.list', { kind, notes }) : msg('exposed.none', { kind }),
  };
}

/* ----- Điều kiện 3: thế của phe được theo ----- */

/** Trả về mã thế (đắc lệnh, được lệnh sinh, tam hợp, bán hợp) hoặc null. */
function momentum(chart: NguHanhChart, sr: ScoreResult, e: Element): Msg | null {
  if (sr.seasonElement === e) return msg('momentum.deLenh', { element: e });
  if (generatedBy(e) === sr.seasonElement) return msg('momentum.lenhSinh', { season: sr.seasonElement, element: e });
  const branches = pillars(chart).map((p) => p.branch);
  for (const t of BRANCH_TRIADS) {
    if (t.to !== e) continue;
    const n = t.set.filter((b) => branches.includes(b)).length;
    if (n === 3) return msg('momentum.triad', { element: e });
    if (n === 2 && branches.includes(t.set[1])) return msg('momentum.halfTriad', { element: e });
  }
  return null;
}

/* ----- Đánh giá tổng ----- */

function grade(checks: FollowCheck[], cfg: ScoringConfig): { confidence: number; grade: FollowGrade } {
  const w = cfg.follow.checkWeights;
  const confidence = round(checks.reduce((a, c) => a + c.score * w[c.id], 0) / (w.root + w.exposed + w.dominant + w.direction), 3);
  const gateFailed = checks.some((c) => c.gate && c.score === 0);
  const allGatesFull = checks.filter((c) => c.gate).every((c) => c.score === 1);
  const g: FollowGrade = gateFailed ? 'khong-thanh'
    : confidence >= cfg.follow.chanMin && allGatesFull ? 'chan'
    : confidence >= cfg.follow.giaMin ? 'gia' : 'khong-thanh';
  return { confidence, grade: g };
}

export function assessFollow(chart: NguHanhChart, sr: ScoreResult, dmi: DayMasterInfo, cfg: ScoringConfig): FollowAssessment | null {
  const f = cfg.follow;
  const dm = dmi.dayMaster;
  const g = dmi.byTenGod;
  const all = Object.values(g).reduce((a, b) => a + b, 0);

  if (dmi.supportRatio < f.candidateWeak) {
    // Tòng nhược
    const helpers = [dm, generatedBy(dm)];
    const drains = (['QuanSat', 'Tai', 'ThucThuong'] as TenGodGroup[]).sort((x, y) => g[y] - g[x]);
    const [top, second] = drains;
    const topEl = elementOfTenGod(dm, top);
    const drainShare = (g.QuanSat + g.Tai + g.ThucThuong) / all;

    const root = rootCheck(chart, helpers, cfg, 'tong');
    const exposed = exposedCheck(chart, helpers, 'tong');

    const mom = momentum(chart, sr, topEl);
    const domScore = drainShare >= f.dominantMinShare ? (mom ? 1 : 0.6) : 0;
    const dominant: FollowCheck = {
      id: 'dominant', score: domScore, gate: false,
      detail: msg('dominant.tong', { share: round(drainShare, 3), min: f.dominantMinShare, top, element: topEl, momentum: mom }),
    };

    const ratio = g[second] > 0 ? g[top] / g[second] : Infinity;
    const single = ratio >= f.singleDirectionRatio;
    const direction: FollowCheck = {
      id: 'direction', score: single ? 1 : 0.6, gate: false,
      detail: single
        ? msg('direction.single', { top, second, ratio: ratio === Infinity ? null : round(ratio, 1) })
        : msg('direction.mixed', { top, topValue: g[top], second, secondValue: g[second] }),
    };

    const checks: FollowCheck[] = [root, exposed, dominant, direction];
    const { confidence, grade: gr } = grade(checks, cfg);
    const type: FollowType = single ? TONG_TYPE[top]! : 'tong-the';
    const followGroups = single ? [top] : [top, second];
    return {
      kind: 'tong', type, grade: gr, confidence, checks, followGroups, breakers: helpers,
      summary: msg('follow.summary', { kind: 'tong', type, grade: gr, confidence, breakers: helpers }),
    };
  }

  if (dmi.supportRatio > f.candidateStrong) {
    // Chuyên vượng
    const opposers = [controlledBy(dm)];
    const root = rootCheck(chart, opposers, cfg, 'chuyen-vuong');
    const exposed = exposedCheck(chart, opposers, 'chuyen-vuong');

    const mom = momentum(chart, sr, dm);
    const supportShare = (g.TyKiep + g.An) / all;
    const dominant: FollowCheck = {
      id: 'dominant', score: supportShare >= f.dominantMinShare ? (mom ? 1 : 0.5) : 0, gate: false,
      detail: msg('dominant.chuyenVuong', { share: round(supportShare, 3), element: dm, momentum: mom }),
    };
    const selfLed = g.TyKiep >= g.An;
    const direction: FollowCheck = {
      id: 'direction', score: selfLed ? 1 : 0.7, gate: false,
      detail: msg(selfLed ? 'direction.selfLed' : 'direction.anLed'),
    };

    const checks: FollowCheck[] = [root, exposed, dominant, direction];
    const { confidence, grade: gr } = grade(checks, cfg);
    const type: FollowType = selfLed ? CHUYEN_VUONG_TYPE[dm] : 'tong-cuong';
    return {
      kind: 'chuyen-vuong', type, grade: gr, confidence, checks, followGroups: ['TyKiep'], breakers: opposers,
      summary: msg('follow.summary', { kind: 'chuyen-vuong', type, grade: gr, confidence, breakers: opposers }),
    };
  }

  return null;
}
