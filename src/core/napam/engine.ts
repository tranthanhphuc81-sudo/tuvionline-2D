/* Nạp Âm — mạng theo năm sinh & hợp hôn. Dùng đúng bảng 30 Nạp Âm và công thức Can/Chi năm sinh
   của Phụ lục Nạp Âm, tài liệu Phần 4. */
import { CAN, CHI, NAPAM, napAmLookup, HANH_ORDER, sinhOf, khacOf, yearCanChiIndex, type CanChi, type Hanh } from '../canchi';
import type { NapAmNeedsId, NapAmRelation, NapAmYear } from './types';

export function canChiOfYear(year: number): CanChi {
  return yearCanChiIndex(year);
}

export function napAmOfYear(year: number): NapAmYear {
  const { can, chi } = canChiOfYear(year);
  const row = napAmLookup(can, chi)!; // năm luôn cho cặp Can Chi hợp lệ
  return { year, can, chi, canChiTen: CAN[can] + ' ' + CHI[chi], hanh: row[2], ten: row[3] };
}

// 4 ngoại lệ sinh khắc đặc biệt được dân gian truyền lại phổ biến nhất (Phụ lục Nạp Âm, mục 5)
const EXC_NEEDS: readonly { id: NapAmNeedsId; names: readonly string[]; needs: Hanh }[] = [
  { id: 'kim-tho', names: ['Kiếm Phong Kim', 'Sa Trung Kim'], needs: 'Hoả' },
  { id: 'hoa-troi', names: ['Thiên Thượng Hoả', 'Tích Lịch Hoả'], needs: 'Thuỷ' },
];

type Party = Pick<NapAmYear, 'ten' | 'hanh'>;

export function relation(pA: Party, pB: Party): NapAmRelation {
  const names = [pA.ten, pB.ten];
  if (names.includes('Đại Hải Thuỷ') && names.includes('Sa Trung Thổ')) {
    return { cls: 'ok', kind: 'exc-dai-hai-sa-trung', from: 1, to: 2 };
  }
  for (const ex of EXC_NEEDS) {
    if (ex.names.includes(pA.ten) && pB.hanh === ex.needs) return { cls: 'ok', kind: 'exc-needs', from: 1, to: 2, needs: ex.id };
    if (ex.names.includes(pB.ten) && pA.hanh === ex.needs) return { cls: 'ok', kind: 'exc-needs', from: 2, to: 1, needs: ex.id };
  }
  if (pA.hanh === pB.hanh) return { cls: 'ok', kind: 'same', from: 1, to: 2 };
  if (sinhOf(pA.hanh) === pB.hanh) return { cls: 'ok', kind: 'sinh', from: 1, to: 2 };
  if (sinhOf(pB.hanh) === pA.hanh) return { cls: 'ok', kind: 'sinh', from: 2, to: 1 };
  if (khacOf(pA.hanh) === pB.hanh) return { cls: 'warn', kind: 'khac', from: 1, to: 2 };
  if (khacOf(pB.hanh) === pA.hanh) return { cls: 'warn', kind: 'khac', from: 2, to: 1 };
  return { cls: 'warn', kind: 'unknown', from: 1, to: 2 };
}

export const NapAmEngine = { CAN, CHI, NAPAM, napAmLookup, canChiOfYear, napAmOfYear, HANH_ORDER, sinhOf, khacOf, relation };
export default NapAmEngine;
