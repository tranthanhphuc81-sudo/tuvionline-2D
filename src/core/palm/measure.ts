/* Đo đặc điểm từ 21 điểm khớp và các nét người dùng đã xác nhận (chuyển từ spike/chitay/classify.ts, đã thử trên ảnh thật).
   Mọi ngưỡng đều tạm, chưa kiểm chứng trên nhiều bàn tay. Không đo được thì trả null, không đoán. */
import type { PalmMeasure, PalmPt, PalmTrace } from './types';

const dist = (a: PalmPt, b: PalmPt) => Math.hypot(a.x - b.x, a.y - b.y);
const chain = (lm: readonly PalmPt[], ids: number[]) => ids.slice(1).reduce((s, id, i) => s + dist(lm[ids[i]], lm[id]), 0);

/** Độ cao theo trục cổ tay → gốc ngón giữa, đơn vị chiều dài lòng bàn tay: 0 ở cổ tay, 1 ở hàng gốc ngón. */
const height = (lm: readonly PalmPt[], p: PalmPt) => {
  const a = lm[0], b = lm[9], len = dist(a, b);
  return ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / (len * len);
};
/** Vị trí ngang: 0 ở gốc ngón trỏ, 1 ở gốc ngón út. */
const across = (lm: readonly PalmPt[], p: PalmPt) => {
  const a = lm[5], b = lm[17], len = dist(a, b);
  return ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / (len * len);
};
/** Ranh giới dưới ngón giữa | dưới áp út | dưới ngón út, nằm giữa các khớp gốc ngón. */
const fingerBounds = (lm: readonly PalmPt[]) => {
  const mid = across(lm, lm[9]), ring = across(lm, lm[13]);
  return { middleRing: (mid + ring) / 2, ringPinky: (ring + 1) / 2 };
};

/** Các ngưỡng tạm, lấy từ bản thử. */
export const PALM_THRESHOLDS = {
  /** dưới mức này (tính từ cổ tay) là vùng gò Thái Âm */
  thaiAmHeight: 0.5,
  /** hai đường coi là chạm nhau nếu cách không quá tỉ lệ này của chiều dài lòng bàn tay */
  touch: 0.032,
  /** Trí đạo thẳng ngang nếu đuôi thấp hơn đầu chưa tới tỉ lệ này */
  triFlat: 0.08,
} as const;

const pick = (q: string, id: string | null, value?: number): PalmMeasure => (value === undefined ? { q, id } : { q, id, value });

/** Các phép đo chỉ cần khớp tay: Q04, Q09, Q10, Q11, Q12. */
export function measureHand(lm: readonly PalmPt[]): PalmMeasure[] {
  if (lm.length < 21) return [];
  const palm = dist(lm[0], lm[9]);
  const out: PalmMeasure[] = [];

  const shape = palm / dist(lm[5], lm[17]);
  out.push(pick('Q04', shape > 1.45 ? 'H10' : shape < 1.25 ? 'H11' : 'can-doi', shape));

  const v1 = { x: lm[4].x - lm[1].x, y: lm[4].y - lm[1].y }, v2 = { x: lm[8].x - lm[5].x, y: lm[8].y - lm[5].y };
  const angle = (Math.acos(Math.max(-1, Math.min(1, (v1.x * v2.x + v1.y * v2.y) / (Math.hypot(v1.x, v1.y) * Math.hypot(v2.x, v2.y))))) * 180) / Math.PI;
  out.push(pick('Q09', angle >= 50 ? 'F03' : angle < 25 ? 'F04' : 'vua', angle));

  const indexRing = height(lm, lm[8]) - height(lm, lm[16]);
  out.push(pick('Q10', indexRing > 0.03 ? 'F08' : indexRing < -0.03 ? 'F09' : 'F10', indexRing));

  // Dựng thẳng ngón út song song ngón áp út: ngón dang ra hay hơi cong vẫn so được với ngấn đốt trên của áp út
  const ringLen = chain(lm, [13, 14, 15, 16]);
  const ringDir = { x: (lm[15].x - lm[13].x) / dist(lm[13], lm[15]), y: (lm[15].y - lm[13].y) / dist(lm[13], lm[15]) };
  const along = (p: PalmPt) => (p.x - lm[13].x) * ringDir.x + (p.y - lm[13].y) * ringDir.y;
  const pinky = (along(lm[17]) + chain(lm, [17, 18, 19, 20]) - along(lm[15])) / ringLen;
  out.push(pick('Q11', pinky > 0.05 ? 'F14' : pinky < -0.05 ? 'F15' : 'ngang', pinky));

  const fingers = chain(lm, [9, 10, 11, 12]) / palm;
  out.push(pick('Q12', fingers > 1.1 ? 'F16' : fingers < 0.9 ? 'F17' : 'can-doi', fingers));
  return out;
}

/** Các phép đo từ nét đã xác nhận: Q17, Q20, Q21 (hướng, độ dài), Q23, Q25. Nét thiếu thì câu đó trả null. */
export function measureLines(t: PalmTrace): PalmMeasure[] {
  const lm = t.landmarks;
  if (lm.length < 21) return [];
  const palm = dist(lm[0], lm[9]);
  const T = PALM_THRESHOLDS;
  const out: PalmMeasure[] = [];
  const has = (k: keyof PalmTrace['lines']) => { const l = t.lines[k]; return l && l.length > 1 ? l : null; };
  const sinh = has('sinh'), tri = has('tri'), tam = has('tam'), dinh = has('dinh');

  if (sinh) {
    const widest = sinh.reduce((m, p) => (p.x > m.x ? p : m));
    const k = (widest.y - lm[0].y) / (lm[9].y - lm[0].y);
    const ref = lm[0].x + k * (lm[9].x - lm[0].x);
    const r = widest.x / ref;
    out.push(pick('Q17', r >= 0.97 ? 'SD02' : r < 0.75 ? 'SD03' : 'vua', r));
  } else out.push(pick('Q17', null));

  if (sinh && tri) {
    const head = tri.slice(0, Math.ceil(tri.length / 3));
    const gap = Math.min(...head.flatMap((p) => sinh.map((q) => dist(p, q))));
    out.push(pick('Q20', gap <= palm * T.touch ? 'TD15' : 'TD16', gap / palm));
  } else out.push(pick('Q20', null));

  if (tri) {
    // Nét có thể được vẽ theo chiều nào cũng được: đầu là điểm gần phía ngón cái hơn
    const [first, last] = across(lm, tri[0]) <= across(lm, tri[tri.length - 1]) ? [tri[0], tri[tri.length - 1]] : [tri[tri.length - 1], tri[0]];
    const drop = height(lm, first) - height(lm, last), tail = height(lm, last);
    out.push(pick('Q21-huong', drop < T.triFlat ? 'TD02' : tail >= T.thaiAmHeight ? 'TD03' : 'TD04', tail));
    const end = across(lm, last), { middleRing, ringPinky } = fingerBounds(lm);
    out.push(pick('Q21-dai', end >= ringPinky ? 'TD05' : end >= middleRing ? 'TD06' : 'TD07', end));
  } else {
    out.push(pick('Q21-huong', null));
    out.push(pick('Q21-dai', null));
  }

  if (tam) {
    // Đầu phía ngón trỏ là điểm có vị trí ngang nhỏ nhất
    const end = tam.reduce((m, p) => (across(lm, p) < across(lm, m) ? p : m));
    const k = (end.x - lm[5].x) / (lm[9].x - lm[5].x); // 0 = dưới ngón trỏ, 1 = dưới ngón giữa
    const toIndex = height(lm, end) >= height(lm, lm[5]) * 0.98 && k < 0.35;
    out.push(pick('Q23', k < -0.2 ? 'TAM03' : toIndex ? 'TAM02' : k < 0.75 ? 'TAM01' : 'TAM04', k));
  } else out.push(pick('Q23', null));

  if (dinh) {
    // Đầu dưới của Định mạng so với cổ tay, Sinh đạo và các đường ảo
    const foot = dinh.reduce((m, p) => (height(lm, p) < height(lm, m) ? p : m));
    const near = !!sinh && sinh.some((p) => dist(p, foot) <= palm * T.touch);
    const h = height(lm, foot), ac = across(lm, foot);
    out.push(pick('Q25', near ? 'DM03' : h < 0.12 ? 'DM02' : h > 0.55 ? 'DM07' : ac >= fingerBounds(lm).ringPinky ? 'DM04' : ac < 0 ? 'DM05' : 'DM06', h));
  } else out.push(pick('Q25', null));
  return out;
}

/** Đổi kết quả đo thành câu trả lời cho `analyzePalm`. */
export function measuresToAnswers(ms: readonly PalmMeasure[]): Record<string, string | null> {
  return Object.fromEntries(ms.map((m) => [m.q, m.id]));
}
