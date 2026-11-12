/* Cách cục theo tháng sinh (ARCHITECTURE mục 15). Điểm vào duy nhất của thư mục. */
import { analyze, toNguHanhChart, type NguHanhAnalysis, type NguHanhChart } from '../nguhanh';
import { HOUR_OFFSET_FROM_NOON } from '../battu/engine';
import type { BatTuChart } from '../battu/types';
import type { BirthCalcInput } from '../birth';
import { cachCuc, daysIntoMonth, dieuHauNeed, type CachCuc } from './engine';
import type { Hanh } from '../canchi/hanh';

export * from './engine';
export * from './quanhe';
export * from './dongkhi';

/** `via`: cách cục thường (`cach`), ngoại cách theo Tòng của engine ngũ hành (`tong`), hay điều hậu thắng (`dieu-hau`). */
export interface CachCucReading extends CachCuc { via: 'cach' | 'tong' | 'dieu-hau'; dungCach: Hanh }

/** Cách cục của lá số, dùng thân vượng/nhược và Tòng cách từ engine ngũ hành (TBCT ch.22: gặp ngoại cách thì theo ngoại cách). */
export function cachCucOf(ch: NguHanhChart, a: NguHanhAnalysis, days?: number): CachCucReading {
  const s = a.dayMaster.strength;
  const base = cachCuc({
    stems: [ch.year.stem, ch.month.stem, ch.day.stem, ch.hour.stem],
    branches: [ch.year.branch, ch.month.branch, ch.day.branch, ch.hour.branch],
    thanVuong: s === 'vuong' || s === 'chuyen-vuong' || (s === 'trung-hoa' && a.dayMaster.supportRatio >= 0.5),
    days,
  });
  if (a.follow && a.follow.grade === 'chan') return { ...base, via: 'tong', dungCach: base.dung, dung: a.usefulGod.dung };
  const dh = dieuHauNeed(ch.day.stem, ch.month.branch);
  if (dh) return { ...base, via: 'dieu-hau', dungCach: base.dung, dung: dh };
  return { ...base, via: 'cach', dungCach: base.dung };
}

/** Cách cục từ lá số Bát Tự của app; biết ngày giờ sinh thì xét cả can tư lệnh. */
export function cachCucOfBirth(ch: BatTuChart, input: BirthCalcInput | null, a: NguHanhAnalysis = analyze(toNguHanhChart(ch))): CachCucReading {
  const days = input ? daysIntoMonth({ ...input, hourChiIdx: input.hourIdx, gender: input.gender }, HOUR_OFFSET_FROM_NOON[input.hourIdx]) : undefined;
  return cachCucOf(toNguHanhChart(ch), a, days);
}
