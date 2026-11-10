/* Từ một ảnh lòng bàn tay → khung xem 512×512 (xoay, thu phóng, lật; không làm méo), 21 điểm khớp trên khung đó và bản đồ rãnh.
   Ảnh chỉ nằm trong bộ nhớ lúc xử lý, không được lưu. Chép từ trang thử trên điện thoại (spike/chitay/phone.ts). */
import { detectHand } from './detect';
import { viewRidge } from './livewire';
import { TEMPLATE } from './editor';
import { analyze, type Quality } from './lines';
import { INDEX, PINKY, WRIST, affine, apply, invert, loadBitmap, palmMask, viewMatrix } from './pipeline';
import { SIZE, type LineId, type Pt } from './types';

export interface PreparedPhoto {
  /** ảnh đã dựng ở khung xem, ngón cái bên trái, cổ tay phía dưới */
  view: HTMLCanvasElement;
  /** 21 điểm khớp trên khung xem, px */
  landmarks: Pt[];
  ridge: Float32Array;
  /** đường máy tự dò, trên khung xem: chỉ hiện mờ làm gợi ý chỗ cần chạm, không dùng để đo */
  hints: Partial<Record<LineId, Pt[]>>;
}

/** Máy tự dò 4 đường trên khung chuẩn (ép 3 mốc về chỗ cố định, như trang thử đã kiểm chứng) rồi đổi về khung xem. Lỗi thì không có gợi ý. */
function machineHints(bmp: ImageBitmap, px: (i: number) => Pt, toViewFromImage: (p: Pt) => Pt): { hints: Partial<Record<LineId, Pt[]>>; quality: Quality | null } {
  try {
    const scaled = (p: Pt) => ({ x: p.x * SIZE, y: p.y * SIZE });
    const m = affine([px(0), px(5), px(17)], [WRIST, INDEX, PINKY].map(scaled));
    const work = document.createElement('canvas');
    work.width = work.height = SIZE;
    const ctx = work.getContext('2d', { willReadFrequently: true })!;
    ctx.setTransform(m.a, m.b, m.c, m.d, m.e, m.f);
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(bmp, 0, 0);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const outline = [0, 1, 2, 5, 9, 13, 17].map((i) => apply(m, px(i)));
    const a = analyze(ctx.getImageData(0, 0, SIZE, SIZE), palmMask(ctx, outline));
    const back = invert(m);
    const toView = (p: Pt) => toViewFromImage(apply(back, p));
    const len = (pts: Pt[]) => pts.slice(1).reduce((t, p, i) => t + Math.hypot(p.x - pts[i].x, p.y - pts[i].y), 0);
    const out: Partial<Record<LineId, Pt[]>> = {};
    for (const id of Object.keys(TEMPLATE) as LineId[]) {
      const typical = TEMPLATE[id].map(([x, y]) => ({ x: x * SIZE, y: y * SIZE }));
      const found = a.lines.find((l) => l.id === id)?.points ?? [];
      // Máy dò được đủ dài thì gợi ý theo nét máy; ảnh mờ hay máy dò hụt thì gợi ý chỗ đường thường nằm
      out[id] = (found.length > 1 && len(found) >= 0.4 * len(typical) ? found : typical).map(toView);
    }
    return { hints: out, quality: a.quality };
  } catch {
    return { hints: {}, quality: null };
  }
}

/** `blurry`: ảnh mờ, nhoè (độ nét của lòng bàn tay dưới ngưỡng đã chỉnh trên 32 ảnh thật ở bản thử) → bắt chụp lại. */
export type PhotoError = 'no-hand' | 'unreadable' | 'blurry';

export async function preparePhoto(file: Blob): Promise<PreparedPhoto | PhotoError> {
  let bmp: ImageBitmap;
  try { bmp = await loadBitmap(file); } catch { return 'unreadable'; }
  try {
    const lm = await detectHand(bmp);
    if (!lm) return 'no-hand';
    const px = (i: number): Pt => ({ x: lm[i].x * bmp.width, y: lm[i].y * bmp.height });
    const vm = viewMatrix(px(0), px(9), px(5), px(17), 0.99, 0.14);
    const view = document.createElement('canvas');
    view.width = view.height = SIZE;
    const pen = view.getContext('2d', { willReadFrequently: true })!;
    pen.fillStyle = '#26221d';
    pen.fillRect(0, 0, SIZE, SIZE);
    pen.setTransform(vm.a, vm.b, vm.c, vm.d, vm.e, vm.f);
    pen.imageSmoothingQuality = 'high';
    pen.drawImage(bmp, 0, 0);
    pen.setTransform(1, 0, 0, 1, 0, 0);
    const { hints, quality } = machineHints(bmp, px, (p) => apply(vm, p));
    // Ảnh mờ thì đường chỉ không rõ, đo ra sai: không dùng ảnh này, bắt chụp lại
    if (quality?.issues.includes('mờ')) return 'blurry';
    return { view, landmarks: lm.map((_, i) => apply(vm, px(i))), ridge: viewRidge(view), hints };
  } finally {
    bmp.close();
  }
}
