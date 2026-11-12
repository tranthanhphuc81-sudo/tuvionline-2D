/* Kịch bản Thầy đọc phần phân tích ngũ hành (Phase 3C.6, ARCHITECTURE 12.7, 12.8, 14.6, 14.8).
   Thầy chỉ đọc kết luận, vài lý do chính (nguyệt lệnh, hợp cục, phương pháp chọn Dụng thần, Tòng cách) và chiến lược;
   bảng điều kiện, phần trăm, vết tính, danh sách thói quen chỉ để xem. Khi có hai cách luận mà chưa phân định,
   Thầy hỏi một giai đoạn đã qua; người dùng trả lời bằng 4 nút của thẻ kiểm chứng ngay trên màn Bát Tự. */
import { BatTuEngine } from '../../core';
import {
  hiddenStems, seasonClimate, seasonalState, tenGodOf, verificationQuestions,
  type Msg, type NguHanhAnalysis, type VerificationQuestion,
} from '../../core/nguhanh';
import type { NguHanhAnswer } from '../../state/schema';
import { TEN_GOD_PRACTICAL, TYPE_VI, msgText, resolutionText, verificationPrompt } from '../../content/nguhanh';
import { analyzeSensitivity } from '../../core/nguhanh';
import { LEADS, fill, pick } from '../../content/reader/templates';
import type { Lead, ScriptInput, Who } from './script';

const { CHI } = BatTuEngine;

/** Tham số chọn câu hỏi của app (ARCHITECTURE 14.5): tối đa 2 Đại Vận đã đi hết và 3 năm từ 18 tuổi mụ. */
export const ASK_OPTIONS = { minAge: 18, maxYears: 3, maxDaiVan: 2 } as const;

const STATE_VI = { vuong: 'vượng', tuong: 'tướng', huu: 'hưu', tu: 'tù', tuDie: 'tử' } as const;
const same = (a: NguHanhAnswer['target'], b: VerificationQuestion['target']) => a.kind === b.kind && (a.kind === 'nam' ? a.year === (b as { year: number }).year : a.index === (b as { index: number }).index);

/** Câu hỏi kế tiếp chưa trả lời; không có khi không có cách luận thay thế, đã kết luận, hay đã hỏi hết. */
export function nextNguHanhQuestion(base: NguHanhAnalysis, decided: boolean, answers: readonly NguHanhAnswer[], nowYear: number): VerificationQuestion | undefined {
  if (base.readings.length < 2 || decided) return undefined;
  return verificationQuestions(base, { nowYear, ...ASK_OPTIONS }).find((q) => !answers.some((x) => same(x.target, q.target)));
}

/** Lời dẫn về cách các chi tác động lẫn nhau (tam hợp, bán hợp, lục hợp, xung), lấy mã đầu tiên trong vết tính. */
function hopCucLead(trace: readonly Msg[]): Lead | null {
  for (const m of trace) {
    const p = (m.p ?? {}) as Record<string, string>;
    if (m.code === 'trace.triad') return { lines: LEADS.nguhanhTamHop, vars: { hanh: p.to }, focus: {} };
    if (m.code === 'trace.halfTriad') return { lines: LEADS.nguhanhBanHop, vars: { hanh: p.to }, focus: {} };
    if (m.code === 'trace.sixCombo') return { lines: LEADS.nguhanhLucHop, vars: { hanh: p.to }, focus: {} };
    if (m.code === 'trace.clash') return { lines: LEADS.nguhanhLucXung, vars: {}, focus: {} };
  }
  return null;
}

/** Lời Thầy hỏi trước câu hỏi kiểm chứng: khác nhau cho giai đoạn mười năm (Đại Vận) và một năm. */
export function askIntroLine(q: VerificationQuestion, vars: { goi: string; ta: string }, seed: number): string {
  return fill(pick(q.target.kind === 'daiVan' ? LEADS.nguhanhHoiDaiVan : LEADS.nguhanhHoiNam, seed), vars);
}

/** Lời Thầy sau khi đã hỏi: nói kết luận, hoặc nói chưa đủ để chắc, hoặc chưa đủ dữ liệu. Rỗng nếu chưa có câu trả lời nào. */
export function resolutionLine(a: NguHanhAnalysis, vars: { goi: string; ta: string }, seed: number): string {
  const r = a.resolution;
  if (!r) return '';
  const code = r.conclusion.code;
  const lead = code === 'resolve.decided' ? LEADS.nguhanhKetLuan : code === 'resolve.insufficient' ? LEADS.nguhanhChuaDu : LEADS.nguhanhChuaChac;
  return fill(pick(lead, seed), vars) + ' ' + resolutionText(r, a);
}

export interface NguHanhReadInput {
  /** phân tích đang hiển thị (đã gộp câu trả lời nếu có) */
  a: NguHanhAnalysis;
  /** câu hỏi kiểm chứng sẽ hỏi cuối bài; bỏ trống thì không hỏi */
  ask?: { question: VerificationQuestion; base: NguHanhAnalysis };
}

/**
 * Đầu vào cho buildScript('nguhanh', ...): 3–5 lý do có lời dẫn (nguyệt lệnh có tô trụ tháng và tàng can), chiến lược,
 * kết luận phân xử nếu đã có câu trả lời, và câu hỏi kiểm chứng khi cần.
 */
export function nguHanhScriptInput(input: NguHanhReadInput, who: Who, seed = new Date().getDate()): ScriptInput {
  const { a, ask } = input;
  const ug = a.usefulGod, dm = a.dayMaster.dayMaster;
  const monthBranch = a.chart.month.branch;
  const vars = { goi: who.goi, ta: who.ta ?? 'thầy' };
  const leads: Lead[] = [];

  const state = STATE_VI[seasonalState(dm, a.score.seasonElement)];
  const dacLenh = state === 'vượng' || state === 'tướng';
  leads.push({
    lines: dacLenh ? LEADS.nguhanhDacLenh : LEADS.nguhanhThatLenh,
    vars: { chi: CHI[monthBranch], tiet: a.score.seasonElement, nhatChu: dm, the: state },
    focus: { pillar: 1, hidden: hiddenStems(monthBranch) },
  });
  const hop = hopCucLead(a.score.trace);
  if (hop) leads.push(hop);
  const dv = { dung: ug.dung, hy: ug.hy, ky: ug.ky };
  if (ug.method === 'phu-uc') leads.push({ lines: LEADS.nguhanhPhuUc, vars: dv, focus: {} });
  else if (ug.method === 'dieu-hau') leads.push({ lines: LEADS.nguhanhDieuHau, vars: { ...dv, khi: seasonClimate(monthBranch) === 'nong' ? 'nóng' : 'lạnh' }, focus: {} });
  else if (ug.method === 'trung-hoa') leads.push({ lines: LEADS.nguhanhTrungHoa, vars: dv, focus: {} });
  else leads.push({ lines: LEADS.nguhanhThuanThe, vars: { ...dv, cach: a.follow ? TYPE_VI[a.follow.type] : 'cách cục đặc biệt' }, focus: {} });
  const bridge = ug.secondary.find((x) => x.method === 'thong-quan');
  if (bridge) {
    const p = (bridge.reason.p ?? {}) as Record<string, string>;
    leads.push({ lines: LEADS.nguhanhThongQuan, vars: { a: p.a, b: p.b, cau: p.bridge }, focus: {} });
  }
  if (a.follow) {
    const lines = a.follow.grade === 'chan' ? LEADS.nguhanhChanTong : a.follow.grade === 'gia' ? LEADS.nguhanhGiaTong : LEADS.nguhanhKhongThanh;
    leads.push({ lines, vars: { cach: TYPE_VI[a.follow.type], tincay: Math.round(a.follow.confidence * 100) + ' phần trăm' }, focus: {} });
  }
  if (a.readings.length > 1) {
    leads.push({ lines: LEADS.nguhanhHaiCach, vars: { cachchinh: msgText(a.readings[0].label).replace(/^Luận /, '') }, focus: {} });
  }

  const prose: string[] = [TEN_GOD_PRACTICAL[tenGodOf(dm, ug.dung)].asUseful];
  // độ nhạy: chỉ nói khi hai cách đặt hệ số cho Dụng thần khác nhau (ARCHITECTURE 14.11)
  if (analyzeSensitivity(a.chart).byPreset.some((x) => x.dung !== ug.dung)) prose.push(fill(pick(LEADS.nguhanhChuaVung, seed), vars));
  const res = resolutionLine(a, vars, seed);
  if (res) prose.push(res);
  if (ask) {
    prose.push(askIntroLine(ask.question, vars, seed));
    prose.push(verificationPrompt(ask.question, ask.base));
  }
  return { leads, prose, sections: [] };
}

