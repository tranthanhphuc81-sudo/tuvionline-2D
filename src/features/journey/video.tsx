/* Nền video cho lối vào (ARCHITECTURE 12.12, 13/11/2026). Video do chủ dự án tạo: một người đi qua cổng, vườn, chính điện,
   hành lang rồi ngồi vào tĩnh thất, 20 giây, chia 5 đoạn 4 giây khớp 5 trạm. Mỗi trạm phát đoạn của mình rồi dừng ở khung
   cuối, chờ người dùng hoặc hẹn giờ sang trạm sau, nên thắp hương, "Đi tiếp", lời đạo đồng giữ nguyên.
   Chỉ dùng cho bản đầy đủ: bản rút gọn mỗi trạm 0,5 giây, giảm chuyển động chỉ mờ dần, nên giữ tranh vẽ. Video lỗi hoặc
   chưa phát được thì tranh vẽ vẫn ở dưới, không ai bị chặn lại. Video luôn tắt tiếng: tiếng nền vẫn do ambientAudio. */
import { useEffect, useRef, useState } from 'react';
import src from '../../assets/journey/video/loi-vao.mp4';
import s from './journey.module.css';

export const JOURNEY_VIDEO_SRC: string = src;

/** Đoạn [bắt đầu, kết thúc] (giây) của từng trạm trong video. */
export const VIDEO_SEGMENTS: Readonly<Record<string, readonly [number, number]>> = {
  gate: [0, 4], garden: [4, 8], hall: [8, 12], corridor: [12, 16], study: [16, 20],
};

/** Việc cần làm với video khi đang ở `t` giây trong trạm có đoạn `seg`: tua về đầu đoạn, phát tiếp, hay dừng ở khung cuối. */
export function videoAction(t: number, seg: readonly [number, number]): 'seek' | 'play' | 'hold' {
  const [a, b] = seg;
  if (t < a - 0.25 || t > b + 0.25) return 'seek';
  return t >= b - 0.05 ? 'hold' : 'play';
}

/** Lớp video nằm dưới trạm. `onReady(true)` khi đã phát được khung đầu, để trạm thôi vẽ lớp tranh. */
export function JourneyVideo({ sceneId, onReady }: { sceneId: string; onReady(ready: boolean): void }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);
  const seg = VIDEO_SEGMENTS[sceneId];

  useEffect(() => {
    const v = ref.current;
    if (!v || !seg) return;
    const play = () => { try { void v.play()?.catch(() => {}); } catch { /* jsdom và máy chặn tự phát */ } };
    if (videoAction(v.currentTime, seg) === 'seek') v.currentTime = seg[0];
    play();
    const check = () => { if (videoAction(v.currentTime, seg) === 'hold') v.pause(); };
    v.addEventListener('timeupdate', check);
    return () => v.removeEventListener('timeupdate', check);
  }, [seg]);

  if (failed || !seg) return null;
  return (
    <video
      ref={ref} className={s.video} src={JOURNEY_VIDEO_SRC} muted playsInline preload="auto" aria-hidden="true" tabIndex={-1}
      disablePictureInPicture onPlaying={() => onReady(true)} onError={() => { setFailed(true); onReady(false); }}
    />
  );
}
