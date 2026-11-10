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
  /** đường coi là thẳng nếu chỗ lệch xa nhất khỏi dây cung chưa tới tỉ lệ này của dây cung */
  straight: 0.05,
  /** Định mạng coi là hơi cong từ mức lệch này */
  curved: 0.07,
  /** đường uốn lượn: số lần đổi chiều cong từ mức này */
  waves: 3,
  /** độ đậm rãnh Sinh đạo so với mức rãnh rõ của chính lòng bàn tay đó: từ mức này là rõ, dưới mức kia là mờ */
  deep: 1.5, faint: 0.7,
  /** mật độ chỉ nhỏ: dưới mức này là ít chỉ, trên mức kia là nhiều chỉ nhỏ */
  fewLines: 0.05, manyLines: 0.14,
} as const;

const pick = (q: string, id: string | null, value?: number): PalmMeasure => (value === undefined ? { q, id } : { q, id, value });

/** Độ lệch xa nhất khỏi dây cung nối hai đầu, chia cho độ dài dây cung. */
function bend(pts: readonly PalmPt[]): number {
  const a = pts[0], b = pts[pts.length - 1], l = dist(a, b) || 1;
  return Math.max(...pts.map((p) => Math.abs((b.x - a.x) * (a.y - p.y) - (a.x - p.x) * (b.y - a.y)) / l)) / l;
}

/** Số lần đường đổi chiều cong (trái ↔ phải). Lấy 12 điểm cách đều theo chiều dài rồi làm mượt, để nét bám rãnh hơi răng cưa không bị tính là uốn lượn. */
function waves(pts: readonly PalmPt[]): number {
  const cum = [0];
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + dist(pts[i - 1], pts[i]));
  const total = cum[cum.length - 1];
  if (total <= 0 || pts.length < 3) return 0;
  const N = 12, rs: PalmPt[] = [];
  for (let k = 0, i = 1; k <= N; k++) {
    const at = (total * k) / N;
    while (i < pts.length - 1 && cum[i] < at) i++;
    const u = (at - cum[i - 1]) / Math.max(1e-9, cum[i] - cum[i - 1]);
    rs.push({ x: pts[i - 1].x + u * (pts[i].x - pts[i - 1].x), y: pts[i - 1].y + u * (pts[i].y - pts[i - 1].y) });
  }
  const sm = rs.map((p, i) => (i === 0 || i === N ? p : { x: (rs[i - 1].x + 2 * p.x + rs[i + 1].x) / 4, y: (rs[i - 1].y + 2 * p.y + rs[i + 1].y) / 4 }));
  let last = 0, flips = 0;
  for (let i = 1; i < N; i++) {
    const ax = sm[i].x - sm[i - 1].x, ay = sm[i].y - sm[i - 1].y, bx = sm[i + 1].x - sm[i].x, by = sm[i + 1].y - sm[i].y;
    const turn = Math.atan2(ax * by - ay * bx, ax * bx + ay * by);
    if (Math.abs(turn) < 0.2) continue; // dưới khoảng 11 độ coi như đi thẳng
    const sg = Math.sign(turn);
    if (last && sg !== last) flips++;
    last = sg;
  }
  return flips;
}

/** Các phép đo chỉ cần khớp tay: Q04, Q08, Q09, Q10, Q11, Q12. */
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

  // Ngón cái áp dọc ngón trỏ: dựng thẳng ngón cái từ khớp gốc (2) lên theo trục bàn tay rồi xem đầu ngón tới đâu trên đốt gốc ngón trỏ (5 → 6).
  // 1 là tới khớp giữa đốt gốc và đốt giữa (dài), khoảng 1/3 là trung bình (CHI-TAY Q08).
  const reach = height(lm, lm[2]) + chain(lm, [2, 3, 4]) / palm;
  const thumb = (reach - height(lm, lm[5])) / (height(lm, lm[6]) - height(lm, lm[5]));
  out.push(pick('Q08', thumb >= 0.8 ? 'F01' : thumb < 0.1 ? 'F02' : 'trung-binh', thumb));
  return out;
}

/** Các phép đo từ nét đã xác nhận: Q17, Q20, Q21 (hướng, độ dài), Q23, Q25 luôn có (nét thiếu thì null);
    Q18, Q22, Q24, Q26, Q32 chỉ có khi thấy rõ đặc điểm, không thì để người dùng tự chọn. */
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

  // Đường vẽ thành nhiều đoạn rời nhau là đường đứt quãng. Chỉ điền sẵn khi có; người dùng vẫn sửa được (ví dụ "Đứt có đoạn che chắn").
  const cut = (k: keyof PalmTrace['lines']) => (t.breaks?.[k] ?? 0) > 0;
  if (sinh && cut('sinh')) out.push(pick('Q18', 'SD06', t.breaks!.sinh));
  if (tri && cut('tri')) out.push(pick('Q22', 'TD19', t.breaks!.tri));

  // Độ đậm của rãnh Sinh đạo (khi không đứt)
  const st = t.strength?.sinh;
  if (sinh && !cut('sinh') && st !== undefined && (st >= T.deep || st < T.faint)) out.push(pick('Q18', st >= T.deep ? 'SD01' : 'SD04', st));
  // Trí đạo uốn lượn
  if (tri) { const w = waves(tri); if (w >= T.waves) out.push(pick('Q22', 'TD11', w)); }
  // Tâm đạo gần như thẳng
  if (tam) { const b = bend(tam); if (b < T.straight) out.push(pick('Q24', 'TAM06', b)); }
  // Định mạng: đứt, thẳng dài lên tới ngón giữa, chạy hết lên gò Thổ, hay hơi cong
  if (dinh) {
    const b = bend(dinh), top = Math.max(...dinh.map((p) => height(lm, p))), foot = Math.min(...dinh.map((p) => height(lm, p)));
    const id = cut('dinh') ? 'DM09' : top >= 0.9 && foot < 0.15 && b < T.straight ? 'DM01' : top >= 0.9 ? 'DM12' : b >= T.curved ? 'DM11' : null;
    if (id) out.push(pick('Q26', id, cut('dinh') ? t.breaks!.dinh : b));
  }
  // Số chỉ nhỏ trên bàn tay
  if (t.minor !== undefined) out.push(pick('Q32', t.minor < T.fewLines ? 'C06' : t.minor > T.manyLines ? 'C07' : 'vua', t.minor));
  return out;
}

/** Đổi kết quả đo thành câu trả lời cho `analyzePalm`. Câu chọn nhiều có thể có vài mã (Q22: đứt và uốn lượn) thì gộp thành mảng. */
export function measuresToAnswers(ms: readonly PalmMeasure[]): Record<string, string | string[] | null> {
  const out: Record<string, string | string[] | null> = {};
  for (const m of ms) {
    const old = out[m.q];
    if (old === undefined || old === null || m.id === null) out[m.q] = old ?? m.id;
    else out[m.q] = [...(Array.isArray(old) ? old : [old]), m.id];
  }
  return out;
}
