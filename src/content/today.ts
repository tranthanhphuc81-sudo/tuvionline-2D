/* Lời "hôm nay" ở Tĩnh thất (ARCHITECTURE 16.2): trụ ngày hôm nay so với Dụng thần của lá số, chấm bằng đúng hàm đã chấm
   năm ví dụ (`evaluatePeriod`), không có công thức mới. Câu viết với "bạn"; màn hình đổi theo cách Thầy gọi (`xungHoPlain`).
   Luôn kèm câu "gợi ý sắp xếp nhịp, không phải lời báo trước" như mục "Nói dễ hiểu". */
import { BatTuEngine, dayCanChiIndex } from '../core';
import { evaluatePeriod, tenGodOf, type NguHanhAnalysis, type Pillar } from '../core/nguhanh';
import { describePillar } from './nguhanh/plain';
import { TEN_GOD_PRACTICAL } from './nguhanh/practical';
import { DAY_LINES, fill, pick } from './reader/templates';

const { CAN, CHI } = BatTuEngine;
const lowerFirst = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

export type DayLevel = 'thuan' | 'binh' | 'giu';
export interface TodayReading { level: DayLevel; canChi: string; text: string }

export const TODAY_NOTE = 'Đây là gợi ý sắp xếp nhịp trong ngày, không phải lời báo trước.';

/** Trụ ngày dương `now` (giờ máy) xét với cách luận chính của lá số. */
export function todayReading(a: NguHanhAnalysis, now: Date): TodayReading {
  const ug = a.readings[0].usefulGod;
  const cc = dayCanChiIndex(now.getDate(), now.getMonth() + 1, now.getFullYear());
  const pl: Pillar = { stem: cc.can as Pillar['stem'], branch: cc.chi as Pillar['branch'] };
  const canChi = `${CAN[pl.stem]} ${CHI[pl.branch]}`;
  const ev = evaluatePeriod(pl, ug);
  const level: DayLevel = ev.favor === 'rat-tot' || ev.favor === 'tot' ? 'thuan' : ev.favor === 'binh' ? 'binh' : 'giu';
  const actions = TEN_GOD_PRACTICAL[tenGodOf(a.dayMaster.dayMaster, ug.dung)].actions;
  const head = `Hôm nay ngày ${canChi}: ${describePillar(pl, ug)}.`;
  const body = level === 'thuan' ? `Ngày hợp để ${lowerFirst(actions[(cc.can + cc.chi) % actions.length])}.`
    : level === 'binh' ? 'Khí ngày không nghiêng hẳn về bên nào, cứ làm đều việc đang dở là tốt.'
    : 'Hôm nay nên giữ nhịp, việc lớn để dịp khác cũng được.';
  return { level, canChi, text: `${head} ${body} ${TODAY_NOTE}` };
}

/** Câu chào thêm cho Tết, rằm, mùng một; ngày thường trả chuỗi rỗng. */
export function dayGreeting(event: keyof typeof DAY_LINES | null, vars: { goi: string; ta?: string }, seed: number): string {
  return event ? fill(pick(DAY_LINES[event], seed), vars) : '';
}

/** Ngày trong 7 ngày gần nhất (cũ → mới, ngày cuối là hôm nay) dạng YYYY-MM-DD theo giờ máy. */
export function lastDays(now: Date, n = 7): string[] {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (n - 1 - i));
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
}
