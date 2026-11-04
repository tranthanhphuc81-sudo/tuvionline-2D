/* Tính đầu ra của engine cho từng ca, trả về Map<khoá ca, giá trị>. Chỉ dùng API công khai của src/core. */
import { LySoUtil, TuViEngine, BatTuEngine, LucHaoEngine, PhongThuyEngine, NapAmEngine, napAmForBirth, quickProfile } from '../../src/core';
import { allTosses, lapXuanDates, spreadDates, tietDates, type SolarDate } from './cases';

type Out = Map<string, unknown>;
const key = (d: SolarDate) => `${d.yy}-${d.mm}-${d.dd}`;
const tz = (yy: number) => LySoUtil.lunarTzForSolarYear(yy);

export function computeCalendar(out: Out) {
  for (const d of spreadDates(11)) {
    out.set(`s2l:${key(d)}`, TuViEngine.convertSolar2Lunar(d.dd, d.mm, d.yy, tz(d.yy)));
    out.set(`s2l7:${key(d)}`, TuViEngine.convertSolar2Lunar(d.dd, d.mm, d.yy, 7));
    out.set(`dayCC:${key(d)}`, LucHaoEngine.dayCanChiIndex(d.dd, d.mm, d.yy));
    out.set(`valid:${key(d)}`, [LySoUtil.validSolar(d.dd, d.mm, d.yy), LySoUtil.validSolar(31, d.mm, d.yy), LySoUtil.validSolar(29, 2, d.yy)]);
    out.set(`shift:${key(d)}`, [LySoUtil.shiftSolar(d.dd, d.mm, d.yy, 1), LySoUtil.shiftSolar(d.dd, d.mm, d.yy, -1)]);
  }
  for (let ly = 1900; ly <= 2099; ly++) {
    for (let m = 1; m <= 12; m++) {
      for (const leap of [0, 1]) {
        out.set(`l2s:${ly}-${m}-${leap}`, [
          TuViEngine.convertLunar2Solar(1, m, ly, leap, LySoUtil.lunarTzForLunarYear(ly)),
          TuViEngine.convertLunar2Solar(15, m, ly, leap, 7),
          BatTuEngine.convertLunar2Solar(29, m, ly, leap, 8),
        ]);
      }
    }
  }
}

export function computeTuVi(out: Out) {
  const dates = spreadDates(17);
  dates.forEach((d, i) => {
    const gender = i % 2 ? 'F' : 'M';
    out.set(`tuvi:${key(d)}:${gender}:${i % 12}`, TuViEngine.calcChart({ gender, dd: d.dd, mm: d.mm, yy: d.yy, hourBranchIdx: i % 12 }));
  });
  // tham số tz tuỳ chọn
  for (const d of spreadDates(401)) {
    out.set(`tuvi-tz8:${key(d)}`, TuViEngine.calcChart({ gender: 'M', dd: d.dd, mm: d.mm, yy: d.yy, hourBranchIdx: 3, tz: 8 }));
  }
  out.set('tuvi:consts', { CAN: TuViEngine.CAN, CHI: TuViEngine.CHI, CUNG_NAME: TuViEngine.CUNG_NAME, HOUR_RANGES: TuViEngine.HOUR_RANGES });
  out.set('tuvi:yearCC', Array.from({ length: 201 }, (_, i) => TuViEngine.yearCanChiIndex(1900 + i)));
  out.set('tuvi:jd', spreadDates(997).map((d) => TuViEngine.jdFromDate(d.dd, d.mm, d.yy)));
}

export function computeBatTu(out: Out) {
  const dates = [...spreadDates(23), ...lapXuanDates(), ...tietDates()];
  dates.forEach((d, i) => {
    const gender = i % 2 ? 'F' : 'M';
    const h = (i * 5) % 12;
    out.set(`battu:${key(d)}:${gender}:${h}:${i}`, BatTuEngine.calcChart({ gender, dd: d.dd, mm: d.mm, yy: d.yy, hourChiIdx: h }));
  });
  const { CAN, HANH5, CAN_HANH, CHI_HANH, TANG_CAN, THAP_THAN, GIUP_THAN, VTHTT_ORDER } = BatTuEngine;
  out.set('battu:consts', { CAN, HANH5, CAN_HANH, CHI_HANH, TANG_CAN, THAP_THAN, GIUP_THAN, VTHTT_ORDER });
  const tt: string[][] = [];
  for (let a = 0; a < 10; a++) tt.push(Array.from({ length: 10 }, (_, b) => BatTuEngine.thapThan(a, b)));
  out.set('battu:thapThan', tt);
  out.set('battu:season', Array.from({ length: 12 }, (_, c) => BatTuEngine.seasonHanh(c)));
}

export function computeLucHao(out: Out) {
  for (const t of allTosses()) out.set(`quai:${t.join('')}`, LucHaoEngine.calcQuai(t));
  for (const d of [...spreadDates(29), ...tietDates()]) out.set(`monthChi:${key(d)}`, LucHaoEngine.monthChiFromDate(d.dd, d.mm, d.yy, 7));
  const { CAN, CHI, HANH5, TRI, TRI_TUONG, VTHTT, CHI_HANH_IDX } = LucHaoEngine;
  out.set('luchao:consts', { CAN, CHI, HANH5, TRI, TRI_TUONG, VTHTT, CHI_HANH_IDX });
  const rel: (string | null)[][] = [];
  for (let a = 0; a < 12; a++) rel.push(Array.from({ length: 12 }, (_, b) => LucHaoEngine.chiRelation(a, b)));
  out.set('luchao:chiRelation', rel);
  out.set('luchao:season', Array.from({ length: 12 }, (_, c) => LucHaoEngine.seasonOfMonthChi(c)));
  const lt: string[][] = [];
  for (let a = 0; a < 5; a++) lt.push(Array.from({ length: 5 }, (_, b) => LucHaoEngine.lucThan(a, b)));
  out.set('luchao:lucThan', lt);
}

export function computeBatTrach(out: Out, starDesc: (star: string) => string) {
  for (let y = 1900; y <= 2100; y++) out.set(`menhQuai:${y}`, [PhongThuyEngine.menhQuai(y, 'M'), PhongThuyEngine.menhQuai(y, 'F')]);
  for (const d of [...spreadDates(31), ...lapXuanDates()]) {
    out.set(`lySoYear:${key(d)}`, [PhongThuyEngine.lySoYear(d.dd, d.mm, d.yy, 7), PhongThuyEngine.lySoYear(d.dd, d.mm, d.yy, 8)]);
  }
  for (const q of ['Càn', 'Khảm', 'Cấn', 'Chấn', 'Tốn', 'Ly', 'Khôn', 'Đoài'] as const) {
    out.set(`duNien:${q}`, PhongThuyEngine.duNien(q).map((s: { star: string; good: boolean; quai: string; hanh: string }) => ({
      star: s.star, good: s.good, desc: starDesc(s.star), quai: s.quai, hanh: s.hanh,
    })));
    out.set(`nhom:${q}`, PhongThuyEngine.nhom(q));
  }
  const { HANH, HAU_THIEN, QUAI_TO_HUONG, DOI_HUONG, HANH_COLOR, SINH_PREV, KHAC_PREV, KHAC_NEXT } = PhongThuyEngine;
  out.set('battrach:consts', { HANH, HAU_THIEN, QUAI_TO_HUONG, DOI_HUONG, HANH_COLOR, SINH_PREV, KHAC_PREV, KHAC_NEXT });
  for (let y = 1900; y <= 2100; y += 3) out.set(`lapXuanJD:${y}`, [PhongThuyEngine.lapXuanJD(y, 7), PhongThuyEngine.lapXuanJD(y, 8)]);
  for (const jd of [2415020.4, 2415020.5, 2440587.49, 2451545, 2460000.6, 2488069.5]) out.set(`ptJdToDate:${jd}`, PhongThuyEngine.jdToDate(jd));
}

export function computeNapAm(out: Out, relationText: (a: unknown, b: unknown) => { cls: string; text: string }) {
  for (let y = 1900; y <= 2100; y++) out.set(`napam:${y}`, NapAmEngine.napAmOfYear(y));
  // 60 năm 1924–1983 phủ đủ 30 Nạp Âm × 2; xét mọi cặp
  const ys = Array.from({ length: 60 }, (_, i) => 1924 + i);
  for (const a of ys) {
    const pa = NapAmEngine.napAmOfYear(a);
    out.set(`napamRel:${a}`, ys.map((b) => relationText(pa, NapAmEngine.napAmOfYear(b))));
  }
  for (const d of spreadDates(37)) out.set(`napamBirth:${key(d)}`, napAmForBirth(d.dd, d.mm, d.yy));
  out.set('napam:consts', { NAPAM: NapAmEngine.NAPAM, HANH_ORDER: NapAmEngine.HANH_ORDER });
}

export function computeQuickProfile(out: Out, starDesc: (star: string) => string) {
  spreadDates(61).forEach((d, i) => {
    const gender = i % 2 ? 'F' : 'M';
    const hourIdx = i % 12;
    const lateTy = hourIdx === 0 && i % 4 === 0;
    const p = quickProfile({ gender, dd: d.dd, mm: d.mm, yy: d.yy, hourIdx, lateTy });
    const duNien = p.battrach.duNien.map((s: { star: string; good: boolean; quai: string; hanh: string }) => ({
      star: s.star, good: s.good, desc: starDesc(s.star), quai: s.quai, hanh: s.hanh,
    }));
    out.set(`quick:${key(d)}:${gender}:${hourIdx}:${lateTy}`, { ...p, battrach: { ...p.battrach, duNien } });
  });
}
