/* Sinh hai file Lottie GIỮ CHỖ cho thầy và đạo đồng (ARCHITECTURE.md mục 12.4). 5 trạng thái đặt bằng marker: idle, talk, point, turnPage, nod.
   Hoạ sĩ thay file chỉ cần giữ tên marker; không phải đổi code.
   Kiểu vẽ: nét cong mềm, mắt nhắm hiền, cùng bảng màu với tranh. KHÔNG cho miệng mấp máy và KHÔNG xoay tay quanh khớp: thử trên máy thật
   trông như con rối. Chuyển động chỉ là thở, nghiêng đầu nhẹ, tay áo đưa nhẹ. Chạy: node scripts/build-characters.mjs */
import { mkdirSync, writeFileSync } from 'node:fs';

const OUT = 'src/assets/journey/character';
const SEG = { idle: [0, 120], talk: [120, 180], point: [180, 240], turnPage: [240, 300], nod: [300, 360] };
const END = 360;

const rgb = (hex) => [1, 3, 5].map((i) => +(parseInt(hex.slice(i, i + 2), 16) / 255).toFixed(3)).concat(1);
const fixed = (k) => ({ a: 0, k });
const ease = { i: { x: [0.45], y: [1] }, o: { x: [0.55], y: [0] } };
function anim(keys) {
  return { a: 1, k: keys.map(([t, s], i) => (i === keys.length - 1 ? { t, s: [].concat(s) } : { t, s: [].concat(s), ...ease })) };
}
const tr = () => ({ ty: 'tr', p: fixed([0, 0]), a: fixed([0, 0]), s: fixed([100, 100]), r: fixed(0), o: fixed(100), sk: fixed(0), sa: fixed(0) });
const fill = (hex, o = 100) => ({ ty: 'fl', c: fixed(rgb(hex)), o: fixed(o), r: 1 });
const stroke = (hex, w, o = 100) => ({ ty: 'st', c: fixed(rgb(hex)), o: fixed(o), w: fixed(w), lc: 2, lj: 2 });

/** Đường cong trơn đi qua các điểm (Catmull-Rom sang bezier). */
function curve(points, closed = true) {
  const n = points.length;
  const at = (i) => (closed ? points[(i + n) % n] : points[Math.min(Math.max(i, 0), n - 1)]);
  const tan = points.map((_, i) => [(at(i + 1)[0] - at(i - 1)[0]) / 6, (at(i + 1)[1] - at(i - 1)[1]) / 6]);
  return { ty: 'sh', ks: fixed({ v: points, i: tan.map(([x, y]) => [-x, -y]), o: tan, c: closed }) };
}
const blob = (points, ...paints) => ({ ty: 'gr', it: [curve(points), ...paints, tr()] });
const pen = (points, hex, w, o) => ({ ty: 'gr', it: [curve(points, false), stroke(hex, w, o), tr()] });
const dot = (x, y, w, h, hex, o) => ({ ty: 'gr', it: [{ ty: 'el', p: fixed([x, y]), s: fixed([w, h]) }, fill(hex, o), tr()] });

const layer = (ind, nm, ks, shapes, parent) => ({
  ddd: 0, ind, ty: 4, nm, sr: 1, ip: 0, op: END, st: 0, bm: 0, ...(parent ? { parent } : {}),
  ks: { o: fixed(100), r: ks.r ?? fixed(0), p: ks.p, a: ks.a, s: ks.s ?? fixed([100, 100, 100]) }, ao: 0, shapes,
});

/* Thở đều suốt mọi trạng thái, nên đổi trạng thái không bị giật. */
const breathe = anim([0, 60, 120, 180, 240, 300, 360].map((t, i) => [t, i % 2 ? [100.6, 101.4, 100] : [100, 100, 100]]));
/* Đầu chỉ nghiêng vài độ. */
const tilt = anim([[0, 0], [60, 1], [120, 0], [150, 2], [180, 0], [205, -2], [240, 0], [270, 3], [300, 0], [318, 5], [340, 5], [360, 0]]);
/* Tay áo đưa nhẹ, không xoay quanh khớp. */
const sleeve = anim([[0, [0, 0, 0]], [180, [0, 0, 0]], [205, [6, -10, 0]], [228, [6, -10, 0]], [240, [0, 0, 0]], [256, [-5, -6, 0]], [272, [3, -3, 0]], [300, [0, 0, 0]], [360, [0, 0, 0]]]);

function thay() {
  const robe = '#2f3556', robeHi = '#454c78', trim = '#d7b571', skin = '#e3bf9a', white = '#ece7dc', shade = '#c79f7c';
  return [
    layer(1, 'tay áo phải', { p: sleeve, a: fixed([0, 0, 0]) }, [
      blob([[150, 150], [172, 176], [176, 212], [150, 220], [128, 206], [130, 170]], fill(robeHi)),
      dot(146, 216, 20, 13, skin),
    ], 3),
    layer(2, 'đầu', { p: fixed([100, 112, 0]), a: fixed([100, 112, 0]), r: tilt }, [
      pen([[89, 80], [93, 83], [97, 80]], '#6a4f3c', 1.8), pen([[107, 80], [111, 83], [115, 80]], '#6a4f3c', 1.8),
      pen([[86, 72], [93, 69], [98, 72]], white, 3.2), pen([[106, 72], [111, 69], [118, 72]], white, 3.2),
      blob([[84, 92], [91, 90], [102, 92], [113, 90], [120, 92], [118, 116], [111, 140], [102, 160], [93, 140], [86, 116]], fill(white)),
      pen([[94, 104], [97, 128]], '#c8c2b4', 1.2), pen([[110, 104], [107, 128]], '#c8c2b4', 1.2),
      blob([[78, 80], [84, 60], [102, 54], [120, 60], [126, 80], [122, 100], [102, 108], [82, 100]], fill(skin)),
      blob([[76, 76], [84, 52], [102, 46], [120, 52], [128, 76], [120, 62], [102, 58], [84, 62]], fill('#d8d3c6')),
      blob([[92, 46], [94, 32], [102, 28], [110, 32], [112, 46], [102, 49]], fill('#d8d3c6')),
      { ty: 'gr', it: [{ ty: 'rc', p: fixed([102, 37]), s: fixed([30, 3]), r: fixed(1.5) }, fill(trim), tr()] },
    ], 3),
    layer(3, 'thân', { p: fixed([100, 220, 0]), a: fixed([100, 220, 0]), s: breathe }, [
      pen([[86, 112], [100, 136], [118, 112]], trim, 2.6),
      pen([[102, 136], [102, 220]], trim, 1.6, 70),
      pen([[66, 170], [70, 220]], '#232845', 2), pen([[136, 160], [132, 220]], '#232845', 2),
      blob([[84, 108], [120, 108], [146, 124], [164, 170], [172, 226], [32, 226], [40, 170], [58, 124]], fill(robe)),
      blob([[50, 150], [30, 180], [28, 214], [54, 222], [74, 204], [72, 168]], fill(robeHi)),
      dot(56, 216, 20, 13, skin),
      dot(100, 104, 26, 14, shade),
    ]),
  ];
}

function dong() {
  const robe = '#6f957f', robeHi = '#8bb098', trim = '#efe4c6', skin = '#f0cda9', hair = '#2a1f1c', sash = '#b5402e';
  return [
    layer(1, 'tay áo', { p: sleeve, a: fixed([0, 0, 0]) }, [
      blob([[138, 132], [156, 146], [162, 170], [146, 178], [128, 166], [126, 142]], fill(robeHi)),
      dot(150, 176, 15, 13, skin),
    ], 3),
    layer(2, 'đầu', { p: fixed([100, 116, 0]), a: fixed([100, 116, 0]), r: tilt }, [
      pen([[86, 84], [91, 80], [96, 84]], '#4a3128', 2), pen([[106, 84], [111, 80], [116, 84]], '#4a3128', 2),
      pen([[96, 98], [101, 101], [106, 98]], '#a8604c', 1.8),
      dot(82, 93, 12, 7, '#eda692', 55), dot(120, 93, 12, 7, '#eda692', 55),
      blob([[70, 80], [76, 58], [101, 48], [126, 58], [132, 80], [126, 104], [101, 116], [76, 104]], fill(skin)),
      blob([[68, 82], [74, 52], [101, 42], [128, 52], [134, 82], [124, 66], [101, 62], [78, 66]], fill(hair)),
      dot(70, 44, 27, 27, hair), dot(132, 44, 27, 27, hair),
      { ty: 'gr', it: [{ ty: 'rc', p: fixed([70, 58]), s: fixed([16, 4]), r: fixed(2) }, fill(sash), tr()] },
      { ty: 'gr', it: [{ ty: 'rc', p: fixed([132, 58]), s: fixed([16, 4]), r: fixed(2) }, fill(sash), tr()] },
    ], 3),
    layer(3, 'thân', { p: fixed([100, 216, 0]), a: fixed([100, 216, 0]), s: breathe }, [
      pen([[86, 118], [100, 138], [116, 118]], trim, 2.6),
      { ty: 'gr', it: [{ ty: 'rc', p: fixed([100, 164]), s: fixed([66, 8]), r: fixed(3) }, fill(sash), tr()] },
      pen([[88, 170], [84, 214]], '#567a65', 1.8), pen([[114, 170], [118, 214]], '#567a65', 1.8),
      blob([[82, 114], [120, 114], [138, 130], [146, 176], [150, 214], [52, 214], [56, 176], [64, 130]], fill(robe)),
      blob([[64, 132], [46, 148], [40, 170], [56, 178], [74, 168], [76, 142]], fill(robeHi)),
      dot(50, 176, 15, 13, skin),
      dot(84, 216, 22, 9, '#3a2c28'), dot(118, 216, 22, 9, '#3a2c28'),
    ]),
  ];
}

const pack = (layers) => ({
  v: '5.7.0', fr: 30, ip: 0, op: END, w: 200, h: 224, nm: 'Nhân vật giữ chỗ', ddd: 0, assets: [],
  markers: Object.entries(SEG).map(([cm, [a, b]]) => ({ tm: a, cm, dr: b - a })), layers,
});

mkdirSync(OUT, { recursive: true });
for (const [name, layers] of [['thay', thay()], ['daodong', dong()]]) {
  const json = JSON.stringify(pack(layers));
  writeFileSync(`${OUT}/${name}.json`, json);
  console.log(name, json.length, 'byte');
}
