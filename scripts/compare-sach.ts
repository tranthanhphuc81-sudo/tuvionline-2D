/**
 * So Dụng thần của engine ngũ hành với lá số mẫu trong sách (tests/fixtures/nguhanh-sach.json).
 * Chạy từ gốc repo: npm run compare:sach  → ghi docs/NGU-HANH-SACH.md
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { evaluate, loadSach, type Book, type Kind, type SachMatch, type SachResult } from "./lib/sach";
import { GRADE_VI, METHOD_VI, STRENGTH_VI, TYPE_VI } from "../src/content/nguhanh/vocab";

const short = (t: string) => t.split(" (")[0];
const { cases } = loadSach();
const res = cases.map(evaluate);

const BOOK_VI: Record<Book, string> = { tbct: "Tử Bình Chân Thuyên", ttt: "Trích Thiên Tủy" };
const KIND_VI: Record<Kind, string> = { "phu-uc": "Phù ức, chế hoá", "dieu-hau": "Điều hậu", tong: "Tòng, chuyên vượng", "hoa-khi": "Hoá khí" };
const MATCH_VI: Record<SachMatch, string> = { trung: "Trùng", gan: "Gần", nguoc: "Ngược", khac: "Khác" };

const pct = (n: number, d: number) => (d ? `${n}/${d} (${Math.round((100 * n) / d)}%)` : "0/0");
const count = (rs: SachResult[], m: SachMatch) => rs.filter((r) => r.match === m).length;
const row = (label: string, rs: SachResult[]) =>
  `| ${label} | ${rs.length} | ${pct(count(rs, "trung"), rs.length)} | ${pct(count(rs, "gan"), rs.length)} | ${pct(count(rs, "khac"), rs.length)} | ${pct(count(rs, "nguoc"), rs.length)} |`;

const byBook = (b: Book) => res.filter((r) => r.c.book === b);
const byKind = (k: Kind) => res.filter((r) => r.c.kind === k);
const unstable = res.filter((r) => !r.stable);

const engineText = (r: SachResult) => {
  const { a } = r; const ug = a.usefulGod; const f = a.follow;
  return `${STRENGTH_VI[a.dayMaster.strength]} (${Math.round(a.dayMaster.supportRatio * 100)}%), ${short(METHOD_VI[ug.method])} → dụng ${ug.dung}, kỵ ${ug.ky}${f && f.grade !== "khong-thanh" ? ` · ${short(TYPE_VI[f.type])}: ${short(GRADE_VI[f.grade])}` : ""}${r.altHit && r.match !== "trung" ? " · cách luận phụ trùng sách" : ""}${r.stable ? "" : " · đổi theo preset"}`;
};
const bookText = (r: SachResult) => `dụng ${r.c.dung}${r.c.accept?.length ? ` (cũng tốt: ${r.c.accept.join(", ")})` : ""}. ${r.c.note}`;
const table = (rs: SachResult[]) => [
  "| Mã | Trang | Tứ trụ (Năm · Tháng · Ngày · Giờ) | Sách | Engine | Khớp |",
  "|---|---|---|---|---|---|",
  ...rs.map((r) => `| ${r.c.id}${r.c.who ? ` (${r.c.who})` : ""} | ${r.c.page} | ${r.c.pillars.join(" · ")}${r.c.fix ? " ¹" : ""} | ${bookText(r)} | ${engineText(r)} | ${MATCH_VI[r.match]} |`),
].join("\n");

const md = `# So sánh Dụng thần: engine ngũ hành và lá số mẫu trong sách

> Sinh tự động bằng \`npm run compare:sach\` (\`scripts/compare-sach.ts\`) từ \`tests/fixtures/nguhanh-sach.json\`. Đừng sửa tay.
> ${res.length} lá số chọn ngày 12/11/2026 từ hai sách chủ dự án cung cấp ở \`docs/sach/\`: ${byBook("tbct").length} lá *${BOOK_VI.tbct}* (bản dịch Phương Trọng Thầm), ${byBook("ttt").length} lá *${BOOK_VI.ttt}* (Nhậm Thiết Tiều bình chú). Chỉ lấy lá sách nói rõ dùng gì.
> Sách cho tứ trụ, không cho ngày sinh, nên engine nhận thẳng tứ trụ (không có Đại Vận). Engine = preset mặc định.

**Đọc bảng này thế nào:** đáp án là cách luận của hai trường phái cổ, không phải sự thật khách quan (ARCHITECTURE 14.1). *Tử Bình Chân Thuyên* luận theo cách cục ở tháng sinh; *Trích Thiên Tủy* luận theo vượng suy, gần với cách engine luận hơn. Lá "Khác" hay "Ngược" là chỗ cần người luận xem lại, không tự coi bên nào đúng. Tứ trụ do người đọc chép từ sách, chưa có người thứ hai soát.

- **Trùng:** dụng thần chính của engine là hành sách nói.
- **Gần:** engine chọn một hành sách cũng nói là tốt, hoặc cách luận phụ của engine (ví dụ thuận thế) trùng sách.
- **Ngược:** kỵ thần của engine lại là dụng thần của sách.
- **Khác:** còn lại.

## 1. Kết quả tổng

| Nhóm | Số lá | Trùng | Gần | Khác | Ngược |
|---|---|---|---|---|---|
${row("Tất cả", res)}
${row(BOOK_VI.tbct, byBook("tbct"))}
${row(BOOK_VI.ttt, byBook("ttt"))}
${(Object.keys(KIND_VI) as Kind[]).map((k) => row(`Sách dùng ${KIND_VI[k].toLowerCase()}`, byKind(k))).join("\n")}

Theo định nghĩa "khớp" của ARCHITECTURE 14.1 điều 2 (dụng thần sách trùng dụng **hoặc hỷ** của engine, không nằm trong kỵ): ${pct(res.filter((r) => r.rule14).length, res.length)}; *${BOOK_VI.tbct}* ${pct(byBook("tbct").filter((r) => r.rule14).length, byBook("tbct").length)}, *${BOOK_VI.ttt}* ${pct(byBook("ttt").filter((r) => r.rule14).length, byBook("ttt").length)}. Không so được với legacy vì legacy cần ngày sinh để lập lá số.

Dụng thần engine đổi theo preset (\`analyzeSensitivity\`, ARCHITECTURE 14.11) ở ${pct(unstable.length, res.length)} lá; trong đó trùng sách ${count(unstable, "trung")} lá.

## 2. ${BOOK_VI.tbct}

${table(byBook("tbct"))}

## 3. ${BOOK_VI.ttt}

${table(byBook("ttt"))}

${res.some((r) => r.c.fix) ? `¹ ${res.filter((r) => r.c.fix).map((r) => `${r.c.id}: ${r.c.fix}`).join("; ")}.` : ""}

## 4. Cách tái tạo

Chạy \`npm run compare:sach\` từ gốc repo. Thêm lá số: sửa \`tests/fixtures/nguhanh-sach.json\` (ghi trang, câu sách nói về dụng thần), chạy lại lệnh, rồi sửa con số kỳ vọng trong \`tests/nguhanh-sach.test.ts\`.
`;
writeFileSync(fileURLToPath(new URL("../docs/NGU-HANH-SACH.md", import.meta.url)), md);
console.log(`Đã ghi docs/NGU-HANH-SACH.md: ${res.length} lá, trùng ${count(res, "trung")}, gần ${count(res, "gan")}, khác ${count(res, "khac")}, ngược ${count(res, "nguoc")}, khớp theo 14.1 ${res.filter((r) => r.rule14).length}`);
for (const b of ["tbct", "ttt"] as Book[]) { const rs = byBook(b); console.log(b, "trùng", count(rs, "trung"), "gần", count(rs, "gan"), "khác", count(rs, "khac"), "ngược", count(rs, "nguoc")); }
