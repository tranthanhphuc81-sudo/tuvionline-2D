/* Kịch bản Thầy đọc phần phân tích ngũ hành (Phase 3C.6, ARCHITECTURE 12.7, 12.8, 14.6, 14.8).
   Thầy chỉ đọc kết luận, vài lý do chính (nguyệt lệnh, hợp cục, phương pháp chọn Dụng thần, Tòng cách) và chiến lược;
   bảng điều kiện, phần trăm, vết tính, danh sách thói quen chỉ để xem. Khi có hai cách luận mà chưa phân định,
   Thầy hỏi một giai đoạn đã qua; người dùng trả lời bằng 4 nút của thẻ kiểm chứng ngay trên màn Bát Tự. */
import { BatTuEngine } from '../../core';
import {
  hiddenStems, seasonalState, tenGodOf, verificationQuestions,
  type Msg, type NguHanhAnalysis, type VerificationQuestion,
} from '../../core/nguhanh';
import type { NguHanhAnswer } from '../../state/schema';
import { GRADE_VI, METHOD_VI, TEN_GOD_PRACTICAL, TYPE_VI, msgText, resolutionText, verificationPrompt } from '../../content/nguhanh';
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

/** Một câu nói về cách các chi tác động lẫn nhau (tam hợp, bán hợp, lục hợp, xung), lấy mã đầu tiên trong vết tính. */
function hopCucText(trace: readonly Msg[]): string | null {
  for (const m of trace) {
    const p = m.p as Record<string, string> | undefined;
    if (m.code === 'trace.triad') return `tam hợp cục ${p?.to}, làm hành ${p?.to} mạnh thêm`;
    if (m.code === 'trace.halfTriad') return `bán hợp hướng ${p?.to}, làm hành ${p?.to} mạnh thêm`;
    if (m.code === 'trace.sixCombo') return `lục hợp hướng ${p?.to}`;
    if (m.code === 'trace.clash') return 'hai chi xung nhau, lực của chúng giảm bớt';
  }
  return null;
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
  leads.push({
    lines: LEADS.nguhanhNguyetLenh,
    vars: { chi: CHI[monthBranch], tiet: a.score.seasonElement, nhatChu: dm, the: state },
    focus: { pillar: 1, hidden: hiddenStems(monthBranch) },
  });
  const hop = hopCucText(a.score.trace);
  if (hop) leads.push({ lines: LEADS.nguhanhHopCuc, vars: { hopcuc: hop }, focus: {} });
  leads.push({
    lines: LEADS.nguhanhPhuongPhap,
    vars: { phuongphap: METHOD_VI[ug.method].split(' (')[0].toLocaleLowerCase('vi'), dung: ug.dung, hy: ug.hy, ky: ug.ky },
    focus: {},
  });
  if (a.follow) {
    leads.push({
      lines: LEADS.nguhanhTongCach,
      vars: { cach: TYPE_VI[a.follow.type], hang: GRADE_VI[a.follow.grade].split(' (')[0].toLocaleLowerCase('vi'), tincay: Math.round(a.follow.confidence * 100) + ' phần trăm' },
      focus: {},
    });
  }
  if (a.readings.length > 1) {
    leads.push({ lines: LEADS.nguhanhHaiCach, vars: { cachchinh: msgText(a.readings[0].label).replace(/^Luận /, '') }, focus: {} });
  }

  const prose: string[] = [TEN_GOD_PRACTICAL[tenGodOf(dm, ug.dung)].asUseful];
  if (a.resolution) prose.push(resolutionText(a.resolution, a));
  if (ask) {
    prose.push(fill(pick(LEADS.nguhanhHoi, seed), vars));
    prose.push(verificationPrompt(ask.question, ask.base));
  }
  return { leads, prose, sections: [] };
}

