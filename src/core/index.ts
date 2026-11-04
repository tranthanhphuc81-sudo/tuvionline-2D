// Điểm vào DUY NHẤT cho phần tính toán (core). UI và src/content chỉ import từ đây.
// Công thức trích nguyên văn từ bản web đã kiểm chứng (docs/legacy/lyso-toolkit.html); đầu ra được khoá bởi
// tests/golden.test.ts và tests/core-snapshot.test.ts.
import { pad2, validSolar, validLunar, shiftSolar, lunarTzForSolarYear, lunarTzForLunarYear } from './calendar';
import { CAN, CHI } from './canchi';
import { TuViEngine } from './tuvi/engine';
import { BatTuEngine } from './battu/engine';
import { LucHaoEngine } from './luchao/engine';
import { PhongThuyEngine } from './battrach/engine';
import { NapAmEngine } from './napam/engine';
import { napAmForBirth, type NapAmBirth } from './napam/reading';
import { batTrachReading } from './battrach/reading';
import { tongHopReading, type TongHopReading } from './tonghop/reading';
import { resolveBirth, type BirthCalcInput, type BirthError, type BirthProfile, type ResolvedBirth, type SolarDate } from './birth';
import type { Gender, HourIdx } from './types';
import type { Hanh } from './canchi/hanh';
import type { TuViChart } from './tuvi/types';
import type { BatTuChart } from './battu/types';
import type { LucHaoResult, Toss } from './luchao/types';
import type { DuNienStar, Nhom, Quai } from './battrach/types';
import type { NapAmYear } from './napam/types';

export const LySoUtil = { pad2, validSolar, validLunar, shiftSolar, lunarTzForSolarYear, lunarTzForLunarYear };
export { TuViEngine, BatTuEngine, LucHaoEngine, PhongThuyEngine, NapAmEngine, resolveBirth };

export type { Gender, HourIdx, CanIdx, ChiIdx, Quai } from './types';
export type { Hanh } from './canchi/hanh';
export type { CanChi } from './canchi';
export type { BirthProfile, BirthCalcInput, BirthError, BirthNote, ResolvedBirth, SolarDate, LunarDate } from './birth';
export type { TuViChart, TuViInput, DaiHan, TuHoa, CungName } from './tuvi/types';
export {
  tuViReading, tuViYear, tuViYearLookup, lifeAreas, brightness, chiRel, relCucMenh, tamPhuong, cungNameFor, banMenh,
  mainStarsOf, chiOfStar, HOA_KEYS, CAT_PHU, SAT_PHU, AREA_CUNG,
} from './tuvi/reading';
export type {
  HoaKey, Tone, TuViReading, TuViYearReading, TuViYearLookup, AreaReading, AreaKey, DaiHanNow, LuuHoa, ChiRelKind, CucMenhRel,
} from './tuvi/reading';
export type { BatTuChart, BatTuInput, Pillar, ThapThan, TangCanRole } from './battu/types';
export {
  assessThan, locThapThan, muaOf, dungThanPattern, thapThanProfile, batTuReading, batTuYearLookup, tangCanOf, familyOf, FAMILY_GODS,
} from './battu/reading';
export type { ThanAssessment, VuongSuyState, Mua, ThapThanFamily, ThapThanCombo, ThapThanProfile, BatTuReading, BatTuYearLookup, HanhPeriod } from './battu/reading';
export type { Toss, HexaStep, LucThan, Hao, HaoHoa, QueBien, LucHaoResult, VuongSuy, Season } from './luchao/types';
export {
  coinFlip, randomToss, randomTosses, castContext, haoViews, findDungThanHao, verdictHaos, lucHaoReading, DUNG_THAN_KEYS,
} from './luchao/reading';
export type { DungThanKey, CastContext, HaoView, NhatRel, VerdictHao, LucHaoReading, LhTone } from './luchao/reading';
export type { Huong, StarName, Nhom, DuNienStar, LySoYear } from './battrach/types';
export { HUONG_LIST, batTrachReading, trachQuaiOf } from './battrach/reading';
export { HEADING_ERROR_LIMIT, angleFromCenter, compassTrust, laBanSectors, normDeg, sectorOf, smoothHeading } from './laban/reading';
export type { LaBanSector } from './laban/reading';
export type { BatTrachReading, BtTone, HouseReading, HuongSao } from './battrach/reading';
export type { NapAmYear, NapAmRelation, NapAmRelationKind, NapAmNeedsId } from './napam/types';
export { napAmCompat, napAmForBirth, napAmPersonOfDate, resolveNapAmInput } from './napam/reading';
export type { HanhFlow, HopLevel, NapAmBirth, NapAmCompat, NapAmInputError, NapAmPerson, NapAmTone } from './napam/reading';
export { hanhRel, huongOfHanh, tongHopReading } from './tonghop/reading';
export type { HanhRel, HanhRelKind, TongHopReading } from './tonghop/reading';

/* ===== Hàm gọn (ARCHITECTURE.md mục 5.2) ===== */

/** Lá số Tử Vi từ đầu vào chung (ngày dương đã xử lý Tý muộn). */
export function tuViChart(input: BirthCalcInput, tz?: number): TuViChart {
  return TuViEngine.calcChart({ gender: input.gender, dd: input.dd, mm: input.mm, yy: input.yy, hourBranchIdx: input.hourIdx, tz });
}
/** Lá số Bát Tự từ đầu vào chung (ngày dương đã xử lý Tý muộn). */
export function batTuChart(input: BirthCalcInput): BatTuChart {
  return BatTuEngine.calcChart({ gender: input.gender, dd: input.dd, mm: input.mm, yy: input.yy, hourChiIdx: input.hourIdx });
}
/** Lập quẻ Lục Hào từ 6 lần gieo (hào 1 → hào 6, mỗi lần 6/7/8/9). */
export function castHexagram(tosses: readonly Toss[]): LucHaoResult {
  return LucHaoEngine.calcQuai(tosses);
}
/** Mệnh Quái theo năm lý số (đã đổi năm theo Lập Xuân) và giới tính. */
export function menhQuai(year: number, gender: Gender): Quai {
  return PhongThuyEngine.menhQuai(year, gender);
}

export const napAmOfBirth = napAmForBirth;

/* ===== Tóm tắt nhanh (màn hình Tổng Hợp) ===== */

export interface BirthInput {
  gender: Gender;
  /** ngày dương lịch */
  dd: number;
  mm: number;
  yy: number;
  /** 0 = Tý … 11 = Hợi */
  hourIdx: HourIdx;
  /** 23:00–23:59 tính sang ngày hôm sau */
  lateTy?: boolean;
}

export interface QuickProfile {
  tuvi: {
    lunar: TuViChart['lunar'];
    menhChi: string;
    thanChi: string;
    cucTen: string;
    cucHanh: Hanh;
    menhStars: string[];
    chart: TuViChart;
  };
  battu: { pillars: string[]; nhatChu: string; nhatChuHanh: string; chart: BatTuChart };
  battrach: { lySoYear: number; beforeLapXuan: boolean; quai: Quai; hanh: Hanh; nhom: Nhom; duNien: DuNienStar[] };
  napam: NapAmBirth;
}

/** Tóm tắt nhanh 4 hệ thống theo ngày sinh dương lịch. Ném lỗi nếu ngày không tồn tại. */
export function quickProfile(b: BirthInput): QuickProfile {
  const r = resolveBirth({
    gender: b.gender, calendar: 'solar', day: b.dd, month: b.mm, year: b.yy, leapMonth: false, hourIdx: b.hourIdx, lateTy: !!b.lateTy,
  });
  if (!r.ok) throw new Error('Ngày sinh không tồn tại trên lịch dương');
  return summarize(r.solar, r.input);
}

/** Tóm tắt nhanh từ hồ sơ (dương hoặc âm lịch, tháng nhuận, Tý muộn). Trả lỗi dạng mã nếu ngày không tồn tại. */
export function profileSummary(p: BirthProfile): { ok: true; summary: QuickProfile; birth: Extract<ResolvedBirth, { ok: true }> } | { ok: false; errors: BirthError[] } {
  const r = resolveBirth(p);
  if (!r.ok) return r;
  return { ok: true, summary: summarize(r.solar, r.input), birth: r };
}

/** Tổng Hợp 4 hệ thống từ ngày sinh đã kiểm tra. */
export function tongHopOf(birth: Extract<ResolvedBirth, { ok: true }>): TongHopReading {
  const { solar, input } = birth;
  return tongHopReading(tuViChart(input), batTuChart(input), batTrachReading(solar, input.gender), napAmForBirth(solar.dd, solar.mm, solar.yy));
}

function summarize(solar: SolarDate, input: BirthCalcInput): QuickProfile {
  const tv = tuViChart(input);
  const bt = batTuChart(input);
  const ly = PhongThuyEngine.lySoYear(solar.dd, solar.mm, solar.yy, 7);
  const quai = PhongThuyEngine.menhQuai(ly.year, input.gender);
  const na = napAmForBirth(solar.dd, solar.mm, solar.yy);

  return {
    tuvi: {
      lunar: tv.lunar,
      menhChi: CHI[tv.menhChi],
      thanChi: CHI[tv.thanChi],
      cucTen: tv.cucTen,
      cucHanh: tv.cucHanh,
      menhStars: tv.stars[tv.menhChi] || [],
      chart: tv,
    },
    battu: {
      pillars: bt.pillars.map((p) => `${CAN[p.can]} ${CHI[p.chi]}`),
      nhatChu: CAN[bt.nhatChu],
      nhatChuHanh: BatTuEngine.HANH5[BatTuEngine.CAN_HANH[bt.nhatChu]],
      chart: bt,
    },
    battrach: {
      lySoYear: ly.year,
      beforeLapXuan: ly.beforeLapXuan,
      quai,
      hanh: PhongThuyEngine.HANH[quai],
      nhom: PhongThuyEngine.nhom(quai),
      duNien: PhongThuyEngine.duNien(quai),
    },
    napam: na,
  };
}
