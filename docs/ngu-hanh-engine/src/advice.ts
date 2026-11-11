/**
 * Lớp diễn giải thực tế: chuyển kết quả kỹ thuật (điểm, dụng thần) thành lời khuyên
 * người dùng làm được.
 *
 * Nguyên tắc diễn giải (để app không "phán" kiểu dọa dẫm):
 *  1. Ưu tiên HÀNH VI > ĐỊNH HƯỚNG CÔNG VIỆC > MÔI TRƯỜNG > VẬT PHẨM.
 *     Màu sắc, hướng ngồi chỉ là lớp nhắc nhở biểu tượng, chi phí thấp, đặt cuối.
 *  2. Diễn giải qua Thập thần (vai trò của hành với bản thân) thay vì chỉ qua tên hành,
 *     vì đó là chỗ ngũ hành chạm vào đời sống: học hỏi, tiền bạc, kỷ luật, sáng tạo, quan hệ.
 *  3. Không đưa lời khuyên y tế, đầu tư cụ thể; không khẳng định định mệnh.
 */

import { BRANCHES, BRANCH_VI, ELEMENT_VI, ELEMENTS, STEMS, STEM_VI, TEN_GOD_VI, tenGodOf, type Element, type TenGodGroup } from "./data.ts";
import { METHOD_VI, STRENGTH_VI, evaluatePeriod, pct, type Analysis, type Favor, type Pillar, type Reading, type Resolution, type UsefulGod } from "./engine.ts";
import { FOLLOW_GRADE_VI } from "./follow.ts";

interface ElementPractical {
  quality: string;      // năng lực / phẩm chất tượng trưng
  habits: string[];     // thói quen bổ sung hành này
  work: string[];       // lĩnh vực, vai trò
  environment: string;  // màu, hướng, chất liệu — lớp biểu tượng
  excessSigns: string;  // biểu hiện khi hành này quá dư
  excessFix: string;    // cách điều tiết khi dư
}

export const ELEMENT_PRACTICAL: Record<Element, ElementPractical> = {
  Moc: {
    quality: "tăng trưởng, học hỏi, kế hoạch dài hạn, lòng nhân",
    habits: [
      "Đặt một mục tiêu học tập dài hạn (khóa học, chứng chỉ) và theo dõi tiến độ hàng tuần",
      "Vận động ngoài trời buổi sáng, đi bộ nơi có cây xanh",
      "Viết kế hoạch 3–6 tháng, chia thành mốc nhỏ",
    ],
    work: ["giáo dục, đào tạo", "xuất bản, nội dung", "thiết kế, kiến trúc", "nông nghiệp, sản phẩm xanh", "phát triển sản phẩm giai đoạn đầu"],
    environment: "màu xanh lá; hướng Đông; chất liệu gỗ; cây xanh trong phòng làm việc",
    excessSigns: "ôm nhiều việc cùng lúc, dàn trải, cố chấp với ý tưởng của mình",
    excessFix: "chốt phạm vi trước khi mở việc mới; dùng quy trình và hạn chót (Kim) để cắt tỉa",
  },
  Hoa: {
    quality: "thể hiện, truyền cảm hứng, nhiệt huyết, tầm nhìn",
    habits: [
      "Chủ động trình bày ý tưởng: viết bài, thuyết trình, chia sẻ công việc công khai",
      "Duy trì một hoạt động tạo hứng khởi (thể thao đồng đội, sự kiện, cộng đồng)",
      "Ra ngoài nắng sáng, giữ nơi làm việc đủ sáng",
    ],
    work: ["truyền thông, marketing", "bán hàng, đào tạo kỹ năng mềm", "giải trí, sự kiện", "năng lượng, điện, ánh sáng", "vai trò đại diện, đối ngoại"],
    environment: "màu đỏ, cam, tím; hướng Nam; ánh sáng ấm",
    excessSigns: "nóng vội, quyết định theo cảm xúc, hứng nhanh bỏ nhanh",
    excessFix: "quy tắc 'ngủ một đêm trước quyết định lớn'; ghi chép, đo lường kết quả (Thổ) để giữ nhịp",
  },
  Tho: {
    quality: "ổn định, tin cậy, tích lũy, trung gian kết nối",
    habits: [
      "Giữ nếp sinh hoạt cố định: giờ ngủ, giờ làm, ngân sách tháng",
      "Tích lũy đều đặn thay vì làm theo đợt",
      "Chăm sóc nhà cửa, không gian sống gọn gàng, ấm cúng",
    ],
    work: ["vận hành, hành chính, quản lý dự án", "bất động sản, xây dựng", "nông sản, thực phẩm", "dịch vụ khách hàng, vai trò trung gian", "kế toán quản trị"],
    environment: "màu vàng, nâu đất; vị trí trung tâm; gốm sứ, đá",
    excessSigns: "trì trệ, ngại thay đổi, ôm đồm trách nhiệm, chậm ra quyết định",
    excessFix: "đặt mốc thử nghiệm điều mới mỗi quý (Mộc); chia việc thay vì gánh hết",
  },
  Kim: {
    quality: "kỷ luật, quyết đoán, chuẩn mực, cắt bỏ cái thừa",
    habits: [
      "Viết quy trình/checklist cho việc lặp lại",
      "Dọn dẹp, tối giản: mỗi tuần loại bỏ một thứ không cần",
      "Đặt tiêu chuẩn chất lượng rõ ràng và tự review trước khi giao",
    ],
    work: ["tài chính, ngân hàng, kiểm soát", "pháp chế, tuân thủ, kiểm toán", "kỹ thuật, cơ khí, phần cứng", "QA/QC, bảo mật", "quản trị rủi ro"],
    environment: "màu trắng, xám, ánh kim; hướng Tây; đồ kim loại, bàn làm việc gọn",
    excessSigns: "cứng nhắc, khắt khe với mình và người khác, dễ đứt gãy quan hệ",
    excessFix: "lắng nghe trước khi kết luận; tham gia hoạt động mềm, sáng tạo (Thủy) để giải tỏa",
  },
  Thuy: {
    quality: "trí tuệ, linh hoạt, lưu thông, thích nghi",
    habits: [
      "Đọc và tổng hợp thông tin đều đặn, ghi chú kiến thức",
      "Mở rộng mạng lưới: gặp người mới, đi đây đi đó",
      "Ngủ đủ, nghỉ ngơi có chủ đích, uống đủ nước",
    ],
    work: ["CNTT, dữ liệu, nghiên cứu", "logistics, vận tải, thương mại", "du lịch, xuất nhập khẩu", "tư vấn, môi giới", "truyền thông số"],
    environment: "màu đen, xanh dương; hướng Bắc; yếu tố nước, kính",
    excessSigns: "thiếu định hướng, nghĩ nhiều làm ít, dễ thay đổi theo hoàn cảnh",
    excessFix: "chọn một mục tiêu chính và cam kết thời hạn; cấu trúc hóa tuần làm việc (Thổ)",
  },
};

interface TenGodPractical { asUseful: string; asHarmful: string; actions: string[] }

/** Diễn giải thập thần: đây là lớp chạm vào đời sống thực tế nhiều nhất */
export const TEN_GOD_PRACTICAL: Record<TenGodGroup, TenGodPractical> = {
  TyKiep: {
    asUseful: "Sức mạnh đến từ bản thân và đồng đội. Nên xây đội nhóm, cộng sự, mạng lưới ngang hàng; tự tin đứng tên việc của mình.",
    asHarmful: "Dễ cạnh tranh, bị chia phần, góp vốn hùn hạp dễ thiệt. Cẩn trọng khi hợp tác tiền bạc, cần hợp đồng rõ ràng.",
    actions: ["Tìm cộng sự bù trừ năng lực", "Tham gia cộng đồng nghề nghiệp", "Rèn sức bền thể chất"],
  },
  An: {
    asUseful: "Được nâng đỡ qua học vấn, người thầy, tổ chức che chở. Nên đầu tư học thêm, bằng cấp, tìm mentor.",
    asHarmful: "Dễ ỷ lại, học mãi không làm, chần chừ hành động. Cần chuyển kiến thức thành sản phẩm cụ thể.",
    actions: ["Học một chứng chỉ chuyên môn", "Tìm 1–2 người hướng dẫn", "Làm việc trong tổ chức có hệ thống đào tạo"],
  },
  ThucThuong: {
    asUseful: "Thành công đến từ thể hiện và sáng tạo: làm sản phẩm, viết, dạy, nói. Nên có 'đầu ra' công khai đều đặn.",
    asHarmful: "Dễ tiêu hao sức, nói nhiều làm mệt, va chạm cấp trên, chi tiêu theo cảm hứng.",
    actions: ["Xây sản phẩm/portfolio cá nhân", "Chia sẻ chuyên môn công khai", "Biến kỹ năng thành dịch vụ"],
  },
  Tai: {
    asUseful: "Hợp với hành động hướng kết quả, kinh doanh, quản lý nguồn lực. Nên đặt mục tiêu thu nhập cụ thể và quản lý dòng tiền.",
    asHarmful: "Dễ bị tiền bạc, công việc vật chất kéo quá sức. Ưu tiên giữ sức khỏe và không mở rộng quá năng lực.",
    actions: ["Lập ngân sách và theo dõi dòng tiền", "Thử một kênh thu nhập phụ quy mô nhỏ", "Học kỹ năng đàm phán, bán hàng"],
  },
  QuanSat: {
    asUseful: "Hợp với môi trường có cấu trúc, trách nhiệm, chức danh. Áp lực vừa phải giúp phát triển; nên nhận vai trò quản lý, tuân thủ quy chuẩn.",
    asHarmful: "Áp lực, kiểm soát, cấp trên khắt khe dễ gây căng thẳng. Cần ranh giới rõ, tránh nhận quá nhiều trách nhiệm cùng lúc.",
    actions: ["Nhận một vai trò có trách nhiệm rõ ràng", "Xây kỷ luật cá nhân bằng lịch cố định", "Làm việc trong tổ chức có quy chế minh bạch"],
  },
};

const FAVOR_VI: Record<Favor, string> = {
  "rat-tot": "Rất thuận", tot: "Thuận", binh: "Bình thường", xau: "Kém thuận", "rat-xau": "Cần thận trọng",
};

const FAVOR_HINT: Record<Favor, string> = {
  "rat-tot": "phù hợp khởi động việc lớn, mở rộng, ra quyết định quan trọng",
  tot: "phù hợp tiến hành kế hoạch đã chuẩn bị",
  binh: "giữ nhịp, củng cố nền tảng",
  xau: "ưu tiên phòng thủ, học hỏi, chuẩn bị; tránh mạo hiểm lớn",
  "rat-xau": "giữ an toàn, giảm cam kết rủi ro, chăm sóc sức khỏe và quan hệ",
};

/** Can chi năm dương lịch (tính theo năm, chưa xét mốc Lập Xuân ~4/2) */
export function yearPillar(year: number): Pillar {
  return { stem: STEMS[(((year - 4) % 10) + 10) % 10], branch: BRANCHES[(((year - 4) % 12) + 12) % 12] };
}

export interface PracticalReport {
  /** Cách luận đang dùng cho báo cáo này và trọng số của nó */
  reading: { id: Reading["id"]; label: string; weight: number };
  headline: string;
  balance: Array<{ element: Element; name: string; share: string; role: string; tag: "dung" | "hy" | "ky" | "cuu" | "" }>;
  why: string[];
  strategy: { title: string; text: string; actions: string[] };
  toStrengthen: Array<{ element: string; quality: string; habits: string[]; work: string[]; environment: string }>;
  toModerate: Array<{ element: string; signs: string; fix: string }>;
  caution: string;
  timing: Array<{ year: number; canChi: string; favor: string; hint: string; altFavor?: string }>;
  notes: string[];
  /** Kết quả kiểm tra Tòng cách / Chuyên vượng (nếu lá số có dấu hiệu) */
  pattern?: {
    typeName: string;
    grade: string;
    confidence: string;
    summary: string;
    checks: Array<{ label: string; status: "Đạt" | "Đạt một phần" | "Không đạt"; detail: string }>;
    breakers: string[];
  };
  /** Cách luận thay thế (khi Giả tòng hoặc Chân tòng còn trọng số đáng kể) */
  alternative?: {
    label: string;
    weight: string;
    headline: string;
    strategy: string;
    keyDifference: string;
  };
  /** Câu hỏi về các năm đã qua để phân xử giữa hai cách luận */
  verification?: VerificationSet;
  disclaimer: string;
}

export interface VerificationQuestion {
  year: number;
  canChi: string;
  predictions: Array<{ readingId: Reading["id"]; label: string; favor: string; score: number }>;
  question: string;
}
export interface VerificationSet { instruction: string; questions: VerificationQuestion[] }

export interface ReportOptions {
  fromYear?: number;
  years?: number;
  /** Năm sinh (dương lịch) — để câu hỏi kiểm chứng chỉ hỏi những năm người dùng đã trưởng thành */
  birthYear?: number;
  /** Dựng báo cáo theo cách luận khác cách chính (vd. người dùng chọn xem cách luận thay thế) */
  readingId?: Reading["id"];
}

export function buildPracticalReport(a: Analysis, opts: ReportOptions = {}): PracticalReport {
  const { dayMaster: dmi, score } = a;
  const reading = (opts.readingId && a.readings.find((r) => r.id === opts.readingId)) || a.readings[0];
  const other = a.readings.find((r) => r !== reading);
  const ug = reading.usefulGod;
  const dm = dmi.dayMaster;
  const tag = (e: Element): PracticalReport["balance"][number]["tag"] =>
    e === ug.dung ? "dung" : e === ug.hy ? "hy" : e === ug.ky ? "ky" : e === ug.cuu ? "cuu" : "";

  const balance = [...ELEMENTS]
    .sort((x, y) => score.shares[y] - score.shares[x])
    .map((e) => ({ element: e, name: ELEMENT_VI[e], share: pct(score.shares[e]), role: TEN_GOD_VI[tenGodOf(dm, e)], tag: tag(e) }));

  const dungRole = tenGodOf(dm, ug.dung);
  const kyRole = tenGodOf(dm, ug.ky);

  // Hành dư cần tiết chế: hành chiếm tỷ lệ cao nhất nếu nó là kỵ/cừu thần hoặc vượt 35%
  const toModerate = ELEMENTS
    .filter((e) => e !== ug.dung && e !== ug.hy)
    .filter((e) => (score.shares[e] >= 0.35) || ((e === ug.ky || e === ug.cuu) && score.shares[e] >= 0.25))
    .map((e) => ({ element: ELEMENT_VI[e], signs: ELEMENT_PRACTICAL[e].excessSigns, fix: ELEMENT_PRACTICAL[e].excessFix }));

  const fromYear = opts.fromYear ?? new Date().getFullYear();
  const timing = Array.from({ length: opts.years ?? 5 }, (_, i) => {
    const y = fromYear + i;
    const p = yearPillar(y);
    const ev = evaluatePeriod(p, ug);
    const alt = other ? FAVOR_VI[evaluatePeriod(p, other.usefulGod).favor] : undefined;
    return { year: y, canChi: `${STEM_VI[p.stem]} ${BRANCH_VI[p.branch]}`, favor: FAVOR_VI[ev.favor], hint: FAVOR_HINT[ev.favor], ...(alt ? { altFavor: alt } : {}) };
  });

  const notes = ug.secondary.map((s) => `${METHOD_VI[s.method]}: ${s.reason}`);

  const fa = a.follow;
  const pattern: PracticalReport["pattern"] = fa ? {
    typeName: fa.typeName,
    grade: FOLLOW_GRADE_VI[fa.grade],
    confidence: pct(fa.confidence),
    summary: fa.summary,
    checks: fa.checks.map((c) => ({
      label: c.label,
      status: c.score === 1 ? "Đạt" : c.score > 0 ? "Đạt một phần" : "Không đạt",
      detail: c.detail,
    })),
    breakers: fa.breakers.map((e) => ELEMENT_VI[e]),
  } : undefined;

  const alternative: PracticalReport["alternative"] = other ? {
    label: other.label,
    weight: pct(other.weight),
    headline: `Dụng ${ELEMENT_VI[other.usefulGod.dung]}, hỷ ${ELEMENT_VI[other.usefulGod.hy]}, kỵ ${ELEMENT_VI[other.usefulGod.ky]}`,
    strategy: `${TEN_GOD_VI[tenGodOf(dm, other.usefulGod.dung)]}: ${TEN_GOD_PRACTICAL[tenGodOf(dm, other.usefulGod.dung)].asUseful}`,
    keyDifference: describeDifference(ug, other.usefulGod),
  } : undefined;

  // Đã phân định bằng câu trả lời → không hỏi lại; chưa phân định → hỏi các năm chưa trả lời
  const answered = new Set(a.resolution?.answers.map((x) => x.year) ?? []);
  const verification = other && !a.resolution?.decided
    ? (() => {
        const v = verificationQuestions(a, fromYear, { birthYear: opts.birthYear, max: 4 + answered.size });
        return { ...v, questions: v.questions.filter((q) => !answered.has(q.year)).slice(0, 4) };
      })()
    : undefined;
  if (a.resolution) notes.unshift(`Kiểm chứng bằng quá khứ: ${a.resolution.conclusion}`);

  return {
    reading: { id: reading.id, label: reading.label, weight: reading.weight },
    headline: `Nhật chủ ${ELEMENT_VI[dm]} — ${STRENGTH_VI[dmi.strength]}. Hành cần bổ sung: ${ELEMENT_VI[ug.dung]} (hỗ trợ: ${ELEMENT_VI[ug.hy]}); hạn chế: ${ELEMENT_VI[ug.ky]}.`,
    balance,
    why: [`Phương pháp: ${METHOD_VI[ug.method]}`, ...ug.reasons],
    strategy: {
      title: `Chiến lược sống: phát huy ${TEN_GOD_VI[dungRole]}`,
      text: TEN_GOD_PRACTICAL[dungRole].asUseful,
      actions: TEN_GOD_PRACTICAL[dungRole].actions,
    },
    toStrengthen: [ug.dung, ug.hy].map((e) => ({
      element: ELEMENT_VI[e],
      quality: ELEMENT_PRACTICAL[e].quality,
      habits: ELEMENT_PRACTICAL[e].habits,
      work: ELEMENT_PRACTICAL[e].work,
      environment: ELEMENT_PRACTICAL[e].environment,
    })),
    toModerate,
    caution: `${TEN_GOD_VI[kyRole]} (${ELEMENT_VI[ug.ky]}) là điểm cần cân nhắc: ${TEN_GOD_PRACTICAL[kyRole].asHarmful}`,
    timing,
    notes,
    ...(pattern ? { pattern } : {}),
    ...(alternative ? { alternative } : {}),
    ...(verification && verification.questions.length ? { verification } : {}),
    disclaimer:
      "Kết quả dựa trên hệ trọng số quy ước của một trường phái Tử Bình, không phải phép đo khoa học. " +
      "Nên xem như gợi ý để tự soi xét và định hướng thói quen; các quyết định về sức khỏe, tài chính, pháp lý cần ý kiến chuyên môn.",
  };
}

// ───────────────────────── Phân xử giữa các cách luận ─────────────────────────

function describeDifference(a: UsefulGod, b: UsefulGod): string {
  const flipped = ELEMENTS.filter((e) => {
    const good = (u: UsefulGod) => e === u.dung || e === u.hy;
    const bad = (u: UsefulGod) => e === u.ky || e === u.cuu;
    return (good(a) && bad(b)) || (bad(a) && good(b));
  });
  if (!flipped.length) return "Hai cách luận khác nhau về mức độ nhưng không đảo chiều hành nào.";
  return `Hai cách luận đánh giá NGƯỢC nhau về ${flipped.map((e) => ELEMENT_VI[e]).join(", ")}: ` +
    "năm hoặc giai đoạn có các hành này sẽ là tốt theo cách này nhưng xấu theo cách kia. Đây là chỗ cần kiểm chứng.";
}

const OUTCOME_VI = { tot: "thuận lợi", binh: "bình thường", xau: "khó khăn" } as const;

/**
 * Chọn các năm đã qua mà hai cách luận dự đoán NGƯỢC chiều nhau nhiều nhất,
 * để hỏi người dùng "năm đó thế nào?". Đây là cách các thầy vẫn làm: kiểm chứng
 * lá số bằng quá khứ trước khi luận tương lai.
 */
export function verificationQuestions(
  a: Analysis,
  fromYear: number,
  opts: { birthYear?: number; lookback?: number; max?: number } = {},
): VerificationSet {
  const [r0, r1] = a.readings;
  const instruction =
    "Trả lời các năm dưới đây là thuận lợi, bình thường hay khó khăn (xét chung công việc, sức khỏe, gia đình). " +
    "Các năm này được chọn vì hai cách luận dự đoán ngược nhau, nên câu trả lời giúp xác định cách luận đúng.";
  if (!r1) return { instruction, questions: [] };

  const lookback = opts.lookback ?? 20;
  const minYear = Math.max(fromYear - lookback, opts.birthYear ? opts.birthYear + 15 : -Infinity);
  const candidates: Array<VerificationQuestion & { diff: number }> = [];
  for (let y = fromYear - 1; y >= minYear; y--) {
    const p = yearPillar(y);
    const e0 = evaluatePeriod(p, r0.usefulGod), e1 = evaluatePeriod(p, r1.usefulGod);
    const opposite = (e0.score >= 0.35 && e1.score <= -0.35) || (e0.score <= -0.35 && e1.score >= 0.35);
    if (!opposite) continue;
    const canChi = `${STEM_VI[p.stem]} ${BRANCH_VI[p.branch]}`;
    candidates.push({
      year: y,
      canChi,
      diff: Math.abs(e0.score - e1.score),
      predictions: [
        { readingId: r0.id, label: r0.label, favor: FAVOR_VI[e0.favor], score: e0.score },
        { readingId: r1.id, label: r1.label, favor: FAVOR_VI[e1.favor], score: e1.score },
      ],
      question: `Năm ${y} (${canChi}) với anh/chị nhìn chung là thuận lợi, bình thường hay khó khăn?`,
    });
  }
  const questions = candidates
    .sort((x, y) => y.diff - x.diff)
    .slice(0, opts.max ?? 4)
    .sort((x, y) => y.year - x.year)
    .map(({ diff: _d, ...q }) => q);
  return { instruction, questions };
}

export interface FeedbackAnswer { year: number; outcome: "tot" | "binh" | "xau" }

/**
 * Cập nhật trọng số các cách luận từ câu trả lời của người dùng (cập nhật kiểu Bayes đơn giản).
 * Mỗi câu trả lời nhân trọng số của cách luận với exp(k × mức khớp), rồi chuẩn hóa.
 * Trả về readings mới (đã sắp xếp) — đưa vào analysis rồi gọi lại buildPracticalReport.
 */
export function resolveWithFeedback(a: Analysis, answers: FeedbackAnswer[], k = 0.7) {
  const outcomeValue = { tot: 1, binh: 0, xau: -1 } as const;
  const log: string[] = [];
  const logW = a.readings.map((r) => Math.log(Math.max(r.weight, 1e-3)));
  const wins = a.readings.map(() => 0);

  for (const ans of answers) {
    const p = yearPillar(ans.year);
    const o = outcomeValue[ans.outcome];
    const parts: string[] = [];
    const agrees = a.readings.map((r, i) => {
      const s = evaluatePeriod(p, r.usefulGod).score;
      // Năm "bình thường" ủng hộ cách luận dự đoán gần 0; năm tốt/xấu ủng hộ cách luận cùng dấu.
      // Kẹp ±1 để một năm không quyết định tất cả (trí nhớ về một năm có thể sai).
      const agree = Math.max(-1, Math.min(1, o === 0 ? -Math.abs(s) * 0.5 : o * s));
      logW[i] += k * agree;
      parts.push(`${r.label} dự đoán ${FAVOR_VI[evaluatePeriod(p, r.usefulGod).favor].toLowerCase()}`);
      return agree;
    });
    const best = agrees.indexOf(Math.max(...agrees));
    if (agrees.filter((x) => x === agrees[best]).length === 1) wins[best]++;
    log.push(`${ans.year}: thực tế ${OUTCOME_VI[ans.outcome]} — ${parts.join("; ")}`);
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
  const matchRate = answers.length ? topWins / answers.length : 0;
  // Kết luận khi: đủ 3 năm, trọng số ≥ 80% VÀ cách luận đó khớp ≥ 75% số năm (tránh 2 đúng 1 sai mà vẫn "chắc chắn")
  const decided = answers.length >= 3 && top.weight >= 0.8 && matchRate >= 0.75;
  const conclusion = decided
    ? `Các năm đã qua khớp với "${top.label}" (${topWins}/${answers.length} năm, trọng số ${pct(top.weight)}). Có thể dùng cách luận này làm chính.`
    : answers.length < 3
      ? "Chưa đủ dữ liệu: cần ít nhất 3 năm để kết luận."
      : `Chưa phân định rõ ("${top.label}" khớp ${topWins}/${answers.length} năm, trọng số ${pct(top.weight)}). Nên trả lời thêm năm hoặc nhờ người luận xem trực tiếp.`;

  const allAnswers = [...(a.resolution?.answers ?? []), ...answers];
  const resolution: Resolution = { decided, conclusion, answers: allAnswers, log };
  return { analysis: { ...a, readings, usefulGod: top.usefulGod, resolution }, decided, conclusion, log };
}
