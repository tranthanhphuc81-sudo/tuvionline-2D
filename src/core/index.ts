// Điểm vào duy nhất cho phần tính toán (core). UI chỉ import từ đây.
// Các engine bên dưới được trích nguyên văn từ bản web đã kiểm chứng (legacy/lyso-toolkit.html).
import { pad2, validSolar, validLunar, shiftSolar, lunarTzForSolarYear, lunarTzForLunarYear } from './calendar';
import { TuViEngine as _TuVi } from './tuvi.js';
import { BatTuEngine as _BatTu } from './battu.js';
import { LucHaoEngine as _LucHao } from './luchao.js';
import { PhongThuyEngine as _BatTrach } from './battrach.js';
import { NapAmEngine } from './napam/engine';

/* eslint-disable @typescript-eslint/no-explicit-any */
// Tạm thời để kiểu `any` vì engine còn là JS trích nguyên văn — Phase 1 (PROMPT-KIT) sẽ viết lại bằng TypeScript có kiểu đầy đủ.
export const LySoUtil = { pad2, validSolar, validLunar, shiftSolar, lunarTzForSolarYear, lunarTzForLunarYear };
export const TuViEngine: any = _TuVi;
export const BatTuEngine: any = _BatTu;
export const LucHaoEngine: any = _LucHao;
export const PhongThuyEngine: any = _BatTrach;
export { NapAmEngine };
export type { NapAmYear, NapAmRelation, NapAmRelationKind, NapAmNeedsId } from './napam/types';
export type { Hanh } from './canchi/hanh';

export type Gender = 'M' | 'F';

export interface BirthInput {
  gender: Gender;
  dd: number; // ngày dương lịch
  mm: number;
  yy: number;
  hourIdx: number; // 0 = Tý ... 11 = Hợi
  lateTy?: boolean; // 23:00–23:59 tính sang ngày hôm sau
}

/** Nạp Âm theo năm ÂM LỊCH (đổi năm vào Tết), không theo năm dương lịch. */
export function napAmForBirth(dd: number, mm: number, yy: number) {
  const lunar = TuViEngine.convertSolar2Lunar(dd, mm, yy, LySoUtil.lunarTzForSolarYear(yy));
  const res = NapAmEngine.napAmOfYear(lunar[2]);
  return { ...res, lunar: { day: lunar[0], month: lunar[1], year: lunar[2], leap: lunar[3] }, beforeTet: lunar[2] !== yy };
}

/** Tóm tắt nhanh 4 hệ thống theo ngày sinh — dùng cho màn hình Tổng Hợp. */
export function quickProfile(b: BirthInput) {
  if (!LySoUtil.validSolar(b.dd, b.mm, b.yy)) throw new Error('Ngày sinh không tồn tại trên lịch dương');
  let [cd, cm, cy] = [b.dd, b.mm, b.yy];
  if (b.hourIdx === 0 && b.lateTy) [cd, cm, cy] = LySoUtil.shiftSolar(b.dd, b.mm, b.yy, 1);

  const tv = TuViEngine.calcChart({ gender: b.gender, dd: cd, mm: cm, yy: cy, hourBranchIdx: b.hourIdx });
  const bt = BatTuEngine.calcChart({ gender: b.gender, dd: cd, mm: cm, yy: cy, hourChiIdx: b.hourIdx });
  const ly = PhongThuyEngine.lySoYear(b.dd, b.mm, b.yy, 7);
  const quai = PhongThuyEngine.menhQuai(ly.year, b.gender);
  const na = napAmForBirth(b.dd, b.mm, b.yy);
  const { CAN, CHI } = TuViEngine;

  return {
    tuvi: {
      lunar: tv.lunar,
      menhChi: CHI[tv.menhChi],
      thanChi: CHI[tv.thanChi],
      cucTen: tv.cucTen,
      cucHanh: tv.cucHanh,
      menhStars: (tv.stars[tv.menhChi] || []) as string[],
      chart: tv,
    },
    battu: {
      pillars: bt.pillars.map((p: { can: number; chi: number }) => `${CAN[p.can]} ${CHI[p.chi]}`),
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
