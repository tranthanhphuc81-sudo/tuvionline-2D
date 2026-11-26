/* Hành trình vào đạo quán, phủ lên app khi mở (ARCHITECTURE.md mục 12.1–12.3). Ảnh sinh từ scripts/build-journey-art.mjs, tiếng tổng hợp giữ chỗ, nhân vật Lottie giữ chỗ. */
import { useEffect, useMemo, useRef, useState, type PointerEvent } from 'react';
import { createAmbientPlayer, type AmbientPlayer } from '../../platform/ambientAudio';
import { backStack } from '../../platform/back';
import { soundAllowed } from '../../platform/device';
import { onPause, onResume } from '../../platform/lifecycle';
import { getAmbience } from './ambience';
import { skipJourney, startJourney, stepJourney, type EntryPlan } from './plan';
import { SceneView } from './SceneEngine';
import { SCENES, preloadScene } from './scenes';
import { IncenseControl } from './incense';
import { BellButton } from './BellButton';
import { JourneyVideo, STOP_WAIT_MS, type JourneyVideoHandle, type StopKind } from './video';
import { Character } from '../reader/Character';
import { DONG_LINES, ENTRY_STOP_LINES, fill, pick } from '../../content/reader/templates';
import { useReader } from '../reader/hooks';
import s from './journey.module.css';

const FADE_MS = 400;
/** Có video thì mờ dần chậm vào app: cắt ngang từ cảnh quay sang phòng vẽ nhìn gắt (chủ dự án, 13/11/2026). */
const VIDEO_FADE_MS = 1200;
const SWIPE_PX = 40;
const COUNT = SCENES.length;

export function Journey({ plan, sound = false, onDone }: { plan: Exclude<EntryPlan, 'none'>; sound?: boolean; onDone(): void }) {
  const { persona } = useReader();
  const [st, setSt] = useState(() => startJourney(plan, COUNT));
  const startY = useRef<number | null>(null);
  const audio = useRef<AmbientPlayer | null>(null);
  const ambience = useMemo(() => getAmbience(new Date()), []);
  const scene = SCENES[st.index];
  const sceneRef = useRef(scene);
  sceneRef.current = scene;
  const animate = plan !== 'fade';
  const durationMs = plan === 'full' ? scene.durationMs.full : scene.durationMs.short;
  /** loading: đang chờ video phát (chưa hẹn giờ trạm); on: video dẫn hành trình; off: tranh vẽ và hẹn giờ như cũ. */
  const [video, setVideo] = useState<'loading' | 'on' | 'off'>(plan === 'full' ? 'loading' : 'off');
  const videoOn = video === 'on';
  /** Chỗ dừng của video đang chờ người dùng (cổng, cửa chính điện, án thư), null = video đang chạy. */
  const [stop, setStop] = useState<StopKind | null>(null);
  const vref = useRef<JourneyVideoHandle>(null);
  const resume = () => { setStop(null); vref.current?.resume(); };
  const later = (ms: number) => { setTimeout(resume, ms); };
  // Dừng mà không ai làm gì thì sau một lúc tự đi tiếp (không chặn ai, 12.1)
  useEffect(() => {
    if (!stop) return;
    const t = setTimeout(resume, STOP_WAIT_MS);
    return () => clearTimeout(t);
  }, [stop]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => backStack.register(() => { setSt((x) => skipJourney(x, COUNT)); return true; }), []);
  useEffect(() => { preloadScene(SCENES[st.index + 1]); }, [st.index]);
  useEffect(() => {
    if (st.done || video === 'on') return; // video đang phát thì video dẫn nhịp; đang chờ video vẫn hẹn giờ phòng khi video không lên
    const t = setTimeout(() => setSt((x) => stepJourney(x, COUNT)), plan === 'fade' ? FADE_MS : durationMs);
    return () => clearTimeout(t);
  }, [st, plan, durationMs, video]);
  useEffect(() => {
    if (!st.done) return;
    const t = setTimeout(onDone, videoOn ? VIDEO_FADE_MS : FADE_MS);
    return () => clearTimeout(t);
  }, [st.done, onDone, videoOn]);

  // Chỉ bản đầy đủ mới có tiếng: rút gọn quá ngắn, tiếng bật lên rồi tắt ngay chỉ gây khó chịu.
  useEffect(() => {
    if (!sound || plan !== 'full') return;
    let dead = false;
    void soundAllowed().then((ok) => {
      if (dead || !ok) return;
      audio.current = createAmbientPlayer();
      audio.current?.mix(sceneRef.current.ambience); // quyền đọc chế độ chuông trả về trễ, trạm có thể đã đổi
    });
    const offPause = onPause(() => audio.current?.suspend());
    const offResume = onResume(() => audio.current?.resume());
    return () => { dead = true; offPause(); offResume(); audio.current?.stop(); audio.current = null; };
  }, [sound, plan]);
  useEffect(() => {
    audio.current?.mix(scene.ambience);
    if (scene.bell) audio.current?.bell();
  }, [scene]);

  const step = () => setSt((x) => stepJourney(x, COUNT));
  const onUp = (e: PointerEvent) => {
    const dy = startY.current === null ? 0 : e.clientY - startY.current;
    startY.current = null;
    if (!(Math.abs(dy) < SWIPE_PX || dy < 0)) return;
    // Có video: đang dừng thì chạm là đi tiếp; đang chạy thì tua tới chỗ dừng kế tiếp
    if (videoOn) { if (stop) resume(); else vref.current?.skipAhead(); return; }
    step();
  };

  return (
    <div className={s.journey} data-done={st.done} data-video={videoOn} role="dialog" aria-label="Lối vào đạo quán" onPointerDown={(e) => { startY.current = e.clientY; audio.current?.unlock(); }} onPointerUp={onUp}>
      {video !== 'off' && (
        <JourneyVideo
          ref={vref} onStop={setStop}
          index={st.index} onIndex={(i) => setSt((x) => (x.done ? x : { index: i, done: false }))}
          onReady={() => setVideo('on')} onFail={() => setVideo('off')} onEnded={() => setSt((x) => skipJourney(x, COUNT))}
        />
      )}
      {/* Có video thì thôi vẽ tranh, hạt lá, khói và đạo đồng: lớp vẽ bằng code chồng lên cảnh quay nhìn gượng. */}
      <SceneView key={scene.id} scene={scene} ambience={ambience} durationMs={durationMs} animate={animate && !videoOn} hideLayers={videoOn} />
      <button type="button" className={s.skip} onPointerUp={(e) => e.stopPropagation()} onClick={() => setSt((x) => skipJourney(x, COUNT))}>Bỏ qua</button>
      {plan === 'full' && !videoOn && (scene.id === 'gate' || scene.id === 'corridor') && <Character name="daodong" state={scene.id === 'gate' ? 'nod' : 'point'} className={s.dong} />}
      {plan === 'full' && !videoOn && (scene.id === 'gate' || scene.id === 'corridor') && <p className={s.speech}>{fill(pick(DONG_LINES[scene.id], new Date().getDate()), { ta: persona.ta })}</p>}
      <div className={s.foot} onPointerUp={(e) => e.stopPropagation()}>
        {videoOn && stop === 'gate' && (<>
          <p className={s.caption}>{fill(pick(DONG_LINES.gate, new Date().getDate()), { ta: persona.ta })}</p>
          <button type="button" className={s.action} onClick={resume}>Bước vào cổng</button>
        </>)}
        {videoOn && stop === 'door' && (<>
          <p className={s.caption}>{fill(pick(ENTRY_STOP_LINES.door, new Date().getDate()), { ta: persona.ta })}</p>
          <BellButton className={s.bellBig} onRing={() => { audio.current?.bell(); later(1200); return true; /* tắt âm thanh lối vào hay máy im lặng thì chỉ rung */ }} />
          <button type="button" className={s.action} onClick={resume}>Vào</button>
        </>)}
        {videoOn && stop === 'table' && (<>
          <p className={s.caption}>{fill(pick(ENTRY_STOP_LINES.table, new Date().getDate()), { ta: persona.ta })}</p>
          <IncenseControl onLit={() => later(1500)} />
          <button type="button" className={s.action} onClick={resume}>Ngồi xuống</button>
        </>)}
        {!videoOn && scene.interaction === 'incense' && plan === 'full' && <BellButton className={s.bell} onRing={() => { audio.current?.bell(); return true; /* tắt âm thanh lối vào hay máy im lặng thì chỉ rung */ }} />}
        {!videoOn && scene.interaction === 'incense' && plan === 'full' && <IncenseControl />}
        {!videoOn && scene.interaction === 'incense' && <button type="button" className={s.action} onClick={step}>Đi tiếp</button>}
        {!videoOn && scene.interaction === 'invite' && <button type="button" className={s.action} onClick={step}>Vào tĩnh thất</button>}
        {!videoOn && st.index === 0 && plan === 'full' && <p className={s.hint}>Vuốt lên hoặc chạm để bước tới</p>}
      </div>
    </div>
  );
}
