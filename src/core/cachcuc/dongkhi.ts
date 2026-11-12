/* Dòng chảy của khí (TTT ch.19 "Nguyên lưu", ch.20 "Thông quan", ch.28 "Thuận nghịch") và hành nổi, hành vắng cho mục tính tình
   (TTT phần II ch.24). ARCHITECTURE 15.7. Chỉ trả mã và số; câu chữ ở src/content/cachcuc/dongkhi.ts. */
import type { Element } from '../nguhanh/data';
import { generates } from '../nguhanh/data';

/** Dưới ngưỡng này coi như hành đó gần như vắng trong lá số. */
export const PRESENT_SHARE = 0.08;

export interface DongKhi {
  /** nơi khí bắt đầu: hành có tỉ lệ lớn nhất */
  nguon: Element;
  /** đường sinh nối tiếp từ nguồn, mỗi hành sau được hành trước sinh ra */
  duong: Element[];
  /** hành khí dừng lại */
  dung: Element;
  /** hành kế tiếp mà khí không chảy tới được vì gần như vắng (null khi đã đi hết vòng) */
  tac: Element | null;
  /** đường chảy có đi qua hành của Nhật Chủ */
  quaNhatChu: boolean;
}

export function dongKhi(shares: Record<Element, number>, nhatChu: Element): DongKhi {
  const els = Object.keys(shares) as Element[];
  const nguon = els.reduce((a, b) => (shares[b] > shares[a] ? b : a));
  const duong: Element[] = [nguon];
  let cur = nguon, tac: Element | null = null;
  while (duong.length < 5) {
    const next = generates(cur);
    if (shares[next] < PRESENT_SHARE) { tac = next; break; }
    duong.push(next); cur = next;
  }
  return { nguon, duong, dung: duong[duong.length - 1], tac, quaNhatChu: duong.includes(nhatChu) };
}

/** Hành nổi nhất và hành vắng nhất, dùng cho mục tính tình. Vắng = dưới ngưỡng hiện diện. */
export function noiVang(shares: Record<Element, number>): { noi: Element; vang: Element[] } {
  const els = Object.keys(shares) as Element[];
  const noi = els.reduce((a, b) => (shares[b] > shares[a] ? b : a));
  return { noi, vang: els.filter((e) => shares[e] < PRESENT_SHARE) };
}
