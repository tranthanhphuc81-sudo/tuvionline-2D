/* Dữ liệu nền của engine ngũ hành (Phase 3C.2), port từ docs/ngu-hanh-engine/src/data.ts (v0.2).
   Dùng lại bảng của app (CAN_HANH, TANG_CAN, BT_HANH_ORDER, seasonHanh) thay cho bảng trùng của bản tham chiếu;
   chỉ giữ bảng riêng khi app không có: can hợp, tam hợp, lục hợp (có hành hoá), khí hậu theo chi tháng.
   Thiên can và Địa chi là chỉ số (CanIdx 0–9, ChiIdx 0–11) như phần còn lại của src/core; hành dùng chính tả của app. */
import type { CanIdx, ChiIdx } from '../canchi';
import type { Hanh } from '../canchi/hanh';
import { BT_HANH_ORDER, CAN_HANH, TANG_CAN, seasonHanh } from '../battu/engine';

export type Element = Hanh;
/** Thứ tự tương sinh của engine: Mộc → Hoả → Thổ → Kim → Thuỷ (trùng BT_HANH_ORDER). */
export const ELEMENTS: readonly Element[] = BT_HANH_ORDER;
export type Stem = CanIdx;
export type Branch = ChiIdx;

const idx = (e: Element) => ELEMENTS.indexOf(e);
const at = (i: number): Element => ELEMENTS[((i % 5) + 5) % 5];
/** Hành mà e sinh ra (con). */
export const generates = (e: Element): Element => at(idx(e) + 1);
/** Hành sinh ra e (mẹ). */
export const generatedBy = (e: Element): Element => at(idx(e) - 1);
/** Hành mà e khắc. */
export const controls = (e: Element): Element => at(idx(e) + 2);
/** Hành khắc e. */
export const controlledBy = (e: Element): Element => at(idx(e) - 2);

export const stemElement = (s: Stem): Element => BT_HANH_ORDER[CAN_HANH[s]];

/** Tàng can của một chi, thứ tự bản khí, trung khí, dư khí (lấy từ TANG_CAN của app). */
export const hiddenStems = (b: Branch): Stem[] => TANG_CAN[b].map((t) => t[0]);
/** Hành chủ của mùa (nguyệt lệnh) theo chi tháng (lấy từ seasonHanh của app). */
export const seasonElement = (monthBranch: Branch): Element => BT_HANH_ORDER[seasonHanh(monthBranch)];

/** Thiên can ngũ hợp: Giáp-Kỷ Thổ, Ất-Canh Kim, Bính-Tân Thuỷ, Đinh-Nhâm Mộc, Mậu-Quý Hoả. */
export const STEM_COMBOS: ReadonlyArray<{ pair: readonly [Stem, Stem]; to: Element }> = [
  { pair: [0, 5], to: 'Thổ' }, { pair: [1, 6], to: 'Kim' }, { pair: [2, 7], to: 'Thuỷ' },
  { pair: [3, 8], to: 'Mộc' }, { pair: [4, 9], to: 'Hoả' },
];

/** Khí hậu theo chi tháng, dùng cho Điều hậu. */
export type Climate = 'lanh' | 'nong' | 'on';
export const seasonClimate = (monthBranch: Branch): Climate =>
  [11, 0, 1].includes(monthBranch) ? 'lanh' : [5, 6, 7].includes(monthBranch) ? 'nong' : 'on';

/** Lục xung (khớp chiRelation của Lục Hào, có test). */
export const BRANCH_CLASHES: ReadonlyArray<readonly [Branch, Branch]> = [[0, 6], [1, 7], [2, 8], [3, 9], [4, 10], [5, 11]];

/** Lục hợp, kèm hành hợp hoá. */
export const BRANCH_SIX_COMBOS: ReadonlyArray<{ pair: readonly [Branch, Branch]; to: Element }> = [
  { pair: [0, 1], to: 'Thổ' }, { pair: [2, 11], to: 'Mộc' }, { pair: [3, 10], to: 'Hoả' },
  { pair: [4, 9], to: 'Kim' }, { pair: [5, 8], to: 'Thuỷ' }, { pair: [6, 7], to: 'Hoả' },
];

/** Tam hợp cục; phần tử giữa (set[1]) là chi chính dùng cho bán hợp. */
export const BRANCH_TRIADS: ReadonlyArray<{ set: readonly [Branch, Branch, Branch]; to: Element }> = [
  { set: [8, 0, 4], to: 'Thuỷ' }, { set: [11, 3, 7], to: 'Mộc' },
  { set: [2, 6, 10], to: 'Hoả' }, { set: [5, 9, 1], to: 'Kim' },
];

/** Nhóm Thập Thần (gộp âm dương). */
export type TenGodGroup = 'TyKiep' | 'An' | 'ThucThuong' | 'Tai' | 'QuanSat';

/** Quan hệ của hành e so với nhật chủ dm. */
export function tenGodOf(dm: Element, e: Element): TenGodGroup {
  if (e === dm) return 'TyKiep';
  if (e === generatedBy(dm)) return 'An';
  if (e === generates(dm)) return 'ThucThuong';
  if (e === controls(dm)) return 'Tai';
  return 'QuanSat';
}

/** Hành tương ứng với một nhóm Thập Thần của nhật chủ dm. */
export function elementOfTenGod(dm: Element, g: TenGodGroup): Element {
  switch (g) {
    case 'TyKiep': return dm;
    case 'An': return generatedBy(dm);
    case 'ThucThuong': return generates(dm);
    case 'Tai': return controls(dm);
    case 'QuanSat': return controlledBy(dm);
  }
}
