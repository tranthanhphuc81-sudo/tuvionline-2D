/* Tìm 3 đường chỉ chính trên ảnh lòng bàn tay đã xoay về khung chuẩn (ngón cái bên trái, cổ tay ở dưới).
   Mỗi đường có một dải dự kiến; trong dải đó tìm đoạn liên tục có tổng "độ rõ đường vân" lớn nhất, nên đầu đuôi tự cắt khi đường mờ đi. */
import { PRIORS } from './priors';
import { SIZE, type LineId, type Pt } from './types';

/** `points`: mọi điểm thuộc đường, nối từ các đoạn. `segments`: từng đoạn liền. `breaks`: giữa các chỗ đứt, để hỏi lại người dùng. */
export interface Line { id: LineId; points: Pt[]; segments: Pt[][]; breaks: Pt[]; coverage: number; strength: number; margin: number; sure: boolean }
export interface Quality { sharpness: number; brightness: number; glare: number; good: boolean; issues: string[] }
export interface Analysis { lines: Line[]; quality: Quality; ridge: Float32Array; sure: boolean }

function blur(src: Float32Array, n: number, r: number): Float32Array {
  let a = src.slice(), b = new Float32Array(src.length);
  const w = 2 * r + 1;
  for (let pass = 0; pass < 3; pass++) {
    for (let y = 0; y < n; y++) {
      let s = 0;
      for (let x = -r; x <= r; x++) s += a[y * n + Math.min(n - 1, Math.max(0, x))];
      for (let x = 0; x < n; x++) {
        b[y * n + x] = s / w;
        s += a[y * n + Math.min(n - 1, x + r + 1)] - a[y * n + Math.max(0, x - r)];
      }
    }
    for (let x = 0; x < n; x++) {
      let s = 0;
      for (let y = -r; y <= r; y++) s += b[Math.min(n - 1, Math.max(0, y)) * n + x];
      for (let y = 0; y < n; y++) {
        a[y * n + x] = s / w;
        s += b[Math.min(n - 1, y + r + 1) * n + x] - b[Math.max(0, y - r) * n + x];
      }
    }
  }
  return a;
}

function percentile(values: number[], p: number): number {
  if (!values.length) return 1;
  const s = values.slice().sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.floor(s.length * p))];
}

/** Đường chỉ là rãnh tối: đo độ cong lớn nhất của độ sáng ở nhiều bề rộng. Kênh xanh lá cho rãnh tương phản tốt nhất trên da. */
export function ridgeMap(gray: Float32Array, mask: Uint8Array, n: number): { ridge: Float32Array; dir: Direction } {
  const out = new Float32Array(n * n);
  const dir: Direction = { x: new Float32Array(n * n), y: new Float32Array(n * n) };
  const scales: readonly (readonly [number, number])[] = TUNE.bigScale ? [[2, 3], [3, 5], [4, 7]] : [[2, 3], [3, 5]];
  for (const [r, h] of scales) {
    const g = blur(gray, n, r);
    for (let y = h; y < n - h; y++) for (let x = h; x < n - h; x++) {
      if (!mask[y * n + x]) continue;
      const c = g[y * n + x], l = g[y * n + x - h], rr = g[y * n + x + h], u = g[(y - h) * n + x], d = g[(y + h) * n + x];
      const xx = l + rr - 2 * c, yy = u + d - 2 * c;
      const xy = (g[(y + h) * n + x + h] + g[(y - h) * n + x - h] - g[(y + h) * n + x - h] - g[(y - h) * n + x + h]) / 4;
      const v = 0.5 * (xx + yy + Math.sqrt((xx - yy) ** 2 + 4 * xy * xy));
      if (v > out[y * n + x]) {
        out[y * n + x] = v;
        // Véc-tơ riêng của độ cong lớn nhất chỉ ngang rãnh, hướng rãnh vuông góc với nó
        const ax = xy, ay = v - xx, len = Math.hypot(ax, ay) || 1;
        dir.x[y * n + x] = -ay / len;
        dir.y[y * n + x] = ax / len;
      }
    }
  }
  const sample: number[] = [];
  for (let i = 0; i < out.length; i += 3) if (mask[i]) sample.push(out[i]);
  const top = percentile(sample, 0.99) || 1;
  for (let i = 0; i < out.length; i++) out[i] = Math.min(1, out[i] / top);
  return { ridge: out, dir };
}

interface Band { from: number; to: number; lo(u: number): number; hi(u: number): number; vertical: boolean }
interface Trace { points: Pt[]; score: number; strength: number }
const STEP = 2, MOVE = 2;
/** Các ngưỡng dò đường, để thử nhiều mức trên ảnh đã có đường chuẩn (`window.__bench`). */
export const TUNE = {
  gapCost: 0.14, cut: true, cutRatio: 0.2, minContrast: 0.012, smallHole: 40, minSegment: 18, maxGap: 60, maxShift: 28, maxTurn: 40,
  /* Dải tìm trên khung chuẩn, lấy từ đường chuẩn của 7 ảnh thật: y = a + b·x. Tâm đạo dốc xuống về phía ngón út, Trí đạo bắt đầu cao hơn dải cũ. */
  tamFrom: 0.22, tamLoA: 0.02, tamLoB: 0.2, tamHiA: 0.2, tamHiB: 0.24,
  triFrom: 0.08, triLoA: 0.13, triLoB: 0.12, triHiA: 0.34, triHiB: 0.36, triBelowPx: 8,
  sinhFrom: 0.18, dinhLo: 0.36, dinhHi: 0.58, dinhFrom: 0.2,
  /** Thêm thang đo cho nét lớn: đường chính thường rộng hơn vân nhỏ. */
  bigScale: true,
  /** 0…1: thưởng khi hướng rãnh trùng hướng đi của đường, vân vụn không đi cùng một hướng. */
  orient: 0,
  /** Độ phạt khi lệch khỏi hình dáng trung bình của đường. */
  priorK: 0.4,
  priors: PRIORS as Partial<Record<LineId, Prior>>,
};

/** Hình dáng trung bình của một đường theo vị trí u (0…1, PRIOR_BINS khoảng): `m` là vị trí v trung bình, `s` là độ lệch chuẩn. */
export interface Prior { m: number[]; s: number[] }
export const PRIOR_BINS = 20;
export interface Direction { x: Float32Array; y: Float32Array }

/** Tìm đoạn điểm cao nhất, đi đơn điệu theo trục u và lệch tối đa `MOVE` bước trên trục v mỗi lần. Đoạn đường không rõ bị trừ điểm nên tự dừng. */
function trace(ridge: Float32Array, n: number, b: Band, dir: Direction, prior?: Prior, blocked?: Uint8Array): Trace | null {
  const at = (u: number, v: number) => {
    const i = b.vertical ? u * n + v : v * n + u;
    return blocked?.[i] ? 0 : ridge[i];
  };
  const index = (u: number, v: number) => (b.vertical ? u * n + v : v * n + u);
  /** Hệ số theo hướng: rãnh chạy cùng hướng bước đi thì giữ nguyên, chạy ngang thì giảm. */
  const steps = Array.from({ length: 2 * MOVE + 1 }, (_, i) => {
    const d = i - MOVE, l = Math.hypot(1, d);
    return b.vertical ? { x: d / l, y: 1 / l } : { x: 1 / l, y: d / l };
  });
  const aligned = (u: number, v: number, d: number) => {
    if (!TUNE.orient) return 1;
    const i = index(u, v), s = steps[d + MOVE];
    return 1 - TUNE.orient + TUNE.orient * Math.abs(dir.x[i] * s.x + dir.y[i] * s.y);
  };
  const penalty = (t: number, vPx: number) => {
    if (!prior || !TUNE.priorK) return 0;
    const k = Math.max(0, Math.min(PRIOR_BINS, Math.round(t * PRIOR_BINS)));
    const z = (vPx / n - prior.m[k]) / prior.s[k];
    return TUNE.priorK * Math.min(1, (z * z) / 9);
  };
  const uFrom = Math.round(b.from * n), uTo = Math.round(b.to * n);
  const us = Math.floor((uTo - uFrom) / STEP) + 1, vs = Math.floor(n / STEP);
  const score = new Float32Array(us * vs), back = new Int32Array(us * vs).fill(-1);
  let best = 0, bestAt = -1;
  for (let i = 0; i < us; i++) {
    const u = uFrom + i * STEP, t = u / n;
    const lo = Math.max(1, Math.ceil(b.lo(t) * n / STEP)), hi = Math.min(vs - 2, Math.floor(b.hi(t) * n / STEP));
    for (let j = lo; j <= hi; j++) {
      const here = at(u, j * STEP), cost = TUNE.gapCost + penalty(t, j * STEP);
      let prev = here * aligned(u, j * STEP, 0) - cost, from = -1;
      if (i > 0) for (let d = -MOVE; d <= MOVE; d++) {
        const k = (i - 1) * vs + j + d;
        if (j + d < 0 || j + d >= vs || score[k] <= 0) continue;
        const s = score[k] - Math.abs(d) * 0.015 + here * aligned(u, j * STEP, d) - cost;
        if (s > prev) { prev = s; from = k; }
      }
      const s = prev;
      if (s > 0) { score[i * vs + j] = s; back[i * vs + j] = from; if (s > best) { best = s; bestAt = i * vs + j; } }
    }
  }
  if (bestAt < 0) return null;
  const points: Pt[] = [];
  let sum = 0;
  for (let k = bestAt; k >= 0; k = back[k]) {
    const u = uFrom + Math.floor(k / vs) * STEP, v = (k % vs) * STEP;
    points.unshift(b.vertical ? { x: v, y: u } : { x: u, y: v });
    sum += at(u, v);
  }
  return { points, score: best, strength: sum / points.length };
}

function suppress(n: number, points: Pt[], radius: number): Uint8Array {
  const m = new Uint8Array(n * n);
  for (const p of points) for (let y = -radius; y <= radius; y++) for (let x = -radius; x <= radius; x++) {
    const px = p.x + x, py = p.y + y;
    if (px >= 0 && py >= 0 && px < n && py < n) m[py * n + px] = 1;
  }
  return m;
}

const SIDE = 7;
/** Ngưỡng nối hai đoạn, đơn vị pixel của khung 512. Mọi ảnh đã về cùng khung nên các số này tỉ lệ theo bàn tay. Số tạm. */
const BREAK_MIN_PX = 14;

const len = (ps: Pt[]) => ps.slice(1).reduce((s, p, i) => s + Math.hypot(p.x - ps[i].x, p.y - ps[i].y), 0);

/** Độ tương phản tại từng điểm: rãnh tối hơn da hai bên bao nhiêu phần trăm. Lấy bên sáng kém hơn, để mép tối một bên không bị tính là đường. */
function sideContrast(g: Float32Array, mask: Uint8Array, n: number, pts: Pt[]): number[] {
  const at = (x: number, y: number) => {
    const i = Math.round(y) * n + Math.round(x);
    return i >= 0 && i < g.length && mask[i] ? g[i] : -1;
  };
  return pts.map((p, i) => {
    const a = pts[Math.max(0, i - 5)], b = pts[Math.min(pts.length - 1, i + 5)];
    const d = Math.max(1, Math.hypot(b.x - a.x, b.y - a.y));
    const nx = -(b.y - a.y) / d, ny = (b.x - a.x) / d;
    let center = Infinity;
    for (let k = -2; k <= 2; k++) { const v = at(p.x + nx * k, p.y + ny * k); if (v >= 0 && v < center) center = v; }
    if (center === Infinity) return 0;
    const l = at(p.x + nx * SIDE, p.y + ny * SIDE), r = at(p.x - nx * SIDE, p.y - ny * SIDE);
    const side = l >= 0 && r >= 0 ? Math.min(l, r) : Math.max(l, r);
    return side > 0 ? (side - center) / side : 0;
  });
}

/** Cắt đường thành các đoạn còn rõ. Ngưỡng so với chính phần rõ của đường đó nên ít phụ thuộc ánh sáng. */
function splitSegments(pts: Pt[], contrast: number[]): Pt[][] {
  const top = contrast.slice().sort((a, b) => b - a).slice(0, Math.max(1, contrast.length >> 1));
  const limit = Math.max(TUNE.minContrast, TUNE.cutRatio * top[top.length >> 1]);
  const on = contrast.map((c) => c >= limit);
  for (let i = 0; i < on.length; i++) {
    if (on[i]) continue;
    let j = i;
    while (j < on.length && !on[j]) j++;
    if (i > 0 && j < on.length && len(pts.slice(i - 1, j + 1)) <= TUNE.smallHole) on.fill(true, i, j);
    i = j;
  }
  const out: Pt[][] = [];
  for (let i = 0; i < on.length; i++) {
    if (!on[i]) continue;
    let j = i;
    while (j + 1 < on.length && on[j + 1]) j++;
    const seg = pts.slice(i, j + 1);
    if (len(seg) >= TUNE.minSegment) out.push(seg);
    i = j;
  }
  return out;
}

const direction = (ps: Pt[], fromEnd: boolean): Pt => {
  const take = ps.slice(fromEnd ? -15 : 0, fromEnd ? undefined : 15);
  const a = take[0], b = take[take.length - 1], d = Math.max(1, Math.hypot(b.x - a.x, b.y - a.y));
  return { x: (b.x - a.x) / d, y: (b.y - a.y) / d };
};

/** Hai đoạn thuộc cùng một đường nếu đủ gần, cùng hướng và không lệch ngang quá xa. */
function canLink(a: Pt[], b: Pt[]): boolean {
  const end = a[a.length - 1], start = b[0];
  if (Math.hypot(start.x - end.x, start.y - end.y) > TUNE.maxGap) return false;
  const da = direction(a, true), db = direction(b, false);
  const turn = Math.acos(Math.max(-1, Math.min(1, da.x * db.x + da.y * db.y))) * 180 / Math.PI;
  const shift = Math.abs((start.x - end.x) * da.y - (start.y - end.y) * da.x);
  return turn <= TUNE.maxTurn && shift <= TUNE.maxShift;
}

/** Bắt đầu từ đoạn dài nhất, nối dần sang hai bên, gặp đoạn không nối được thì dừng. Đoạn bỏ lại không được tính vào đường. */
function linkSegments(segments: Pt[][]): Pt[][] {
  if (!segments.length) return [];
  let core = 0;
  segments.forEach((s, i) => { if (len(s) > len(segments[core])) core = i; });
  let lo = core, hi = core;
  while (lo > 0 && canLink(segments[lo - 1], segments[lo])) lo--;
  while (hi + 1 < segments.length && canLink(segments[hi], segments[hi + 1])) hi++;
  return segments.slice(lo, hi + 1);
}

function solve(id: LineId, ridge: Float32Array, soft: Float32Array, mask: Uint8Array, n: number, band: Band, expected: number, dir: Direction): Line {
  const first = trace(ridge, n, band, dir, TUNE.priors[id]);
  const blank: Line = { id, points: [], segments: [], breaks: [], coverage: 0, strength: 0, margin: 0, sure: false };
  if (!first) return blank;
  const second = trace(ridge, n, band, dir, TUNE.priors[id], suppress(n, first.points, 14));
  const margin = first.score / Math.max(0.01, second?.score ?? 0.01);
  const segments = TUNE.cut ? linkSegments(splitSegments(first.points, sideContrast(soft, mask, n, first.points))) : [first.points];
  if (!segments.length) return { ...blank, margin };
  const points = segments.flat();
  const breaks: Pt[] = [];
  for (let i = 1; i < segments.length; i++) {
    const a = segments[i - 1][segments[i - 1].length - 1], b = segments[i][0];
    if (Math.hypot(a.x - b.x, a.y - b.y) >= BREAK_MIN_PX) breaks.push({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
  }
  const span = first.points.indexOf(points[points.length - 1]) - first.points.indexOf(points[0]) + 1;
  const coverage = (span * STEP) / (expected * n);
  const strength = points.reduce((s, p) => s + ridge[Math.round(p.y) * n + Math.round(p.x)], 0) / points.length;
  const sure = coverage >= 0.55 && strength >= 0.3 && margin >= 1.25;
  return { id, points, segments, breaks, coverage, strength, margin, sure };
}

function quality(img: ImageData, gray: Float32Array, mask: Uint8Array, n: number): Quality {
  let sum = 0, count = 0, glare = 0, lap = 0, lap2 = 0;
  for (let y = 1; y < n - 1; y++) for (let x = 1; x < n - 1; x++) {
    const i = y * n + x;
    if (!mask[i]) continue;
    const v = gray[i], L = gray[i - 1] + gray[i + 1] + gray[i - n] + gray[i + n] - 4 * v;
    sum += v; count++; lap += L; lap2 += L * L;
    if (img.data[i * 4] > 245 && img.data[i * 4 + 1] > 245 && img.data[i * 4 + 2] > 245) glare++;
  }
  const c = Math.max(1, count), brightness = sum / c, sharpness = lap2 / c - (lap / c) ** 2, glareRate = glare / c;
  const issues: string[] = [];
  if (brightness < 60) issues.push('tối');
  if (brightness > 225) issues.push('cháy sáng');
  if (glareRate > 0.05) issues.push('loá');
  if (sharpness < 1.5) issues.push('mờ'); // 3 là quá chặt: 23/32 ảnh bị báo mờ dù phần lớn được chấm Tốt. Số tạm.
  return { sharpness, brightness, glare: glareRate, good: !issues.length, issues };
}

const curveBelow = (points: Pt[], n: number, gap: number) => {
  const ys = new Map(points.map((p) => [p.x, p.y]));
  const fallback = points.length ? points.reduce((s, p) => s + p.y, 0) / points.length : 0.3 * n;
  return (x: number) => {
    for (let d = 0; d < 20; d++) {
      const y = ys.get(x + d) ?? ys.get(x - d);
      if (y !== undefined) return (y + gap) / n;
    }
    return (fallback + gap) / n;
  };
};

export function analyze(img: ImageData, mask: Uint8Array): Analysis {
  const n = img.width;
  const gray = new Float32Array(n * n);
  for (let i = 0; i < gray.length; i++) gray[i] = img.data[i * 4 + 1];
  const { ridge, dir } = ridgeMap(gray, mask, n);
  const soft = blur(gray, n, 1);

  // Gốc ngón trỏ ở x = 0.2 trong khung chuẩn. Dải phải bắt đầu xa hơn thế, không thì đường chạy suốt (TAM03) và đường dừng ở ngón trỏ (TAM02) không bao giờ đo được.
  const tam = solve('tam', ridge, soft, mask, n, { from: TUNE.tamFrom, to: 0.99, lo: (t) => TUNE.tamLoA + TUNE.tamLoB * t, hi: (t) => TUNE.tamHiA + TUNE.tamHiB * t, vertical: false }, 0.55, dir);
  const below = curveBelow(tam.points, n, TUNE.triBelowPx);
  const tri = solve('tri', ridge, soft, mask, n, { from: TUNE.triFrom, to: 0.9, lo: (t) => Math.max(TUNE.triLoA + TUNE.triLoB * t, below(Math.round(t * n / STEP) * STEP)), hi: (t) => TUNE.triHiA + TUNE.triHiB * t, vertical: false }, 0.5, dir);
  const arc = (y: number) => Math.max(0, (y - 0.22) / 0.71);
  const sinh = solve('sinh', ridge, soft, mask, n, { from: TUNE.sinhFrom, to: 0.97, lo: (y) => 0.06 + 0.22 * arc(y), hi: (y) => 0.3 + 0.32 * Math.sqrt(arc(y)), vertical: true }, 0.5, dir);

  const q = quality(img, gray, mask, n);
  // Định mạng: từ phía cổ tay lên ngón giữa. Không phải ai cũng có, nên không tính vào độ chắc chung của ảnh.
  const dinh = solve('dinh', ridge, soft, mask, n, { from: TUNE.dinhFrom, to: 0.97, lo: () => TUNE.dinhLo, hi: () => TUNE.dinhHi, vertical: true }, 0.5, dir);
  const main = [tam, tri, sinh];
  return { lines: [...main, dinh], quality: q, ridge, sure: q.good && main.every((l) => l.sure) };
}
