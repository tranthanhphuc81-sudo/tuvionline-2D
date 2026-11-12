/* Engine phân tích ngũ hành (Phase 3C.2). Điểm vào duy nhất của thư mục; xuất lại qua src/core/index.ts.
   Port từ docs/ngu-hanh-engine v0.2 (bản tham chiếu giữ nguyên ở đó). Xem ARCHITECTURE mục 14. */
import type { BatTuChart } from '../battu/types';
import type { NguHanhChart } from './types';

export * from './config';
export * from './data';
export * from './types';
export * from './engine';
export * from './follow';
export * from './period';
export * from './compare';
export * from './sensitivity';

/** Đổi lá số Bát Tự của app sang đầu vào của engine ngũ hành (tứ trụ, Đại Vận, năm Lập Xuân). */
export function toNguHanhChart(ch: BatTuChart): NguHanhChart {
  return {
    year: { stem: ch.yearCC.can, branch: ch.yearCC.chi },
    month: { stem: ch.monthCanIdx, branch: ch.monthChiIdx },
    day: { stem: ch.dayCC.can, branch: ch.dayCC.chi },
    hour: { stem: ch.gioCanIdx, branch: ch.hourChiIdx },
    daiVan: ch.daiVan.map((d) => ({ stem: d.can, branch: d.chi })),
    khoiVanYears: ch.khoiVanYears,
    tietYear: ch.tietYear,
  };
}
export * from './balance';
