/* Cách cục theo tháng sinh (Tử Bình Chân Thuyên ch.8–16, 31–48; Trích Thiên Tủy ch.12, 15). ARCHITECTURE mục 15.
   Engine chỉ trả mã; câu chữ ở src/content/cachcuc. Viết lại quy tắc bằng code, không chép câu văn của bản dịch. */
import { jdFromDate, tietAround } from '../calendar';
import { BT_HANH_ORDER, CAN_HANH, TANG_CAN, thapThan } from '../battu/engine';
import type { BatTuInput, ThapThan } from '../battu/types';
import type { CanIdx, ChiIdx } from '../types';
import type { Hanh } from '../canchi/hanh';

/* ===== Nhân nguyên tư lệnh ===== */

/** Số ngày mỗi can tàng cầm quyền kể từ tiết đầu tháng (bảng phổ biến, mỗi tháng 30 ngày). Thân gộp Mậu Kỷ 10 ngày.
    CHƯA đối chiếu bảng in trong sách: các bản lưu truyền chênh nhau 1–3 ngày (ARCHITECTURE 15.2). */
export const TU_LENH: Record<number, readonly (readonly [CanIdx, number])[]> = {
  0: [[8, 10], [9, 20]],            // Tý: Nhâm, Quý
  1: [[9, 9], [7, 3], [5, 18]],     // Sửu: Quý, Tân, Kỷ
  2: [[4, 7], [2, 7], [0, 16]],     // Dần: Mậu, Bính, Giáp
  3: [[0, 10], [1, 20]],            // Mão: Giáp, Ất
  4: [[1, 9], [9, 3], [4, 18]],     // Thìn: Ất, Quý, Mậu
  5: [[4, 5], [6, 9], [2, 16]],     // Tỵ: Mậu, Canh, Bính
  6: [[2, 10], [5, 9], [3, 11]],    // Ngọ: Bính, Kỷ, Đinh
  7: [[3, 9], [1, 3], [5, 18]],     // Mùi: Đinh, Ất, Kỷ
  8: [[4, 10], [8, 3], [6, 17]],    // Thân: Mậu Kỷ, Nhâm, Canh
  9: [[6, 10], [7, 20]],            // Dậu: Canh, Tân
  10: [[7, 9], [3, 3], [4, 18]],    // Tuất: Tân, Đinh, Mậu
  11: [[4, 7], [0, 5], [8, 18]],    // Hợi: Mậu, Giáp, Nhâm
};

/** Số ngày (có phần lẻ theo giờ sinh) từ tiết đầu tháng tới lúc sinh; dùng UTC+7 như Bát Tự (ARCHITECTURE 5.3). */
export function daysIntoMonth(input: BatTuInput, hourOffsetFromNoon: number): number {
  const jd = jdFromDate(input.dd, input.mm, input.yy) + hourOffsetFromNoon / 24;
  const all = tietAround(input.yy, 7);
  for (let i = 0; i < all.length - 1; i++) if (jd >= all[i].jd && jd < all[i + 1].jd) return jd - all[i].jd;
  throw new Error('Cách cục: không tìm được tiết của tháng');
}

/** Can tàng đang cầm quyền ở ngày thứ `days` của tháng. */
export function tuLenhCan(monthChi: ChiIdx, days: number): CanIdx {
  let acc = 0;
  for (const [can, n] of TU_LENH[monthChi]) { acc += n; if (days < acc) return can; }
  const rows = TU_LENH[monthChi];
  return rows[rows.length - 1][0];
}

/* ===== Điều hậu (TBCT ch.14 "phối khí hậu đắc thất"; TTT ch.29–30 "Hàn thử", "Táo thấp") ===== */

/** Tháng quá lạnh hay quá nóng thì việc điều hoà khí hậu đứng trước cách cục, kể cả khi lá số đã có sẵn hành đó (sách vẫn lấy nó làm dụng).
    Lạnh: Hợi, Tý, Sửu, và đầu xuân Dần với Nhật Chủ Kim, Mộc; cần Hoả. Nóng: Tỵ, Ngọ, Mùi với Nhật Chủ khác Thuỷ; cần Thuỷ.
    Trả hành cần có, hoặc null khi không cần điều hậu. Quy tắc gọn hoá từ cách sách luận, chưa phải toàn bộ ngoại lệ (ARCHITECTURE 15.3). */
export function dieuHauNeed(dm: CanIdx, monthChi: ChiIdx): Hanh | null {
  const e = hanhOfCan(dm);
  const cold = monthChi === 11 || monthChi === 0 || monthChi === 1 || (monthChi === 2 && (e === 'Kim' || e === 'Mộc'));
  const hot = (monthChi === 5 || monthChi === 6 || monthChi === 7) && e !== 'Thuỷ';
  if (!cold && !hot) return null;
  const want: Hanh = cold ? 'Hoả' : 'Thuỷ';
  return e === want ? null : want;
}

/* ===== Hoá khí cách (TTT phần II ch.13 "Hoá tượng", ch.15 "Giả hoá"; TBCT ch.22 "ngoại cách") ===== */

export interface HoaKhi { to: Hanh; partner: 1 | 3; grade: 'chan' | 'gia' }

/** Nhật Chủ hợp với can kề bên (tháng hoặc giờ) và hoá thành hành mới. Chân: chi tháng mang khí hành hoá, và can tháng, can giờ
    không có hành khắc hành hoá. Giả: chi tháng mang khí hành hoá nhưng có hành khắc lộ bên cạnh. Ngoài ra không xét là hoá. */
export function hoaKhi(stems: readonly CanIdx[], branches: readonly ChiIdx[]): HoaKhi | null {
  const dm = stems[2];
  for (const partner of [1, 3] as const) {
    const o = stems[partner];
    const combo = HOA_COMBOS.find((c) => (c.a === dm && c.b === o) || (c.a === o && c.b === dm));
    if (!combo) continue;
    const monthHas = TANG_CAN[branches[1]].some(([c]) => hanhOfCan(c) === combo.to);
    if (!monthHas) continue;
    const khac = BT_HANH_ORDER[(BT_HANH_ORDER.indexOf(combo.to) + 3) % 5];
    const broken = [1, 3].some((i) => i !== partner && hanhOfCan(stems[i]) === khac);
    return { to: combo.to, partner, grade: broken ? 'gia' : 'chan' };
  }
  return null;
}
const HOA_COMBOS: readonly { a: CanIdx; b: CanIdx; to: Hanh }[] = [
  { a: 0, b: 5, to: 'Thổ' }, { a: 1, b: 6, to: 'Kim' }, { a: 2, b: 7, to: 'Thuỷ' }, { a: 3, b: 8, to: 'Mộc' }, { a: 4, b: 9, to: 'Hoả' },
];

/* ===== Cách cục ===== */

export type CachKey = 'chinh-quan' | 'that-sat' | 'tai' | 'an' | 'thuc-than' | 'thuong-quan' | 'duong-nhan' | 'kien-loc' | 'nguyet-kiep';
/** Theo sách: cách lành thì giữ gìn (thuận dụng), cách dữ thì chế ngự (nghịch dụng). */
export const THIEN_CACH: readonly CachKey[] = ['chinh-quan', 'tai', 'an', 'thuc-than'];
/** Thấu: can tàng chi tháng lộ lên can năm, tháng hoặc giờ. Tư lệnh: không thấu, theo can cầm quyền. Bản khí: không thấu, không biết ngày. */
export type CachNguon = 'thau' | 'tu-lenh' | 'ban-khi' | 'loc-nhan';
export type CachTrangThai = 'thanh' | 'cuu' | 'bai';
export type GodKey = 'quan' | 'sat' | 'tai' | 'an' | 'thuc' | 'thuong' | 'kiep' | 'kieu';

/** Lý do dạng mã để content dựng câu. */
export type CachLyDo =
  | { k: 'thanh'; tuong: GodKey; vi: 'sinh' | 'ho' | 'che' | 'hoa' | 'tiet' | 'giup' }
  | { k: 'pha'; boi: GodKey; cuu?: GodKey }
  | { k: 'thieu'; can: GodKey[] };

type Vi = Extract<CachLyDo, { k: 'thanh' }>['vi'];

export interface CachCuc {
  cach: CachKey;
  /** Thập Thần làm nên cách (với Lộc, Nhận là Tỷ Kiên, Kiếp Tài) */
  than: ThapThan;
  /** can tàng của chi tháng làm cách */
  can: CanIdx;
  nguon: CachNguon;
  thien: boolean;
  trangThai: CachTrangThai;
  /** chữ giúp cách thành; null khi cách bị phá mà không có cứu */
  tuongThan: GodKey | null;
  /** hành của Dụng thần theo cách cục (hành của tương thần; bại thì là hành cần có) */
  dung: Hanh;
  lyDo: CachLyDo[];
  /** ngày thứ mấy kể từ tiết đầu tháng, khi biết ngày sinh */
  days?: number;
}

export interface CachInput {
  stems: readonly [CanIdx, CanIdx, CanIdx, CanIdx]; // năm, tháng, ngày, giờ
  branches: readonly [ChiIdx, ChiIdx, ChiIdx, ChiIdx];
  /** Thân vượng (từ engine ngũ hành). Theo sách, nhiều tương thần đổi theo thân mạnh hay yếu */
  thanVuong: boolean;
  /** Ngày trong tháng tính từ tiết; không biết (lá số trong sách) thì để trống */
  days?: number;
}

const GOD_OF: Record<ThapThan, GodKey> = {
  'Chính Quan': 'quan', 'Thất Sát': 'sat', 'Chính Tài': 'tai', 'Thiên Tài': 'tai', 'Chính Ấn': 'an', 'Thiên Ấn': 'kieu',
  'Thực Thần': 'thuc', 'Thương Quan': 'thuong', 'Tỷ Kiên': 'kiep', 'Kiếp Tài': 'kiep',
};
const hanhOfCan = (c: CanIdx): Hanh => BT_HANH_ORDER[CAN_HANH[c]];

/** Hành của một nhóm thần so với Nhật Chủ (Ấn gồm cả Thiên Ấn, Kiếp gồm cả Tỷ Kiên). */
export function godHanh(nhatChu: CanIdx, g: GodKey): Hanh {
  const dm = CAN_HANH[nhatChu];
  const step = { kiep: 0, thuc: 1, thuong: 1, tai: 2, quan: 3, sat: 3, an: 4, kieu: 4 }[g];
  return BT_HANH_ORDER[(dm + step) % 5];
}

export function cachCuc(x: CachInput): CachCuc {
  const dm = x.stems[2], m = x.branches[1];
  const outside = [x.stems[0], x.stems[1], x.stems[3]];
  const godOfCan = (c: CanIdx) => GOD_OF[thapThan(dm, c)];
  /** lộ: có ở can năm, tháng, giờ */
  const lo = (g: GodKey) => outside.some((c) => godOfCan(c) === g || (g === 'an' && godOfCan(c) === 'kieu'));
  const loExact = (g: GodKey) => outside.some((c) => godOfCan(c) === g);
  /** có: lộ, hoặc là bản khí của một chi */
  const co = (g: GodKey) => lo(g) || x.branches.some((b) => { const gg = godOfCan(TANG_CAN[b][0][0]); return gg === g || (g === 'an' && gg === 'kieu'); });

  // 1. Chọn cách
  const hidden = TANG_CAN[m].map((t) => t[0]);
  const mainGod = godOfCan(hidden[0]);
  let can: CanIdx, nguon: CachNguon, cach: CachKey;
  if (mainGod === 'kiep') {
    // Lộc, Nhận ở tháng không lấy làm dụng (TBCT ch.43–46)
    can = hidden[0]; nguon = 'loc-nhan';
    const same = thapThan(dm, can) === 'Tỷ Kiên';
    cach = same ? 'kien-loc' : dm % 2 === 0 ? 'duong-nhan' : 'nguyet-kiep';
  } else {
    const thau = hidden.filter((h) => outside.includes(h) && godOfCan(h) !== 'kiep');
    if (thau.length) { can = thau[0]; nguon = 'thau'; } // bản khí ưu tiên vì TANG_CAN xếp bản khí trước
    else if (x.days !== undefined) { can = tuLenhCan(m, x.days); nguon = 'tu-lenh'; if (godOfCan(can) === 'kiep') { can = hidden[0]; nguon = 'ban-khi'; } }
    else { can = hidden[0]; nguon = 'ban-khi'; }
    const g = godOfCan(can);
    cach = g === 'quan' ? 'chinh-quan' : g === 'sat' ? 'that-sat' : g === 'tai' ? 'tai' : g === 'an' || g === 'kieu' ? 'an' : g === 'thuc' ? 'thuc-than' : 'thuong-quan';
  }

  // 2. Thành, bại, cứu và tương thần (TBCT ch.8–9, 31–48)
  const lyDo: CachLyDo[] = [];
  let trangThai: CachTrangThai = 'thanh';
  let tuong: GodKey | null = null;
  const pick = (opts: readonly (readonly [GodKey, Vi])[]) => {
    for (const [g, vi] of opts) if (co(g)) { tuong = g; lyDo.push({ k: 'thanh', tuong: g, vi }); return true; }
    lyDo.push({ k: 'thieu', can: opts.map((o) => o[0]) });
    return false;
  };
  /** Cách bị `boi` phá; chữ cứu là chữ đầu tiên trong `cuu` có lộ. Không có cứu thì Dụng thần là chữ cứu cần tìm (`need`). */
  let need: GodKey | null = null;
  const broken = (boi: GodKey, cuu: readonly GodKey[]) => {
    const c = cuu.find((g) => lo(g));
    lyDo.push({ k: 'pha', boi, cuu: c });
    if (c) { trangThai = 'cuu'; tuong = c; } else { trangThai = 'bai'; need = cuu[0]; }
    return true;
  };
  const sv = x.thanVuong;

  switch (cach) {
    case 'chinh-quan':
      if (lo('thuong')) broken('thuong', ['an']);
      else if (loExact('sat')) broken('sat', ['thuc']);
      else pick(sv ? [['tai', 'sinh'], ['an', 'ho']] : [['an', 'ho'], ['tai', 'sinh']]);
      break;
    case 'tai':
      if (lo('kiep') && !lo('quan') && !lo('sat')) broken('kiep', ['quan', 'thuc', 'sat']);
      else if (loExact('sat') && !lo('thuc')) broken('sat', ['thuc', 'an', 'kiep']);
      else pick(sv ? [['quan', 'ho'], ['thuc', 'sinh'], ['thuong', 'sinh']] : [['an', 'ho'], ['kiep', 'giup']]);
      break;
    case 'an':
      if (!sv && lo('tai') && !lo('kiep')) broken('tai', ['kiep']);
      else pick(sv ? [['thuc', 'tiet'], ['thuong', 'tiet'], ['tai', 'che']] : [['quan', 'sinh'], ['sat', 'sinh'], ['kiep', 'giup']]);
      break;
    case 'thuc-than':
      if (loExact('kieu') && !lo('tai')) broken('kieu', ['tai']);
      else if (loExact('sat')) { tuong = 'thuc'; lyDo.push({ k: 'thanh', tuong: 'thuc', vi: 'che' }); }
      else pick(sv ? [['tai', 'sinh']] : [['an', 'ho'], ['kiep', 'giup']]);
      break;
    case 'that-sat':
      if (lo('tai') && !lo('thuc') && !lo('an')) broken('tai', ['thuc', 'an']);
      else pick(sv ? [['thuc', 'che'], ['thuong', 'che'], ['an', 'hoa']] : [['an', 'hoa'], ['thuc', 'che']]);
      break;
    case 'thuong-quan':
      if (loExact('quan') && !lo('an')) broken('quan', ['an', 'tai']);
      else pick(sv ? [['tai', 'sinh'], ['sat', 'che']] : [['an', 'ho'], ['tai', 'sinh']]);
      break;
    case 'duong-nhan':
      pick([['quan', 'che'], ['sat', 'che'], ['thuc', 'tiet'], ['thuong', 'tiet']]);
      break;
    case 'kien-loc':
    case 'nguyet-kiep':
      pick([['quan', 'ho'], ['tai', 'sinh'], ['sat', 'che'], ['thuc', 'tiet'], ['thuong', 'tiet']]);
      break;
  }
  if (!tuong && trangThai === 'thanh') trangThai = 'bai';

  const fallback = lyDo.find((l) => l.k === 'thieu') as Extract<CachLyDo, { k: 'thieu' }> | undefined;
  const want: GodKey = tuong ?? need ?? fallback?.can[0] ?? 'an';
  return {
    cach, than: thapThan(dm, can), can, nguon, thien: THIEN_CACH.includes(cach),
    days: x.days, trangThai, tuongThan: tuong, dung: tuong === 'thuc' && cach === 'thuc-than' ? hanhOfCan(can) : godHanh(dm, want), lyDo,
  };
}
