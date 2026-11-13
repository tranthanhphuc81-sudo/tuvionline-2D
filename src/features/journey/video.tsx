/* Nền video cho lối vào (ARCHITECTURE 12.12, 13/11/2026). Video do chủ dự án tạo: một người đi qua cầu vào cổng, vườn,
   chính điện, hành lang rồi ngồi vào tĩnh thất, 20 giây, chia 5 đoạn 4 giây khớp 5 trạm.
   Video chạy LIỀN MỘT MẠCH và quyết định đang ở trạm nào (bản đầu dừng ở cuối mỗi đoạn chờ trạm sau, chủ dự án thấy
   gượng). Chạm, "Đi tiếp", "Vào tĩnh thất" thì tua sang đầu đoạn sau; hết video thì hành trình xong.
   Chỉ dùng cho bản đầy đủ: rút gọn mỗi trạm 0,5 giây, giảm chuyển động chỉ mờ dần, nên giữ tranh vẽ. Video lỗi, hoặc
   quá VIDEO_START_MS chưa phát được, thì quay về tranh vẽ và hẹn giờ như cũ. Video luôn tắt tiếng: tiếng nền do ambientAudio. */
import { useEffect, useRef } from 'react';
import src from '../../assets/journey/video/loi-vao.mp4';
import s from './journey.module.css';

export const JOURNEY_VIDEO_SRC: string = src;
/** Chờ video phát tối đa bấy nhiêu, quá thì dùng tranh vẽ. */
export const VIDEO_START_MS = 2500;

/** Đoạn [bắt đầu, kết thúc] (giây) của từng trạm trong video, theo đúng thứ tự trạm. */
export const VIDEO_SEGMENTS: readonly (readonly [number, number])[] = [[0, 4], [4, 8], [8, 12], [12, 16], [16, 20]];

/** Trạm ứng với giây `t` của video. */
export function segmentAt(t: number): number {
  const i = VIDEO_SEGMENTS.findIndex(([, b]) => t < b);
  return i < 0 ? VIDEO_SEGMENTS.length - 1 : i;
}

/**
 * Lớp video nằm dưới trạm. `index` là trạm hiện tại: video tự báo trạm qua `onIndex` khi chạy tới; khi `index` đổi vì
 * người dùng bước tới thì video tua tới đầu đoạn đó. `onReady` khi đã phát khung đầu; `onFail` khi lỗi hoặc quá hạn.
 */
export function JourneyVideo({ index, onIndex, onReady, onFail, onEnded }: {
  index: number; onIndex(i: number): void; onReady(): void; onFail(): void; onEnded(): void;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    try { void v.play()?.catch(() => {}); } catch { /* jsdom, hoặc máy chặn tự phát: hẹn giờ dưới sẽ lo */ }
    const t = setTimeout(() => { if (!started.current) onFail(); }, VIDEO_START_MS);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const v = ref.current;
    const seg = VIDEO_SEGMENTS[index];
    if (!v || !seg || !started.current) return;
    if (segmentAt(v.currentTime) !== index) v.currentTime = seg[0];
  }, [index]);

  return (
    <video
      ref={ref} className={s.video} src={JOURNEY_VIDEO_SRC} muted playsInline preload="auto" aria-hidden="true" tabIndex={-1}
      disablePictureInPicture
      onPlaying={() => { if (!started.current) { started.current = true; onReady(); } }}
      onTimeUpdate={(e) => { const i = segmentAt(e.currentTarget.currentTime); if (i !== index) onIndex(i); }}
      onEnded={onEnded}
      onError={onFail}
    />
  );
}
