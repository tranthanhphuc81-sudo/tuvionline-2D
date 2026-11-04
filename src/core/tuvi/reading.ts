/* Phần TÍNH TOÁN của luận giải Tử Vi, chuyển từ legacy (lyso-toolkit.html, module LySoInterp: tuVi, tuViYear, lifeAreas,
   brightness, relCucMenh, chiRel; và doYearLookup của tab Tử Vi). Giữ nguyên từng quy tắc chấm điểm và thứ tự xét.
   Chỉ trả số liệu/mã; câu chữ dựng ở src/content/tuvi. ARCHITECTURE.md mục 5.4. */
import { CAN, CHI, mod, napAmLookup, yearCanChiIndex, type CanChi, type ChiIdx, type Hanh } from '../canchi';
import type { CungName, DaiHan, TuViChart } from './types';
import { CUNG_NAME } from './engine';

export type HoaKey = 'loc' | 'quyen' | 'khoa' | 'ky';
export const HOA_KEYS: readonly HoaKey[] = ['loc', 'quyen', 'khoa', 'ky'];
export type Tone = 'ok' | 'mid' | 'warn';

/** Phụ tinh cát / sát dùng khi chấm điểm (legacy CAT_PHU, SAT_PHU). */
export const CAT_PHU: readonly string[] = ['Tả Phù', 'Hữu Bật', 'Văn Xương', 'Văn Khúc', 'Thiên Khôi', 'Thiên Việt', 'Lộc Tồn'];
export const SAT_PHU: readonly string[] = ['Kình Dương', 'Đà La', 'Địa Không', 'Địa Kiếp'];
/** Phụ tinh có câu ngắn ở "Từng mảng cuộc sống" (legacy PHU_SHORT) — chỉ các sao này được tính điểm. */
const PHU_SCORED: readonly string[] = [...CAT_PHU, ...SAT_PHU];

export function cungNameFor(menhChi: ChiIdx, chi: ChiIdx): CungName {
  return CUNG_NAME[mod(chi - menhChi, 12)];
}

/** Độ sáng sao: chỉ xét Thái Dương / Thái Âm (1 = sáng, -1 = tối, 0 = không xét). */
export function brightness(star: string, chi: ChiIdx): -1 | 0 | 1 {
  if (star === 'Thái Dương') { if ([2, 3, 4, 5, 6].includes(chi)) return 1; if ([8, 9, 10, 11, 0].includes(chi)) return -1; }
  if (star === 'Thái Âm') { if ([8, 9, 10, 11, 0].includes(chi)) return 1; if ([2, 3, 4, 5, 6].includes(chi)) return -1; }
  return 0;
}

/** Bản mệnh = Nạp Âm của can chi năm âm (legacy gắn vào chart là `banMenh`; ở đây tính riêng để không đổi đầu ra calcChart). */
export function banMenh(ch: TuViChart): { hanh: Hanh; ten: string } {
  const r = napAmLookup(ch.yearCC.can, ch.yearCC.chi)!;
  return { hanh: r[2], ten: r[3] };
}

const SINH_ORDER: readonly Hanh[] = ['Mộc', 'Hoả', 'Thổ', 'Kim', 'Thuỷ'];
const sinhRa = (h: Hanh) => SINH_ORDER[(SINH_ORDER.indexOf(h) + 1) % 5];
const khacDi = (h: Hanh) => SINH_ORDER[(SINH_ORDER.indexOf(h) + 2) % 5];
export type CucMenhRel = 'same' | 'cuc-sinh-menh' | 'menh-sinh-cuc' | 'menh-khac-cuc' | 'cuc-khac-menh';
/** Cục so với bản mệnh (legacy relCucMenh): điểm s và mã quan hệ. */
export function relCucMenh(cuc: Hanh, menh: Hanh): { s: number; kind: CucMenhRel } {
  if (cuc === menh) return { s: 1, kind: 'same' };
  if (sinhRa(cuc) === menh) return { s: 2, kind: 'cuc-sinh-menh' };
  if (sinhRa(menh) === cuc) return { s: 0, kind: 'menh-sinh-cuc' };
  if (khacDi(menh) === cuc) return { s: 0, kind: 'menh-khac-cuc' };
  return { s: -1, kind: 'cuc-khac-menh' };
}

const LUC_HOP: readonly (readonly [number, number])[] = [[0, 1], [2, 11], [3, 10], [4, 9], [5, 8], [6, 7]];
const LUC_XUNG: readonly (readonly [number, number])[] = [[0, 6], [1, 7], [2, 8], [3, 9], [4, 10], [5, 11]];
const TAM_HOP: readonly (readonly number[])[] = [[8, 0, 4], [2, 6, 10], [5, 9, 1], [11, 3, 7]];
export type ChiRelKind = 'same' | 'luc-hop' | 'tam-hop' | 'luc-xung' | 'none';
/** Quan hệ hai Chi theo dân gian (legacy chiRel, dùng chung cho Tử Vi lưu niên và Nạp Âm). */
export function chiRel(a: ChiIdx, b: ChiIdx): { s: number; kind: ChiRelKind } {
  const inPairs = (P: readonly (readonly [number, number])[]) => P.some((x) => (x[0] === a && x[1] === b) || (x[0] === b && x[1] === a));
  if (a === b) return { s: 0, kind: 'same' };
  if (inPairs(LUC_HOP)) return { s: 1, kind: 'luc-hop' };
  if (TAM_HOP.some((g) => g.includes(a) && g.includes(b))) return { s: 1, kind: 'tam-hop' };
  if (inPairs(LUC_XUNG)) return { s: -1, kind: 'luc-xung' };
  return { s: 0, kind: 'none' };
}

/** Tam phương tứ chính của một cung: chính nó, hai cung tam hợp (+4, +8) và cung xung chiếu (+6). */
export function tamPhuong(chi: ChiIdx): [ChiIdx, ChiIdx, ChiIdx, ChiIdx] {
  return [chi, (chi + 4) % 12, (chi + 8) % 12, (chi + 6) % 12];
}

const starsAt = (ch: TuViChart, c: ChiIdx) => ch.stars[c] || [];
const phuAt = (ch: TuViChart, c: ChiIdx) => ch.phuTinh[c] || [];
/** Cung chứa một sao (chính tinh hoặc phụ tinh), -1 nếu không có. */
export function chiOfStar(ch: TuViChart, name: string): ChiIdx {
  for (let c = 0; c < 12; c++) if (starsAt(ch, c).includes(name) || phuAt(ch, c).includes(name)) return c;
  return -1;
}

/** Chính tinh của cung; cung trống thì mượn cung xung chiếu (borrowed). */
export function mainStarsOf(ch: TuViChart, c: ChiIdx): { stars: string[]; borrowed: boolean; srcChi: ChiIdx } {
  const own = starsAt(ch, c);
  if (own.length) return { stars: own, borrowed: false, srcChi: c };
  return { stars: starsAt(ch, (c + 6) % 12), borrowed: true, srcChi: (c + 6) % 12 };
}

const toneOf = (score: number): Tone => (score >= 1 ? 'ok' : score < 0 ? 'warn' : 'mid');

/* ===== Lưu niên (đọc riêng từng năm) ===== */

export interface LuuHoa { key: HoaKey; star: string; chi: ChiIdx; cung: CungName; inFocus: boolean }
export interface TuViYearReading {
  year: number;
  canChi: string;
  yearCC: CanChi;
  /** tuổi âm */
  age: number;
  /** cung có Thái Tuế của năm */
  thaiTueCung: CungName;
  tieuHanChi: ChiIdx;
  tieuHanCung: CungName;
  tieuHanStars: string[];
  tieuHanSat: string[];
  tieuHanCat: string[];
  /** Tứ Hoá của năm theo Can năm, chỉ các sao có trên lá số, theo thứ tự Lộc, Quyền, Khoa, Kỵ */
  luuHoa: LuuHoa[];
  namTuoi: boolean;
  /** quan hệ Chi năm với cung Mệnh: chỉ 'xung' (Lục Xung) và 'hop' (Lục/Tam Hợp) được xét */
  menhRel: 'xung' | 'hop' | null;
  score: number;
  tone: Tone;
}

/** Legacy tuViYear. Trả null nếu năm trước năm sinh (tuổi âm < 1). */
export function tuViYear(ch: TuViChart, year: number): TuViYearReading | null {
  const m = ch.menhChi, yc = yearCanChiIndex(year), age = year - ch.lunar.year + 1;
  if (age < 1) return null;
  const thChi = mod(ch.tieuHanStartChi + (age - 1) * (ch.thuanTieuHan ? 1 : -1), 12);
  const tp: number[] = [...tamPhuong(m), thChi];
  let score = 0;
  const thSat = phuAt(ch, thChi).filter((x) => SAT_PHU.includes(x));
  const thCat = phuAt(ch, thChi).filter((x) => CAT_PHU.includes(x));
  if (thCat.length) score += 0.5;
  if (thSat.length) score -= Math.min(1, thSat.length * 0.5);
  const luu = ch.TUHOA[yc.can];
  const luuHoa: LuuHoa[] = [];
  HOA_KEYS.forEach((key, i) => {
    const c = chiOfStar(ch, luu[i]);
    if (c < 0) return;
    const inFocus = tp.includes(c);
    luuHoa.push({ key, star: luu[i], chi: c, cung: cungNameFor(m, c), inFocus });
    if (inFocus) score += key === 'ky' ? -1 : 1;
  });
  const namTuoi = yc.chi === ch.yearCC.chi;
  if (namTuoi) score -= 0.5;
  const r = chiRel(yc.chi, m);
  let menhRel: TuViYearReading['menhRel'] = null;
  if (r.s < 0 && r.kind === 'luc-xung') { score -= 1; menhRel = 'xung'; }
  else if (r.s > 0) { score += 1; menhRel = 'hop'; }
  return {
    year, canChi: CAN[yc.can] + ' ' + CHI[yc.chi], yearCC: yc, age,
    thaiTueCung: cungNameFor(m, yc.chi), tieuHanChi: thChi, tieuHanCung: cungNameFor(m, thChi), tieuHanStars: starsAt(ch, thChi),
    tieuHanSat: thSat, tieuHanCat: thCat, luuHoa, namTuoi, menhRel, score, tone: toneOf(score),
  };
}

/** Bảng "Tra vận hạn theo năm" (legacy doYearLookup): tuổi, can chi năm, cung Đại Hạn, cung Tiểu Hạn, Tứ Hoá lưu niên. */
export interface TuViYearLookup {
  year: number;
  age: number;
  yearCC: CanChi;
  /** null khi tuổi ≤ 0 */
  daiHanChi: ChiIdx | null;
  /** Đại Hạn đang đi (null nếu ngoài 12 chặng đầu) */
  daiHan: DaiHan | null;
  tieuHanChi: ChiIdx | null;
  tuHoa: Record<HoaKey, string>;
}
export function tuViYearLookup(ch: TuViChart, year: number): TuViYearLookup {
  const age = year - ch.lunar.year + 1;
  const yc = yearCanChiIndex(year);
  const tieuHanChi = mod(ch.tieuHanStartChi + (age - 1) * (ch.thuanTieuHan ? 1 : -1), 12);
  const dh = ch.daiHan.find((d) => age >= d.tuoiStart && age <= d.tuoiEnd) ?? null;
  let daiHanChi: ChiIdx | null = dh ? dh.chi : null;
  if (!dh && age > 0) {
    // ngoài 12 chặng (trên 120 tuổi): quay vòng 12 cung
    const idx = Math.floor((age - ch.cucSo) / 10) % 12;
    const norm = ((idx % 12) + 12) % 12;
    daiHanChi = ch.thuanDaiHan ? mod(ch.menhChi + norm, 12) : mod(ch.menhChi - norm, 12);
  }
  const t = ch.TUHOA[yc.can];
  return {
    year, age, yearCC: yc, daiHanChi, daiHan: dh, tieuHanChi: age > 0 ? tieuHanChi : null,
    tuHoa: { loc: t[0], quyen: t[1], khoa: t[2], ky: t[3] },
  };
}

/* ===== Từng mảng cuộc sống ===== */

export type AreaKey = 'tai' | 'quan' | 'phu' | 'tat' | 'dien' | 'di';
export const AREA_CUNG: readonly { key: AreaKey; cung: CungName }[] = [
  { key: 'tai', cung: 'Tài Bạch' }, { key: 'quan', cung: 'Quan Lộc' }, { key: 'phu', cung: 'Phu Thê' },
  { key: 'tat', cung: 'Tật Ách' }, { key: 'dien', cung: 'Điền Trạch' }, { key: 'di', cung: 'Thiên Di' },
];
export interface AreaReading {
  key: AreaKey;
  cung: CungName;
  chi: ChiIdx;
  stars: string[];
  borrowed: boolean;
  /** sao có độ sáng ≠ 0, theo thứ tự chính tinh */
  bright: { star: string; br: 1 | -1 }[];
  hoa: HoaKey[];
  /** phụ tinh được xét (cát hoặc sát), theo thứ tự trên lá số */
  phu: string[];
  score: number;
  tone: Tone;
}
export function lifeAreas(ch: TuViChart): AreaReading[] {
  const m = ch.menhChi;
  return AREA_CUNG.map(({ key, cung }) => {
    const c = (m + CUNG_NAME.indexOf(cung)) % 12;
    const { stars, borrowed, srcChi } = mainStarsOf(ch, c);
    let score = 0;
    const bright: AreaReading['bright'] = [];
    stars.forEach((s) => { const br = brightness(s, srcChi); if (br) { score += br * 0.5; bright.push({ star: s, br }); } });
    const hoa = HOA_KEYS.filter((k) => chiOfStar(ch, ch.tuHoaBanMenh[k]) === c);
    hoa.forEach((k) => { score += k === 'ky' ? -1 : 1; });
    const phu = phuAt(ch, c).filter((x) => PHU_SCORED.includes(x));
    phu.forEach((x) => { score += CAT_PHU.includes(x) ? 0.5 : -0.5; });
    return { key, cung, chi: c, stars, borrowed, bright, hoa, phu, score, tone: toneOf(score) };
  });
}

/* ===== Tổng kết ===== */

export interface DaiHanNow {
  /** tuổi âm hiện tại */
  age: number;
  index: number;
  daiHan: DaiHan;
  stars: string[];
  borrowed: boolean;
  hoa: HoaKey[];
  sat: string[];
  cat: string[];
  next: DaiHan | null;
}

export interface TuViReading {
  menhChi: ChiIdx;
  main: string[];
  borrowed: boolean;
  /** độ sáng các chính tinh ở Mệnh (hoặc cung mượn) */
  menhBright: { star: string; br: 1 | -1 }[];
  phuMenh: string[];
  /** cung chứa sao Tứ Hoá bản mệnh (null nếu sao không có trên lá số) */
  hoaCung: Record<HoaKey, CungName | null>;
  thanCung: CungName;
  banMenh: { hanh: Hanh; ten: string };
  cucMenh: { s: number; kind: CucMenhRel };
  score: number;
  /** ngưỡng riêng của đánh giá chung: ≥ 2,5 ok, ≥ 0 mid, còn lại warn */
  tone: Tone;
  daiHanNow: DaiHanNow | null;
  /** lưu niên năm nay và 2 năm tới (bỏ năm trước năm sinh) */
  years: TuViYearReading[];
  areas: AreaReading[];
}

/** Legacy tuVi(): mọi phép chấm của phần "Tổng kết". `nowYear` thay cho new Date().getFullYear() để test được. */
export function tuViReading(ch: TuViChart, nowYear: number): TuViReading {
  const m = ch.menhChi;
  const { stars: main, borrowed, srcChi } = mainStarsOf(ch, m);
  let menhBrightScore = 0;
  const menhBright: TuViReading['menhBright'] = [];
  main.forEach((st) => { const br = brightness(st, srcChi); if (br) { menhBrightScore += br * 0.5; menhBright.push({ star: st, br }); } });
  const hoaCung = {} as Record<HoaKey, CungName | null>;
  for (const k of HOA_KEYS) { const c = chiOfStar(ch, ch.tuHoaBanMenh[k]); hoaCung[k] = c >= 0 ? cungNameFor(m, c) : null; }
  const bm = banMenh(ch);
  const cucMenh = relCucMenh(ch.cucHanh, bm.hanh);
  const tp: number[] = tamPhuong(m);
  let score = cucMenh.s + menhBrightScore;
  tp.forEach((c) => phuAt(ch, c).forEach((x) => { if (CAT_PHU.includes(x)) score += 0.5; if (SAT_PHU.includes(x)) score -= 0.5; }));
  (['loc', 'quyen', 'khoa'] as const).forEach((k) => { if (tp.includes(chiOfStar(ch, ch.tuHoaBanMenh[k]))) score += 1; });
  if (tp.includes(chiOfStar(ch, ch.tuHoaBanMenh.ky))) score -= 1;
  const tone: Tone = score >= 2.5 ? 'ok' : score >= 0 ? 'mid' : 'warn';

  const age = nowYear - ch.lunar.year + 1;
  let dhIdx = -1;
  ch.daiHan.forEach((d, i) => { if (age >= d.tuoiStart && age <= d.tuoiEnd) dhIdx = i; });
  let daiHanNow: DaiHanNow | null = null;
  if (dhIdx >= 0) {
    const dh = ch.daiHan[dhIdx];
    const ms = mainStarsOf(ch, dh.chi);
    daiHanNow = {
      age, index: dhIdx, daiHan: dh, stars: ms.stars, borrowed: ms.borrowed,
      hoa: HOA_KEYS.filter((k) => chiOfStar(ch, ch.tuHoaBanMenh[k]) === dh.chi),
      sat: phuAt(ch, dh.chi).filter((x) => SAT_PHU.includes(x)),
      cat: phuAt(ch, dh.chi).filter((x) => CAT_PHU.includes(x)),
      next: ch.daiHan[dhIdx + 1] ?? null,
    };
  }
  const years = [0, 1, 2].map((k) => tuViYear(ch, nowYear + k)).filter((y): y is TuViYearReading => y !== null);
  return {
    menhChi: m, main, borrowed, menhBright, phuMenh: phuAt(ch, m), hoaCung, thanCung: cungNameFor(m, ch.thanChi),
    banMenh: bm, cucMenh, score, tone, daiHanNow, years, areas: lifeAreas(ch),
  };
}
