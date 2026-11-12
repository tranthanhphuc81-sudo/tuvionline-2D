/**
 * So Dụng thần theo cách cục (src/core/cachcuc) với lá số mẫu trong sách. Chạy từ gốc repo: npm run compare:cachcuc
 * In bảng ra màn hình; thêm --md để ghi docs/CACH-CUC-SACH.md.
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { loadSach, sachChart, type SachCase } from "./lib/sach";
import { analyze } from "../src/core/nguhanh/index";
import { cachCucOf, type CachCucReading } from "../src/core/cachcuc/index";

export interface CcResult { c: SachCase; r: CachCucReading; hit: boolean }

export function evaluateCc(c: SachCase): CcResult {
  const ch = sachChart(c);
  const r = cachCucOf(ch, analyze(ch));
  return { c, r, hit: r.dung === c.dung || (c.accept ?? []).includes(r.dung) };
}

const { cases } = loadSach();
const res = cases.map(evaluateCc);
const pct = (rs: CcResult[]) => `${rs.filter((x) => x.hit).length}/${rs.length} (${Math.round((100 * rs.filter((x) => x.hit).length) / Math.max(1, rs.length))}%)`;
const nh = cases.map((c) => analyze(sachChart(c)).usefulGod.dung === c.dung);
const nhPct = (book: string) => { const idx = cases.map((c, i) => [c, i] as const).filter(([c]) => c.book === book); return `${idx.filter(([, i]) => nh[i]).length}/${idx.length}`; };

const lines = [
  `| Nhóm | Số lá | Cách cục trùng Dụng thần sách | Engine ngũ hành trùng |`, `|---|---|---|---|`,
  `| Tử Bình Chân Thuyên | 56 | ${pct(res.filter((x) => x.c.book === "tbct"))} | ${nhPct("tbct")} |`,
  `| Trích Thiên Tủy | 65 | ${pct(res.filter((x) => x.c.book === "ttt"))} | ${nhPct("ttt")} |`,
  ...(["phu-uc", "dieu-hau", "tong", "hoa-khi"] as const).map((k) => `| TBCT, sách dùng ${k} | ${res.filter((x) => x.c.book === "tbct" && x.c.kind === k).length} | ${pct(res.filter((x) => x.c.book === "tbct" && x.c.kind === k))} | |`),
];
console.log(lines.join("\n"));
if (process.argv.includes("--v")) for (const x of res.filter((x) => x.c.book === "tbct")) console.log(x.hit ? "✓" : "✗", x.c.id, x.c.pillars.join(" "), "| sách", x.c.dung, x.c.kind, "| cách", x.r.cach, x.r.nguon, x.r.trangThai, x.r.tuongThan, "→", x.r.dung, x.r.via, "|", x.c.note.slice(0, 70));
if (process.argv.includes("--md")) {
  writeFileSync(fileURLToPath(new URL("../docs/CACH-CUC-SACH.md", import.meta.url)), [
    "# Cách cục so với lá số mẫu trong sách", "", "> Sinh bằng `npm run compare:cachcuc -- --md`. Đừng sửa tay. Cách đối chiếu: Dụng thần theo cách cục trùng hành sách nói (hoặc hành sách cũng chấp nhận).", "",
    ...lines, "",
  ].join("\n"));
}
