/* Nhận biết lắc máy qua `devicemotion`, để gieo xu. Android WebView không cần xin quyền. */
/** m/s², đã gồm trọng lực (đứng yên ≈ 9,8). Đủ cao để run tay hay bước đi không tính là lắc; chốt lại sau khi thử trên máy thật. */
export const SHAKE_LIMIT = 22;
/** Một lần lắc mạnh sinh nhiều sự kiện liền nhau, nên phải cách ít nhất ngần này. */
export const SHAKE_GAP_MS = 900;

export function shakeDetector(): (x: number, y: number, z: number, now: number) => boolean {
  let last = -Infinity;
  return (x, y, z, now) => {
    if (Math.hypot(x, y, z) < SHAKE_LIMIT || now - last < SHAKE_GAP_MS) return false;
    last = now;
    return true;
  };
}

/** Gọi `cb` mỗi lần lắc; hàm trả về để thôi nghe. */
export function onShake(cb: () => void): () => void {
  const hit = shakeDetector();
  const handler = (e: DeviceMotionEvent) => {
    const a = e.accelerationIncludingGravity;
    if (a && hit(a.x ?? 0, a.y ?? 0, a.z ?? 0, e.timeStamp)) cb();
  };
  window.addEventListener('devicemotion', handler);
  return () => window.removeEventListener('devicemotion', handler);
}
