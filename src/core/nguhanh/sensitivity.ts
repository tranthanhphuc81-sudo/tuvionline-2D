/* Kiểm tra độ nhạy theo trường phái (ARCHITECTURE 14.11): chạy cùng một lá số với các bộ hệ số khác nhau (PRESETS).
   Dụng thần giống nhau ở mọi bộ thì kết luận "ổn định"; khác nhau thì "chưa vững". Chỉ để báo cho người dùng, không đổi kết quả. */
import { PRESETS, type ScoringConfig } from './config';
import type { Element } from './data';
import { analyze } from './period';
import type { NguHanhChart } from './types';

export interface Sensitivity {
  /** Dụng thần chính ở mọi bộ hệ số trùng nhau */
  stable: boolean;
  /** Dụng thần chính theo từng bộ hệ số: [id bộ, hành] */
  byPreset: Array<{ id: string; dung: Element }>;
}

export function analyzeSensitivity(chart: NguHanhChart, presets: readonly ScoringConfig[] = PRESETS): Sensitivity {
  const byPreset = presets.map((c) => ({ id: c.id, dung: analyze(chart, c).usefulGod.dung }));
  return { stable: byPreset.every((x) => x.dung === byPreset[0].dung), byPreset };
}
