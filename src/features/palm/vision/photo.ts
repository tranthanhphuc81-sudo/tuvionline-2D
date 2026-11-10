/* Từ một ảnh lòng bàn tay → khung xem 512×512 (xoay, thu phóng, lật; không làm méo), 21 điểm khớp trên khung đó và bản đồ rãnh.
   Ảnh chỉ nằm trong bộ nhớ lúc xử lý, không được lưu. Chép từ trang thử trên điện thoại (spike/chitay/phone.ts). */
import { detectHand } from './detect';
import { viewRidge } from './livewire';
import { apply, loadBitmap, viewMatrix } from './pipeline';
import { SIZE, type Pt } from './types';

export interface PreparedPhoto {
  /** ảnh đã dựng ở khung xem, ngón cái bên trái, cổ tay phía dưới */
  view: HTMLCanvasElement;
  /** 21 điểm khớp trên khung xem, px */
  landmarks: Pt[];
  ridge: Float32Array;
}

export type PhotoError = 'no-hand' | 'unreadable';

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
    return { view, landmarks: lm.map((_, i) => apply(vm, px(i))), ridge: viewRidge(view) };
  } finally {
    bmp.close();
  }
}
