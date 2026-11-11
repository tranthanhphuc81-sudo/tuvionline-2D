/**
 * Dữ liệu nền: Ngũ hành, Thiên can, Địa chi, Tàng can, quan hệ sinh khắc.
 * Thuần dữ liệu, không chứa trọng số tính điểm (trọng số nằm ở config.ts).
 */

export const ELEMENTS = ["Moc", "Hoa", "Tho", "Kim", "Thuy"] as const;
export type Element = (typeof ELEMENTS)[number];

export const ELEMENT_VI: Record<Element, string> = {
  Moc: "Mộc",
  Hoa: "Hỏa",
  Tho: "Thổ",
  Kim: "Kim",
  Thuy: "Thủy",
};

const idx = (e: Element) => ELEMENTS.indexOf(e);
const at = (i: number): Element => ELEMENTS[((i % 5) + 5) % 5];

/** Hành mà e sinh ra (con). Mộc → Hỏa → Thổ → Kim → Thủy → Mộc */
export const generates = (e: Element): Element => at(idx(e) + 1);
/** Hành sinh ra e (mẹ). */
export const generatedBy = (e: Element): Element => at(idx(e) - 1);
/** Hành mà e khắc. Mộc khắc Thổ, Thổ khắc Thủy... */
export const controls = (e: Element): Element => at(idx(e) + 2);
/** Hành khắc e. */
export const controlledBy = (e: Element): Element => at(idx(e) - 2);

// ───────────────────────── Thiên can ─────────────────────────

export const STEMS = ["Giap", "At", "Binh", "Dinh", "Mau", "Ky", "Canh", "Tan", "Nham", "Quy"] as const;
export type Stem = (typeof STEMS)[number];

export const STEM_VI: Record<Stem, string> = {
  Giap: "Giáp", At: "Ất", Binh: "Bính", Dinh: "Đinh", Mau: "Mậu",
  Ky: "Kỷ", Canh: "Canh", Tan: "Tân", Nham: "Nhâm", Quy: "Quý",
};

export const stemElement = (s: Stem): Element => ELEMENTS[Math.floor(STEMS.indexOf(s) / 2)];
/** true = Dương, false = Âm */
export const stemIsYang = (s: Stem): boolean => STEMS.indexOf(s) % 2 === 0;

/** Thiên can ngũ hợp: Giáp-Kỷ hóa Thổ, Ất-Canh hóa Kim, Bính-Tân hóa Thủy, Đinh-Nhâm hóa Mộc, Mậu-Quý hóa Hỏa */
export const STEM_COMBOS: Array<{ pair: [Stem, Stem]; to: Element }> = [
  { pair: ["Giap", "Ky"], to: "Tho" },
  { pair: ["At", "Canh"], to: "Kim" },
  { pair: ["Binh", "Tan"], to: "Thuy" },
  { pair: ["Dinh", "Nham"], to: "Moc" },
  { pair: ["Mau", "Quy"], to: "Hoa" },
];

// ───────────────────────── Địa chi ─────────────────────────

export const BRANCHES = ["Ty", "Suu", "Dan", "Mao", "Thin", "Ti", "Ngo", "Mui", "Than", "Dau", "Tuat", "Hoi"] as const;
export type Branch = (typeof BRANCHES)[number];

export const BRANCH_VI: Record<Branch, string> = {
  Ty: "Tý", Suu: "Sửu", Dan: "Dần", Mao: "Mão", Thin: "Thìn", Ti: "Tỵ",
  Ngo: "Ngọ", Mui: "Mùi", Than: "Thân", Dau: "Dậu", Tuat: "Tuất", Hoi: "Hợi",
};

/** Tàng can theo thứ tự: bản khí, trung khí, dư khí */
export const HIDDEN_STEMS: Record<Branch, Stem[]> = {
  Ty: ["Quy"],
  Suu: ["Ky", "Quy", "Tan"],
  Dan: ["Giap", "Binh", "Mau"],
  Mao: ["At"],
  Thin: ["Mau", "At", "Quy"],
  Ti: ["Binh", "Canh", "Mau"],
  Ngo: ["Dinh", "Ky"],
  Mui: ["Ky", "Dinh", "At"],
  Than: ["Canh", "Nham", "Mau"],
  Dau: ["Tan"],
  Tuat: ["Mau", "Tan", "Dinh"],
  Hoi: ["Nham", "Giap"],
};

/** Hành chủ của mùa (nguyệt lệnh) theo chi tháng. Thìn Tuất Sửu Mùi = tứ quý Thổ. */
export const SEASON_ELEMENT: Record<Branch, Element> = {
  Dan: "Moc", Mao: "Moc",
  Ti: "Hoa", Ngo: "Hoa",
  Than: "Kim", Dau: "Kim",
  Hoi: "Thuy", Ty: "Thuy",
  Thin: "Tho", Tuat: "Tho", Suu: "Tho", Mui: "Tho",
};

/** Khí hậu theo chi tháng, dùng cho Điều hậu. */
export const SEASON_CLIMATE: Record<Branch, "lanh" | "nong" | "on"> = {
  Hoi: "lanh", Ty: "lanh", Suu: "lanh",
  Ti: "nong", Ngo: "nong", Mui: "nong",
  Dan: "on", Mao: "on", Thin: "on", Than: "on", Dau: "on", Tuat: "on",
};

/** Lục xung */
export const BRANCH_CLASHES: Array<[Branch, Branch]> = [
  ["Ty", "Ngo"], ["Suu", "Mui"], ["Dan", "Than"], ["Mao", "Dau"], ["Thin", "Tuat"], ["Ti", "Hoi"],
];

/** Lục hợp */
export const BRANCH_SIX_COMBOS: Array<{ pair: [Branch, Branch]; to: Element }> = [
  { pair: ["Ty", "Suu"], to: "Tho" },
  { pair: ["Dan", "Hoi"], to: "Moc" },
  { pair: ["Mao", "Tuat"], to: "Hoa" },
  { pair: ["Thin", "Dau"], to: "Kim" },
  { pair: ["Ti", "Than"], to: "Thuy" },
  { pair: ["Ngo", "Mui"], to: "Hoa" },
];

/** Tam hợp cục */
export const BRANCH_TRIADS: Array<{ set: [Branch, Branch, Branch]; to: Element }> = [
  { set: ["Than", "Ty", "Thin"], to: "Thuy" },
  { set: ["Hoi", "Mao", "Mui"], to: "Moc" },
  { set: ["Dan", "Ngo", "Tuat"], to: "Hoa" },
  { set: ["Ti", "Dau", "Suu"], to: "Kim" },
];

// ───────────────────────── Thập thần ─────────────────────────

/** Nhóm thập thần (gộp âm dương) — đủ dùng cho luận phù ức và diễn giải thực tế. */
export type TenGodGroup = "TyKiep" | "An" | "ThucThuong" | "Tai" | "QuanSat";

export const TEN_GOD_VI: Record<TenGodGroup, string> = {
  TyKiep: "Tỷ Kiếp",
  An: "Ấn",
  ThucThuong: "Thực Thương",
  Tai: "Tài",
  QuanSat: "Quan Sát",
};

/** Quan hệ của hành e so với nhật chủ dm. */
export function tenGodOf(dm: Element, e: Element): TenGodGroup {
  if (e === dm) return "TyKiep";
  if (e === generatedBy(dm)) return "An";
  if (e === generates(dm)) return "ThucThuong";
  if (e === controls(dm)) return "Tai";
  return "QuanSat";
}

/** Hành tương ứng với một nhóm thập thần của nhật chủ dm. */
export function elementOfTenGod(dm: Element, g: TenGodGroup): Element {
  switch (g) {
    case "TyKiep": return dm;
    case "An": return generatedBy(dm);
    case "ThucThuong": return generates(dm);
    case "Tai": return controls(dm);
    case "QuanSat": return controlledBy(dm);
  }
}
