/**
 * So sánh Dụng Thần legacy (src/core/battu/reading.ts) với engine ngũ hành đã port (src/core/nguhanh) trên 3000 lá số.
 * Chạy từ gốc repo: npm run compare:dungthan  → ghi docs/NGU-HANH-SO-SANH.md
 * Engine trả mã nên nhãn chữ ở mục 3 lấy từ bảng tạm bên dưới (TODO 3C.3: thay bằng src/content/nguhanh).
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { batTuChart, batTuReading } from "../src/core/index";
import { CAN, CHI } from "../src/core/canchi/index";
import { analyze, compareWithLegacy, toNguHanhChart, type FollowGrade, type FollowType, type Method, type Strength } from "../src/core/nguhanh/index";

// TODO 3C.3: bảng nhãn tạm, thay bằng src/content/nguhanh. Chính tả theo app (Hoả, Thuỷ, hoà).
const STRENGTH_VI: Record<Strength, string> = { "tong-nhuoc": "Cực nhược", nhuoc: "Thân nhược", "trung-hoa": "Trung hoà", vuong: "Thân vượng", "chuyen-vuong": "Cực vượng" };
const METHOD_VI: Record<Method, string> = { "phu-uc": "Phù ức", "dieu-hau": "Điều hậu", "thong-quan": "Thông quan", "tong-cach": "Thuận thế", "trung-hoa": "Giữ trung hoà" };
const GRADE_VI: Record<FollowGrade, string> = { chan: "Chân", gia: "Giả", "khong-thanh": "Không thành cách" };
const TYPE_VI: Record<FollowType, string> = {
  "tong-sat": "Tòng Sát", "tong-tai": "Tòng Tài", "tong-nhi": "Tòng Nhi", "tong-the": "Tòng Thế", "khuc-truc": "Khúc Trực", "viem-thuong": "Viêm Thượng",
  "gia-sac": "Giá Sắc", "tong-cach-kim": "Tòng Cách (Kim chuyên vượng)", "nhuan-ha": "Nhuận Hạ", "tong-cuong": "Tòng Cường",
};
let seed = 20261111; const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
const HOURS = ["Tý","Sửu","Dần","Mão","Thìn","Tỵ","Ngọ","Mùi","Thân","Dậu","Tuất","Hợi"];

type Row = { key: string; date: string; tru: string; legacy: string; engine: string; cat: string; follow: string; dacLenh: boolean; legacyVuong: boolean; ratio: number; method: string };
const rows: Row[] = [];
const N = 3000;
let inSeasonLegNEngV = 0, outSeasonEngW = 0;
let same = 0, inDung = 0, flip = 0, sameStr = 0, legV = 0, engV = 0, engW = 0, engT = 0, outSeasonEngV = 0, outSeason = 0, inSeasonLegN = 0, inSeason = 0;
const methods: Record<string, number> = {}; const fol = { chan: 0, gia: 0, khong: 0, none: 0 };
for (let i = 0; i < N; i++) {
  const yy = 1950 + Math.floor(rnd() * 60), mm = 1 + Math.floor(rnd() * 12), dd = 1 + Math.floor(rnd() * 28), h = Math.floor(rnd() * 12);
  rnd();
  const ch = batTuChart({ gender: "M", dd, mm, yy, hourIdx: h } as any);
  const r = batTuReading(ch, 2026);
  const a = analyze(toNguHanhChart(ch)); const ug = a.usefulGod; const dm = a.dayMaster;
  const cmp = compareWithLegacy(r, ug, dm.strength);
  const isFlip = cmp.match === "nguoc";
  const lP = r.primary, lD = r.dung;
  if (lP === ug.dung) same++; if (lD.includes(ug.dung)) inDung++; if (isFlip) flip++;
  const engStrong = dm.strength === "vuong" || dm.strength === "chuyen-vuong";
  const engWeak = dm.strength === "nhuoc" || dm.strength === "tong-nhuoc";
  if (engStrong) engV++; if (engWeak) engW++; if (dm.strength === "trung-hoa") engT++;
  if (r.assessment.thanVuong) legV++;
  if ((r.assessment.thanVuong && engStrong) || (!r.assessment.thanVuong && engWeak)) sameStr++;
  if (!r.assessment.dacLenh) { outSeason++; if (engStrong) outSeasonEngV++; } else { inSeason++; if (!r.assessment.thanVuong) { inSeasonLegN++; if (engStrong) inSeasonLegNEngV++; } }
  if (!r.assessment.dacLenh && engWeak) outSeasonEngW++;
  methods[ug.method] = (methods[ug.method] ?? 0) + 1;
  const f = a.follow; const fk = !f ? "none" : f.grade === "chan" ? "chan" : f.grade === "gia" ? "gia" : "khong"; (fol as any)[fk]++;
  rows.push({
    key: `${dd}/${mm}/${yy}`, date: `${String(dd).padStart(2,"0")}/${String(mm).padStart(2,"0")}/${yy} giờ ${HOURS[h]}`,
    tru: ch.pillars.map((p) => `${CAN[p.can]} ${CHI[p.chi]}`).join(" · "),
    legacy: `${r.assessment.thanVuong ? "Vượng" : "Nhược"} (${r.assessment.trangThai}${r.assessment.dacLenh ? ", đắc lệnh" : ""}, giúp ${r.assessment.giup}/hao ${r.assessment.hao}) → dụng ${r.dung.join(", ")}; kỵ ${r.ky.join(", ")}`,
    engine: `${STRENGTH_VI[dm.strength]} (${Math.round(dm.supportRatio * 100)}%), ${METHOD_VI[ug.method]} → dụng ${ug.dung}, hỷ ${ug.hy}; kỵ ${ug.ky}${f ? ` · ${TYPE_VI[f.type]}: ${GRADE_VI[f.grade]}` : ""}`,
    cat: "", follow: fk, dacLenh: r.assessment.dacLenh, legacyVuong: r.assessment.thanVuong, ratio: dm.supportRatio, method: ug.method,
  });
  const row = rows[rows.length - 1];
  row.cat = f && f.grade !== "khong-thanh" ? `tong-${f.grade}` : ug.method === "dieu-hau" ? "dieu-hau" : isFlip ? "dao-chieu" : lP === ug.dung ? "trung" : "lech-nhe";
}
const p = (n: number, d = N) => `${(100 * n / d).toFixed(1)}%`;
// stratified golden sample: 24 charts
const pick = (cat: string, n: number) => rows.filter((r) => r.cat === cat).slice(0, n);
const golden = [...pick("trung", 4), ...pick("lech-nhe", 3), ...pick("dao-chieu", 8), ...pick("dieu-hau", 3), ...pick("tong-chan", 3), ...pick("tong-gia", 3)];
const CAT_VI: Record<string, string> = { trung: "Trùng dụng thần chính", "lech-nhe": "Lệch nhẹ (không đảo chiều)", "dao-chieu": "Đảo chiều", "dieu-hau": "Engine dùng Điều hậu", "tong-chan": "Engine: Chân tòng/chuyên vượng", "tong-gia": "Engine: Giả tòng/chuyên vượng" };

const md = `# So sánh Dụng Thần: bản legacy và engine ngũ hành

> Sinh tự động ngày 11/11/2026 để làm đầu vào cho bước 🔴 3C.1 (\`docs/PROMPT-KIT-NGU-HANH.md\`). Không phải tài liệu kiến trúc.
> Mẫu: ${N} lá số ngẫu nhiên (seed cố định 20261111), năm sinh 1950–2009, đủ 12 giờ. Tứ trụ lấy từ \`batTuChart\` của app (đã xử lý Lập Xuân, giờ Tý muộn), nên hai bên dùng CÙNG một bộ tứ trụ.
> Legacy = \`batTuReading\` (\`src/core/battu/reading.ts\`). Engine = \`docs/ngu-hanh-engine\` v0.2, preset mặc định.

## 1. Kết quả tổng

| Chỉ số | Giá trị |
|---|---|
| Dụng thần chính trùng nhau | ${p(same)} |
| Dụng thần engine nằm trong danh sách "dụng" của legacy | ${p(inDung)} |
| **Đảo chiều** (dụng của bên này là kỵ của bên kia) | **${p(flip)}** |
| Cùng kết luận vượng/nhược (bỏ qua ca engine "trung hoà") | ${p(sameStr, N - engT)} |
| Legacy kết luận Thân vượng | ${p(legV)} |
| Engine: vượng / trung hoà / nhược | ${p(engV)} / ${p(engT)} / ${p(engW)} |
| Phương pháp engine dùng: Phù ức / Điều hậu / Trung hoà / Thuận thế | ${p(methods["phu-uc"] ?? 0)} / ${p(methods["dieu-hau"] ?? 0)} / ${p(methods["trung-hoa"] ?? 0)} / ${p(methods["tong-cach"] ?? 0)} |
| Engine xét tòng/chuyên vượng: Chân / Giả / Không thành | ${p(fol.chan)} / ${p(fol.gia)} / ${p(fol.khong)} |

## 2. Nguyên nhân chính của độ lệch

1. **Luật vượng/nhược của legacy rất chặt:** \`thanVuong = dacLenh && giup >= hao\`, chỉ đếm 3 thiên can lộ, không tính tàng can, không tính sức của địa chi.
   - Sinh ngoài mùa (${outSeason} lá) thì legacy **luôn** kết luận nhược; engine đồng ý nhược ở ${p(outSeasonEngW, outSeason)}, thấy vượng ở ${p(outSeasonEngV, outSeason)} (nhật chủ có gốc mạnh ở địa chi hoặc được hợp cục), phần còn lại trung hoà.
   - Sinh đúng mùa (${inSeason} lá) mà 3 can lộ "hao" nhiều hơn "giúp" thì legacy vẫn kết luận nhược (${inSeasonLegN} lá); engine thấy vượng ở ${inSeasonLegNEngV} lá trong số đó (${p(inSeasonLegNEngV, inSeasonLegN)}), vì chi tháng có hệ số lớn và tàng can được tính. **Đây là nguồn đảo chiều lớn nhất.**
2. **Legacy chỉ có một chiến lược** (Phù ức + mẫu "Sát trọng dụng Ấn"); không có Điều hậu, Thông quan, Tòng cách. Engine dùng Điều hậu ở ${p(methods["dieu-hau"] ?? 0)} lá số.
3. **Legacy chọn dụng thần chính = hành ít chữ nhất** trong danh sách dụng (đếm thô 8 chữ). Engine chọn theo nguyên nhân gây mất cân bằng (vd. nhược vì Tài nặng thì dùng Tỷ Kiếp, không dùng Ấn).
4. **Engine có vùng "trung hoà"** (40–55% hỗ trợ) mà legacy không có; với vùng này engine chỉ bù hành yếu nhất, khác hẳn logic legacy.

## 3. Bộ ${golden.length} lá số mẫu để chủ dự án/người luận gán nhãn

Mục đích: có "đáp án" độc lập trước khi chốt. Chọn phân tầng theo loại lệch. Cột cuối để trống: điền dụng thần đúng theo người luận (hoặc theo sách Phần 2 trong \`docs/\`), ghi nguồn.

| # | Loại | Ngày sinh (dương) | Tứ trụ (Năm · Tháng · Ngày · Giờ) | Legacy | Engine | Đáp án người luận |
|---|---|---|---|---|---|---|
${golden.map((r, i) => `| ${i + 1} | ${CAT_VI[r.cat]} | ${r.date} | ${r.tru} | ${r.legacy} | ${r.engine} |  |`).join("\n")}

## 4. Cách tái tạo

Chạy từ gốc repo: \`npm run compare:dungthan\` (seed cố định nên ra đúng bảng này). Script ở \`scripts/compare-dung-than.ts\`, chạy engine đã port ở \`src/core/nguhanh\`; bản tham chiếu \`docs/ngu-hanh-engine\` giữ nguyên để đối chiếu.
`;
writeFileSync(fileURLToPath(new URL("../docs/NGU-HANH-SO-SANH.md", import.meta.url)), md);
console.log("Đã ghi docs/NGU-HANH-SO-SANH.md");
console.log("golden", golden.length);
