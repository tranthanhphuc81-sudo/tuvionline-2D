/* Thử trên điện thoại: một ảnh, chạm vài điểm trên từng đường để máy bám theo rãnh, đo thời gian. Ảnh không rời máy và không được lưu. */
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { classify } from './classify';
import { deviation, mountEditor, setRouter, wholeLine, type EditState, type Editor } from './editor';
import { makeRouter, viewRidge } from './livewire';
import { SIZE, analyze, type Analysis, type LineId, type Pt } from './lines';
import { INDEX, PINKY, WRIST, affine, apply, invert, loadBitmap, palmMask, viewMatrix } from './pipeline';

const $ = (id: string) => document.getElementById(id)!;
const STEPS: { id: LineId; title: string; hint: string; none?: string }[] = [
  { id: 'sinh', title: 'Sinh đạo', hint: 'Đường vòng quanh gò ngón cái xuống cổ tay. Chạm vào đầu đường, cuối đường, rồi chạm thêm 1–2 điểm ở chỗ cong nhất.' },
  { id: 'tri', title: 'Trí đạo', hint: 'Đường đi ngang lòng bàn tay, bắt đầu gần Sinh đạo. Chạm đầu rồi chạm cuối đường.', none: 'Không thấy đường' },
  { id: 'tam', title: 'Tâm đạo', hint: 'Đường trên cùng, từ mép dưới ngón út về phía ngón trỏ. Chạm đầu rồi chạm cuối đường.' },
  { id: 'dinh', title: 'Định mạng', hint: 'Đường dọc giữa bàn tay, từ cổ tay lên ngón giữa. Có người không có.', none: 'Không có đường này' },
];
const LOG_KEY = 'chitay-phone-log';
/* Chưa tìm được thẻ mô hình để xác nhận giấy phép, nên bản đăng không phân phối lại file này mà tải trực tiếp từ Google. Chỉ tải mô hình, không gửi ảnh. */
const MODEL_URL = import.meta.env.DEV ? '/mp/hand_landmarker.task' : 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task';
const NAMES = ['Sinh đạo', 'Trí đạo', 'Tâm đạo', 'Định mạng'];

interface Run { at: string; modelMs: number; detectMs: number; size: string; seconds: number; firstTouch: number; steps: number[]; moves: number; dev: (number | null)[]; labels: string[] }

function logHtml(): string {
  let rows: Run[] = [];
  try { rows = JSON.parse(localStorage.getItem(LOG_KEY) ?? '[]'); } catch { rows = []; }
  if (!rows.length) return '';
  const body = rows.slice(-10).map((r, i) => `<tr><td>Lần ${i + 1}: ${r.detectMs} ms, ${r.moves} lần kéo</td><td>${r.seconds} giây</td></tr>`).join('');
  return `<p class="muted" style="margin-top:14px">Các lần đã thử trên máy này:</p><table>${body}</table>`;
}

async function start(): Promise<void> {
  const t0 = performance.now();
  const vision = await FilesetResolver.forVisionTasks(new URL('mp', document.baseURI).pathname.replace(/\/$/, ''));
  const hands = await HandLandmarker.createFromOptions(vision, {
    baseOptions: { modelAssetPath: MODEL_URL, delegate: 'CPU' },
    runningMode: 'IMAGE', numHands: 1,
  });
  const modelMs = Math.round(performance.now() - t0);
  $('status').textContent = `Sẵn sàng (nạp mô hình ${(modelMs / 1000).toFixed(1)} giây).`;
  $('log').innerHTML = logHtml();

  const open = async (file: File) => {
    $('status').textContent = 'Đang xử lý ảnh…';
    const bmp = await loadBitmap(file);
    const tDetect = performance.now();
    const lm = hands.detect(bmp).landmarks[0];
    if (!lm) { $('status').textContent = 'Không thấy bàn tay. Bạn chụp lại, thấy rõ cả lòng bàn tay và các ngón nhé.'; bmp.close(); return; }
    const px = (i: number): Pt => ({ x: lm[i].x * bmp.width, y: lm[i].y * bmp.height });
    const scaled = (p: Pt) => ({ x: p.x * SIZE, y: p.y * SIZE });
    const m = affine([px(0), px(5), px(17)], [WRIST, INDEX, PINKY].map(scaled));
    const work = document.createElement('canvas');
    work.width = work.height = SIZE;
    const ctx = work.getContext('2d', { willReadFrequently: true })!;
    ctx.setTransform(m.a, m.b, m.c, m.d, m.e, m.f);
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(bmp, 0, 0);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const outline = [0, 1, 2, 5, 9, 13, 17].map((i) => apply(m, px(i)));
    const a = analyze(ctx.getImageData(0, 0, SIZE, SIZE), palmMask(ctx, outline));
    const detectMs = Math.round(performance.now() - tDetect);

    // Khung lớn hơn trang chấm: lòng bàn tay chiếm gần hết màn hình cho dễ kéo bằng ngón tay
    const vm = viewMatrix(px(0), px(9), px(5), px(17), 0.99, 0.14);
    const back = invert(m);
    const toView = (p: Pt) => apply(vm, apply(back, p));
    const viewLm = lm.map((_, i) => apply(vm, px(i)));
    const clean = document.createElement('canvas');
    clean.width = clean.height = SIZE;
    const pen = clean.getContext('2d')!;
    pen.fillStyle = '#26221d';
    pen.fillRect(0, 0, SIZE, SIZE);
    pen.setTransform(vm.a, vm.b, vm.c, vm.d, vm.e, vm.f);
    pen.imageSmoothingQuality = 'high';
    pen.drawImage(bmp, 0, 0);
    pen.setTransform(1, 0, 0, 1, 0, 0);
    const size = `${bmp.width}x${bmp.height}`;
    bmp.close();
    begin(a, clean, toView, viewLm, { modelMs, detectMs, size });
  };

  const pick = (id: string) => {
    const input = $(id) as HTMLInputElement;
    input.onchange = async () => {
      const f = input.files?.[0];
      input.value = '';
      if (f) await open(f).catch((e) => { $('status').textContent = `Lỗi: ${String(e)}`; });
    };
  };
  pick('camera');
  pick('library');
  $('again').onclick = () => { $('done').hidden = true; $('start').hidden = false; $('log').innerHTML = logHtml(); $('status').textContent = 'Sẵn sàng.'; };
}

function begin(a: Analysis, clean: HTMLCanvasElement, toView: (p: Pt) => Pt, viewLm: Pt[], info: { modelMs: number; detectMs: number; size: string }): void {
  const machine = Object.fromEntries(a.lines.map((l) => [l.id, l.points.map(toView)])) as Record<LineId, Pt[]>;
  const state: EditState = { lines: {} as EditState['lines'], breaks: {} as EditState['breaks'], extra: {} as EditState['extra'], off: {} };
  // Bắt đầu trống: người dùng chạm điểm, nét máy dò chỉ hiện mờ làm gợi ý
  for (const l of a.lines) {
    state.lines[l.id] = [];
    state.breaks[l.id] = [];
    state.extra[l.id] = [];
  }
  setRouter(makeRouter(viewRidge(clean)));

  // Thay canvas để bỏ các bộ lắng nghe của ảnh trước
  const old = $('canvas') as HTMLCanvasElement;
  const canvas = old.cloneNode() as HTMLCanvasElement;
  old.replaceWith(canvas);

  const t0 = performance.now();
  let firstTouch = 0, moves = 0, step = 0, stepAt = t0;
  const stepMs = [0, 0, 0, 0];
  const editor: Editor = mountEditor(canvas, clean, state, [], [], {
    touched() { if (!firstTouch) firstTouch = performance.now() - t0; },
    changed() { moves++; },
  });
  editor.setMounds(false);
  editor.setHandleSize(11);
  editor.setTapMode(true);
  editor.setHints(machine);

  const show = () => {
    const s = STEPS[step];
    $('title').textContent = `${step + 1}/${STEPS.length}. ${s.title}`;
    $('hint').textContent = s.hint;
    state.off[s.id] = false;
    editor.setFocus(s.id);
    ($('back') as HTMLButtonElement).disabled = step === 0;
    const none = $('none') as HTMLButtonElement;
    none.hidden = !s.none;
    none.textContent = s.none ?? '';
  };
  const leave = () => { stepMs[step] += performance.now() - stepAt; stepAt = performance.now(); };
  const finish = () => {
    leave();
    const seconds = Math.round((performance.now() - t0) / 1000);
    const edited: Analysis = { ...a, sure: true, lines: a.lines.map((l) => (state.off[l.id] ? { ...l, points: [], segments: [], breaks: [], sure: false } : { ...l, ...wholeLine(state, l.id), sure: true })) };
    const labels = classify(viewLm, edited).filter((p) => p.id && ['Q17', 'Q20', 'Q21-huong', 'Q21-dai', 'Q23', 'Q25'].includes(p.q)).map((p) => p.label);
    const order: LineId[] = ['sinh', 'tri', 'tam', 'dinh'];
    const dev = order.map((id) => { if (state.off[id]) return null; const d = deviation(machine[id], wholeLine(state, id).points); return d === null ? null : Math.round(d); });
    const run: Run = { at: new Date().toISOString(), modelMs: info.modelMs, detectMs: info.detectMs, size: info.size, seconds, firstTouch: Math.round(firstTouch / 1000), steps: stepMs.map((x) => Math.round(x / 1000)), moves, dev, labels };
    try {
      const rows = JSON.parse(localStorage.getItem(LOG_KEY) ?? '[]') as Run[];
      rows.push(run);
      localStorage.setItem(LOG_KEY, JSON.stringify(rows));
    } catch { /* không lưu được thì vẫn hiện kết quả */ }
    $('edit').hidden = true;
    $('done').hidden = false;
    $('total').textContent = `${seconds} giây`;
    const row = (k: string, v: string) => `<tr><td>${k}</td><td>${v}</td></tr>`;
    $('result').innerHTML = [
      ...NAMES.map((n, i) => row(n, `${run.steps[i]} giây, lệch ${run.dev[i] ?? 'không có'}`)),
      row('Số lần kéo', String(moves)), row('Máy xử lý ảnh', `${info.detectMs} ms`), row('Nạp mô hình', `${(info.modelMs / 1000).toFixed(1)} giây`), row('Cỡ ảnh', info.size),
      ...labels.map((l) => row(l, '')),
    ].join('');
    $('log2').innerHTML = logHtml();
  };

  $('ok').onclick = () => {
    if (state.lines[STEPS[step].id].length < 2) { $('hint').textContent = 'Chạm vào đầu đường và cuối đường trước đã. Không có đường này thì bấm nút bên cạnh.'; return; }
    leave(); if (step === STEPS.length - 1) finish(); else { step++; show(); }
  };
  $('back').onclick = () => { if (step) { leave(); step--; show(); } };
  $('none').onclick = () => { state.off[STEPS[step].id] = true; leave(); if (step === STEPS.length - 1) finish(); else { step++; show(); } };
  $('undo').onclick = () => { editor.undo(); };
  $('point').onclick = () => { state.lines[STEPS[step].id].length = 0; state.extra[STEPS[step].id].length = 0; moves++; editor.setFocus(STEPS[step].id); };
  $('cut').onclick = () => {
    if (state.lines[STEPS[step].id].length < 2) { $('hint').textContent = 'Chạm đầu và cuối đoạn đầu tiên trước, rồi mới bấm Đoạn mới.'; return; }
    editor.newSegment();
    $('hint').textContent = 'Chạm đầu rồi cuối đoạn tiếp theo. Hai đoạn cách nhau thì máy tự ghi nhận chỗ đứt.';
  };
  const plain = $('plain');
  plain.onpointerdown = (e) => { e.preventDefault(); editor.setPlain(true); };
  plain.onpointerup = plain.onpointercancel = plain.onpointerleave = () => editor.setPlain(false);
  plain.oncontextmenu = (e) => e.preventDefault();

  $('start').hidden = true;
  $('edit').hidden = false;
  show();
}

start().catch((e) => { $('status').textContent = `Không nạp được mô hình: ${String(e)}`; });
