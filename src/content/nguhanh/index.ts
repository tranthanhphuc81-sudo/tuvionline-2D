/* Câu chữ mục "Phân tích ngũ hành" (Phase 3C.3): hàm thuần nhận kết quả của src/core/nguhanh và trả câu / Section.
   NỘI DUNG MỚI (xem README.md). Giữ nguyên các quyết định ở ARCHITECTURE mục 14:
   - 14.1 dòng đối chiếu với gợi ý sơ bộ; 14.3 không nêu màu, hướng, vật phẩm; 14.7 trọng số hiện bằng chữ;
   - 14.8 nhãn năm mềm kèm gợi ý, lời nhắc văn hoá ở đầu và cuối, hai danh sách từ cấm. */
import { BatTuEngine, type BatTuReading } from '../../core';
import {
  compareWithLegacy, daiVanYears, ageInYear, evaluatePeriod, pillarOfYear, seasonClimate, tenGodOf,
  type Element, type Favor, type LegacyComparison, type NguHanhAnalysis, type Pillar, type PeriodTarget, type Reading, type Resolution, type VerificationQuestion,
} from '../../core/nguhanh';
import { p, list, note, parseRich, type Block, type Section } from '../rich';
import { analyzeSensitivity, rankIntervention, balanceTarget, BALANCE, TARGET, type BalanceMode, type TargetInput } from '../../core/nguhanh';
import { FAMILY } from '../interp/battu';
import { msgText, type RenderCtx } from './render';
import { ELEMENT_PRACTICAL, TEN_GOD_PRACTICAL } from './practical';
import {
  SENSITIVITY_STABLE, sensitivityUnstable, CHECK_QUESTION, CHECK_STATUS, CLOSING_NOTE, COLOR_SOURCE_NOTE, DISCLAIMER, FAVOR_HINT, FAVOR_LABEL, FAVOR_TONE, INTRO_NOTE, METHOD_VI, OUTCOME_LABEL,
  STRENGTH_VI, TEN_GOD_VI, TYPE_VI,
} from './vocab';

export * from './vocab';
export { msgText } from './render';
export type { RenderCtx } from './render';
export { ELEMENT_PRACTICAL, TEN_GOD_PRACTICAL } from './practical';

const { CAN, CHI } = BatTuEngine;
const NO_SPEECH = ['no-speech'];
const pc = (x: number) => Math.round(x * 100) + '%';
const canChi = (pl: Pillar) => `${CAN[pl.stem]} ${CHI[pl.branch]}`;

/** Ngữ cảnh dựng câu từ một phân tích: nhãn của từng cách luận ("Luận Tòng Sát", ...). */
export const renderCtxOf = (a: NguHanhAnalysis): RenderCtx => ({
  readingLabel: (id) => { const r = a.readings.find((x) => x.id === id); return r ? msgText(r.label) : id; },
});
export const readingLabel = (r: Reading): string => msgText(r.label);

/** Trọng số hiện bằng chữ (14.7), phần trăm chỉ nằm trong "Vì sao ra kết quả này". */
export function weightPhrase(w: number): string {
  return w >= 0.8 ? 'nghiêng rõ về' : w >= 0.6 ? 'nghiêng nhẹ về' : 'hai cách gần ngang nhau, hơi nghiêng về';
}

/** Danh sách "vì sao ra kết quả này" của một cách luận: phương pháp, rồi các lý do. */
export function reasons(r: Reading, ctx?: RenderCtx): string[] {
  return [`Phương pháp: ${METHOD_VI[r.usefulGod.method]}`, ...r.usefulGod.reasons.map((m) => msgText(m, ctx))];
}

/** Ghi chú phụ (Điều hậu, Thông quan) của một cách luận. */
export function secondaryNotes(r: Reading, ctx?: RenderCtx): string[] {
  return r.usefulGod.secondary.map((s) => `${METHOD_VI[s.method]}: ${msgText(s.reason, ctx)}`);
}

export interface PatternView {
  typeName: string;
  grade: string;
  confidence: string;
  summary: string;
  breakers: string[];
  checks: Array<{ id: string; ask: string; term: string; status: string; score: number; detail: string }>;
}
/** Kết quả kiểm tra Tòng cách / Chuyên vượng; null khi lá số không có dấu hiệu. */
export function patternSummary(a: NguHanhAnalysis, ctx: RenderCtx = renderCtxOf(a)): PatternView | null {
  const f = a.follow;
  if (!f) return null;
  return {
    typeName: TYPE_VI[f.type],
    grade: f.grade === 'chan' ? 'Chân (thành cách rõ)' : f.grade === 'gia' ? 'Giả (thành cách nhưng dễ bị phá)' : 'Không thành cách',
    confidence: pc(f.confidence),
    summary: msgText(f.summary, ctx),
    breakers: f.breakers,
    checks: followChecks(a, ctx),
  };
}

/** Bảng 4 điều kiện: câu hỏi thường ngày, tên chuyên môn, kết quả (chữ kèm biểu tượng) và chi tiết. */
export function followChecks(a: NguHanhAnalysis, ctx: RenderCtx = renderCtxOf(a)): PatternView['checks'] {
  return (a.follow?.checks ?? []).map((c) => ({
    id: c.id, ...CHECK_QUESTION[c.id], status: CHECK_STATUS(c.score), score: c.score, detail: msgText(c.detail, ctx),
  }));
}

/** Nhãn năm cách nói mềm, kèm gợi ý nên làm gì và tông màu (chữ luôn đi kèm, không chỉ dùng màu). */
export function timingLabel(f: Favor): { label: string; hint: string; tone: 'ok' | 'mid' | 'warn' } {
  return { label: FAVOR_LABEL[f], hint: FAVOR_HINT[f], tone: FAVOR_TONE[f] };
}

/** Câu hỏi kiểm chứng cho một mốc đã qua (14.5): có tuổi mụ và ghi chú tính từ Lập Xuân. */
export function verificationPrompt(q: Pick<VerificationQuestion, 'target' | 'pillar'>, a: NguHanhAnalysis): string {
  const t: PeriodTarget = q.target;
  if (t.kind === 'nam') {
    return `Năm ${t.year} (${canChi(q.pillar)}), lúc bạn ${ageInYear(a.chart, t.year)} tuổi (tuổi mụ). Năm tính từ Lập Xuân, khoảng đầu tháng 2 dương lịch. Nhìn chung năm đó với bạn là thuận lợi, bình thường hay khó khăn?`;
  }
  const s = daiVanYears(a.chart, t.index);
  return `Giai đoạn từ khoảng ${s.fromAge} đến ${s.toAge} tuổi (khoảng ${s.fromYear}–${s.toYear}, Đại Vận ${canChi(q.pillar)}). Nhìn chung giai đoạn đó với bạn là thuận lợi, bình thường hay khó khăn?`;
}
/** Ghi chú độ nhạy (ARCHITECTURE 14.11): chạy lại cả hai bộ hệ số trên cùng lá số, so với Dụng thần đang hiển thị. */
export function sensitivityNote(chart: Parameters<typeof analyzeSensitivity>[0], dung: Element): string {
  const other = analyzeSensitivity(chart).byPreset.find((x) => x.dung !== dung);
  return other ? sensitivityUnstable(other.dung, dung) : SENSITIVITY_STABLE;
}

/** Lời giải thích phương trình và kết quả xếp hạng "can thiệp tối thiểu" (ARCHITECTURE 14.11). */
export function balanceBlocks(shares: Record<Element, number>, dung: Element, mode: BalanceMode = 'roi-rac', target?: TargetInput): Block[] {
  const tau = target ? balanceTarget(target) : undefined;
  const r = rankIntervention(shares, dung, mode, tau);
  const pc = (v: number) => Math.round(v * 100);
  const why: string[] = [];
  if (target?.climate === 'lanh') why.push(`sinh mùa lạnh nên Hoả cần thêm ${pc(TARGET.CLIMATE)}%`);
  if (target?.climate === 'nong') why.push(`sinh mùa nóng nên Thuỷ cần thêm ${pc(TARGET.CLIMATE)}%`);
  if (target && (target.strength === 'nhuoc' || target.strength === 'chuyen-vuong')) why.push(`${STRENGTH_VI[target.strength]} nên ${target.dayMaster} và hành sinh ra nó cần thêm ${pc(TARGET.STRENGTH)}% mỗi hành`);
  if (target && (target.strength === 'vuong' || target.strength === 'tong-nhuoc')) why.push(`${STRENGTH_VI[target.strength]} nên hành do ${target.dayMaster} sinh ra và hành do ${target.dayMaster} khắc cần thêm ${pc(TARGET.STRENGTH)}% mỗi hành`);
  const targetText = tau
    ? `Điểm cân bằng theo lá số: ${CYCLE.map((e) => `${e} ${pc(tau[e])}%`).join(', ')}${why.length ? ' (' + why.join('; ') + ', rồi chuẩn hoá về 100%)' : ' (Trung hoà, sinh mùa ôn hoà nên vẫn đều 20%)'}. Các mức dịch này cũng là hệ số tự đặt.`
    : '';
  const model = mode === 'vi-phan'
    ? `Hệ vi phân liên tục: tốc độ đổi của mỗi hành = ${pc(BALANCE.S)}% × (hành sinh ra nó − chính nó) − ${pc(BALANCE.K)}% × hành khắc nó, tích phân trong ${BALANCE.STEPS} đơn vị thời gian rồi chuẩn hoá tổng về 100%; điểm đứng yên là mỗi hành ${pc(BALANCE.EQUILIBRIUM)}%. "Can thiệp tối thiểu": thử thêm ${pc(BALANCE.DELTA)}% vào từng hành một, hành nào đưa lá số về gần mức cân bằng nhất thì xếp hạng 1.`
    : `Mô hình đơn giản: mỗi bước, mỗi hành nhận thêm ${pc(BALANCE.S)}% phần chênh so với hành sinh ra nó và bị hành khắc nó trừ ${pc(BALANCE.K)}%; hệ đứng yên khi cả năm hành đều ${pc(BALANCE.EQUILIBRIUM)}%. "Can thiệp tối thiểu": thử thêm ${pc(BALANCE.DELTA)}% vào từng hành một, cho chạy ${BALANCE.STEPS} bước, hành nào đưa lá số về gần mức cân bằng nhất thì xếp hạng 1.`;
  const result = r.rank === 1
    ? `Theo mô hình này, bổ sung <b>${dung}</b> là cách bù chỗ lệch hiệu quả nhất, khớp với Dụng thần ở trên.`
    : `Theo mô hình này, <b>${dung}</b> xếp thứ ${r.rank}/5; hành bù chỗ lệch hiệu quả nhất là <b>${r.best}</b>. Mô hình bỏ qua mùa sinh và Nhật Chủ nên Dụng thần vẫn lấy theo cách luận ở trên.`;
  const source = 'Lưu ý: chỉ vòng sinh khắc là kiến thức cổ truyền. Phương trình và các hệ số là mô hình tự đặt để minh hoạ, không lấy từ sách hay trường phái nào, chưa được kiểm chứng; đừng dùng nó để luận đoán.';
  return [
    { ...note('nguhanh.balance.source', source), tags: NO_SPEECH },
    { ...note('nguhanh.balance.model', model), tags: NO_SPEECH },
    ...(targetText ? [{ ...note('nguhanh.balance.target', targetText), tags: NO_SPEECH }] : []),
    { ...p('nguhanh.balance.rank', result), tags: NO_SPEECH },
  ];
}

const CYCLE: Element[] = ['Mộc', 'Hoả', 'Thổ', 'Kim', 'Thuỷ'];
/** Màu tượng trưng của từng hành (cố định, không đổi theo giao diện sáng/tối) và màu chữ đủ tương phản trên nền đó. */
const CYCLE_COLOR: Record<Element, { fill: string; ink: string }> = {
  Mộc: { fill: '#27794a', ink: '#ffffff' },
  Hoả: { fill: '#c9402f', ink: '#ffffff' },
  Thổ: { fill: '#d2a64a', ink: '#2b2110' },
  Kim: { fill: '#e4e4e0', ink: '#22252b' },
  Thuỷ: { fill: '#2f5f9e', ink: '#ffffff' },
};

/** Hình 5 nút minh hoạ vì sao cần thêm Dụng thần (ARCHITECTURE 14.11): chỉ vẽ lại quan hệ sinh khắc quanh Dụng thần, không tham gia chọn Dụng thần. */
export function cycleBlock(shares: Record<Element, number>, dung: Element, tags: Record<string, string>): Block {
  const i = CYCLE.indexOf(dung), mother = CYCLE[(i + 4) % 5], foe = CYCLE[(i + 3) % 5];
  const edges: Extract<Block, { kind: 'cycle' }>['edges'] = [];
  CYCLE.forEach((_, k) => {
    edges.push({ from: k, to: (k + 1) % 5, kind: 'sinh', active: (k + 1) % 5 === i });
    edges.push({ from: k, to: (k + 2) % 5, kind: 'khac', active: (k + 2) % 5 === i });
  });
  const caption = `Hình minh hoạ, không dùng để chọn Dụng thần. Muốn bổ sung <b>${dung}</b>: nuôi <b>${mother}</b> (sinh ${dung}) và bớt <b>${foe}</b> (khắc ${dung}).`;
  return {
    id: 'nguhanh.headline.cycle', kind: 'cycle', tags: NO_SPEECH,
    nodes: CYCLE.map((e) => ({ label: e, pct: Math.round(shares[e] * 100), role: tags[e], focus: e === dung, ...CYCLE_COLOR[e] })),
    edges, caption: parseRich(caption),
  };
}

export const VERIFICATION_INTRO = 'Hai cách luận cho kết quả khác nhau về lá số này. Nếu bạn nhớ lại một vài giai đoạn đã qua, câu trả lời giúp so xem cách luận nào khớp hơn. Đây chỉ là so hai cách tính, không chứng minh cách nào đúng, và trí nhớ có thể lệch. Bạn có thể chọn "Không nhớ" bất cứ lúc nào.';
export const VERIFICATION_NOT_ENOUGH = 'Chưa đủ giai đoạn đã qua để kiểm chứng.';
export { OUTCOME_LABEL };

/** Câu kết quả phân xử (chưa đủ dữ liệu, chưa phân định, hay đã kết luận). */
export function resolutionText(res: Pick<Resolution, 'conclusion'>, a: NguHanhAnalysis): string {
  return msgText(res.conclusion, renderCtxOf(a));
}

/* ===== Dòng đối chiếu với gợi ý sơ bộ (14.1) ===== */
export function legacyComparisonText(cmp: LegacyComparison, a: NguHanhAnalysis, legacy: BatTuReading): string {
  const X = a.usefulGod.dung, Y = legacy.primary;
  const list2 = legacy.dung.join(', ');
  const legacyV = legacy.assessment.thanVuong;
  const lead =
    cmp.match === 'trung' ? `Phân tích định lượng cũng chọn <b>${X}</b> là hành cần bổ sung nhất, trùng với gợi ý sơ bộ ở trên.`
    : cmp.match === 'gan' ? `Phân tích định lượng chọn <b>${X}</b> làm Dụng thần chính, gợi ý sơ bộ ở trên chọn ${Y}. Hai cách cùng một hướng: ${X} vẫn nằm trong nhóm hành có lợi của gợi ý sơ bộ.`
    : cmp.match === 'khac' ? `Phân tích định lượng chọn <b>${X}</b>, khác các hành gợi ý sơ bộ (${list2}), nhưng hai cách không ngược nhau.`
    : `Ở lá số này, hai cách tính cho kết quả gần như ngược nhau: gợi ý sơ bộ nghiêng về ${list2}, phân tích định lượng nghiêng về <b>${X}</b>.`;
  if (cmp.match === 'trung') return lead;
  const climate = seasonClimate(a.chart.month.branch);
  const why =
    cmp.cause === 'vuong-nhuoc' ? ` Gợi ý sơ bộ chỉ đếm mùa sinh và 3 Can lộ nên thấy Thân ${legacyV ? 'vượng' : 'nhược'}; khi tính cả Can ẩn trong Chi và sức của chi tháng, Nhật Chủ lại thiên ${legacyV ? 'nhược' : 'vượng'}.`
    : cmp.cause === 'trung-hoa' ? ' Khi tính đủ 8 chữ, Nhật Chủ gần cân bằng (trung hoà), nên phân tích định lượng chỉ bù hành yếu nhất thay vì bồi thêm hay tiết bớt Nhật Chủ.'
    : cmp.cause === 'dieu-hau' ? ` Lá số sinh mùa ${climate === 'lanh' ? 'lạnh' : 'nóng'} mà hành ${X} rất ít, nên phân tích định lượng ưu tiên Điều hậu (cân bằng nóng lạnh) trước việc bồi thêm hay tiết bớt Nhật Chủ.`
    : cmp.cause === 'tong-cach' ? ` Lá số có dấu hiệu cách cục đặc biệt (${a.follow ? TYPE_VI[a.follow.type] : 'Tòng cách'}); khi đó nguyên tắc Vượng Suy thông thường không còn áp dụng (Phần 2, Chương 7).`
    : ` Hai cách cùng thấy Thân ${legacyV ? 'vượng' : 'nhược'} nhưng chọn hành khác: gợi ý sơ bộ lấy hành ít chữ nhất, phân tích định lượng lấy hành chữa đúng nguyên nhân mất cân bằng.`;
  const tail = cmp.match === 'nguoc'
    ? ' Sách Phần 2 (mục 6.3 và Chương 7) coi cách sơ bộ là bước nền tảng, còn lá số thực tế cần xét thêm những yếu tố này. Bạn có thể đọc cả hai như hai góc nhìn. Nếu định dựa vào đây để quyết định việc gì, nên nhờ người luận xem trực tiếp.'
    : '';
  return lead + why + tail;
}
export const LEGACY_TIMING_NOTE = 'Đánh giá các năm ở đây có thể khác mục "Giai đoạn hiện tại" trong Tổng kết, vì hai cách lấy hành có lợi khác nhau.';

/* ===== Báo cáo thực hành ===== */
export interface ReportOptions {
  /** năm hiện tại (tham số, không đọc đồng hồ) */
  nowYear: number;
  /** xem cách luận khác cách chính (người dùng chọn tab) */
  readingId?: Reading['id'];
  /** cách viết mô hình cân bằng (tuỳ chọn); mặc định sai phân */
  balanceMode?: BalanceMode;
  /** điểm cân bằng của mô hình: 20% đều (mặc định) hay theo mùa sinh và Nhật Chủ */
  balanceTarget?: 'deu' | 'la-so';
  /** số năm tới, mặc định 5 */
  years?: number;
  /** gợi ý sơ bộ của legacy để dựng dòng đối chiếu; bỏ trống thì không có dòng đối chiếu */
  legacy?: BatTuReading;
}

/**
 * Các Section của mục "Phân tích ngũ hành". Khối chứa bảng, phần trăm, vết tính, danh sách thói quen gắn thẻ `no-speech`
 * (chỉ hiện chữ); Thầy chỉ đọc lý do chính, chiến lược và kết luận (3C.6).
 */
export function practicalReport(a: NguHanhAnalysis, o: ReportOptions): Section[] {
  const ctx = renderCtxOf(a);
  const reading = (o.readingId && a.readings.find((r) => r.id === o.readingId)) || a.readings[0];
  const other = a.readings.find((r) => r !== reading);
  const ug = reading.usefulGod;
  const dm = a.dayMaster.dayMaster;
  const dungRole = tenGodOf(dm, ug.dung), kyRole = tenGodOf(dm, ug.ky);
  const out: Section[] = [];
  const sec = (id: string, title: string, blocks: Block[]) => out.push({ id: 'nguhanh.' + id, title, blocks });

  // 1. Mở đầu: lời nhắc văn hoá và dòng đối chiếu
  const intro: Block[] = [note('nguhanh.intro.note', INTRO_NOTE)];
  const cmp = o.legacy ? compareWithLegacy(o.legacy, ug, a.dayMaster.strength) : null;
  if (o.legacy && cmp && reading === a.readings[0]) intro.push(p('nguhanh.intro.legacy', legacyComparisonText(cmp, a, o.legacy)));
  sec('intro', '', intro);

  // 2. Kết luận ngắn và thanh 5 hành
  const tags: Record<string, string> = { [ug.dung]: 'Dụng thần', [ug.hy]: 'Hỷ thần', [ug.ky]: 'Kỵ thần', ...(ug.cuu ? { [ug.cuu]: 'Cừu thần' } : {}) };
  const balance = (['Mộc', 'Hoả', 'Thổ', 'Kim', 'Thuỷ'] as Element[]).sort((x, y) => a.score.shares[y] - a.score.shares[x]);
  sec('headline', 'Tóm lại', [
    p('nguhanh.headline.0', `Nhật Chủ <b>${dm}</b> — <b>${STRENGTH_VI[a.dayMaster.strength]}</b>. Hành cần bổ sung: <b>${ug.dung}</b> (hỗ trợ: ${ug.hy}); hành nên tiết chế: ${ug.ky}.`, { pillar: 2 }),
    { id: 'nguhanh.headline.bars', kind: 'bars', tags: NO_SPEECH, rows: balance.map((e) => ({ label: `${e} · ${TEN_GOD_VI[tenGodOf(dm, e)]}${tags[e] ? ' · ' + tags[e] : ''}`, pct: Math.round(a.score.shares[e] * 100) })) },
    p('nguhanh.headline.sens', sensitivityNote(a.chart, ug.dung)),
  ]);

  // 2b. Mô hình cân bằng (tuỳ chọn, gập sẵn): hình 5 nút và xếp hạng "can thiệp tối thiểu"
  sec('balance', 'Mô hình cân bằng 5 hành (tuỳ chọn)', [cycleBlock(a.score.shares, ug.dung, tags), ...balanceBlocks(a.score.shares, ug.dung, o.balanceMode, o.balanceTarget === 'la-so' ? { dayMaster: dm, strength: a.dayMaster.strength, climate: seasonClimate(a.chart.month.branch) } : undefined)]);

  // 3. Vì sao ra kết quả này (cả phần trăm của trọng số)
  const why = reasons(reading, ctx);
  if (a.readings.length > 1) why.push(`Trọng số các cách luận: ${a.readings.map((r) => `${readingLabel(r)} ${pc(r.weight)}`).join(', ')}.`);
  sec('why', 'Vì sao ra kết quả này', [{ ...list('nguhanh.why.list', why), tags: NO_SPEECH }]);

  // 4. Tòng cách (4 điều kiện)
  const pat = patternSummary(a, ctx);
  if (pat) {
    sec('pattern', 'Kiểm tra cách cục đặc biệt', [
      p('nguhanh.pattern.summary', pat.summary),
      {
        id: 'nguhanh.pattern.table', kind: 'table', tags: NO_SPEECH, head: ['Câu hỏi', 'Tên chuyên môn', 'Kết quả', 'Chi tiết'],
        rows: pat.checks.map((c) => [parseRich(c.ask), parseRich(c.term), parseRich(c.status), parseRich(c.detail)]),
      },
    ]);
  }

  // 5. Cách luận khác
  if (other) {
    const ou = other.usefulGod;
    sec('alt', 'Cách luận khác', [
      p('nguhanh.alt.0', `Hiện ${weightPhrase(reading.weight)} <b>${readingLabel(reading)}</b>. Cách luận còn lại, <b>${readingLabel(other)}</b>, chọn Dụng thần ${ou.dung}, Hỷ thần ${ou.hy}, Kỵ thần ${ou.ky}.`),
      p('nguhanh.alt.1', differenceText(reading, other)),
    ]);
  }

  // 6. Chiến lược theo Thập Thần
  const tg = TEN_GOD_PRACTICAL[dungRole];
  sec('strategy', `Chiến lược: phát huy ${TEN_GOD_VI[dungRole]}`, [p('nguhanh.strategy.0', tg.asUseful), list('nguhanh.strategy.actions', tg.actions)]);

  // 7. Thói quen và công việc cho hành cần bổ sung
  sec('strengthen', 'Việc nên làm đều đặn', [ug.dung, ug.hy].flatMap((e, i): Block[] => {
    const ep = ELEMENT_PRACTICAL[e];
    return [
      p(`nguhanh.strengthen.${i}.q`, `<b>${e}</b> — ${ep.quality}.`),
      { ...list(`nguhanh.strengthen.${i}.habits`, ep.habits), tags: NO_SPEECH },
      { ...p(`nguhanh.strengthen.${i}.work`, `Lĩnh vực hợp với hành này: ${ep.work.join('; ')}.`), tags: NO_SPEECH },
    ];
  }));

  // 8. Hành dư cần tiết chế và điều cần cân nhắc
  const moderate = (['Mộc', 'Hoả', 'Thổ', 'Kim', 'Thuỷ'] as Element[])
    .filter((e) => e !== ug.dung && e !== ug.hy)
    .filter((e) => a.score.shares[e] >= 0.35 || ((e === ug.ky || e === ug.cuu) && a.score.shares[e] >= 0.25));
  const caution: Block[] = [p('nguhanh.caution.0', `<b>${TEN_GOD_VI[kyRole]}</b> (${ug.ky}) là điểm cần cân nhắc: ${TEN_GOD_PRACTICAL[kyRole].asHarmful}`)];
  moderate.forEach((e, i) => caution.push(p(`nguhanh.caution.m${i}`, `Hành ${e} đang nhiều: dễ ${ELEMENT_PRACTICAL[e].excessSigns}. Cách điều tiết: ${ELEMENT_PRACTICAL[e].excessFix}.`)));
  sec('caution', 'Điều cần cân nhắc', caution);

  // 9. Giai đoạn: Đại Vận hiện tại và các năm tới
  const timing: Block[] = [];
  const age = ageInYear(a.chart, o.nowYear);
  const dvIdx = Math.floor((age - a.chart.khoiVanYears) / 10);
  if (dvIdx >= 0 && dvIdx < a.chart.daiVan.length) {
    const ev = evaluatePeriod(a.chart.daiVan[dvIdx], ug), s = daiVanYears(a.chart, dvIdx), t = timingLabel(ev.favor);
    timing.push(p('nguhanh.timing.dv', `Đại Vận hiện tại <b>${canChi(a.chart.daiVan[dvIdx])}</b> (${s.fromAge}–${s.toAge} tuổi): <b>${t.label}</b> — ${t.hint}.`));
  }
  const yearChips = Array.from({ length: o.years ?? 5 }, (_, i) => {
    const y = o.nowYear + i, pl = pillarOfYear(y), ev = evaluatePeriod(pl, ug), t = timingLabel(ev.favor);
    const alt = other ? ` (cách luận khác: ${FAVOR_LABEL[evaluatePeriod(pl, other.usefulGod).favor]})` : '';
    return { chip: { text: `${y} ${canChi(pl)}: ${t.label}`, tone: t.tone }, line: `${y}: ${t.label} — ${t.hint}${alt}.` };
  });
  timing.push({ id: 'nguhanh.timing.chips', kind: 'chips', chips: yearChips.map((x) => x.chip) });
  timing.push(list('nguhanh.timing.list', yearChips.map((x) => x.line)));
  timing.push(note('nguhanh.timing.note', 'Năm tính theo Lập Xuân (khoảng đầu tháng 2 dương lịch). Nhãn chỉ để gợi ý cách sắp xếp nhịp làm việc, không phải lời báo trước.'));
  if (cmp?.match === 'nguoc') timing.push(note('nguhanh.timing.legacy', LEGACY_TIMING_NOTE));
  sec('timing', 'Giai đoạn hiện tại và các năm tới', timing);

  // 10. Ghi chú phụ
  const notes = secondaryNotes(reading, ctx);
  if (a.resolution) notes.unshift(`Kiểm chứng bằng quá khứ: ${resolutionText(a.resolution, a)}`);
  if (notes.length) sec('notes', 'Ghi chú thêm', [{ ...list('nguhanh.notes.list', notes), tags: NO_SPEECH }]);

  // 11. Kết: lời nhắc văn hoá và giải thích nguồn màu, hướng
  sec('closing', '', [note('nguhanh.closing.0', CLOSING_NOTE), note('nguhanh.closing.color', COLOR_SOURCE_NOTE), note('nguhanh.closing.disclaimer', DISCLAIMER)]);
  return out;
}

/** Điểm khác biệt chính giữa hai cách luận (hành bị đảo chiều). */
export function differenceText(a: Reading, b: Reading): string {
  const hanh: Element[] = ['Mộc', 'Hoả', 'Thổ', 'Kim', 'Thuỷ'];
  const good = (u: Reading['usefulGod'], e: Element) => e === u.dung || e === u.hy;
  const bad = (u: Reading['usefulGod'], e: Element) => e === u.ky || e === u.cuu;
  const flipped = hanh.filter((e) => (good(a.usefulGod, e) && bad(b.usefulGod, e)) || (bad(a.usefulGod, e) && good(b.usefulGod, e)));
  if (!flipped.length) return 'Hai cách luận khác nhau về mức độ nhưng không đảo chiều hành nào.';
  return `Hai cách luận đánh giá NGƯỢC nhau về ${flipped.join(', ')}: năm hay giai đoạn có các hành này sẽ thuận theo cách này nhưng kém thuận theo cách kia. Đây là chỗ cần kiểm chứng.`;
}

/** Nét và nghề của nhóm Thập Thần nổi bật dùng lại nguyên văn từ legacy (FAMILY), không chép lại. */
export const familyNet = (g: keyof typeof TEN_GOD_VI): string => {
  const map = { TyKiep: 'Tỷ Kiếp', An: 'Ấn', ThucThuong: 'Thực Thương', Tai: 'Tài', QuanSat: 'Quan Sát' } as const;
  return FAMILY[map[g]].net;
};

