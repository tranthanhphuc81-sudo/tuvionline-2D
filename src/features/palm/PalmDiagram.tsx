/* Sơ đồ bàn tay kiểu tranh sách cổ: tờ giấy dó, tranh bàn tay vẽ bút mực (src/assets/palm/palm-hand.webp), tên gò ngoài lề,
   và các đường chỉ người dùng đã chạm. Nét chạm được đặt lên tranh theo tỉ lệ bàn tay thật qua ba mốc cổ tay, gốc ngón trỏ,
   gốc ngón út. Không dùng ảnh chụp. Tay trái được lật để nhìn như đang xem lòng bàn tay mình. */
import type { PalmPt } from '../../core';
import { PALM_LINE_NAME } from '../../content/palm/ui';
import type { PalmLineKey, PalmSession } from '../../state/schema';
import handArt from '../../assets/palm/palm-hand.webp';
import { affine, apply } from './vision/pipeline';
import s from './palm.module.css';

/** Màu mực trên giấy: son, chàm, tím than, lục. Giấy luôn sáng nên dùng chung cho chế độ sáng và tối. */
export const PALM_LINE_COLOR: Record<PalmLineKey, string> = { tam: '#b3261e', tri: '#1f4e8c', sinh: '#6b3fa0', dinh: '#2e7d4f' };
const INK = '#4e3220';
const K = 512;

type P = PalmPt;
const len = (a: P, b: P) => Math.hypot(a.x - b.x, a.y - b.y);
const f = (p: P) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`;

/* ===== Tranh bàn tay: số đo lấy trên chính file ảnh (687 × 1024 px, tay phải, nền trắng) ===== */
const ART = { w: 687, h: 1024 };
/** Phần tranh hiện trên giấy: từ đầu ngón tới ngay dưới nếp cổ tay. */
const CROP = { x0: 70, x1: 580, y0: 50, y1: 720 };
/** Khung giấy và chỗ đặt tranh. */
const PAPER = 320, TOP = 62;
const SCALE = Math.min(220 / (CROP.x1 - CROP.x0), 318 / (CROP.y1 - CROP.y0));
const CX = (CROP.x0 + CROP.x1) / 2;
/** Điểm ảnh trên tranh → toạ độ trên giấy (tay phải). */
const img = (x: number, y: number): P => ({ x: (x - CX) * SCALE + PAPER / 2, y: (y - CROP.y0) * SCALE + TOP });
/** Ba mốc trên tranh: giữa nếp cổ tay, gốc ngón trỏ, gốc ngón út (cùng thứ tự với khớp 0, 5, 17 của MediaPipe). */
const ANCHORS: P[] = [img(356, 690), img(272, 368), img(488, 418)];
/** Vùng lòng bàn tay và gò ngón cái trên tranh: nét chạm chỉ hiện trong vùng này. */
const PALM_CLIP = [
  [240, 352], [317, 345], [395, 350], [466, 392], [530, 402], [523, 440], [514, 480], [507, 520], [500, 560], [492, 600], [477, 640], [462, 680],
  [455, 705], [255, 705], [236, 660], [207, 620], [180, 580], [156, 540], [145, 500], [127, 460], [109, 420], [85, 375], [81, 358], [137, 360], [205, 440], [228, 470], [236, 420],
].map(([x, y]) => img(x, y));

/** Gò: tên, tâm gò trên tranh, chỗ đặt chữ ngoài lề (toạ độ giấy, tay phải). Chữ nối về gò bằng một nét dẫn mảnh. */
const MOUNTS: readonly { name: string; at: P; text: P }[] = [
  { name: 'Gò Mộc Tinh', at: img(282, 398), text: { x: 16, y: 128 } },
  { name: 'Gò Kim Tinh', at: img(272, 565), text: { x: 16, y: 334 } },
  { name: 'Gò Thổ Tinh', at: img(356, 388), text: { x: 304, y: 86 } },
  { name: 'Gò Thái Dương', at: img(424, 398), text: { x: 304, y: 112 } },
  { name: 'Gò Thủy Tinh', at: img(482, 438), text: { x: 304, y: 236 } },
  { name: 'Gò Hỏa Tinh', at: img(474, 512), text: { x: 304, y: 278 } },
  { name: 'Gò Thái Âm', at: img(440, 608), text: { x: 304, y: 326 } },
];

const star = (x: number, y: number, r: number) => `M${x} ${y - r}Q${x} ${y} ${x + r} ${y}Q${x} ${y} ${x} ${y + r}Q${x} ${y} ${x - r} ${y}Q${x} ${y} ${x} ${y - r}Z`;
const sun = (x: number, y: number, k = 1) => Array.from({ length: 12 }, (_, i) => {
  const a = (i * Math.PI) / 6, r1 = 7.5 * k, r2 = (i % 2 ? 11 : 13) * k;
  return `M${(x + Math.cos(a) * r1).toFixed(1)} ${(y + Math.sin(a) * r1).toFixed(1)}L${(x + Math.cos(a) * r2).toFixed(1)} ${(y + Math.sin(a) * r2).toFixed(1)}`;
}).join('');

/** Nét bám rãnh đi theo từng điểm ảnh nên răng cưa: lấy mẫu thưa, làm mượt, rồi vẽ bằng đường cong qua các điểm. */
function smoothPath(raw: readonly P[]): string {
  if (raw.length < 2) return '';
  const step = 6, pts: P[] = [raw[0]];
  let acc = 0;
  for (let i = 1; i < raw.length; i++) {
    acc += len(raw[i - 1], raw[i]);
    if (acc >= step) { pts.push(raw[i]); acc = 0; }
  }
  if (len(pts[pts.length - 1], raw[raw.length - 1]) > 1) pts.push(raw[raw.length - 1]);
  const sm = pts.map((p, i) => (i === 0 || i === pts.length - 1 ? p : { x: (pts[i - 1].x + 2 * p.x + pts[i + 1].x) / 4, y: (pts[i - 1].y + 2 * p.y + pts[i + 1].y) / 4 }));
  let d = `M${f(sm[0])}`;
  for (let i = 0; i < sm.length - 1; i++) {
    const p0 = sm[Math.max(0, i - 1)], p1 = sm[i], p2 = sm[i + 1], p3 = sm[Math.min(sm.length - 1, i + 2)];
    d += `C${f({ x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 })} ${f({ x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 })} ${f(p2)}`;
  }
  return d;
}

/** Chỗ đặt tên đường: thử vài vị trí dọc đoạn dài nhất, hai bên nét, chọn chỗ xa tên gò và tên đường đã đặt nhất. */
function labelAt(segs: readonly P[][], taken: P[]): P | null {
  const seg = segs.reduce<P[] | null>((best, x) => (!best || x.length > best.length ? x : best), null);
  if (!seg || seg.length < 4) return null;
  let best: { p: P; score: number } | null = null;
  for (const t of [0.5, 0.35, 0.65, 0.2, 0.8]) {
    const i = Math.round((seg.length - 1) * t), a = seg[Math.max(0, i - 3)], b = seg[Math.min(seg.length - 1, i + 3)];
    const l = len(a, b) || 1, nx = -(b.y - a.y) / l, ny = (b.x - a.x) / l;
    for (const side of [1, -1]) {
      const p = { x: seg[i].x + nx * 10 * side, y: seg[i].y + ny * 10 * side + 3 };
      const inside = p.x > 70 && p.x < 250 && p.y > 150 && p.y < 350;
      const score = Math.min(...taken.map((q) => Math.hypot((q.x - p.x) / 2.2, q.y - p.y))) - (inside ? 0 : 50) - Math.abs(t - 0.5) * 6;
      if (!best || score > best.score) best = { p, score };
    }
  }
  if (best) taken.push(best.p);
  return best?.p ?? null;
}

export function PalmDiagram({ session, focus }: { session: Pick<PalmSession, 'hand' | 'landmarks' | 'lines'>; focus?: PalmLineKey }) {
  const lm = session.landmarks;
  const mirror = session.hand === 'left';
  const shown = Object.keys(session.lines) as PalmLineKey[];
  const m = affine([0, 5, 17].map((i) => ({ x: lm[i].x * K, y: lm[i].y * K })), ANCHORS);
  const lines = shown.map((k) => ({ k, segs: (session.lines[k] ?? []).map((seg) => seg.map((p) => apply(m, { x: p.x * K, y: p.y * K }))) }));
  /** Toạ độ giấy của tay phải → toạ độ giấy thật (đã tính lật tay trái). */
  const hx = (x: number) => (mirror ? PAPER - x : x);
  const anchor = (x: number): 'start' | 'end' => ((x < PAPER / 2) !== mirror ? 'start' : 'end');
  const dim = (k: PalmLineKey) => !!focus && focus !== k;
  const art = { tl: img(0, 0), w: ART.w * SCALE, h: ART.h * SCALE };
  const fadeTop = img(0, CROP.y1 - 60).y, fadeBottom = img(0, CROP.y1).y;
  return (
    <figure style={{ margin: 0 }}>
      <svg className={s.diagram} viewBox={`0 30 ${PAPER} 340`} role="img" aria-label={`Sơ đồ bàn tay ${mirror ? 'trái' : 'phải'} với các đường ${shown.map((k) => PALM_LINE_NAME[k]).join(', ') || 'chưa có'}`}>
        <defs>
          <radialGradient id="palm-paper" cx="0.5" cy="0.45" r="0.75">
            <stop offset="0" stopColor="#f6ebcf" />
            <stop offset="0.7" stopColor="#ecdcb3" />
            <stop offset="1" stopColor="#dcc590" />
          </radialGradient>
          {/* Cổ tay mờ dần vào giấy */}
          <linearGradient id="palm-fade" gradientUnits="userSpaceOnUse" x1="0" y1={fadeTop} x2="0" y2={fadeBottom}>
            <stop offset="0" stopColor="#fff" />
            <stop offset="1" stopColor="#000" />
          </linearGradient>
          <mask id="palm-mask" maskUnits="userSpaceOnUse" x="0" y="30" width={PAPER} height="340">
            <rect x="0" y="30" width={PAPER} height="340" fill="url(#palm-fade)" />
          </mask>
          <clipPath id="palm-clip"><polygon points={PALM_CLIP.map(f).join(' ')} /></clipPath>
        </defs>
        <rect x="2" y="32" width={PAPER - 4} height="336" rx="6" fill="url(#palm-paper)" />
        <rect x="8" y="38" width={PAPER - 16} height="324" rx="3" fill="none" stroke="#a07a3c" strokeWidth={0.8} />
        <rect x="11" y="41" width={PAPER - 22} height="318" rx="2" fill="none" stroke="#a07a3c" strokeWidth={0.4} />
        {/* Trang trí góc: trăng, mặt trời, sao nhỏ */}
        <g stroke="#8a6532" fill="none" strokeWidth={0.7} opacity={0.75}>
          <path d="M30 50a9 9 0 1 0 9 12a7 7 0 1 1 -9 -12Z" />
          <circle cx={PAPER - 32} cy={56} r={6} /><path d={sun(PAPER - 32, 56)} />
          <path d="M28 344a8 8 0 1 0 8 10a6 6 0 1 1 -8 -10Z" />
          <circle cx={PAPER - 30} cy={348} r={4.5} /><path d={sun(PAPER - 30, 348, 0.7)} />
          <g fill="#8a6532" stroke="none"><path d={star(52, 76, 3)} /><path d={star(PAPER - 58, 80, 2.5)} /><path d={star(48, 318, 2.2)} /><path d={star(PAPER - 52, 300, 3)} /></g>
        </g>
        <text x={48} y={58} fontFamily="var(--font-serif)" fontStyle="italic" fontSize={12} fontWeight={600} fill={INK}>Lòng bàn tay</text>
        <g data-hand transform={mirror ? `translate(${PAPER} 0) scale(-1 1)` : undefined} fill="none" strokeLinecap="round" strokeLinejoin="round">
          {/* Nền trắng của tranh hoà vào giấy nhờ chế độ nhân màu */}
          <image href={handArt} x={art.tl.x} y={art.tl.y} width={art.w} height={art.h} mask="url(#palm-mask)" style={{ mixBlendMode: 'multiply', filter: 'saturate(0.55) sepia(0.25)' }} preserveAspectRatio="none" />
          {MOUNTS.map((mt) => <ellipse key={mt.name} cx={mt.at.x} cy={mt.at.y} rx={10} ry={6.5} stroke={INK} strokeWidth={0.5} strokeDasharray="1.5 3" opacity={0.45} />)}
          <g clipPath="url(#palm-clip)">
            {lines.map(({ k, segs }) => segs.map((seg, i) => (
              <path key={k + i} data-line={k} d={smoothPath(seg)} stroke={PALM_LINE_COLOR[k]} strokeWidth={dim(k) ? 1.6 : 3} opacity={dim(k) ? 0.35 : 0.9} />
            )))}
          </g>
        </g>
        <g fontFamily="var(--font-serif)" fill="none">
          {MOUNTS.map((mt) => {
            const a = { x: hx(mt.at.x), y: mt.at.y }, tx = hx(mt.text.x), left = mt.text.x < PAPER / 2;
            const end = { x: hx(mt.text.x + (left ? 4 : -4)), y: mt.text.y - 3 };
            return (
              <g key={mt.name}>
                <path d={`M${f(a)}Q${f({ x: (a.x + end.x) / 2, y: end.y })} ${f(end)}`} stroke={INK} strokeWidth={0.45} opacity={0.6} />
                <circle cx={a.x} cy={a.y} r={1.1} fill={INK} opacity={0.7} />
                <text x={tx} y={mt.text.y} fontSize={7.5} fontStyle="italic" fill={INK} textAnchor={anchor(mt.text.x)} opacity={0.85}>{mt.name}</text>
              </g>
            );
          })}
        </g>
        <g fontFamily="var(--font-serif)" textAnchor="middle">
          {(() => {
            const taken = MOUNTS.map((mt) => mt.at);
            return lines.map(({ k, segs }) => {
              const p = dim(k) ? null : labelAt(segs, taken);
              if (!p) return null;
              return <text key={k} x={hx(p.x)} y={p.y} fontSize={8} fontStyle="italic" fontWeight={600} fill={PALM_LINE_COLOR[k]} stroke="#f3e5c2" strokeWidth={2.5} paintOrder="stroke">{PALM_LINE_NAME[k]}</text>;
            });
          })()}
        </g>
      </svg>
      <figcaption className={s.legend}>
        {shown.map((k) => <span key={k}><i style={{ background: PALM_LINE_COLOR[k] }} />{PALM_LINE_NAME[k]}</span>)}
      </figcaption>
    </figure>
  );
}
