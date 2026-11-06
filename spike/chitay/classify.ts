/* Đổi số đo thành ID đặc điểm của CHI-TAY §11. Mọi ngưỡng ở đây là tạm, sẽ chỉnh theo kết quả chấm trên ảnh thật.
   `lm` là 21 điểm trong khung chuẩn, đơn vị pixel của khung SIZE. Không chắc thì trả null, không đoán. */
import type { Analysis, Line, LineId, Pt } from './lines';

export interface Pred { q: string; label: string; id: string | null; value?: number }

const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y);
const chain = (lm: Pt[], ids: number[]) => ids.slice(1).reduce((s, id, i) => s + dist(lm[ids[i]], lm[id]), 0);

function pick(label: string, q: string, id: string | null, value?: number): Pred { return { q, label, id, value }; }

/** Độ cao theo trục cổ tay → gốc ngón giữa, đơn vị chiều dài lòng bàn tay. */
const height = (lm: Pt[], p: Pt) => {
  const a = lm[0], b = lm[9], len = dist(a, b);
  return ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / (len * len);
};

/** Vị trí ngang của điểm: 0 ở gốc ngón trỏ, 1 ở gốc ngón út. */
const across = (lm: Pt[], p: Pt) => {
  const a = lm[5], b = lm[17], len = dist(a, b);
  return ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / (len * len);
};

/* Các đường ảo dựng từ khớp tay của chính người đó, nên tự co giãn theo từng bàn tay. Vừa để đo, vừa vẽ ra cho người chấm xem. */
const palmPoint = (lm: Pt[], ac: number, h: number): Pt => ({
  x: lm[5].x + ac * (lm[17].x - lm[5].x) - (1 - h) * (lm[9].x - lm[0].x),
  y: lm[5].y + ac * (lm[17].y - lm[5].y) - (1 - h) * (lm[9].y - lm[0].y),
});
/** Ranh giới dưới ngón giữa | dưới áp út | dưới ngón út, nằm giữa các khớp gốc ngón. */
const fingerBounds = (lm: Pt[]) => {
  const mid = across(lm, lm[9]), ring = across(lm, lm[13]);
  return { middleRing: (mid + ring) / 2, ringPinky: (ring + 1) / 2 };
};
/** Từ ngang lòng bàn tay xuống cổ tay: dưới mức này là vùng gò Thái Âm. Số tạm. */
const THAI_AM_HEIGHT = 0.5;

export interface Guide { a: Pt; b: Pt; label: string }
export interface Mound { c: Pt; rx: number; ry: number; label: string }

/** Vị trí các gò theo CHI-TAY §5, dựng từ khớp tay: `ac` 0 ở gốc ngón trỏ, 1 ở gốc ngón út; `h` 1 ở hàng gốc ngón, 0 ở cổ tay. Chỉ là vùng ước lượng để dễ nhìn. */
export function mounds(lm: Pt[]): Mound[] {
  const scale = dist(lm[0], lm[9]) / 435; // các bán kính dưới đây đặt theo bàn tay dài 435 px
  const m = (label: string, ac: number, h: number, rx: number, ry: number): Mound => ({ c: palmPoint(lm, ac, h), rx: rx * scale, ry: ry * scale, label });
  return [
    m('Mộc tinh', 0.03, 0.87, 52, 36), m('Thổ tinh', 0.36, 0.87, 46, 34), m('Thái dương', 0.67, 0.87, 46, 34), m('Thủy tinh', 0.98, 0.85, 46, 34),
    m('Hỏa dương', -0.08, 0.68, 34, 30), m('Kim tinh', 0.05, 0.38, 72, 92), m('Đồng Hỏa', 0.5, 0.56, 62, 46),
    m('Hỏa âm', 1.0, 0.58, 42, 48), m('Thái âm', 0.92, 0.24, 62, 72), m('Khảm', 0.48, 0.1, 54, 30),
  ];
}

export function guides(lm: Pt[]): Guide[] {
  const { middleRing, ringPinky } = fingerBounds(lm);
  const down = (ac: number, label: string): Guide => ({ a: palmPoint(lm, ac, 1), b: palmPoint(lm, ac, 0.1), label });
  return [
    { a: lm[0], b: { x: lm[0].x + 1.15 * (lm[9].x - lm[0].x), y: lm[0].y + 1.15 * (lm[9].y - lm[0].y) }, label: 'cổ tay – ngón giữa' },
    down(middleRing, 'hết ngón giữa'),
    down(ringPinky, 'hết áp út'),
    { a: palmPoint(lm, across(lm, lm[9]), THAI_AM_HEIGHT), b: palmPoint(lm, 1.05, THAI_AM_HEIGHT), label: 'trên gò Thái Âm' },
  ];
}

/** Hai đường coi là chạm nhau nếu cách không quá tỉ lệ này của chiều dài lòng bàn tay. Số tạm. */
const TOUCH = 0.032;

export function classify(lm: Pt[], a: Analysis): Pred[] {
  const out: Pred[] = [];
  const palm = dist(lm[0], lm[9]);

  const shape = palm / dist(lm[5], lm[17]);
  out.push(pick(shape > 1.45 ? 'Bàn tay dài' : shape < 1.25 ? 'Bàn tay rộng' : 'Bàn tay cân đối', 'Q04', shape > 1.45 ? 'H10' : shape < 1.25 ? 'H11' : 'can-doi', shape));

  const v1 = { x: lm[4].x - lm[1].x, y: lm[4].y - lm[1].y }, v2 = { x: lm[8].x - lm[5].x, y: lm[8].y - lm[5].y };
  const angle = Math.acos(Math.max(-1, Math.min(1, (v1.x * v2.x + v1.y * v2.y) / (Math.hypot(v1.x, v1.y) * Math.hypot(v2.x, v2.y))))) * 180 / Math.PI;
  out.push(pick(angle >= 50 ? 'Ngón cái dang xa' : angle < 25 ? 'Ngón cái khép sát' : 'Ngón cái bình thường', 'Q09', angle >= 50 ? 'F03' : angle < 25 ? 'F04' : 'vua', angle));

  const indexRing = height(lm, lm[8]) - height(lm, lm[16]);
  out.push(pick(indexRing > 0.03 ? 'Ngón trỏ dài hơn áp út' : indexRing < -0.03 ? 'Ngón trỏ ngắn hơn áp út' : 'Ngón trỏ gần bằng áp út', 'Q10', indexRing > 0.03 ? 'F08' : indexRing < -0.03 ? 'F09' : 'F10', indexRing));

  // Dựng thẳng ngón út song song ngón áp út: ngón dang ra hay hơi cong vẫn so được với ngấn đốt trên của áp út.
  const ringLen = chain(lm, [13, 14, 15, 16]);
  const ringDir = { x: (lm[15].x - lm[13].x) / dist(lm[13], lm[15]), y: (lm[15].y - lm[13].y) / dist(lm[13], lm[15]) };
  const along = (p: Pt) => (p.x - lm[13].x) * ringDir.x + (p.y - lm[13].y) * ringDir.y;
  const pinky = (along(lm[17]) + chain(lm, [17, 18, 19, 20]) - along(lm[15])) / ringLen;
  out.push(pick(pinky > 0.05 ? 'Ngón út vượt ngấn đốt trên áp út' : pinky < -0.05 ? 'Ngón út thấp hơn ngấn' : 'Ngón út ngang ngấn', 'Q11', pinky > 0.05 ? 'F14' : pinky < -0.05 ? 'F15' : 'ngang', pinky));

  const fingers = chain(lm, [9, 10, 11, 12]) / palm;
  out.push(pick(fingers > 1.1 ? 'Ngón dài so với lòng bàn tay' : fingers < 0.9 ? 'Ngón ngắn so với lòng bàn tay' : 'Ngón cân đối', 'Q12', fingers > 1.1 ? 'F16' : fingers < 0.9 ? 'F17' : 'can-doi', fingers));

  const line = (id: LineId): Line | null => {
    const l = a.lines.find((x) => x.id === id);
    return l?.sure ? l : null;
  };
  const sinh = line('sinh'), tri = line('tri'), tam = line('tam');

  if (sinh) {
    const widest = sinh.points.reduce((m, p) => (p.x > m.x ? p : m));
    const t = (widest.y - lm[0].y) / (lm[9].y - lm[0].y);
    const ref = lm[0].x + t * (lm[9].x - lm[0].x);
    const r = widest.x / ref;
    out.push(pick(r >= 0.97 ? 'Sinh đạo cong vượt đường tham chiếu' : r < 0.75 ? 'Sinh đạo ôm sát' : 'Sinh đạo cong vừa', 'Q17', r >= 0.97 ? 'SD02' : r < 0.75 ? 'SD03' : 'vua', r));
  } else out.push(pick('Sinh đạo: máy không chắc', 'Q17', null));

  if (sinh && tri) {
    // Khoảng hở nhỏ nhất giữa hai đường. Đo từ riêng điểm đầu Trí đạo thì mất tác dụng, vì đầu đường hay mờ và bị cắt bớt.
    const head = tri.points.slice(0, Math.ceil(tri.points.length / 3));
    const gap = Math.min(...head.flatMap((p) => sinh.points.map((q) => dist(p, q))));
    const touching = gap <= palm * TOUCH;
    out.push(pick(touching ? 'Đầu Sinh đạo và Trí đạo dính nhau' : 'Đầu Sinh đạo và Trí đạo tách hở', 'Q20', touching ? 'TD15' : 'TD16', gap / palm));
  } else out.push(pick('Đầu Sinh đạo, Trí đạo: máy không chắc', 'Q20', null));

  if (tri) {
    const first = tri.points[0], last = tri.points[tri.points.length - 1];
    // Độ dốc tính theo chiều dài lòng bàn tay; cong sâu là đuôi xuống dưới đường ảo của gò Thái Âm.
    const drop = height(lm, first) - height(lm, last), tail = height(lm, last);
    const bend = drop < 0.08 ? 'TD02' : tail >= THAI_AM_HEIGHT ? 'TD03' : 'TD04';
    out.push(pick(bend === 'TD02' ? 'Trí đạo thẳng ngang' : bend === 'TD03' ? 'Trí đạo cong nhẹ' : 'Trí đạo cong sâu', 'Q21-huong', bend, tail));
    const end = across(lm, last), { middleRing, ringPinky } = fingerBounds(lm);
    const reach = end >= ringPinky ? 'TD05' : end >= middleRing ? 'TD06' : 'TD07';
    out.push(pick(reach === 'TD05' ? 'Trí đạo dài tới mép tay' : reach === 'TD06' ? 'Trí đạo tới dưới ngón áp út' : 'Trí đạo ngắn', 'Q21-dai', reach, end));
  } else {
    out.push(pick('Trí đạo, hướng: máy không chắc', 'Q21-huong', null));
    out.push(pick('Trí đạo, độ dài: máy không chắc', 'Q21-dai', null));
  }

  if (tam) {
    const end = tam.points[0];
    const k = (end.x - lm[5].x) / (lm[9].x - lm[5].x); // 0 = dưới ngón trỏ, 1 = dưới ngón giữa
    const toIndex = height(lm, end) >= height(lm, lm[5]) * 0.98 && k < 0.35;
    const id = k < -0.2 ? 'TAM03' : toIndex ? 'TAM02' : k < 0.75 ? 'TAM01' : 'TAM04';
    const names: Record<string, string> = { TAM01: 'Tâm đạo dừng giữa trỏ và giữa', TAM02: 'Tâm đạo dừng ở gốc ngón trỏ', TAM03: 'Tâm đạo chạy suốt', TAM04: 'Tâm đạo dừng dưới ngón giữa' };
    out.push(pick(names[id], 'Q23', id, k));
  } else out.push(pick('Tâm đạo: máy không chắc', 'Q23', null));

  const dinh = line('dinh');
  if (dinh) {
    // Đầu dưới của Định mạng so với cổ tay, Sinh đạo và các đường ảo
    const foot = dinh.points[dinh.points.length - 1];
    const sinhAll = a.lines.find((x) => x.id === 'sinh')?.points ?? [];
    const near = sinhAll.some((p) => dist(p, foot) <= palm * TOUCH);
    const h = height(lm, foot), ac = across(lm, foot);
    const id = near ? 'DM03' : h < 0.12 ? 'DM02' : h > 0.55 ? 'DM07' : ac >= fingerBounds(lm).ringPinky ? 'DM04' : ac < 0 ? 'DM05' : 'DM06';
    const names: Record<string, string> = { DM02: 'từ cổ tay', DM03: 'từ Sinh đạo', DM04: 'từ gò Thái Âm', DM05: 'từ gò Kim Tinh', DM06: 'từ giữa lòng bàn tay', DM07: 'chỉ rõ đoạn trên' };
    out.push(pick('Định mạng ' + names[id], 'Q25', id, h));
  } else out.push(pick('Không có Định mạng', 'Q25', 'DM15'));

  return out;
}
