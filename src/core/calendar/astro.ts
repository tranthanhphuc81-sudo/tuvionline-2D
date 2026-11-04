/* Sóc (trăng mới) và kinh độ Mặt Trời — Meeus 1998, theo bản Hồ Ngọc Đức. Giữ nguyên thứ tự phép tính. */
import { INT } from './julian';

const PI = Math.PI;

export function NewMoon(k: number): number {
  const T = k / 1236.85, T2 = T * T, T3 = T2 * T, dr = PI / 180;
  let Jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3;
  Jd1 += 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);
  const M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
  const Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
  const F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;
  let C1 = (0.1734 - 0.000393 * T) * Math.sin(M * dr) + 0.0021 * Math.sin(2 * dr * M);
  C1 -= 0.4068 * Math.sin(Mpr * dr); C1 += 0.0161 * Math.sin(dr * 2 * Mpr); C1 -= 0.0004 * Math.sin(dr * 3 * Mpr);
  C1 += 0.0104 * Math.sin(dr * 2 * F); C1 -= 0.0051 * Math.sin(dr * (M + Mpr));
  C1 -= 0.0074 * Math.sin(dr * (M - Mpr)); C1 += 0.0004 * Math.sin(dr * (2 * F + M));
  C1 -= 0.0004 * Math.sin(dr * (2 * F - M)); C1 -= 0.0006 * Math.sin(dr * (2 * F + Mpr));
  C1 += 0.0010 * Math.sin(dr * (2 * F - Mpr)); C1 += 0.0005 * Math.sin(dr * (2 * Mpr + M));
  const deltat = (T < -11)
    ? (0.001 + 0.000839 * T + 0.0002261 * T2 - 0.00000845 * T3 - 0.000000081 * T * T3)
    : (-0.000278 + 0.000265 * T + 0.000262 * T2);
  return Jd1 + C1 - deltat;
}

/** Kinh độ Mặt Trời (radian, 0…2π) tại JD (theo giờ quốc tế). */
export function SunLongitude(jdn: number): number {
  const T = (jdn - 2451545.0) / 36525, T2 = T * T, dr = PI / 180;
  const M = 357.52910 + 35999.05030 * T - 0.0001559 * T2 - 0.00000048 * T * T2;
  const L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
  let DL = (1.914600 - 0.004817 * T - 0.000014 * T2) * Math.sin(dr * M);
  DL += (0.019993 - 0.000101 * T) * Math.sin(dr * 2 * M) + 0.000290 * Math.sin(dr * 3 * M);
  let L = (L0 + DL) * dr;
  L -= PI * 2 * INT(L / (PI * 2));
  return L;
}

/** Cung hoàng đạo 0…11 (mỗi cung 30°) của Mặt Trời lúc nửa đêm đầu ngày `dayNumber` theo múi giờ. */
export function getSunLongitude(dayNumber: number, timeZone: number): number {
  return INT(SunLongitude(dayNumber - 0.5 - timeZone / 24) / PI * 6);
}

/** JD nguyên của ngày có sóc thứ k theo múi giờ. */
export function getNewMoonDay(k: number, timeZone: number): number {
  return INT(NewMoon(k) + 0.5 + timeZone / 24);
}

/** Tìm thời điểm (JD thực) Mặt Trời tới kinh độ `targetDeg`, chia đôi 60 lần trong ±6 ngày quanh `jdGuess`. */
export function findSolarTerm(jdGuess: number, targetDeg: number, tz: number): number {
  const targetRad = targetDeg * PI / 180;
  let lo = jdGuess - 6, hi = jdGuess + 6;
  function f(jd: number): number {
    const L = SunLongitude(jd - tz / 24);
    let diff = L - targetRad;
    while (diff > PI) diff -= 2 * PI;
    while (diff < -PI) diff += 2 * PI;
    return diff;
  }
  for (let i = 0; i < 60; i++) { const mid = (lo + hi) / 2; if (f(lo) * f(mid) <= 0) hi = mid; else lo = mid; }
  return (lo + hi) / 2;
}
