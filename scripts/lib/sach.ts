/**
 * Bộ lá số mẫu lấy từ sách (tests/fixtures/nguhanh-sach.json): đọc tứ trụ in trong sách, chạy engine ngũ hành, xếp loại khớp.
 * Dùng chung cho scripts/compare-sach.ts (sinh docs/NGU-HANH-SACH.md) và tests/nguhanh-sach.test.ts.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { CAN, CHI } from "../../src/core/canchi/index";
import { analyze, analyzeSensitivity, DEFAULT_CONFIG, type NguHanhAnalysis, type NguHanhChart, type ScoringConfig } from "../../src/core/nguhanh/index";
import type { Element } from "../../src/core/nguhanh/data";

export type Book = "tbct" | "ttt";
export type Kind = "phu-uc" | "dieu-hau" | "tong" | "hoa-khi";
export interface SachCase {
  id: string; book: Book; page: string; who?: string | null; ref?: string;
  pillars: [string, string, string, string]; dung: Element; accept?: Element[]; kind: Kind; note: string; fix?: string;
  /** 1: dùng để hiệu chỉnh (ARCHITECTURE 14.12); 2: thêm sau hiệu chỉnh, tập kiểm tra độc lập (14.13) */
  batch: 1 | 2;
}
/** trung: dụng thần chính của engine = sách; gan: engine nêu hành sách cũng cho là tốt, hoặc cách luận phụ của engine trùng sách; nguoc: kỵ thần engine là dụng thần sách; khac: còn lại. */
export type SachMatch = "trung" | "gan" | "nguoc" | "khac";
/** rule14: "khớp" theo ARCHITECTURE 14.1 điều 2 (dụng thần sách trùng dụng hoặc hỷ của engine, không nằm trong kỵ). */
export interface SachResult { c: SachCase; a: NguHanhAnalysis; match: SachMatch; altHit: boolean; stable: boolean; rule14: boolean }

export function loadSach(): { meta: Record<string, unknown>; cases: SachCase[] } {
  const j = JSON.parse(readFileSync(fileURLToPath(new URL("../../tests/fixtures/nguhanh-sach.json", import.meta.url)), "utf8"));
  return { meta: j._meta, cases: j.cases };
}

/** "Đinh Hợi" → { stem, branch }; báo lỗi nếu chữ lạ hoặc lệch âm dương. */
export function parsePillar(s: string) {
  const [a, b] = s.split(" ");
  const stem = CAN.indexOf(a), branch = CHI.indexOf(b);
  if (stem < 0 || branch < 0 || stem % 2 !== branch % 2) throw new Error(`Trụ không hợp lệ: ${s}`);
  return { stem, branch } as NguHanhChart["year"];
}

/** Sách không cho ngày sinh nên không có Đại Vận; engine chọn dụng thần chỉ từ tứ trụ. */
export function sachChart(c: SachCase): NguHanhChart {
  const [year, month, day, hour] = c.pillars.map(parsePillar);
  return { year, month, day, hour, daiVan: [], khoiVanYears: 0, tietYear: 0 };
}

export function evaluate(c: SachCase, cfg: ScoringConfig = DEFAULT_CONFIG): SachResult {
  const ch = sachChart(c);
  const a = analyze(ch, cfg);
  const ug = a.usefulGod;
  const altHit = a.readings.slice(1).some((r) => r.usefulGod.dung === c.dung);
  const match: SachMatch = ug.dung === c.dung ? "trung" : ug.ky === c.dung ? "nguoc" : (c.accept ?? []).includes(ug.dung) || altHit ? "gan" : "khac";
  const rule14 = (ug.dung === c.dung || ug.hy === c.dung) && ug.ky !== c.dung;
  return { c, a, match, altHit, stable: analyzeSensitivity(ch).stable, rule14 };
}
