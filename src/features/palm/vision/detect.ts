/* Nhận diện 21 điểm khớp bàn tay bằng MediaPipe Hand Landmarker, chạy hoàn toàn trên máy.
   Mô hình (Apache 2.0, Google) và phần chạy WASM nằm trong app ở public/palm/, tải lười khi vào màn hình xem tay lần đầu (~22 MB), không cần mạng. */
import type { HandLandmarker } from '@mediapipe/tasks-vision';
import type { Pt } from './types';

let loading: Promise<HandLandmarker> | null = null;

/** Nạp một lần, dùng lại cho các ảnh sau. Lỗi thì lần sau thử lại. */
export function loadHands(): Promise<HandLandmarker> {
  loading ??= (async () => {
    const { FilesetResolver, HandLandmarker } = await import('@mediapipe/tasks-vision');
    const dir = new URL('palm', document.baseURI).pathname.replace(/\/$/, '');
    const vision = await FilesetResolver.forVisionTasks(dir);
    return HandLandmarker.createFromOptions(vision, {
      baseOptions: { modelAssetPath: `${dir}/hand_landmarker.task`, delegate: 'CPU' },
      runningMode: 'IMAGE', numHands: 1,
    });
  })().catch((e) => { loading = null; throw e; });
  return loading;
}

/** 21 điểm theo tỉ lệ 0…1 của ảnh, hoặc null nếu không thấy bàn tay. */
export async function detectHand(bitmap: ImageBitmap): Promise<Pt[] | null> {
  const hands = await loadHands();
  const lm = hands.detect(bitmap).landmarks[0];
  return lm ? lm.map((p) => ({ x: p.x, y: p.y })) : null;
}
