/* Đổi từng mã `Msg` của engine ngũ hành thành câu (chữ có thẻ <b> theo src/content/rich). NỘI DUNG MỚI, xem README.md.
   Mỗi mã engine có thể trả về đều phải có câu ở đây; test tests/nguhanh-content.test.ts kiểm cho 3000 lá số. */
import { BatTuEngine } from '../../core';
import type { Msg } from '../../core/nguhanh';
import { GRADE_VI, TEN_GOD_VI, TYPE_VI } from './vocab';

const { CAN, CHI } = BatTuEngine;
type P = NonNullable<Msg['p']>;
const pc = (x: unknown) => Math.round(Number(x) * 100) + '%';
const num = (x: unknown) => String(Math.round(Number(x) * 100) / 100).replace('.', ',');
const can = (i: unknown) => CAN[Number(i)];
const chi = (i: unknown) => CHI[Number(i)];
const god = (g: unknown) => TEN_GOD_VI[g as keyof typeof TEN_GOD_VI];
const type = (t: unknown) => TYPE_VI[t as keyof typeof TYPE_VI];
const POS: Record<string, string> = { year: 'năm', month: 'tháng', day: 'ngày', hour: 'giờ' };
const LEVEL = ['bản khí', 'trung khí', 'dư khí'];
const STATE: Record<string, string> = { vuong: 'Vượng', tuong: 'Tướng', huu: 'Hưu', tu: 'Tù', tuDie: 'Tử' };
const HANH5 = ['Mộc', 'Hoả', 'Thổ', 'Kim', 'Thuỷ'];
const who = (kind: unknown) => (kind === 'tong' ? 'Ấn/Tỷ (phe cứu Nhật Chủ)' : 'Quan Sát (phe chế Nhật Chủ)');
const whoShort = (kind: unknown) => (kind === 'tong' ? 'Ấn/Tỷ' : 'Quan Sát');
const scores = (s: unknown) => HANH5.map((h) => `${h} ${num((s as Record<string, number>)[h])}`).join(' · ');

export interface RenderCtx {
  /** nhãn của cách luận theo id; mặc định "cách luận thuận thế" / "cách luận thông thường" */
  readingLabel?: (id: string) => string;
}
const defaultLabel = (id: string) => (id === 'thuan-the' ? 'cách luận thuận thế' : 'cách luận thông thường');

/** Câu của một mã. Mã lạ trả về chuỗi rỗng (test bắt trường hợp này). */
export function msgText(m: Msg, ctx: RenderCtx = {}): string {
  const p = (m.p ?? {}) as P;
  const label = ctx.readingLabel ?? defaultLabel;
  switch (m.code) {
    /* --- vết tính --- */
    case 'trace.clash': return `Lục xung ${chi(p.a)}–${chi(p.b)}: giảm lực hai chi (×${num(p.factor)})`;
    case 'trace.stemCombo': return `Can hợp ${can(p.a)}–${can(p.b)} (hướng hoá ${p.to}): hai can bị "trói" bớt lực (×${num(p.factor)})`;
    case 'trace.raw': return `Điểm thô (chưa xét mùa): ${scores(p.scores)}`;
    case 'trace.triad': return `Tam hợp ${(p.set as number[]).map(chi).join('–')} cục ${p.to}: cộng ${num(p.bonus)}`;
    case 'trace.halfTriad': return `Bán hợp ${(p.present as number[]).map(chi).join('–')} hướng ${p.to}: cộng ${num(p.bonus)}`;
    case 'trace.sixCombo': return `Lục hợp ${chi(p.a)}–${chi(p.b)} hướng ${p.to}: cộng ${num(p.bonus)}`;
    case 'trace.season': {
      const st = p.states as Record<string, { state: string; mult: number }>;
      return `Sinh tháng ${chi(p.monthBranch)} (mùa ${p.season}): ${HANH5.map((h) => `${h} ${STATE[st[h].state]} ×${num(st[h].mult)}`).join(', ')}`;
    }
    case 'trace.final': return `Điểm cuối: ${scores(p.scores)}`;
    /* --- ghi chú phụ --- */
    case 'secondary.dieuHau':
      return p.climate === 'lanh'
        ? `Sinh mùa lạnh (tháng ${chi(p.monthBranch)}) mà ${p.element} chỉ chiếm ${pc(p.share)} → cục thiên lạnh, cần ${p.element} sưởi ấm`
        : `Sinh mùa nóng (tháng ${chi(p.monthBranch)}) mà ${p.element} chỉ chiếm ${pc(p.share)} → cục thiên nóng khô, cần ${p.element} làm dịu`;
    case 'secondary.thongQuan':
      return `${p.a} (${pc(p.aShare)}) đang khắc mạnh ${p.b} (${pc(p.bShare)}) → dùng ${p.bridge} làm cầu nối (${p.a} sinh ${p.bridge}, ${p.bridge} sinh ${p.b})`;
    /* --- lý do chọn Dụng thần --- */
    case 'reason.followHead': return `${type(p.type)} — ${GRADE_VI[p.grade as keyof typeof GRADE_VI]}, độ tin cậy ${pc(p.confidence)}`;
    case 'reason.chuyenVuong': return `Nhật Chủ ${p.dm} chiếm ${pc(p.ratio)} lực → thuận theo thế vượng; dùng Thực Thương ${p.thoat} để thoát khí, tránh Quan Sát ${p.nghich} đi ngược thế`;
    case 'reason.followMixed': return `Phe tiết, khắc hỗn hợp (${(p.groups as string[]).map(god).join(' + ')}) → theo thế chung, lấy ${god(p.main)} ${p.dung} làm trục`;
    case 'reason.followSingle': return `Nhật Chủ ${p.dm} chỉ có ${pc(p.ratio)} lực, không có gốc → không "cứu", thuận theo ${god(p.main)} ${p.dung}`;
    case 'reason.dieuHauFirst': return 'Thiếu hụt rõ nên ưu tiên Điều hậu trước việc bồi thêm hay tiết bớt Nhật Chủ (theo tinh thần Cùng Thông Bảo Giám)';
    case 'reason.trungHoa': return `Nhật Chủ gần cân bằng (trung hoà, ${pc(p.ratio)} hỗ trợ) → không cần can thiệp mạnh: bù hành yếu nhất ${p.weakest}, bớt hành dư nhất ${p.strongest}`;
    case 'reason.vuong.an': return `Thân vượng chủ yếu do Ấn nhiều (${num(p.an)} so với Tỷ Kiếp ${num(p.tyKiep)}) → dùng Tài ${p.tai} để chế Ấn`;
    case 'reason.vuong.quanSat': return `Thân vượng do Tỷ Kiếp nhiều, trong cục có Quan Sát (${num(p.quanSat)}) → dùng Quan Sát ${p.element} để chế bớt Thân`;
    case 'reason.vuong.thucThuong': return `Thân vượng do Tỷ Kiếp, Quan Sát yếu hoặc không có → dùng Thực Thương ${p.element} để tiết bớt (nhẹ nhàng hơn là đưa Quan Sát vào khắc)`;
    case 'reason.nhuoc.tai': return `Thân nhược do Tài nặng (${num(p.tai)}) → dùng Tỷ Kiếp ${p.element} để gánh Tài (Ấn bị Tài khắc nên kém hiệu quả)`;
    case 'reason.nhuoc.quanSat': return `Thân nhược do Quan Sát nặng (${num(p.quanSat)}) → dùng Ấn ${p.element}: Quan sinh Ấn, Ấn sinh Thân (vừa hoá bớt áp lực vừa bồi Thân)`;
    case 'reason.nhuoc.thucThuong': return `Thân nhược do Thực Thương tiết khí (${num(p.thucThuong)}) → dùng Ấn ${p.element} để chế Thực Thương và bổ Thân`;
    /* --- bốn điều kiện Tòng cách --- */
    case 'root.none': return `${who(p.kind)} không có gốc ở địa chi nào`;
    case 'root.weak': case 'root.real': {
      const found = (p.found as Array<{ stem: number; level: number; pos: string; branch: number; weight: number }>)
        .map((f) => `${can(f.stem)} (${LEVEL[f.level]}) trong chi ${POS[f.pos]} ${chi(f.branch)} = ${num(f.weight)}`).join('; ');
      return `${who(p.kind)} có gốc: ${found} → tổng ${num(p.total)} (${m.code === 'root.weak' ? `≤ ${num(p.weakRootMax)}: gốc yếu` : `> ${num(p.weakRootMax)}: có gốc thật`})`;
    }
    case 'exposed.none': return `Không có ${whoShort(p.kind)} thấu can`;
    case 'exposed.list': {
      const why = (n: { why: string; other: number | null; branch: number }) => {
        switch (n.why) {
          case 'combo-void': return `bị hợp với ${can(n.other)} → vô hiệu`;
          case 'combo-dm': return `hợp với Nhật Chủ ${can(n.other)} → bị trói nhưng vẫn "hữu tình" với Nhật Chủ`;
          case 'clash-noroot': return `bị ${can(n.other)} khắc, ngồi trên ${chi(n.branch)} không có gốc → vô hiệu`;
          case 'clash-root': return `bị ${can(n.other)} khắc nhưng có gốc tại ${chi(n.branch)} → còn lực`;
          case 'free-root': return `có gốc tại ${chi(n.branch)}, không bị chế`;
          default: return 'không bị hợp hay khắc';
        }
      };
      return (p.notes as Array<{ stem: number; pos: string; why: string; other: number | null; branch: number }>)
        .map((n) => `${can(n.stem)} (trụ ${POS[n.pos]}) ${why(n)}`).join('; ');
    }
    case 'dominant.tong': return `Phe khắc, tiết Nhật Chủ chiếm ${pc(p.share)} (cần ≥ ${pc(p.min)}); ${god(p.top)} ${p.element} ${p.momentum ? msgText(p.momentum as Msg, ctx) : 'không đắc lệnh, không thành cục'}`;
    case 'dominant.chuyenVuong': return `Tỷ Kiếp + Ấn chiếm ${pc(p.share)}; Nhật Chủ ${p.element} ${p.momentum ? msgText(p.momentum as Msg, ctx) : 'không đắc lệnh, không thành cục'}`;
    case 'momentum.deLenh': return `đắc lệnh (sinh mùa ${p.element})`;
    case 'momentum.lenhSinh': return `được lệnh tháng sinh (mùa ${p.season} sinh ${p.element})`;
    case 'momentum.triad': return `thành tam hợp cục ${p.element}`;
    case 'momentum.halfTriad': return `bán hợp hướng ${p.element}`;
    case 'direction.single': return `Theo một hướng rõ: ${god(p.top)} gấp ${p.ratio === null ? 'rất nhiều' : num(p.ratio)} lần ${god(p.second)}`;
    case 'direction.mixed': return `Hỗn hợp: ${god(p.top)} (${num(p.topValue)}) và ${god(p.second)} (${num(p.secondValue)}) ngang ngửa → tòng thế`;
    case 'direction.selfLed': return 'Tỷ Kiếp làm chủ → chuyên vượng đúng nghĩa';
    case 'direction.anLed': return 'Ấn nhiều hơn Tỷ Kiếp → nghiêng về Tòng Cường';
    case 'follow.summary': {
      const t = type(p.type), conf = pc(p.confidence), b = (p.breakers as string[]).join(', ');
      const s = p.kind === 'tong' ? 'thân nhược' : 'thân vượng';
      if (p.grade === 'chan') return `Thành ${t} rõ ràng (độ tin cậy ${conf}). Năm hay Đại Vận gặp ${b} là lúc dễ có biến động vì phá cách.`;
      if (p.grade === 'gia') return `Có thể là ${t} nhưng chưa trọn (độ tin cậy ${conf}): nên xem cả hai cách luận và kiểm chứng bằng các năm đã qua. Khi gặp ${b}, cục có xu hướng quay về luận ${s} thông thường.`;
      return `Có dấu hiệu ${t} nhưng chưa đạt điều kiện (độ tin cậy ${conf}) → luận theo ${s} thông thường.`;
    }
    /* --- cách luận --- */
    case 'reading.follow': return `Luận ${type(p.type)}`;
    case 'reading.normal': return p.side === 'nhuoc' ? 'Luận thân nhược thông thường' : 'Luận thân vượng thông thường';
    /* --- phân xử bằng quá khứ --- */
    case 'resolve.decided': return `Các mốc đã qua khớp hơn với "${label(String(p.reading))}" (${p.wins}/${p.total} mốc, trọng số ${pc(p.weight)}). Đây chỉ là so sánh giữa hai cách tính, chưa chứng minh cách nào đúng; trí nhớ về các năm cũ cũng có thể lệch.`;
    case 'resolve.insufficient': return `Chưa đủ dữ liệu: cần ít nhất ${p.needed} mốc để kết luận (hiện có ${p.total}).`;
    case 'resolve.undecided': return `Chưa phân định rõ ("${label(String(p.reading))}" khớp ${p.wins}/${p.total} mốc, trọng số ${pc(p.weight)}). Có thể do câu hỏi quá chung chung hoặc trí nhớ chưa chắc. Bạn có thể trả lời thêm, hoặc nhờ người luận xem trực tiếp.`;
    default: return '';
  }
}
