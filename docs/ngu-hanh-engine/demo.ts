/**
 * Chạy: npm run demo   (Node ≥ 22.18, tự strip type TS)
 * Lá số mẫu là giả định để minh họa, không phải của người thật.
 */
import {
  analyze, buildPracticalReport, resolveWithFeedback, ELEMENT_VI,
  type Chart, type PracticalReport,
} from "./src/index.ts";

const samples: Array<{ label: string; chart: Chart }> = [
  {
    label: "1 — Bính Hỏa, toàn Thủy/Kim, không gốc (kỳ vọng: Chân Tòng Sát)",
    chart: {
      year: { stem: "Nham", branch: "Than" }, month: { stem: "Nham", branch: "Ty" },
      day: { stem: "Binh", branch: "Ty" }, hour: { stem: "Mau", branch: "Ty" },
    },
  },
  {
    label: "2 — Bính Hỏa ngồi Thìn (Ất trung khí) (kỳ vọng: Giả tòng)",
    chart: {
      year: { stem: "Nham", branch: "Than" }, month: { stem: "Nham", branch: "Ty" },
      day: { stem: "Binh", branch: "Thin" }, hour: { stem: "Mau", branch: "Ty" },
    },
  },
  {
    label: "3 — Bính Hỏa có Ất Mùi giờ (kỳ vọng: Không thành, luận thân nhược)",
    chart: {
      year: { stem: "Nham", branch: "Than" }, month: { stem: "Nham", branch: "Ty" },
      day: { stem: "Binh", branch: "Ty" }, hour: { stem: "At", branch: "Mui" },
    },
  },
  {
    label: "4 — Giáp Mộc tháng Dần, Hợi-Mão, không Kim (kỳ vọng: Khúc Trực)",
    chart: {
      year: { stem: "Quy", branch: "Hoi" }, month: { stem: "Giap", branch: "Dan" },
      day: { stem: "Giap", branch: "Thin" }, hour: { stem: "Dinh", branch: "Mao" },
    },
  },
  {
    label: "5 — Canh Kim tháng Ngọ, Hỏa vượng (lá số thường, không xét tòng)",
    chart: {
      year: { stem: "Binh", branch: "Dan" }, month: { stem: "Giap", branch: "Ngo" },
      day: { stem: "Canh", branch: "Tuat" }, hour: { stem: "Dinh", branch: "Hoi" },
    },
  },
];

function print(r: PracticalReport) {
  console.log(`[${r.reading.label} — ${Math.round(r.reading.weight * 100)}%] ${r.headline}`);
  for (const n of r.notes.filter((x) => x.startsWith("Kiểm chứng"))) console.log("  " + n);
  if (r.pattern) {
    console.log(`  Cách: ${r.pattern.typeName} | ${r.pattern.grade} | tin cậy ${r.pattern.confidence}`);
    for (const c of r.pattern.checks) console.log(`    · ${c.label}: ${c.status} — ${c.detail}`);
    console.log(`  → ${r.pattern.summary}`);
  }
  if (r.alternative) {
    console.log(`  Cách luận thay thế: ${r.alternative.label} (${r.alternative.weight}) — ${r.alternative.headline}`);
    console.log(`    ${r.alternative.keyDifference}`);
  }
  console.log("  Thời điểm: " + r.timing.map((t) => `${t.year} ${t.favor}${t.altFavor ? ` / ${t.altFavor}` : ""}`).join(" | "));
  if (r.verification) {
    console.log("  Câu hỏi kiểm chứng:");
    for (const q of r.verification.questions) {
      console.log(`    ? ${q.question}  [${q.predictions.map((p) => `${p.label}: ${p.favor}`).join(" vs ")}]`);
    }
  }
}

for (const { label, chart } of samples) {
  const a = analyze(chart);
  console.log("\n" + "═".repeat(90) + "\n" + label);
  console.log(`  Hỗ trợ nhật chủ ${Math.round(a.dayMaster.supportRatio * 100)}% · Điểm: ` +
    Object.entries(a.score.shares).map(([e, v]) => `${ELEMENT_VI[e as keyof typeof ELEMENT_VI]} ${Math.round(v * 100)}%`).join(" "));
  print(buildPracticalReport(a, { fromYear: 2026, years: 5, birthYear: 1990 }));
}

// ── Phân xử bằng câu trả lời của người dùng (lá số 2, giả tòng) ──
console.log("\n" + "═".repeat(90) + "\nPHÂN XỬ lá số 2 bằng các năm đã qua");
const a2 = analyze(samples[1].chart);
const qs = buildPracticalReport(a2, { fromYear: 2026, birthYear: 1990 }).verification!.questions;
// Giả lập: thực tế khớp với cách luận thông thường (thân nhược)
const answers = qs.map((q) => {
  const normal = q.predictions.find((p) => p.readingId === "thong-thuong")!;
  return { year: q.year, outcome: normal.score > 0 ? "tot" as const : "xau" as const };
});
const res = resolveWithFeedback(a2, answers);
res.log.forEach((l) => console.log("  " + l));
console.log("  ⇒ " + res.conclusion);
console.log("  Trọng số mới: " + res.analysis.readings.map((r) => `${r.label} ${Math.round(r.weight * 100)}%`).join(" | "));
print(buildPracticalReport(res.analysis, { fromYear: 2026, years: 5 }));
