/**
 * Sinh docs/NGU-HANH.md từ src/content/nguhanh: tài liệu để chủ dự án đọc duyệt câu chữ mục "Phân tích ngũ hành" (bước 3C.3).
 * Chạy từ gốc repo: npm run doc:nguhanh. Câu chữ nằm trong src/content/nguhanh; muốn sửa câu nào thì sửa ở đó rồi chạy lại lệnh này.
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { batTuChart, batTuReading } from '../src/core/index';
import { analyze, compareWithLegacy, resolveWithFeedback, toNguHanhChart, verificationQuestions, type Msg, type NguHanhAnalysis } from '../src/core/nguhanh/index';
import * as NH from '../src/content/nguhanh/index';
import { NO_SPEECH_TERMS } from '../src/content/noSpeech';
import { sectionPlainText } from '../src/content/rich';

const BT = '`';
const code = (s: string) => BT + s + BT;
let seed = 20261114; const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
const charts = Array.from({ length: 3000 }, () => {
  const yy = 1950 + Math.floor(rnd() * 60), mm = 1 + Math.floor(rnd() * 12), dd = 1 + Math.floor(rnd() * 28), h = Math.floor(rnd() * 12);
  return { input: { gender: 'M', dd, mm, yy, hourIdx: h }, ch: batTuChart({ gender: 'M', dd, mm, yy, hourIdx: h } as never) };
});
const analyses = charts.map((c) => ({ ...c, a: analyze(toNguHanhChart(c.ch)), legacy: batTuReading(c.ch, 2026) }));
const plain = (html: string) => html.replace(/<\/?b>/g, '**').replace(/<br\s*\/?>/g, ' ');
const cell = (s: string) => plain(s).replace(/\|/g, '/').replace(/\n/g, ' ');

// ví dụ câu đầu tiên của mỗi mã engine
const examples = new Map<string, string>();
const walk = (v: unknown, out: Msg[]) => {
  if (Array.isArray(v)) v.forEach((x) => walk(x, out));
  else if (v && typeof v === 'object') { const o = v as Record<string, unknown>; if (typeof o.code === 'string') out.push(o as Msg); Object.values(o).forEach((x) => walk(x, out)); }
};
const resolved: NguHanhAnalysis[] = [];
for (const { a } of analyses) {
  if (a.readings.length > 1) {
    const qs = verificationQuestions(a, { nowYear: 2026, minAge: 18, maxYears: 3, maxDaiVan: 2 });
    for (const n of [0, 4]) resolved.push(resolveWithFeedback(a, qs.slice(0, n).map((q) => ({ target: q.target, outcome: 'tot' as const }))).analysis);
  }
  const ms: Msg[] = []; walk([a.score.trace, a.readings, a.follow], ms);
  for (const m of ms) if (!examples.has(m.code)) examples.set(m.code, NH.msgText(m, NH.renderCtxOf(a)));
}
for (const a of resolved) { const ms: Msg[] = []; walk(a.resolution, ms); for (const m of ms) if (!examples.has(m.code)) examples.set(m.code, NH.msgText(m, NH.renderCtxOf(a))); }
const rare: Msg[] = [{ code: 'momentum.triad', p: { element: 'Hoả' } }, { code: 'momentum.halfTriad', p: { element: 'Thuỷ' } }, { code: 'direction.mixed', p: { top: 'Tai', topValue: 3, second: 'QuanSat', secondValue: 2.5 } }, { code: 'direction.anLed' }, { code: 'resolve.decided', p: { reading: 'thong-thuong', wins: 4, total: 4, weight: 0.9 } }, { code: 'resolve.undecided', p: { reading: 'thuan-the', wins: 2, total: 3, weight: 0.6 } }];
for (const m of rare) if (!examples.has(m.code)) examples.set(m.code, NH.msgText(m));

const lines: string[] = [];
const L = (s = '') => lines.push(s);

L('# Câu chữ mục "Phân tích ngũ hành" (Phase 3C.3)');
L();
L('> **Tài liệu để chủ dự án đọc duyệt, sinh tự động ngày 12/11/2026 bằng ' + code('npm run doc:nguhanh') + '.** Câu chữ nằm trong ' + code('src/content/nguhanh') + '. Muốn sửa câu nào, ghi lại câu mới (hoặc sửa thẳng vào file code tương ứng) rồi chạy lại lệnh trên.');
L('> Đây là NỘI DUNG MỚI, không chép nguyên văn legacy và không thuộc ' + code('tests/parity') + ' (ngoại lệ giống chỉ tay). Giọng "bài học nhỏ", không hù doạ, không hứa hẹn. Quyết định gốc ở ' + code('docs/ARCHITECTURE.md') + ' mục 14.');
L();
L('Phần dùng lại nguyên văn từ legacy, KHÔNG chép ở đây: nét và nghề của 5 nhóm Thập Thần (' + code('FAMILY') + ' trong ' + code('src/content/interp/battu.ts') + '), nghề theo hành (' + code('HANH_INFO.nghe') + ').');
L();
L('## 1. Quy tắc (ARCHITECTURE 14.3, 14.8)');
L();
L('- Mục ngũ hành **không nêu màu, hướng, vật phẩm**. Mỗi màn một nguồn; câu giải thích ba nguồn ở mục 2 dưới đây.');
L('- Không lời khuyên y tế, đầu tư tài chính, pháp lý cụ thể. Câu về sức khoẻ chỉ ở mức thói quen (ngủ đủ, vận động).');
L('- Nhãn năm dùng cách nói mềm và luôn đi kèm gợi ý nên làm gì (mục 3).');
L('- **Danh sách (i) KHÔNG HIỆN** (không được có trong bất kỳ câu mới nào, kể cả chữ chỉ để xem): ' + NH.BANNED_TERMS.join(', ') + '. Có test chặn.');
L('- **Danh sách (ii) KHÔNG ĐỌC** (câu vẫn hiện chữ, Thầy không đọc thành lời) là ' + code('NO_SPEECH_TERMS') + ' ở ' + code('src/content/noSpeech.ts') + ': ' + NO_SPEECH_TERMS.join(', ') + '.');
L('- Khối chỉ để xem chứ không đọc (gắn thẻ ' + code('no-speech') + '): thanh 5 hành và phần trăm, vết tính "Vì sao ra kết quả này", bảng 4 điều kiện, danh sách thói quen và lĩnh vực, ghi chú thêm. Thầy chỉ đọc kết luận, lý do chính và chiến lược (3C.6).');
L();
L('## 2. Lời nhắc cố định');
L();
L('| Vị trí | Câu |');
L('|---|---|');
L('| Đầu mục | ' + cell(NH.INTRO_NOTE) + ' |');
L('| Cuối mục | ' + cell(NH.CLOSING_NOTE) + ' |');
L('| Cuối mục (nguồn màu và hướng) | ' + cell(NH.COLOR_SOURCE_NOTE) + ' |');
L('| Cuối mục (lưu ý) | ' + cell(NH.DISCLAIMER) + ' |');
L('| Mở thẻ kiểm chứng | ' + cell(NH.VERIFICATION_INTRO) + ' |');
L('| Không đủ giai đoạn để hỏi | ' + cell(NH.VERIFICATION_NOT_ENOUGH) + ' |');
L('| Khi hai cách lệch nhau nhiều (dưới mục Giai đoạn) | ' + cell(NH.LEGACY_TIMING_NOTE) + ' |');
L();
L('## 3. Nhãn năm và Đại Vận (cách nói mềm, kèm gợi ý)');
L();
L('| Mức | Nhãn hiện | Gợi ý đi kèm |');
L('|---|---|---|');
for (const f of ['rat-tot', 'tot', 'binh', 'xau', 'rat-xau'] as const) L(`| ${f} | ${NH.FAVOR_LABEL[f]} | ${NH.FAVOR_HINT[f]} |`);
L();
L('Nút trả lời kiểm chứng: ' + (['tot', 'binh', 'xau', 'khong-nho'] as const).map((k) => NH.OUTCOME_LABEL[k]).join(' / ') + '. "Không nhớ" không đổi trọng số.');
L();
L('Cách nói trọng số (không hiện phần trăm ngoài mục "Vì sao"): từ 80% trở lên "' + NH.weightPhrase(0.9) + '"; từ 60% đến dưới 80% "' + NH.weightPhrase(0.7) + '"; dưới 60% "' + NH.weightPhrase(0.5) + '".');
L();
L('## 4. Tên gọi');
L();
L('| Nhóm | Tên hiện |');
L('|---|---|');
L('| Mức vượng nhược | ' + Object.values(NH.STRENGTH_VI).join(' · ') + ' |');
L('| Phương pháp chọn Dụng thần | ' + Object.values(NH.METHOD_VI).join(' · ') + ' |');
L('| Tên cách cục | ' + Object.values(NH.TYPE_VI).join(' · ') + ' |');
L('| Hạng cách cục | ' + Object.values(NH.GRADE_VI).join(' · ') + ' |');
L();
L('Bảng 4 điều kiện Tòng cách (câu hỏi thường ngày, tên chuyên môn nhỏ bên dưới, kết quả: ✓ Đạt, ◐ Một phần, ✗ Không đạt):');
L();
for (const [id, v] of Object.entries(NH.CHECK_QUESTION)) L(`- ${code(id)}: "${v.ask}" (${v.term})`);
L();
L('## 5. Chiến lược theo Thập Thần (vai trò của hành có lợi hoặc cần cân nhắc)');
L();
L('| Nhóm | Khi là hành có lợi | Khi cần cân nhắc | Việc nên làm |');
L('|---|---|---|---|');
for (const [k, v] of Object.entries(NH.TEN_GOD_PRACTICAL)) L(`| ${NH.TEN_GOD_VI[k as keyof typeof NH.TEN_GOD_VI]} | ${v.asUseful} | ${v.asHarmful} | ${v.actions.join('; ')} |`);
L();
L('## 6. Thói quen và cách điều tiết theo hành');
L();
L('| Hành | Phẩm chất | Thói quen bổ sung | Lĩnh vực hợp | Khi quá dư | Cách điều tiết |');
L('|---|---|---|---|---|---|');
for (const [k, v] of Object.entries(NH.ELEMENT_PRACTICAL)) L(`| ${k} | ${v.quality} | ${v.habits.join('; ')} | ${v.work.join('; ')} | ${v.excessSigns} | ${v.excessFix} |`);
L();

// dòng đối chiếu: ví dụ cho mỗi (match, cause)
L('## 7. Dòng đối chiếu với gợi ý sơ bộ (ARCHITECTURE 14.1)');
L();
L('Hiện ngay đầu mục ngũ hành, một ví dụ cho mỗi tình huống.');
L();
const seenCmp = new Set<string>();
for (const { a, legacy } of analyses) {
  const c = compareWithLegacy(legacy, a.usefulGod, a.dayMaster.strength);
  const key = c.match === 'trung' ? 'trung' : `${c.match}/${c.cause}`;
  if (seenCmp.has(key)) continue;
  seenCmp.add(key);
  L(`- **${key}**: ${plain(NH.legacyComparisonText(c, a, legacy))}`);
}
L();
L('## 8. Câu cho từng mã của engine (một ví dụ thật)');
L();
L('Engine chỉ trả mã và số; mỗi mã dưới đây đổi thành câu như sau. Tham số trong câu (hành, can chi, phần trăm) thay đổi theo từng lá số.');
L();
L('| Mã | Ví dụ |');
L('|---|---|');
for (const k of [...examples.keys()].sort()) L(`| ${code(k)} | ${cell(examples.get(k)!)} |`);
L();

// báo cáo đầy đủ cho vài lá số
L('## 9. Báo cáo đầy đủ cho vài lá số');
L();
const pick = (f: (x: (typeof analyses)[number]) => boolean) => analyses.find(f);
const demos: Array<[string, (typeof analyses)[number] | undefined]> = [
  ['Lá số thường', pick((x) => !x.a.follow && compareWithLegacy(x.legacy, x.a.usefulGod, x.a.dayMaster.strength).match === 'gan')],
  ['Lá số đảo chiều so với gợi ý sơ bộ', pick((x) => !x.a.follow && compareWithLegacy(x.legacy, x.a.usefulGod, x.a.dayMaster.strength).match === 'nguoc')],
  ['Lá số Giả tòng (hai cách luận)', pick((x) => x.a.follow?.grade === 'gia')],
];
for (const [title, d] of demos) {
  if (!d) continue;
  const i = d.input;
  L(`### ${title} (sinh ${i.dd}/${i.mm}/${i.yy}, giờ thứ ${i.hourIdx + 1} trong 12 giờ)`);
  L();
  for (const s of NH.practicalReport(d.a, { nowYear: 2026, legacy: d.legacy })) {
    const text = sectionPlainText(s).split('\n').filter(Boolean).map((t) => '> ' + t.replace(/\*/g, '')).join('\n>\n');
    L(text); L();
  }
}
L('## 10. Việc cần chủ dự án duyệt');
L();
L('1. Giọng văn các mục 2 đến 8: có đủ mềm, không hù doạ, không hứa hẹn?');
L('2. Nhãn năm "Nên chậm lại, củng cố" và "Nên giữ chắc, chuẩn bị kỹ" (mục 3).');
L('3. Câu giải thích nguồn màu và hướng (mục 2) và câu đối chiếu khi hai cách tính ngược nhau (mục 7).');
L('4. Danh sách từ KHÔNG HIỆN (mục 1): thiếu từ nào cần chặn thêm?');
L('Duyệt xong mới sang bước 3C.4 (giao diện).');

writeFileSync(fileURLToPath(new URL('../docs/NGU-HANH.md', import.meta.url)), lines.join('\n') + '\n');
console.log('Đã ghi docs/NGU-HANH.md', lines.length, 'dòng');
