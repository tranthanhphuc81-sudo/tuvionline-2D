/* Nền video cho lối vào (ARCHITECTURE 12.12). Video do chủ dự án tạo: một người qua cổng "Lý Số Trọn Bộ", lối vườn, cầu gỗ,
   tới cửa chính điện, cửa mở, đi hành lang vào phòng cửa sổ tròn, đứng trước án thư rồi ngồi xuống.
   Bản 16/11/2026 (chủ dự án: "khách đi rất nhanh, không có tương tác rõ"): phát chậm 1,5 lần (VIDEO_SLOW; từ 27/11/2026 app tự
   phát file 20 giây ở tốc độ 2/3 thay cho file làm chậm, 12.12) và DỪNG ở ba chỗ có lý do trong hình (VIDEO_STOPS): trước cổng (đạo đồng mời vào), trước cửa chính điện (gõ chuông xin vào,
   video chạy tiếp đúng đoạn cửa mở), trước án thư (thắp hương hoặc ngồi xuống). Ngoài ba chỗ đó video chạy liền.
   Chỉ dùng cho bản đầy đủ: rút gọn và giảm chuyển động giữ tranh vẽ. Video lỗi, hoặc quá VIDEO_START_MS chưa phát được, thì
   quay về tranh vẽ và hẹn giờ như cũ. Video luôn tắt tiếng: tiếng nền do ambientAudio. */
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import src from '../../assets/journey/video/loi-vao.mp4';
import s from './journey.module.css';

export const JOURNEY_VIDEO_SRC: string = src;
/** Chờ video phát tối đa bấy nhiêu, quá thì dùng tranh vẽ. */
export const VIDEO_START_MS = 2500;
/** Dừng ở một chỗ mà người dùng không làm gì thì sau bấy nhiêu tự đi tiếp: không chặn ai (12.1). */
export const STOP_WAIT_MS = 20000;

/** Phát chậm bấy nhiêu lần (`playbackRate` = 1 / VIDEO_SLOW). File làm chậm sẵn thì đặt 1 và nhân mọi mốc dưới với 1,5. */
export const VIDEO_SLOW = 1.5;

/** Đoạn [bắt đầu, kết thúc] (giây của FILE, không phải đồng hồ) của từng trạm, đúng thứ tự trạm: cổng, vườn, chính điện, hành lang, tĩnh thất. */
export const VIDEO_SEGMENTS: readonly (readonly [number, number])[] = [[0, 2.5], [2.5, 7.4], [7.4, 10], [10, 13], [13, 20]];

export type StopKind = 'gate' | 'door' | 'table';
/** Ba chỗ dừng (giây của file), chọn theo khung hình: khách đứng trước cổng, sát cửa chính điện (ngay trước lúc hình chuyển
    sang cánh cửa), trước án thư (ngay trước lúc ngồi). */
export const VIDEO_STOPS: readonly { at: number; kind: StopKind }[] = [{ at: 0.05, kind: 'gate' }, { at: 7.33, kind: 'door' }, { at: 15.5, kind: 'table' }];

/** Trạm ứng với giây `t` của video. */
export function segmentAt(t: number): number {
  const i = VIDEO_SEGMENTS.findIndex(([, b]) => t < b);
  return i < 0 ? VIDEO_SEGMENTS.length - 1 : i;
}

/** Chỗ dừng kế tiếp chưa qua, tính từ giây `t`; `passed` là số chỗ dừng đã qua. */
export function nextStop(passed: number): (typeof VIDEO_STOPS)[number] | undefined {
  return VIDEO_STOPS[passed];
}

export interface JourneyVideoHandle {
  /** Đi tiếp sau một chỗ dừng. */
  resume(): void;
  /** Người dùng chạm khi video đang chạy: tua tới chỗ dừng kế tiếp; hết chỗ dừng thì kết thúc. */
  skipAhead(): void;
}

/**
 * Lớp video nằm dưới trạm. Báo trạm qua `onIndex` khi chạy tới, báo chỗ dừng qua `onStop` (video đã dừng ở khung đó).
 * Kiểm thời điểm dừng mỗi khung hình (requestAnimationFrame) chứ không chờ `timeupdate` (4 lần/giây, dễ trượt sang cảnh sau).
 */
export const JourneyVideo = forwardRef<JourneyVideoHandle, {
  index: number; onIndex(i: number): void; onStop(kind: StopKind): void; onReady(): void; onFail(): void; onEnded(): void;
}>(function JourneyVideo({ index, onIndex, onStop, onReady, onFail, onEnded }, ref) {
  const el = useRef<HTMLVideoElement>(null);
  const started = useRef(false);
  const passed = useRef(0);
  const cb = useRef({ onIndex, onStop, onEnded, index });
  cb.current = { onIndex, onStop, onEnded, index };

  const play = () => { try { void el.current?.play()?.catch(() => {}); } catch { /* jsdom, hoặc máy chặn tự phát */ } };

  useImperativeHandle(ref, () => ({
    resume: play,
    skipAhead: () => {
      const v = el.current, st = nextStop(passed.current);
      if (!v) return;
      if (!st) { cb.current.onEnded(); return; }
      v.currentTime = Math.max(v.currentTime, st.at - 0.05);
      play();
    },
  }), []);

  useEffect(() => {
    const v0 = el.current;
    // defaultPlaybackRate giữ tốc độ khi trình duyệt nạp lại nguồn; playbackRate cho lần phát này
    if (v0) { v0.defaultPlaybackRate = 1 / VIDEO_SLOW; v0.playbackRate = 1 / VIDEO_SLOW; }
    play();
    const t = setTimeout(() => { if (!started.current) onFail(); }, VIDEO_START_MS);
    let raf = 0;
    const tick = () => {
      const v = el.current;
      if (v && !v.paused) {
        const st = nextStop(passed.current);
        if (st && v.currentTime >= st.at) { v.pause(); passed.current += 1; cb.current.onStop(st.kind); }
        const i = segmentAt(v.currentTime);
        if (i !== cb.current.index) cb.current.onIndex(i);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { clearTimeout(t); cancelAnimationFrame(raf); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <video
      ref={el} className={s.video} src={JOURNEY_VIDEO_SRC} muted playsInline preload="auto" aria-hidden="true" tabIndex={-1}
      disablePictureInPicture
      onPlaying={() => { if (!started.current) { started.current = true; onReady(); } }}
      onEnded={onEnded}
      onError={onFail}
    />
  );
});
