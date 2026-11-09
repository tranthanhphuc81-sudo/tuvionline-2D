/* Kéo chỉnh 3 đường trên khung chuẩn. Mỗi đường là vài điểm điều khiển, nét vẽ là đường cong đi qua các điểm đó. */
import { SIZE, type LineId, type Pt } from './lines';

export const COLORS: Record<LineId, string> = { tam: '#ff3b6b', tri: '#1450ff', sinh: '#a100ff', dinh: '#00c853' };
export const HANDLES = 6;
const MIN_START_PX = 120;
const IDS: LineId[] = ['tam', 'tri', 'sinh', 'dinh'];

/** `off`: đường không có trên tay này, ẩn và không kéo được. `extra`: các đoạn người dùng thêm, ví dụ phần sau chỗ đứt, mỗi đoạn là các điểm kéo được như nét chính. */
export interface EditState { lines: Record<LineId, Pt[]>; breaks: Record<LineId, Pt[]>; off: Partial<Record<LineId, boolean>>; extra: Record<LineId, Pt[][]> }

/** Vị trí gợi ý khi máy không tìm được đường nào, để người dùng vẫn có nét mà kéo. Toạ độ theo tỉ lệ khung chuẩn, cùng chiều với đường máy tìm. */
const TEMPLATE: Record<LineId, [number, number][]> = {
  tam: [[0.3, 0.2], [0.42, 0.2], [0.54, 0.21], [0.66, 0.23], [0.78, 0.24], [0.9, 0.22]],
  tri: [[0.14, 0.3], [0.25, 0.36], [0.38, 0.42], [0.5, 0.47], [0.62, 0.5], [0.72, 0.54]],
  sinh: [[0.12, 0.3], [0.2, 0.42], [0.27, 0.55], [0.33, 0.68], [0.4, 0.8], [0.45, 0.9]],
  dinh: [[0.52, 0.24], [0.52, 0.38], [0.51, 0.52], [0.5, 0.66], [0.49, 0.8], [0.48, 0.92]],
};

const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y);

/** Lấy `n` điểm cách đều theo chiều dài đường. */
export function resample(pts: Pt[], n: number): Pt[] {
  if (pts.length < 2) return [];
  const cum = [0];
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + dist(pts[i - 1], pts[i]));
  const total = cum[cum.length - 1];
  if (total < 1) return [];
  const out: Pt[] = [];
  for (let k = 0, i = 1; k < n; k++) {
    const t = (total * k) / (n - 1);
    while (i < pts.length - 1 && cum[i] < t) i++;
    const u = (t - cum[i - 1]) / Math.max(1e-6, cum[i] - cum[i - 1]);
    out.push({ x: pts[i - 1].x + u * (pts[i].x - pts[i - 1].x), y: pts[i - 1].y + u * (pts[i].y - pts[i - 1].y) });
  }
  return out;
}

export const startingHandles = (id: LineId, machine: Pt[], toView: (p: Pt) => Pt): Pt[] => {
  const r = resample(machine, HANDLES);
  // Nét máy quá ngắn thì các điểm dồn cục, ngón tay không kéo được: dùng vị trí gợi ý
  const long = machine.slice(1).reduce((sum, p, i) => sum + dist(machine[i], p), 0) >= MIN_START_PX;
  return r.length && long ? r : TEMPLATE[id].map(([x, y]) => toView({ x: x * SIZE, y: y * SIZE }));
};

/** Đường cong Catmull-Rom đi qua mọi điểm điều khiển. */
export function spline(ctrl: Pt[], perSpan = 12): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i < ctrl.length - 1; i++) {
    const p0 = ctrl[Math.max(0, i - 1)], p1 = ctrl[i], p2 = ctrl[i + 1], p3 = ctrl[Math.min(ctrl.length - 1, i + 2)];
    for (let s = 0; s < perSpan; s++) {
      const t = s / perSpan, t2 = t * t, t3 = t2 * t;
      const f = (a: number, b: number, c: number, d: number) => 0.5 * (2 * b + (c - a) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (3 * b - a - 3 * c + d) * t3);
      out.push({ x: f(p0.x, p1.x, p2.x, p3.x), y: f(p0.y, p1.y, p2.y, p3.y) });
    }
  }
  out.push(ctrl[ctrl.length - 1]);
  return out;
}

const nearest = (p: Pt, ps: Pt[]) => ps.reduce((m, q) => Math.min(m, dist(p, q)), Infinity);
const meanNearest = (a: Pt[], b: Pt[]) => a.reduce((s, p) => s + nearest(p, b), 0) / a.length;

/** Độ lệch giữa đường máy và đường đã chỉnh, pixel khung chuẩn. Tính cả hai chiều để bắt được cả đường máy quá ngắn lẫn quá dài. `null` = máy không có đường. */
export function deviation(machine: Pt[], edited: Pt[]): number | null {
  if (!machine.length || !edited.length) return null;
  return Math.max(meanNearest(machine, edited), meanNearest(edited, machine));
}

type Mode = 'break' | 'add' | 'remove';
const PER_SPAN = 12;
const MIN_HANDLES = 2;
/** Đoạn mới có 3 điểm, cách đuôi đường một khoảng để thấy rõ là đoạn riêng. */
const NEW_SEGMENT_AT = [26, 60, 94];
const MAX_UNDO = 100;

/* Bộ bám rãnh (chế độ chạm): có thì nét đi theo rãnh giữa các điểm, không có thì là đường cong qua các điểm. */
let router: ((a: Pt, b: Pt) => Pt[]) | null = null;
export function setRouter(r: ((a: Pt, b: Pt) => Pt[]) | null): void { router = r; }
/** Nét của một dãy điểm điều khiển. `quick`: đang kéo thì vẽ đường cong cho mượt, thả tay mới bám rãnh. */
export function curvePath(ctrl: Pt[], quick = false): Pt[] {
  if (ctrl.length < 2) return ctrl.slice();
  if (!router || quick) return spline(ctrl);
  return ctrl.slice(1).flatMap((b, i) => { const r = router!(ctrl[i], b); return i ? r.slice(1) : r; });
}

/** Đường hoàn chỉnh: nét kéo chỉnh và các đoạn vẽ thêm, xếp theo chiều đường. Trả cả các đoạn để biết chỗ đứt. */
export function wholeLine(state: EditState, id: LineId): { points: Pt[]; segments: Pt[][]; breaks: Pt[] } {
  const along = (p: Pt) => (id === 'sinh' || id === 'dinh' ? p.y : p.x);
  const facing = (s: Pt[]) => (along(s[0]) <= along(s[s.length - 1]) ? s : s.slice().reverse());
  const segments = [state.lines[id], ...state.extra[id]].filter((c) => c.length > 0).map((c) => curvePath(c)).map(facing).sort((a, b) => along(a[0]) - along(b[0]));
  const breaks = [...state.breaks[id]];
  for (let i = 1; i < segments.length; i++) {
    const a = segments[i - 1][segments[i - 1].length - 1], b = segments[i][0];
    const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    if (dist(a, b) >= 14 && !breaks.some((p) => dist(p, mid) < 20)) breaks.push(mid);
  }
  return { points: segments.flat(), segments, breaks };
}

export interface Guide { a: Pt; b: Pt; label: string }
export interface Mound { c: Pt; rx: number; ry: number; label: string }
export interface Editor { setHidden(v: boolean): void; setMode(m: Mode): void; redraw(): void; setGuides(v: boolean): void; setFocus(id: LineId | null): void; setHandleSize(r: number): void; setTapMode(v: boolean): void; setHints(h: Partial<Record<LineId, Pt[]>>): void; addSegment(id: LineId): void; undoSegment(): void; setMounds(v: boolean): void; undo(): boolean; setPlain(v: boolean): void; newSegment(): void }

export function mountEditor(canvas: HTMLCanvasElement, clean: HTMLCanvasElement, state: EditState, guides: Guide[], mounds: Mound[], on: { touched(): void; changed(): void }): Editor {
  const g = canvas.getContext('2d')!;
  // Nét tự do đã lưu từ bản trước: rút còn vài điểm để nắn được và mượt
  for (const id of IDS) state.extra[id] = state.extra[id].map((s) => (s.length > 7 ? resample(s, 5) : s));
  let hidden = false, showGuides = false, showMounds = true, plain = false;
  let mode: Mode | null = null;
  const shown = () => IDS.filter((id) => !state.off[id]);
  let focusId: LineId | null = null, handleR = 6, tapMode = false;
  /** Đoạn đang chạm tiếp (chế độ chạm). `null` là nét chính; bấm Đoạn mới thì chạm tiếp vào một đoạn riêng, không nối qua chỗ đứt. */
  let active: Pt[] | null = null;
  let hints: Partial<Record<LineId, Pt[]>> = {};
  /** Chỉ đường đang làm mới kéo được, để ngón tay không chạm nhầm đường khác. */
  const grabbable = () => (focusId ? [focusId] : shown());
  let drag: { id: LineId; curve: Pt[]; i: number } | null = null;
  const history: LineId[] = [];
  /* Mỗi thao tác lưu lại trạng thái trước đó của ảnh này, để Quay lại được nhiều bước. */
  const past: string[] = [];
  const snapshot = () => JSON.stringify({ lines: state.lines, breaks: state.breaks, extra: state.extra });
  const remember = (s: string) => { past.push(s); if (past.length > MAX_UNDO) past.shift(); };
  let dragStart: string | null = null;
  const curves = (id: LineId) => [state.lines[id], ...state.extra[id]];
  let pointer: Pt | null = null;

  const render = () => {
    g.setLineDash([]);
    g.globalAlpha = 1;
    g.drawImage(clean, 0, 0);
    if (plain) return;
    if (showMounds) {
      // Mờ và nét đứt để không che đường chỉ thật
      g.strokeStyle = '#fff'; g.fillStyle = '#fff'; g.lineWidth = 1; g.setLineDash([3, 5]);
      g.font = '12px system-ui, sans-serif'; g.textAlign = 'center';
      for (const m of mounds) {
        g.globalAlpha = 0.4;
        g.beginPath(); g.ellipse(m.c.x, m.c.y, m.rx, m.ry, 0, 0, Math.PI * 2); g.stroke();
        g.globalAlpha = 0.6;
        g.fillText(m.label, Math.max(30, Math.min(SIZE - 30, m.c.x)), Math.max(14, Math.min(SIZE - 6, m.c.y + 4)));
      }
      g.globalAlpha = 1; g.textAlign = 'left'; g.setLineDash([]);
    }
    if (showGuides) {
      g.strokeStyle = '#fff'; g.fillStyle = '#fff'; g.lineWidth = 1; g.setLineDash([6, 5]);
      g.font = '13px system-ui, sans-serif';
      for (const r of guides) {
        g.beginPath(); g.moveTo(r.a.x, r.a.y); g.lineTo(r.b.x, r.b.y); g.stroke();
        g.fillText(r.label, Math.max(4, Math.min(SIZE - 110, r.b.x + 4)), Math.max(14, Math.min(SIZE - 6, r.b.y - 4)));
      }
      g.setLineDash([]);
    }
    if (!hidden) for (const id of shown()) {
      g.strokeStyle = COLORS[id];
      g.lineWidth = 1.5; g.lineCap = 'round'; g.lineJoin = 'round';
      const dim = focusId !== null && focusId !== id;
      const hint = hints[id];
      if (!dim && hint && hint.length > 1 && state.lines[id].length < 2) {
        // Gợi ý của máy: nét đứt mờ, chỉ để biết đường nằm khoảng đâu
        g.globalAlpha = 0.5; g.setLineDash([5, 6]);
        g.beginPath();
        hint.forEach((p, i) => (i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y)));
        g.stroke();
        g.setLineDash([]);
      }
      for (const ctrl of curves(id)) {
        g.globalAlpha = dim ? 0.35 : 0.85;
        g.beginPath();
        curvePath(ctrl, drag?.curve === ctrl).forEach((p, i) => (i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y)));
        g.stroke();
        g.globalAlpha = 1;
        if (!dim) for (const p of ctrl) { g.beginPath(); g.arc(p.x, p.y, handleR, 0, Math.PI * 2); g.stroke(); }
      }
      // Gồm cả chỗ đứt tự nhận giữa các đoạn, để người dùng thấy máy đã hiểu là đường đứt
      for (const p of dim ? state.breaks[id] : wholeLine(state, id).breaks) { g.lineWidth = 2; g.beginPath(); g.arc(p.x, p.y, 13, 0, Math.PI * 2); g.stroke(); }
    }
    const focus = drag?.id;
    if (focus && pointer) {
      // Khung phóng to ở góc xa ngón tay, không vẽ nét để thấy đường thật ngay dưới điểm đang kéo
      const size = 170, zoom = 3, src = size / zoom;
      const x = pointer.x < SIZE / 2 ? SIZE - size - 8 : 8, y = pointer.y < SIZE / 2 ? SIZE - size - 8 : 8;
      g.drawImage(clean, pointer.x - src / 2, pointer.y - src / 2, src, src, x, y, size, size);
      g.strokeStyle = '#fff'; g.lineWidth = 2;
      g.strokeRect(x, y, size, size);
      g.strokeStyle = COLORS[focus]; g.lineWidth = 1;
      g.beginPath();
      g.moveTo(x + size / 2 - 12, y + size / 2); g.lineTo(x + size / 2 + 12, y + size / 2);
      g.moveTo(x + size / 2, y + size / 2 - 12); g.lineTo(x + size / 2, y + size / 2 + 12);
      g.stroke();
    }
  };

  const toCanon = (e: PointerEvent): { p: Pt; scale: number } => {
    const r = canvas.getBoundingClientRect(), scale = r.width / SIZE;
    return { p: { x: Math.max(0, Math.min(SIZE, (e.clientX - r.left) / scale)), y: Math.max(0, Math.min(SIZE, (e.clientY - r.top) / scale)) }, scale };
  };

  canvas.addEventListener('pointerdown', (e) => {
    if (plain) return;
    const { p, scale } = toCanon(e);
    const reach = 24 / scale; // 24 px màn hình, đủ cho vùng chạm 44 px
    if (mode) {
      const current = mode;
      mode = null;
      canvas.style.cursor = '';
      const before = snapshot();
      const edited = () => { remember(before); on.touched(); on.changed(); render(); };
      const best = grabbable().flatMap((id) => curves(id).map((ctrl) => ({ id, ctrl, d: nearest(p, spline(ctrl, PER_SPAN)) }))).sort((a, b) => a.d - b.d)[0];
      if (current === 'break') {
        for (const id of shown()) {
          const near = state.breaks[id].findIndex((b) => dist(b, p) <= reach);
          if (near >= 0) { state.breaks[id].splice(near, 1); edited(); return; }
        }
        if (best.d <= reach) { state.breaks[best.id].push(p); edited(); }
      } else if (current === 'add') {
        if (best.d > reach) return;
        // Chèn vào đúng đoạn được chạm để nét không bị gập lại
        const dense = spline(best.ctrl, PER_SPAN);
        let at = 0;
        dense.forEach((q, i) => { if (dist(q, p) < dist(dense[at], p)) at = i; });
        best.ctrl.splice(Math.min(best.ctrl.length - 1, Math.floor(at / PER_SPAN) + 1), 0, p);
        edited();
      } else {
        // Lấy điểm gần nhất, vì đầu đoạn thêm nằm sát đuôi nét chính
        const hit = grabbable().flatMap((id) => curves(id).flatMap((ctrl) => ctrl.map((q, i) => ({ id, ctrl, i, d: dist(q, p) })))).sort((a, b) => a.d - b.d)[0];
        if (!hit || hit.d > reach) return;
        if (hit.ctrl.length > MIN_HANDLES) hit.ctrl.splice(hit.i, 1);
        else {
          // Đoạn thêm chỉ còn 2 điểm thì bỏ cả đoạn; nét chính thì giữ lại
          const at = state.extra[hit.id].indexOf(hit.ctrl);
          if (at < 0) return;
          state.extra[hit.id].splice(at, 1);
        }
        edited();
      }
      return;
    }
    let found: { id: LineId; curve: Pt[]; i: number; d: number } | null = null;
    for (const id of grabbable()) for (const curve of curves(id)) curve.forEach((q, i) => {
      const d = dist(p, q);
      if (d <= reach && (!found || d < found.d)) found = { id, curve, i, d };
    });
    if (!found && tapMode && focusId) {
      // Chạm chỗ trống: thêm điểm. Gần nét thì chèn vào giữa, xa thì nối vào đầu gần hơn.
      const before = snapshot();
      const ctrl = active && state.extra[focusId].includes(active) ? active : state.lines[focusId];
      if (ctrl.length < 2) ctrl.push(p);
      else {
        // Đoạn nào gần chỗ chạm nhất thì chèn vào đoạn đó; chạm gần hai đầu đường thì nối dài
        let best = { k: 0, d: Infinity, end: false };
        for (let k = 0; k + 1 < ctrl.length; k++) {
          const seg = curvePath([ctrl[k], ctrl[k + 1]]);
          seg.forEach((q, qi) => {
            const d = dist(q, p);
            if (d < best.d) best = { k, d, end: (k === 0 && qi === 0) || (k === ctrl.length - 2 && qi === seg.length - 1) };
          });
        }
        if (best.d <= reach * 2 && !best.end) ctrl.splice(best.k + 1, 0, p);
        else if (dist(p, ctrl[0]) < dist(p, ctrl[ctrl.length - 1])) ctrl.unshift(p);
        else ctrl.push(p);
      }
      remember(before);
      on.touched();
      on.changed();
      render();
      return;
    }
    if (!found) return;
    dragStart = snapshot();
    drag = found;
    pointer = p;
    canvas.setPointerCapture(e.pointerId);
    on.touched();
    e.preventDefault();
    render();
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const { p } = toCanon(e);
    drag.curve[drag.i] = p;
    pointer = p;
    render();
  });
  const finish = () => {
    if (!drag) return;
    drag = null;
    pointer = null;
    if (dragStart && dragStart !== snapshot()) remember(dragStart);
    dragStart = null;
    render();
    on.changed();
  };
  canvas.addEventListener('pointerup', finish);
  canvas.addEventListener('pointercancel', finish);
  render();
  return {
    setHidden(v) { hidden = v; render(); },
    redraw: render,
    setGuides(v) { showGuides = v; render(); },
    setMounds(v) { showMounds = v; render(); },
    setFocus(id) { focusId = id; active = null; render(); },
    setHandleSize(r) { handleR = r; render(); },
    setTapMode(v) { tapMode = v; },
    setHints(h) { hints = h; render(); },
    setPlain(v) { plain = v; render(); },
    addSegment(id) {
      // Đặt nối tiếp đuôi đường theo hướng đang đi; hết chỗ thì đặt phía đầu đường
      remember(snapshot());
      const segs = wholeLine(state, id).segments;
      const inside = (p: Pt) => p.x >= 8 && p.y >= 8 && p.x <= SIZE - 8 && p.y <= SIZE - 8;
      const from = (a: Pt, b: Pt) => {
        const d = Math.max(1, dist(a, b)), ux = (b.x - a.x) / d, uy = (b.y - a.y) / d;
        return NEW_SEGMENT_AT.map((k) => ({ x: b.x + ux * k, y: b.y + uy * k }));
      };
      const tail = segs[segs.length - 1], head = segs[0];
      const ahead = from(tail[Math.max(0, tail.length - 8)], tail[tail.length - 1]);
      const seg = ahead.every(inside) ? ahead : from(head[Math.min(head.length - 1, 7)], head[0]).reverse();
      state.extra[id].push(seg.map((p) => ({ x: Math.max(8, Math.min(SIZE - 8, p.x)), y: Math.max(8, Math.min(SIZE - 8, p.y)) })));
      history.push(id);
      on.touched();
      on.changed();
      render();
    },
    undoSegment() {
      const id = history.pop() ?? IDS.find((x) => state.extra[x].length);
      if (!id) return;
      remember(snapshot());
      state.extra[id].pop();
      on.changed();
      render();
    },
    undo() {
      const last = past.pop();
      if (!last) return false;
      const was = JSON.parse(last) as Pick<EditState, 'lines' | 'breaks' | 'extra'>;
      state.lines = was.lines; state.breaks = was.breaks; state.extra = was.extra;
      active = null;
      on.changed();
      render();
      return true;
    },
    setMode(m) { mode = m; canvas.style.cursor = 'crosshair'; },
    newSegment() {
      if (!focusId) return;
      // Đoạn đang làm dở còn trống thì dùng lại, không tạo đoạn rỗng chồng lên nhau
      if (active && active.length === 0 && state.extra[focusId].includes(active)) return;
      remember(snapshot());
      active = [];
      state.extra[focusId].push(active);
      render();
    },
  };
}
