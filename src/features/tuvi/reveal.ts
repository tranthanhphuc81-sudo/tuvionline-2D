/* Hoạt ảnh "an sao" chỉ chạy khi mở Tử Vi từ tờ lá số trên án thư, không chạy khi bấm thanh tab. */
let pending = false;

export const requestStarReveal = (): void => { pending = true; };

/** Lấy yêu cầu đang chờ, đồng thời xoá nó. Máy bật giảm chuyển động thì bỏ qua. */
export function takeStarReveal(): boolean {
  const asked = pending;
  pending = false;
  return asked && !(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);
}
