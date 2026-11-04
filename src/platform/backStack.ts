/* Ngăn xếp trình xử lý nút Back — thuần, không phụ thuộc Capacitor/React, test được (ARCHITECTURE.md mục 1.3).
   Trình xử lý đăng ký sau cùng chạy trước; trả `true` nghĩa là đã xử lý. Không ai xử lý thì gọi `fallback`
   (quy tắc của router); fallback trả 'minimize' khi đang ở gốc tab Tổng hợp. */
export type BackHandler = () => boolean;
export type BackFallback = () => 'handled' | 'minimize';

export function createBackStack() {
  const handlers: BackHandler[] = [];
  let fallback: BackFallback = () => 'minimize';
  return {
    register(h: BackHandler): () => void {
      handlers.push(h);
      return () => {
        const i = handlers.lastIndexOf(h);
        if (i >= 0) handlers.splice(i, 1);
      };
    },
    setFallback(f: BackFallback) { fallback = f; },
    /** Chạy một lần bấm Back. */
    dispatch(): 'handled' | 'minimize' {
      for (let i = handlers.length - 1; i >= 0; i--) if (handlers[i]()) return 'handled';
      return fallback();
    },
    get size() { return handlers.length; },
  };
}
export type BackStack = ReturnType<typeof createBackStack>;
