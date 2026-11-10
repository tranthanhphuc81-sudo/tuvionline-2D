/* Bước chạm đường: chạm đầu, cuối (và vài điểm giữa) của từng đường, máy bám theo rãnh giữa các điểm.
   Chép từ trang thử trên điện thoại (spike/chitay/phone.ts), đã đo 39–68 giây mỗi bàn tay trên Galaxy S25 Ultra. */
import { useEffect, useRef, useState } from 'react';
import type { PalmPt } from '../../core';
import { PALM_LEAVE_TEXT, PALM_LEAVE_TITLE, PALM_LINE_STEPS, PALM_TRACE_CUT_FIRST, PALM_TRACE_CUT_HINT, PALM_TRACE_NEED_POINTS } from '../../content/palm/ui';
import { useBackHandler } from '../../app/hooks';
import { Sheet } from '../../ui/components/Sheet';
import type { PalmLineKey } from '../../state/schema';
import ui from '../../ui/components/ui.module.css';
import { mountEditor, setRouter, wholeLine, type EditState, type Editor } from './vision/editor';
import { makeRouter } from './vision/livewire';
import type { PreparedPhoto } from './vision/photo';
import { SIZE, type LineId } from './vision/types';
import s from './palm.module.css';

const IDS: LineId[] = ['tam', 'tri', 'sinh', 'dinh'];

export interface TraceResult {
  lines: Partial<Record<PalmLineKey, PalmPt[][]>>;
  /** số chỗ đứt của mỗi đường */
  breaks: Partial<Record<PalmLineKey, number>>;
}

function freshState(): EditState {
  const st: EditState = { lines: {} as EditState['lines'], breaks: {} as EditState['breaks'], extra: {} as EditState['extra'], off: {} };
  for (const id of IDS) { st.lines[id] = []; st.breaks[id] = []; st.extra[id] = []; }
  return st;
}

export function TraceStep({ photo, active, onDone, onExit }: { photo: PreparedPhoto; active: boolean; onDone(r: TraceResult): void; onExit(): void }) {
  const holder = useRef<HTMLDivElement>(null);
  const state = useRef<EditState>(freshState());
  const editor = useRef<Editor | null>(null);
  const touched = useRef(false);
  const [step, setStep] = useState(0);
  const [hint, setHint] = useState<string>(PALM_LINE_STEPS[0].hint);
  const [leave, setLeave] = useState(false);
  const cur = PALM_LINE_STEPS[step];

  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = SIZE;
    canvas.setAttribute('aria-label', 'Lòng bàn tay, chạm vào đầu và cuối đường để máy vẽ theo');
    holder.current?.appendChild(canvas);
    state.current = freshState();
    setRouter(makeRouter(photo.ridge));
    const ed = mountEditor(canvas, photo.view, state.current, [], [], { touched() { touched.current = true; }, changed() { touched.current = true; } });
    ed.setMounds(false);
    ed.setHandleSize(11);
    ed.setTapMode(true);
    ed.setFocus(PALM_LINE_STEPS[0].id);
    editor.current = ed;
    return () => { editor.current = null; setRouter(null); canvas.remove(); };
  }, [photo]);

  useEffect(() => {
    state.current.off[cur.id] = false;
    editor.current?.setFocus(cur.id);
    setHint(cur.hint);
  }, [cur]);

  const collect = (): TraceResult => {
    const out: TraceResult = { lines: {}, breaks: {} };
    for (const l of PALM_LINE_STEPS) {
      if (state.current.off[l.id]) continue;
      const segs = wholeLine(state.current, l.id).segments.filter((x) => x.length > 1);
      if (!segs.length) continue;
      out.lines[l.id] = segs.map((seg) => seg.map((p) => ({ x: p.x / SIZE, y: p.y / SIZE })));
      out.breaks[l.id] = segs.length - 1;
    }
    return out;
  };
  const advance = () => { if (step === PALM_LINE_STEPS.length - 1) onDone(collect()); else setStep(step + 1); };
  const goBack = (): boolean => {
    if (step > 0) { setStep(step - 1); return true; }
    if (touched.current) setLeave(true); else onExit();
    return true;
  };
  useBackHandler(() => (leave ? (setLeave(false), true) : goBack()), active);

  const ok = () => {
    if (state.current.lines[cur.id].length < 2) { setHint(PALM_TRACE_NEED_POINTS); return; }
    advance();
  };
  const none = () => { state.current.off[cur.id] = true; advance(); };
  const clear = () => { state.current.lines[cur.id].length = 0; state.current.extra[cur.id].length = 0; editor.current?.setFocus(cur.id); };
  const cut = () => {
    if (state.current.lines[cur.id].length < 2) { setHint(PALM_TRACE_CUT_FIRST); return; }
    editor.current?.newSegment();
    setHint(PALM_TRACE_CUT_HINT);
  };
  const plain = (v: boolean) => editor.current?.setPlain(v);

  return (
    <div className={s.trace}>
      <div className={s.traceHead}>
        <h2 className={s.traceTitle}>{step + 1}/{PALM_LINE_STEPS.length}. {cur.title}</h2>
        <p className={s.traceHint} role="status">{hint}</p>
      </div>
      <div className={s.stage}><div ref={holder} className={s.canvasHolder} /></div>
      <div className={s.tools}>
        <button type="button" className={ui.btn} aria-label="Quay lại thao tác trước" onClick={() => editor.current?.undo()}>↶ Lùi</button>
        <button
          type="button" className={ui.btn} onPointerDown={(e) => { e.preventDefault(); plain(true); }} onPointerUp={() => plain(false)}
          onPointerCancel={() => plain(false)} onPointerLeave={() => plain(false)} onContextMenu={(e) => e.preventDefault()}
        >Giữ xem gốc</button>
        <button type="button" className={ui.btn} onClick={clear}>Xoá đường</button>
        <button type="button" className={ui.btn} onClick={cut}>Đoạn mới</button>
      </div>
      <div className={s.nav}>
        <button type="button" className={ui.btn} onClick={goBack}>‹ Trước</button>
        <button type="button" className={`${ui.btn} ${ui.primary} ${s.grow}`} onClick={ok}>
          {step === PALM_LINE_STEPS.length - 1 ? 'Xong, đo tay ›' : 'Đường này đúng ›'}
        </button>
      </div>
      {'none' in cur && <button type="button" className={`${ui.btn} ${ui.ghost} ${ui.block}`} onClick={none}>{cur.none}</button>}
      <Sheet open={leave} title={PALM_LEAVE_TITLE} onClose={() => setLeave(false)}>
        <p>{PALM_LEAVE_TEXT}</p>
        <div className={s.nav}>
          <button type="button" className={ui.btn} onClick={() => setLeave(false)}>Ở lại</button>
          <button type="button" className={`${ui.btn} ${ui.danger}`} onClick={() => { setLeave(false); onExit(); }}>Bỏ ảnh</button>
        </div>
      </Sheet>
    </div>
  );
}
