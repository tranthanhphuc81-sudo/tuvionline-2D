/* Ảnh tay của lần xem vừa xong, CHỈ giữ trong bộ nhớ để màn kết quả vẽ đường lên ảnh thật (ARCHITECTURE mục 13.1: không lưu ảnh).
   Rời màn kết quả, xoá kết quả hoặc tắt app là mất; mở lại kết quả sau đó thì dùng tranh vẽ. */
let held: { sessionId: string; url: string } | null = null;

export function holdPhoto(sessionId: string, view: HTMLCanvasElement): void {
  try { held = { sessionId, url: view.toDataURL('image/jpeg', 0.88) }; } catch { held = null; }
}

export const heldPhoto = (sessionId: string): string | null => (held?.sessionId === sessionId ? held.url : null);

export function dropPhoto(): void { held = null; }
