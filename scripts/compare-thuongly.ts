/**
 * Đo "Lời sách cho Can ngày theo tháng sinh" (src/content/cachcuc/thuongly.ts) với lá số mẫu trong sách. Chạy: npm run compare:thuongly
 * LƯU Ý: 50/56 lá TBCT trong sach.json lấy từ chính phụ lục này, nên con số TBCT chỉ là kiểm tra "lẽ thường có khớp ví dụ
 * của chính nó không", không phải kiểm chứng độc lập. Trích Thiên Tủy là nguồn khác, độc lập.
 * Ba cách đọc bảng: A = hành của can đứng đầu "uu"; B = theo thân mạnh/yếu của engine ngũ hành lấy can đầu của cuong/nhuoc nếu có,
 * không thì như A; C = hành sách cần nằm trong số hành của mọi can sách kể (lỏng, chỉ để tham khảo).
 */
import { loadSach, sachChart, type SachCase } from "./lib/sach";
import { analyze } from "../src/core/nguhanh/index";
import { thuongLyOf, canList, hanhOfCan } from "../src/content/cachcuc/thuongly";

export function evalThuongLy(c: SachCase) {
  const ch = sachChart(c);
  const a = analyze(ch);
  const t = thuongLyOf(ch.day.stem, ch.month.branch);
  const ok = (h: string) => h === c.dung || (c.accept ?? []).includes(h as never);
  const uu = canList(t.uu), cuong = canList(t.cuong), nhuoc = canList(t.nhuoc);
  const strong = a.dayMaster.strength === "vuong" || a.dayMaster.strength === "chuyen-vuong";
  const weak = a.dayMaster.strength === "nhuoc" || a.dayMaster.strength === "tong-nhuoc";
  const b = strong && cuong.length ? cuong[0] : weak && nhuoc.length ? nhuoc[0] : uu[0];
  return { A: ok(hanhOfCan(uu[0])), B: ok(hanhOfCan(b)), C: [...uu, ...cuong, ...nhuoc].some((x) => ok(hanhOfCan(x))) };
}

const isMain = process.argv[1]?.replace(/\\/g, "/").endsWith("scripts/compare-thuongly.ts");
if (isMain) {
  const { cases } = loadSach();
  for (const [name, cs] of [["TBCT (cùng nguồn)", cases.filter((c) => c.book === "tbct")], ["TTT (độc lập)", cases.filter((c) => c.book === "ttt")]] as const) {
    const r = cs.map(evalThuongLy);
    const n = (k: "A" | "B" | "C") => `${r.filter((x) => x[k]).length}/${r.length}`;
    console.log(`${name}: A ${n("A")} · B ${n("B")} · C ${n("C")}`);
  }
}
