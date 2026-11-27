/* Màn hình nạp khi cần (ARCHITECTURE 4.2). Khác React.lazy ở một điểm: gói đã tải xong (do tải sẵn lúc app rảnh, hoặc đã mở
   một lần) thì dựng ngay, không qua Suspense, nên không chớp chữ "Đang mở…". Chưa tải thì dùng React.lazy như thường. */
import { createElement, lazy, useState, type ComponentType } from 'react';

export interface LazyScreen<P> {
  (props: P): ReturnType<typeof createElement>;
  /** Tải gói (một lần, gọi lại trả cùng promise). Lỗi mạng thì lần sau thử lại. */
  preload(): Promise<unknown>;
}

export function lazyScreen<M, P extends object>(load: () => Promise<M>, pick: (m: M) => ComponentType<P>): LazyScreen<P> {
  let mod: M | undefined;
  let pending: Promise<M> | undefined;
  const preload = () => (pending ??= load().then((m) => (mod = m), (e) => { pending = undefined; throw e; }));
  const Lazy = lazy(() => preload().then((m) => ({ default: pick(m) })));
  // Chọn MỘT lần cho mỗi lần dựng: đổi loại component giữa chừng thì React gỡ cây cũ, tab mất trạng thái (1.2)
  function LazyScreen(props: P) {
    const [Comp] = useState<ComponentType<P>>(() => (mod ? pick(mod) : (Lazy as unknown as ComponentType<P>)));
    return createElement(Comp, props);
  }
  return Object.assign(LazyScreen, { preload });
}
