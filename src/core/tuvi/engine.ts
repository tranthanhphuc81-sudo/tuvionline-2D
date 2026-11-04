/* Tử Vi Đẩu Số (Phần 1): an Mệnh/Thân, Cục, 14 chính tinh, phụ tinh, vòng Trường Sinh/Thái Tuế, Tứ Hoá, Đại/Tiểu Hạn. */
import { jdFromDate, convertSolar2Lunar, convertLunar2Solar, lunarTzForSolarYear } from '../calendar';
import {
  CAN, CHI, HOUR_RANGES, DAN, mod, dayCanChiIndex, yearCanChiIndex, ngHoDonDanCan, nguThuDonTyCan, napAmLookup,
  type CanIdx, type ChiIdx, type Hanh,
} from '../canchi';
import type { CungName, DaiHan, TuViChart, TuViInput } from './types';

export const CUNG_NAME: readonly CungName[] = ['Mệnh', 'Phụ Mẫu', 'Phúc Đức', 'Điền Trạch', 'Quan Lộc', 'Nô Bộc', 'Thiên Di', 'Tật Ách', 'Tài Bạch', 'Tử Tức', 'Phu Thê', 'Huynh Đệ'];
function canOfPalaceFromDan(yearCanIdx: CanIdx, steps: number): CanIdx {
  return mod(ngHoDonDanCan(yearCanIdx) + steps, 10);
}
const CUC_SO: Record<Hanh, number> = { 'Thuỷ': 2, 'Mộc': 3, 'Kim': 4, 'Thổ': 5, 'Hoả': 6 };
const CUC_TEN: Record<Hanh, string> = { 'Thuỷ': 'Thuỷ Nhị Cục', 'Mộc': 'Mộc Tam Cục', 'Kim': 'Kim Tứ Cục', 'Thổ': 'Thổ Ngũ Cục', 'Hoả': 'Hoả Lục Cục' };

const TS_NAMES = ['Trường Sinh', 'Mộc Dục', 'Quan Đới', 'Lâm Quan', 'Đế Vượng', 'Suy', 'Bệnh', 'Tử', 'Mộ', 'Tuyệt', 'Thai', 'Dưỡng'];
// Trường Sinh của Cục: Hoả khởi Dần, Kim khởi Tỵ, Mộc khởi Hợi, Thuỷ và Thổ khởi Thân
const TS_START: Record<Hanh, ChiIdx> = { 'Hoả': 2, 'Kim': 5, 'Mộc': 11, 'Thuỷ': 8, 'Thổ': 8 };
const TT_NAMES = ['Thái Tuế', 'Thiếu Dương', 'Tang Môn', 'Thiếu Âm', 'Quan Phù', 'Tử Phù', 'Tuế Phá', 'Long Đức', 'Bạch Hổ', 'Phúc Đức', 'Điếu Khách', 'Trực Phù'];
const LOC_TON_BY_CAN: Record<number, ChiIdx> = { 0: 2, 1: 3, 2: 5, 3: 6, 4: 5, 5: 6, 6: 8, 7: 9, 8: 11, 9: 0 };
const KHOI_VIET_BY_CAN: Record<number, readonly [ChiIdx, ChiIdx]> = {
  0: [1, 7], 4: [1, 7], 6: [1, 7], 1: [0, 8], 5: [0, 8], 2: [11, 9], 3: [11, 9], 8: [3, 5], 9: [3, 5], 7: [2, 6],
};
/** Tứ Hoá theo Can năm: [Lộc, Quyền, Khoa, Kỵ] */
const TUHOA: readonly (readonly [string, string, string, string])[] = [
  ['Liêm Trinh', 'Phá Quân', 'Vũ Khúc', 'Thái Dương'], ['Thiên Cơ', 'Thiên Lương', 'Tử Vi', 'Thái Âm'],
  ['Thiên Đồng', 'Thiên Cơ', 'Văn Xương', 'Liêm Trinh'], ['Thái Âm', 'Thiên Đồng', 'Thiên Cơ', 'Cự Môn'],
  ['Tham Lang', 'Thái Âm', 'Hữu Bật', 'Thiên Cơ'], ['Vũ Khúc', 'Tham Lang', 'Thiên Lương', 'Văn Khúc'],
  ['Thái Dương', 'Vũ Khúc', 'Thái Âm', 'Thiên Đồng'], ['Cự Môn', 'Thái Dương', 'Văn Khúc', 'Văn Xương'],
  ['Thiên Lương', 'Tử Vi', 'Tả Phù', 'Vũ Khúc'], ['Phá Quân', 'Cự Môn', 'Thái Âm', 'Tham Lang'],
];

function thienMaChi(yc: ChiIdx): ChiIdx {
  if ([8, 0, 4].includes(yc)) return 2;
  if ([2, 6, 10].includes(yc)) return 8;
  if ([5, 9, 1].includes(yc)) return 11;
  return 5;
}
function tieuHanStart(yc: ChiIdx): ChiIdx {
  if ([2, 6, 10].includes(yc)) return 4;
  if ([8, 0, 4].includes(yc)) return 10;
  if ([5, 9, 1].includes(yc)) return 7;
  return 1;
}
/** Bước thứ `oneIdx` (đếm từ 1) tính từ cung Dần. */
function stepFromDan1(oneIdx: number): ChiIdx {
  return mod(DAN + (oneIdx - 1), 12);
}

export function calcChart(input: TuViInput): TuViChart {
  const TZ = input.tz || lunarTzForSolarYear(input.yy);
  const [lDay, lMonth, lYear, lLeap] = convertSolar2Lunar(input.dd, input.mm, input.yy, TZ);
  const gioIdx = input.hourBranchIdx;
  const yearCC = yearCanChiIndex(lYear);
  const dayCC = dayCanChiIndex(input.dd, input.mm, input.yy);
  const gioCanIdx = mod(nguThuDonTyCan(dayCC.can) + gioIdx, 10);
  const isDuongCan = (yearCC.can % 2 === 0);
  const isDuongNam = input.gender === 'M' && isDuongCan;
  const isAmNu = input.gender === 'F' && !isDuongCan;
  const thuanDaiHan = isDuongNam || isAmNu;
  let menhStep = lMonth - gioIdx;
  while (menhStep <= 0) menhStep += 12;
  while (menhStep > 12) menhStep -= 12;
  const menhChi = stepFromDan1(menhStep);
  let thanStep = lMonth + gioIdx;
  while (thanStep <= 0) thanStep += 12;
  while (thanStep > 12) thanStep -= 12;
  const thanChi = stepFromDan1(thanStep);
  const menhStepsFromDan = mod(menhChi - DAN, 12);
  const menhCanIdx = canOfPalaceFromDan(yearCC.can, menhStepsFromDan);
  const napAm = napAmLookup(menhCanIdx, menhChi)!; // Can cung Mệnh theo Ngũ Hổ Độn luôn cùng âm dương với Chi
  const cucHanh = napAm[2], cucSo = CUC_SO[cucHanh], cucTen = CUC_TEN[cucHanh];
  const ngay = lDay;
  const aBorrow = mod(cucSo - mod(ngay, cucSo), cucSo);
  const b = (ngay + aBorrow) / cucSo;
  let tuViChi = stepFromDan1(b);
  if (aBorrow !== 0) { if (aBorrow % 2 === 1) tuViChi = mod(tuViChi - aBorrow, 12); else tuViChi = mod(tuViChi + aBorrow, 12); }
  const stars: Record<number, string[]> = {};
  const addStar = (chiIdx: ChiIdx, name: string) => { (stars[chiIdx] = stars[chiIdx] || []).push(name); };
  addStar(tuViChi, 'Tử Vi');
  addStar(mod(tuViChi - 1, 12), 'Thiên Cơ'); addStar(mod(tuViChi - 3, 12), 'Thái Dương');
  addStar(mod(tuViChi - 4, 12), 'Vũ Khúc'); addStar(mod(tuViChi - 5, 12), 'Thiên Đồng');
  addStar(mod(tuViChi - 8, 12), 'Liêm Trinh');
  const thienPhuChi = mod(4 - tuViChi, 12);
  addStar(thienPhuChi, 'Thiên Phủ');
  addStar(mod(thienPhuChi + 1, 12), 'Thái Âm'); addStar(mod(thienPhuChi + 2, 12), 'Tham Lang');
  addStar(mod(thienPhuChi + 3, 12), 'Cự Môn'); addStar(mod(thienPhuChi + 4, 12), 'Thiên Tướng');
  addStar(mod(thienPhuChi + 5, 12), 'Thiên Lương'); addStar(mod(thienPhuChi + 6, 12), 'Thất Sát');
  addStar(mod(thienPhuChi + 10, 12), 'Phá Quân');

  const tsStart = TS_START[cucHanh];
  const truongSinh: Record<number, string> = {};
  for (let i = 0; i < 12; i++) { const c = thuanDaiHan ? mod(tsStart + i, 12) : mod(tsStart - i, 12); truongSinh[c] = TS_NAMES[i]; }

  const thaiTue: Record<number, string> = {};
  for (let i = 0; i < 12; i++) thaiTue[mod(yearCC.chi + i, 12)] = TT_NAMES[i];

  const locTonChi = LOC_TON_BY_CAN[yearCC.can];
  const kinhDuongChi = mod(locTonChi + 1, 12), daLaChi = mod(locTonChi - 1, 12);
  const thienMa = thienMaChi(yearCC.chi);
  const [khoiChi, vietChi] = KHOI_VIET_BY_CAN[yearCC.can];

  const taPhuChi = mod(4 + (lMonth - 1), 12), huuBatChi = mod(10 - (lMonth - 1), 12);
  const vanKhucChi = mod(4 + gioIdx, 12), vanXuongChi = mod(10 - gioIdx, 12);
  const diaKiepChi = mod(11 + gioIdx, 12), diaKhongChi = mod(11 - gioIdx, 12);

  const phuTinh: Record<number, string[]> = {};
  const addPhu = (c: ChiIdx, n: string) => { (phuTinh[c] = phuTinh[c] || []).push(n); };
  addPhu(locTonChi, 'Lộc Tồn'); addPhu(kinhDuongChi, 'Kình Dương'); addPhu(daLaChi, 'Đà La');
  addPhu(thienMa, 'Thiên Mã'); addPhu(khoiChi, 'Thiên Khôi'); addPhu(vietChi, 'Thiên Việt');
  addPhu(taPhuChi, 'Tả Phù'); addPhu(huuBatChi, 'Hữu Bật');
  addPhu(vanXuongChi, 'Văn Xương'); addPhu(vanKhucChi, 'Văn Khúc');
  addPhu(diaKhongChi, 'Địa Không'); addPhu(diaKiepChi, 'Địa Kiếp');

  const th = TUHOA[yearCC.can];
  const tuHoaBanMenh = { loc: th[0], quyen: th[1], khoa: th[2], ky: th[3] };

  const daiHan: DaiHan[] = [];
  for (let i = 0; i < 12; i++) {
    const c = thuanDaiHan ? mod(menhChi + i, 12) : mod(menhChi - i, 12);
    daiHan.push({ chi: c, tuoiStart: cucSo + i * 10, tuoiEnd: cucSo + i * 10 + 9, cungTen: CUNG_NAME[mod(c - menhChi, 12)] });
  }

  const tieuHanStartChi = tieuHanStart(yearCC.chi);
  const thuanTieuHan = input.gender === 'M';

  return {
    lunar: { day: lDay, month: lMonth, year: lYear, leap: lLeap }, yearCC, dayCC, gioCanIdx, gioChiIdx: gioIdx,
    isDuongCan, thuanDaiHan, menhChi, thanChi, menhCanIdx, cucHanh, cucSo, cucTen, napAmTen: napAm[3],
    tuViChi, thienPhuChi, stars, phuTinh, truongSinh, thaiTue, locTonChi, kinhDuongChi, daLaChi, thienMa,
    khoiChi, vietChi, taPhuChi, huuBatChi, vanXuongChi, vanKhucChi, diaKhongChi, diaKiepChi,
    tuHoaBanMenh, daiHan, tieuHanStartChi, thuanTieuHan, TUHOA,
  };
}

export const TuViEngine = { convertSolar2Lunar, convertLunar2Solar, jdFromDate, CAN, CHI, CUNG_NAME, HOUR_RANGES, mod, calcChart, yearCanChiIndex };
export default TuViEngine;
