/* Vẽ tranh hành trình đạo quán thành SVG (ARCHITECTURE.md mục 12.1, 12.3, 12.10). Phong cách: sơn mài và thuỷ mặc, nhiều lớp phẳng,
   viền vàng, cùng bảng màu với app. Đạo quán hư cấu, tượng cách điệu không rõ mặt, không dùng chữ, kinh văn hay phù chú.
   Không dùng filter blur vì WebView trên máy yếu vẽ rất chậm; ánh sáng và sương đều là gradient.
   Vật chính nằm trong x = 40–320 vì máy dài sẽ bị cắt hai bên. Chạy: node scripts/build-journey-art.mjs */
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';

const OUT = 'src/assets/journey/art';
const n = (v) => +v.toFixed(1);
const C = {
  ink: '#0d1424', indigo: '#1b2845', slate: '#33435f', mist: '#8e9db0', gold: '#d7b571', goldHi: '#f3dfa8', amber: '#f0a94e',
  red: '#8f2a20', redHi: '#b8402e', wood: '#3a2318', woodHi: '#5b3a26', plaster: '#e6dac0', plasterLo: '#b7a688', jade: '#2c5a50', jadeHi: '#4a8270',
  pine: '#16302d', pineHi: '#26504a', stone: '#6f7482', stoneLo: '#3d4250',
};

function rng(seed) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}
const svg = (defs, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 640" preserveAspectRatio="xMidYMid slice">${defs ? `<defs>${defs}</defs>` : ''}${body}</svg>`;
const stops = (list) => list.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a === undefined ? '' : ` stop-opacity="${a}"`}/>`).join('');
const lg = (id, list, y2 = 1, x2 = 0) => `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}">${stops(list)}</linearGradient>`;
const rg = (id, list) => `<radialGradient id="${id}">${stops(list)}</radialGradient>`;
const rect = (x, y, w, h, fill, extra = '') => `<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" fill="${fill}" ${extra}/>`;
const ell = (cx, cy, rx, ry, fill, extra = '') => `<ellipse cx="${n(cx)}" cy="${n(cy)}" rx="${n(rx)}" ry="${n(ry)}" fill="${fill}" ${extra}/>`;
const path = (d, fill, extra = '') => `<path d="${d}" fill="${fill}" ${extra}/>`;
const line = (d, stroke, w, extra = '') => `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${w}" stroke-linecap="round" ${extra}/>`;

/** Dãy núi: các sóng sin cộng nhiễu, đổ xuống tới `bottom`. */
function ridge(seed, base, amp, bottom, fill, extra = '') {
  const r = rng(seed), a = r() * 6, b = r() * 6;
  let d = `M-10 ${bottom}L-10 ${n(base)}`;
  for (let x = -10; x <= 370; x += 9) {
    const y = base - amp * (0.55 * Math.sin(x / 61 + a) + 0.3 * Math.sin(x / 23 + b) + 0.15 * (r() - 0.5));
    d += `L${x} ${n(y)}`;
  }
  return path(`${d}L370 ${bottom}Z`, fill, extra);
}

/** Thân đá hoặc lùm lá: nhiều elip chồng nhau, lớp sáng lệch lên trên. */
function clump(seed, cx, cy, w, h, lo, hi, count = 9) {
  const r = rng(seed);
  let out = '';
  for (let i = 0; i < count; i++) {
    const x = cx + (r() - 0.5) * w, y = cy + (r() - 0.5) * h, rx = w * (0.16 + r() * 0.16);
    out += ell(x, y, rx, rx * 0.68, lo) + ell(x - rx * 0.1, y - rx * 0.22, rx * 0.72, rx * 0.36, hi, 'opacity=".75"');
  }
  return out;
}

/** Thông kiểu tranh: thân cong và các tán dẹt. `dir` = 1 nghiêng phải, −1 nghiêng trái. */
function pine(seed, x, y, s, dir = 1) {
  const r = rng(seed);
  const tx = x + dir * 26 * s, ty = y - 150 * s;
  let out = path(`M${n(x - 7 * s)} ${y}C${n(x - 12 * s)} ${n(y - 60 * s)} ${n(x + dir * 30 * s)} ${n(y - 80 * s)} ${n(tx - 3 * s)} ${n(ty)}L${n(tx + 3 * s)} ${n(ty)}C${n(x + dir * 40 * s)} ${n(y - 70 * s)} ${n(x + 12 * s)} ${n(y - 50 * s)} ${n(x + 9 * s)} ${y}Z`, '#2b1d17');
  for (let i = 0; i < 5; i++) {
    const t = i / 4, px = x + dir * (10 + 26 * t) * s + (i % 2 ? 26 : -22) * s * (r() * 0.5 + 0.6), py = y - (72 + 92 * t) * s;
    out += line(`M${n(x + dir * 18 * t * s)} ${n(py + 16 * s)}Q${n((x + px) / 2)} ${n(py + 10 * s)} ${n(px)} ${n(py)}`, '#2b1d17', n(2.4 * s));
    const w = (64 - 22 * t) * s;
    out += ell(px, py, w, 15 * s, C.pine) + ell(px - 3 * s, py - 5 * s, w * 0.74, 7 * s, C.pineHi) + ell(px + 6 * s, py - 8 * s, w * 0.36, 3.2 * s, C.jadeHi, 'opacity=".55"');
  }
  return out;
}

/** Mái cong cong vút hai đầu. */
function roof(cx, y, w, h, fill, edge = C.gold) {
  const a = w * 0.3, b = w * 0.5;
  const d = `M${n(cx - a)} ${y}L${n(cx + a)} ${y}Q${n(cx + a * 1.26)} ${n(y + h * 0.58)} ${n(cx + b)} ${n(y + h - 8)}Q${n(cx + b * 0.9)} ${n(y + h + 1)} ${n(cx + b * 0.72)} ${n(y + h)}L${n(cx - b * 0.72)} ${n(y + h)}Q${n(cx - b * 0.9)} ${n(y + h + 1)} ${n(cx - b)} ${n(y + h - 8)}Q${n(cx - a * 1.26)} ${n(y + h * 0.58)} ${n(cx - a)} ${y}Z`;
  let tiles = '';
  for (let i = -6; i <= 6; i++) tiles += `M${n(cx + (i * a) / 6)} ${y}L${n(cx + (i * b * 0.74) / 6)} ${n(y + h)}`;
  return path(d, fill) + line(tiles, '#000', 0.7, 'opacity=".22"')
    + line(`M${n(cx - b)} ${n(y + h - 8)}Q${n(cx - b * 0.9)} ${n(y + h + 1)} ${n(cx - b * 0.72)} ${n(y + h)}L${n(cx + b * 0.72)} ${n(y + h)}Q${n(cx + b * 0.9)} ${n(y + h + 1)} ${n(cx + b)} ${n(y + h - 8)}`, edge, 1.2)
    + rect(cx - a - 3, y - 2, a * 2 + 6, 3.4, edge);
}

/** Lầu nhiều tầng đứng xa. */
function pagoda(cx, y, s, body, roofC, glow = C.amber) {
  let out = '';
  [[3, 42, 34], [2, 58, 40], [1, 76, 46], [0, 96, 52]].forEach(([, w, h], i) => {
    const ty = y + i * 34 * s, bw = w * s * 0.56, bh = (i === 3 ? 34 : 18) * s;
    out += rect(cx - bw / 2, ty + 14 * s, bw, bh, body);
    for (let k = -1; k <= 1; k++) out += rect(cx + (k * bw) / 3.4 - 2.2 * s, ty + 18 * s, 4.4 * s, 8 * s, glow, 'opacity=".85"');
    out += roof(cx, ty, w * s, 17 * s, roofC);
  });
  out += line(`M${cx} ${n(y)}L${cx} ${n(y - 16 * s)}`, C.gold, n(1.6 * s)) + ell(cx, y - 18 * s, 2.6 * s, 2.6 * s, C.goldHi);
  return out;
}

/** Đèn đá trong vườn. */
function stoneLantern(x, y, s) {
  return rect(x - 4 * s, y - 26 * s, 8 * s, 26 * s, C.stoneLo) + rect(x - 11 * s, y - 2 * s, 22 * s, 4 * s, C.stoneLo)
    + rect(x - 9 * s, y - 42 * s, 18 * s, 16 * s, C.stoneLo) + rect(x - 5 * s, y - 39 * s, 10 * s, 10 * s, C.amber)
    + roof(x, y - 54 * s, 34 * s, 13 * s, C.stoneLo, C.stone);
}

/** Đèn lồng treo, `id` là gradient quầng sáng đã khai báo. */
function lantern(x, y, r, body, glowId, cord = 60) {
  return (glowId ? ell(x, y, r * 3.4, r * 3.4, `url(#${glowId})`) : '')
    + line(`M${x} ${y - r - cord}L${x} ${y - r}`, C.ink, 1.3)
    + rect(x - r * 0.42, y - r * 1.12, r * 0.84, r * 0.24, C.gold) + rect(x - r * 0.42, y + r * 0.9, r * 0.84, r * 0.24, C.gold)
    + ell(x, y, r, r * 0.96, body) + ell(x, y, r * 0.52, r * 0.96, C.goldHi, 'opacity=".2"') + ell(x, y, r * 0.16, r * 0.96, C.goldHi, 'opacity=".28"')
    + line(`M${x} ${n(y + r * 1.14)}L${x} ${n(y + r * 1.9)}`, C.gold, 1.6);
}

function column(x, top, w, h, id) {
  return rect(x, top, w, h, `url(#${id})`) + rect(x - 1.5, top + h * 0.1, w + 3, 4, C.gold, 'opacity=".85"') + rect(x - 1.5, top + h * 0.78, w + 3, 4, C.gold, 'opacity=".85"');
}

/** Sương là dải gradient, không dùng blur. */
const mistBand = (id, y, h, o = 1) => ell(180, y, 320, h, `url(#${id})`, `opacity="${o}"`);
const mistDef = (id, c = '#dfe6ea', a = 0.6) => rg(id, [[0, c, a], [1, c, 0]]);

const layers = {};

/* ===== Cổng nguyệt môn ===== */
layers['gate-0'] = svg(
  lg('sky', [[0, '#1b2b50'], [0.2, '#566488'], [0.36, '#d9a47a'], [0.68, '#f3cf97']]) + mistDef('c', '#fbeedb', 0.5) + rg('sun', [[0, '#fff0c9', 0.95], [0.25, '#ffdca0', 0.7], [1, '#ffcf8a', 0]]) + mistDef('m', '#f4e3c8', 0.55) + lg('hill', [[0, '#4d5f6e'], [1, '#8a8a7d']]) + lg('near', [[0, '#27423f'], [1, '#3f5b4c']]),
  rect(0, 0, 360, 640, 'url(#sky)') + ell(70, 64, 150, 12, 'url(#c)') + ell(290, 108, 140, 10, 'url(#c)') + ell(150, 150, 170, 9, 'url(#c)')
  + ridge(71, 222, 44, 640, '#6d7690', 'opacity=".75"') + ridge(73, 240, 30, 640, '#535f7d', 'opacity=".85"') + ell(180, 372, 130, 130, 'url(#sun)')
  + ridge(11, 372, 56, 640, '#5e6a7f', 'opacity=".72"') + mistBand('m', 392, 50)
  + ridge(23, 410, 44, 640, 'url(#hill)') + pagoda(180, 322, 0.86, '#2d2730', '#21304a') + mistBand('m', 450, 38, 0.9)
  + ridge(37, 470, 26, 640, 'url(#near)'),
);
layers['gate-1'] = svg(
  lg('wall', [[0, C.plaster], [0.7, '#cdbd9f'], [1, '#776a58']]) + lg('tile', [[0, '#26344f'], [1, '#121a2e']]) + rg('rim', [[0.84, '#f8d79c', 0], [0.92, '#f8d79c', 0.55], [1, '#f8d79c', 0]]),
  path('M-10 306H370V650H-10ZM180 322a112 112 0 1 0 .1 0Z', 'url(#wall)', 'fill-rule="evenodd"')
  + roof(180, 244, 600, 58, 'url(#tile)')
  + rect(-10, 302, 380, 8, '#6b5a47', 'opacity=".45"') + rect(-10, 310, 380, 3, C.gold, 'opacity=".55"')
  + `<circle cx="180" cy="434" r="112" fill="none" stroke="${C.wood}" stroke-width="9"/><circle cx="180" cy="434" r="118" fill="none" stroke="${C.gold}" stroke-width="1.5"/><circle cx="180" cy="434" r="106" fill="none" stroke="${C.gold}" stroke-width="1" opacity=".7"/>`
  + ell(180, 434, 132, 132, 'url(#rim)', 'opacity=".5"')
  + path('M60 646L76 548H284L300 646Z', C.stoneLo, 'opacity=".55"')
  + rect(138, 288, 84, 28, C.wood, 'rx="2"') + rect(141, 291, 78, 22, C.red, 'rx="1" stroke="#d7b571" stroke-width="1"')
  + `<circle cx="162" cy="302" r="3" fill="${C.gold}"/><circle cx="180" cy="302" r="3" fill="${C.gold}"/><circle cx="198" cy="302" r="3" fill="${C.gold}"/>`,
);
layers['gate-2'] = svg(
  lg('path', [[0, '#a79c8c'], [1, '#2b2a33']]) + lg('steps', [[0, '#5f6470'], [1, '#2a2d38']]),
  path('M122 548H238L330 660H30Z', 'url(#path)') + line('M140 558H220M122 576H238M100 598H260M72 626H288', '#20222c', 3, 'opacity=".5"')
  + pine(5, -14, 590, 1.06, 1) + pine(9, 372, 600, 1.12, -1)
  + clump(3, 26, 584, 100, 34, C.pine, C.pineHi, 7) + clump(8, 336, 596, 100, 34, C.pine, C.pineHi, 7)
  + stoneLantern(84, 584, 0.82) + stoneLantern(276, 584, 0.82),
);
layers['gate-3'] = svg(
  lg('foot', [[0, '#0b1020', 0], [0.5, '#0b1020', 0.7], [1, '#0b1020', 0.96]]),
  clump(4, 0, 22, 190, 66, '#0f1f20', '#1c3a36', 14) + clump(6, 360, 16, 200, 62, '#0f1f20', '#1c3a36', 14)
  + rect(0, 500, 360, 140, 'url(#foot)')
  + clump(12, 26, 640, 150, 34, '#0a1414', '#16302d', 8) + clump(14, 336, 642, 150, 34, '#0a1414', '#16302d', 8),
);

/* ===== Sân vườn ===== */
layers['garden-0'] = svg(
  lg('sky', [[0, '#1a2a4c'], [0.34, '#5a6c8c'], [0.5, '#e4bf90']]) + mistDef('m', '#f3e6cf', 0.6) + mistDef('c', '#f8efe0', 0.42),
  rect(0, 0, 360, 640, 'url(#sky)') + ell(90, 120, 150, 16, 'url(#c)') + ell(280, 176, 130, 12, 'url(#c)') + ell(150, 215, 170, 10, 'url(#c)')
  + ridge(41, 268, 62, 640, '#65748a', 'opacity=".7"') + mistBand('m', 288, 44) + ridge(53, 300, 40, 640, '#4d6072') + mistBand('m', 322, 34, 0.8),
);
layers['garden-1'] = svg(
  mistDef('m', '#efe3cc', 0.5),
  clump(21, 44, 318, 150, 46, '#21403c', '#35605a', 9) + clump(22, 326, 322, 150, 42, '#21403c', '#35605a', 9)
  + pagoda(116, 196, 1.02, '#3a2a26', '#1f2c46')
  + rect(180, 306, 116, 36, '#3c2b26') + roof(238, 268, 174, 44, '#1f2c46')
  + [190, 212, 234, 256, 278].map((x) => rect(x, 314, 12, 24, C.amber, 'opacity=".8"') + rect(x + 5.5, 314, 1, 24, '#3c2b26')).join('')
  + mistBand('m', 346, 22),
);
layers['garden-2'] = svg(
  lg('lake', [[0, '#b9a27f', 0.96], [0.14, '#55737e'], [0.5, '#25414e'], [1, '#0f1c2b']]) + lg('rock', [[0, C.stone], [1, C.stoneLo]]) + mistDef('m', '#efe3cc', 0.4),
  rect(-10, 338, 380, 320, 'url(#lake)')
  + `<g opacity=".22" transform="translate(0 684) scale(1 -1)">${pagoda(116, 196, 1.02, '#1b2230', '#1b2230', '#caa56a')}</g>`
  + line('M40 380H150M210 372H320M20 416H120M190 430H340M60 470H200M230 492H340M30 528H170', C.goldHi, 1.2, 'opacity=".26"')
  + path('M196 454C232 394 306 394 346 454L346 466C306 416 232 416 196 466Z', C.plasterLo) + path('M196 454C232 394 306 394 346 454', 'none', `stroke="${C.gold}" stroke-width="1.4"`)
  + path('M214 466C244 430 298 430 328 466', C.ink, 'opacity=".5"')
  + mistBand('m', 342, 18),
);
layers['garden-3'] = svg(
  lg('rock', [[0, '#585f6e'], [1, '#14171f']]) + lg('foot', [[0, '#0b1020', 0], [1, '#0b1020', 0.92]]),
  (() => {
    const r = rng(77);
    let out = line('M-8 30Q60 16 112 34', '#2b1d17', 5);
    for (let i = 0; i < 16; i++) {
      const x = 4 + i * 8 + r() * 6, len = 110 + r() * 120, sway = 6 + r() * 12;
      out += line(`M${n(x)} ${n(20 + r() * 16)}Q${n(x - sway)} ${n(len * 0.5)} ${n(x + sway * 0.4)} ${n(len)}`, i % 3 ? C.pineHi : C.jadeHi, 1.7, 'stroke-dasharray="8 2"');
    }
    return out;
  })()
  + path('M-10 650V556C24 528 58 540 92 560C128 578 176 584 214 604C236 616 250 632 254 650Z', 'url(#rock)')
  + path('M372 650V580C340 562 304 572 276 600C262 614 256 630 256 650Z', 'url(#rock)')
  + clump(31, 24, 556, 96, 26, C.pine, C.pineHi, 6) + stoneLantern(312, 586, 0.92)
  + rect(0, 560, 360, 80, 'url(#foot)'),
);

/* ===== Điện Tam Thanh ===== */
layers['hall-0'] = svg(
  lg('wall', [[0, '#150d10'], [0.5, '#3a1d18'], [1, '#160c10']]) + rg('g', [[0, '#ffc877', 0.82], [0.45, '#d66f2e', 0.34], [1, '#d66f2e', 0]]),
  rect(0, 0, 360, 640, 'url(#wall)') + ell(180, 290, 210, 240, 'url(#g)')
  + [86, 124].map((y, i) => rect(0, y, 360, 12 + i * 2, C.wood) + rect(0, y + 12 + i * 2, 360, 1.4, C.gold, 'opacity=".5"')).join('')
  + path('M0 150L60 176H300L360 150V0H0Z', '#120b0e', 'opacity=".78"')
  + rect(0, 440, 360, 200, '#140c10') + path('M60 440H300L370 640H-10Z', '#25161a'),
);
layers['hall-1'] = svg(
  rg('halo', [[0, '#ffe2a4', 0.82], [0.55, '#f1a24c', 0.32], [1, '#f1a24c', 0]]) + lg('robe', [[0, '#3b2230'], [1, '#160d16']]) + rg('flame', [[0, '#fff5cf', 1], [0.4, '#ffc15c', 0.8], [1, '#ff9b38', 0]]) + lg('cloth', [[0, C.redHi], [1, '#5c1a15']]),
  (() => {
    const figure = (x, y, s) => ell(x, y - 66 * s, 44 * s, 58 * s, 'url(#halo)')
      + path(`M${n(x - 28 * s)} ${y}C${n(x - 32 * s)} ${n(y - 34 * s)} ${n(x - 19 * s)} ${n(y - 54 * s)} ${n(x - 11 * s)} ${n(y - 62 * s)}L${n(x + 11 * s)} ${n(y - 62 * s)}C${n(x + 19 * s)} ${n(y - 54 * s)} ${n(x + 32 * s)} ${n(y - 34 * s)} ${n(x + 28 * s)} ${y}Z`, 'url(#robe)')
      + ell(x, y - 75 * s, 12.5 * s, 14 * s, '#1b1018') + rect(x - 6 * s, y - 94 * s, 12 * s, 7 * s, '#1b1018', `rx="${2 * s}"`)
      + line(`M${n(x - 12 * s)} ${n(y - 58 * s)}Q${x} ${n(y - 44 * s)} ${n(x + 12 * s)} ${n(y - 58 * s)}M${x} ${n(y - 50 * s)}L${x} ${y}`, C.gold, 0.9, 'opacity=".6"');
    const candle = (x) => rect(x - 2.6, 366, 5.2, 24, '#e8ddc1') + rect(x - 6, 388, 12, 3, C.gold) + ell(x, 356, 18, 22, 'url(#flame)') + ell(x, 359, 2.4, 6, '#fff7dc');
    return figure(180, 322, 1.04) + figure(120, 334, 0.84) + figure(240, 334, 0.84)
      + rect(58, 332, 244, 8, C.woodHi) + rect(58, 340, 244, 1.5, C.gold)
      + rect(70, 392, 220, 8, C.woodHi) + rect(82, 400, 196, 72, 'url(#cloth)') + rect(82, 400, 196, 1.6, C.gold)
      + path('M110 400L180 450L250 400', 'none', `stroke="${C.gold}" stroke-width="1" opacity=".55"`)
      + `<circle cx="180" cy="436" r="9" fill="none" stroke="${C.gold}" stroke-width="1" opacity=".55"/>`
      + candle(118) + candle(242)
      + path('M160 392C156 372 163 368 180 368C197 368 204 372 200 392Z', '#4a3a24') + rect(156, 364, 48, 5, C.gold) + rect(164, 359, 32, 5, '#4a3a24') + line('M172 359V346M180 359V342M188 359V346', C.goldHi, 0.9);
  })(),
);
layers['hall-2'] = svg(
  lg('col', [[0, '#3f120e'], [0.36, '#a03526'], [0.6, '#7a2319'], [1, '#2c0c0a']], 0, 1) + lg('banner', [[0, '#7c2119', 0.95], [1, '#5c1812', 0.85]]) + rg('glow', [[0, '#ffc066', 0.5], [1, '#ffc066', 0]]),
  column(20, 80, 44, 480, 'col') + column(296, 80, 44, 480, 'col')
  + rect(0, 556, 96, 22, C.stoneLo) + rect(264, 556, 96, 22, C.stoneLo)
  + rect(68, 160, 26, 190, 'url(#banner)', 'stroke="#d7b571" stroke-width=".8"') + rect(266, 160, 26, 190, 'url(#banner)', 'stroke="#d7b571" stroke-width=".8"')
  + [190, 230, 270, 310].map((y) => `<circle cx="81" cy="${y}" r="4" fill="none" stroke="${C.gold}" stroke-width=".9"/><circle cx="279" cy="${y}" r="4" fill="none" stroke="${C.gold}" stroke-width=".9"/>`).join('')
  + lantern(128, 150, 13, C.redHi, 'glow', 110) + lantern(232, 150, 13, C.redHi, 'glow', 110),
);
layers['hall-3'] = svg(
  lg('sill', [[0, C.woodHi], [0.15, C.wood], [1, '#0d0806']]) + lg('door', [[0, '#0d0806'], [1, '#2e1a12']], 0, 1) + lg('door2', [[0, '#2e1a12'], [1, '#0d0806']], 0, 1) + lg('top', [[0, '#0d0806'], [1, '#0d0806', 0]]),
  rect(0, 0, 360, 110, 'url(#top)') + rect(-10, 0, 34, 650, 'url(#door)') + rect(336, 0, 34, 650, 'url(#door2)')
  + rect(-10, 566, 380, 90, 'url(#sill)') + rect(-10, 566, 380, 1.8, C.gold, 'opacity=".7"'),
);

/* ===== Hành lang: phối cảnh một điểm tụ ở (180, 290) ===== */
const VP = [180, 290];
const persp = (x, y, t) => [VP[0] + (x - VP[0]) * t, VP[1] + (y - VP[1]) * t];
layers['corridor-0'] = svg(
  lg('fl', [[0, '#5a4532'], [1, '#150e0c']]) + lg('ce', [[0, '#120b0b'], [1, '#3a2418']]) + rg('g', [[0, '#ffdc9c', 0.95], [0.4, '#f09a42', 0.4], [1, '#f09a42', 0]]) + lg('dw', [[0, '#ffdca0'], [1, '#d78a3c']]),
  rect(0, 0, 360, 640, '#1a100e')
  + path('M0 0H360L212 250H148Z', 'url(#ce)') + path('M0 640H360L212 340H148Z', 'url(#fl)')
  + (() => { let o = ''; for (let i = 1; i < 9; i++) { const t = i / 8; const y = 250 - 250 * t; o += `M${n(148 - 148 * t)} ${n(y)}H${n(212 + 148 * t)}`; } return line(o, C.woodHi, 3, 'opacity=".75"'); })()
  + line('M180 340V640M164 340L100 640M196 340L260 640M152 340L20 640M208 340L340 640', '#120b0a', 1, 'opacity=".5"')
  + rect(148, 250, 64, 90, 'url(#dw)') + line('M180 250V340M148 280H212M148 310H212M164 250V340M196 250V340', C.wood, 1)
  + ell(180, 296, 150, 170, 'url(#g)'),
);
layers['corridor-1'] = svg(
  lg('pl', [[0, '#7a2f1d'], [1, '#e2a052']], 0, 1) + lg('pr', [[0, '#e2a052'], [1, '#7a2f1d']], 0, 1),
  (() => {
    const panel = (side) => {
      const X = (t) => (side < 0 ? 148 - 148 * t : 212 + 148 * t);
      const Y1 = (t) => 250 - 250 * t, Y2 = (t) => 340 + 300 * t;
      const P = (a, b) => `M${n(X(a))} ${n(Y1(a))}L${n(X(b))} ${n(Y1(b))}L${n(X(b))} ${n(Y2(b))}L${n(X(a))} ${n(Y2(a))}Z`;
      let o = '', lat = '';
      for (const [a, b] of [[0, 0.1], [0.13, 0.27], [0.3, 0.52], [0.56, 0.86]]) {
        o += path(P(a, b), `url(#${side < 0 ? 'pl' : 'pr'})`, 'opacity=".9"') + path(P(a, b), 'none', `stroke="${C.wood}" stroke-width="${n(2 + 5 * b)}"`);
        for (let i = 1; i < 4; i++) { const c = a + ((b - a) * i) / 4; lat += `M${n(X(c))} ${n(Y1(c))}L${n(X(c))} ${n(Y2(c))}`; }
        for (let k = 1; k < 9; k++) { const f = k / 9; const y = (t) => Y1(t) + (Y2(t) - Y1(t)) * f; lat += `M${n(X(a))} ${n(y(a))}L${n(X(b))} ${n(y(b))}`; }
      }
      return o + line(lat, C.wood, 1.4);
    };
    return panel(-1) + panel(1);
  })(),
);
layers['corridor-2'] = svg(
  lg('c', [[0, '#35100c'], [0.45, '#a03526'], [1, '#2c0c0a']], 0, 1),
  (() => {
    let o = '';
    for (const t of [0.12, 0.29, 0.54, 0.9]) {
      for (const side of [-1, 1]) {
        const x = side < 0 ? 148 - 148 * t : 212 + 148 * t, w = 4 + 34 * t;
        o += rect(x - w / 2, 250 - 250 * t, w, 90 + 550 * t, 'url(#c)') + rect(x - w / 2 - 1, 340 + 300 * t - 6 - 16 * t, w + 2, 6 + 16 * t, C.stoneLo)
          + rect(x - w / 2, 250 - 250 * t + 50 * t + 8, w, 1 + 3 * t, C.gold, 'opacity=".8"');
      }
    }
    return o;
  })(),
);
layers['corridor-3'] = svg(
  rg('g', [[0, '#ffc066', 0.6], [1, '#ffc066', 0]]) + lg('foot', [[0, '#0b1020', 0], [1, '#0b1020', 0.92]]) + lg('top', [[0, '#0d0806', 0.92], [1, '#0d0806', 0]]),
  rect(0, 0, 360, 90, 'url(#top)') + lantern(70, 150, 25, C.redHi, 'g', 150) + lantern(292, 118, 19, C.redHi, 'g', 120)
  + rect(0, 520, 360, 120, 'url(#foot)'),
);

/* ===== Tĩnh thất ===== */
const shelf = (seed, x, w) => {
  const r = rng(seed);
  const colors = [C.red, C.jade, '#7d6a3c', '#3c4d70', '#a98a53', '#5c2c26'];
  let o = rect(x, 110, w, 330, '#1d110c') + rect(x - 2, 104, w + 4, 8, C.woodHi);
  for (let row = 0; row < 5; row++) {
    const y = 172 + row * 62;
    o += rect(x - 1, y, w + 2, 5, C.woodHi);
    let bx = x + 4;
    while (bx < x + w - 8) {
      const bw = 5 + r() * 7, bh = 26 + r() * 22;
      if (r() < 0.2) { o += ell(bx + 8, y - 7, 8, 6.4, '#d9ccae') + `<circle cx="${n(bx + 2)}" cy="${y - 7}" r="2.4" fill="${C.wood}"/>`; bx += 18; continue; }
      o += rect(bx, y - bh, bw, bh, colors[Math.floor(r() * colors.length)]) + rect(bx, y - bh + 5, bw, 1, C.gold, 'opacity=".55"');
      bx += bw + 0.6;
    }
  }
  return o;
};
layers['study-0'] = svg(
  lg('w', [[0, '#2a1a14'], [0.6, '#4a2d1e'], [1, '#22140f']]) + lg('fl', [[0, '#2d1b13'], [1, '#100a08']]),
  rect(0, 0, 360, 640, 'url(#w)') + line('M0 60H360M0 66H360', C.woodHi, 2, 'opacity=".7"')
  + shelf(61, 8, 86) + shelf(67, 266, 86) + rect(0, 446, 360, 200, 'url(#fl)') + rect(0, 442, 360, 5, C.woodHi),
);
layers['study-1'] = svg(
  lg('sky', [[0, '#1c2c50'], [0.6, '#50658a'], [1, '#e3bb8a']]) + rg('moon', [[0, '#fff5d6', 0.95], [0.3, '#ffe6ad', 0.6], [1, '#ffe6ad', 0]]) + `<clipPath id="w"><circle cx="180" cy="230" r="78"/></clipPath>`,
  `<g clip-path="url(#w)">${rect(100, 150, 160, 160, 'url(#sky)')}${ell(214, 196, 42, 42, 'url(#moon)')}`
  + ridge(83, 286, 26, 320, '#2c3b55')
  + [[132, 1], [160, 0], [226, 1]].map(([x, b]) => line(`M${x} 320Q${x + 6} 240 ${x - 2} 150`, C.pine, 4.4) + line(`M${x - 6} 268H${x + 6}M${x - 6} 214H${x + 6}`, '#0d1a1a', 1.4)
    + [176, 206, 240, 268].map((y, i) => path(`M${x} ${y}q${b ? 24 : -24} ${-8 + i} ${b ? 40 : -40} 8q${b ? -24 : 24} ${-2 + i} ${b ? -40 : 40} ${-8}Z`, C.pine)).join('')).join('')
  + `</g><circle cx="180" cy="230" r="78" fill="none" stroke="${C.wood}" stroke-width="10"/><circle cx="180" cy="230" r="84" fill="none" stroke="${C.gold}" stroke-width="1.5"/>`
  + line('M180 152V308M102 230H258M125 175Q180 230 235 175M125 285Q180 230 235 285', C.wood, 2.4),
);
layers['study-2'] = svg(
  lg('top', [[0, '#6e4630'], [1, '#3b2317']]) + lg('front', [[0, '#3b2015'], [1, '#160c08']]) + lg('paper', [[0, '#f2e8cd'], [1, '#cdbd96']]),
  path('M20 438H340L368 500H-8Z', 'url(#top)') + rect(-8, 500, 376, 7, C.gold, 'opacity=".75"') + rect(-8, 507, 376, 34, 'url(#front)')
  + rect(26, 541, 28, 110, '#1c100b') + rect(306, 541, 28, 110, '#1c100b') + path('M-8 500Q20 490 22 438', 'none', `stroke="${C.gold}" stroke-width=".8" opacity=".5"`)
  + path('M112 452H246L262 490H96Z', 'url(#paper)') + line('M122 462H236M118 470H240M114 478H244', '#8c7d62', 0.9, 'opacity=".55"')
  + rect(92, 450, 8, 42, C.red, 'rx="3"') + rect(258, 450, 8, 42, C.red, 'rx="3"')
  + rect(60, 430, 22, 34, '#2c3b55', 'rx="3"') + rect(60, 430, 22, 3, C.gold) + line('M66 430L62 394M71 430L72 390M77 430L84 398', '#7d6a3c', 1.8)
  + ell(280, 472, 24, 8, C.stoneLo) + ell(280, 470, 18, 5, '#10141c'),
);
layers['study-3'] = svg(
  rg('g', [[0, '#ffd488', 0.66], [0.3, '#f7a24a', 0.28], [1, '#f7a24a', 0]]) + rg('f', [[0, '#fff7d8', 1], [0.5, '#ffc05c', 0.85], [1, '#ff9d3a', 0]]) + lg('foot', [[0, '#0b1020', 0], [1, '#0b1020', 0.94]]) + lg('b', [[0, '#a5833f'], [1, '#4c3a1e']]),
  ell(294, 384, 210, 210, 'url(#g)')
  + path('M274 460Q294 448 314 460L308 472H280Z', 'url(#b)') + rect(290, 424, 8, 36, 'url(#b)') + path('M274 424Q294 436 314 424L308 414H280Z', 'url(#b)')
  + rect(291, 402, 6, 12, '#e8ddc1') + ell(294, 386, 16, 26, 'url(#f)') + ell(294, 392, 3, 9, '#fff9e2')
  + rect(0, 540, 360, 100, 'url(#foot)'),
);

/* ===== Lớp phủ theo mùa, rằm, Tết ===== */
function blossoms(seed, points, c1, c2) {
  const r = rng(seed);
  return points.map(([x, y]) => {
    const s = 5 + r() * 3.4;
    let o = '';
    for (let i = 0; i < 5; i++) { const a = (i * 72 + r() * 18) * (Math.PI / 180); o += ell(x + Math.cos(a) * s * 0.8, y + Math.sin(a) * s * 0.8, s * 0.72, s * 0.72, i % 2 ? c1 : c2); }
    return o + ell(x, y, s * 0.3, s * 0.3, C.goldHi);
  }).join('');
}
function maple(x, y, s, c, rot) {
  return path('M0 -10L2.5 -4L8 -6L5.5 -1L10 2L4 2.5L5 8L0 4.5L-5 8L-4 2.5L-10 2L-5.5 -1L-8 -6L-2.5 -4Z', c, `transform="translate(${x} ${y}) rotate(${rot}) scale(${s})"`);
}
const branch = line('M372 24Q300 44 262 92M300 54Q292 96 256 136M262 92Q226 100 200 86M330 38Q336 76 320 110', '#2b1d17', 4);
layers['over-xuan'] = svg('', branch + blossoms(3, [[262, 92], [240, 88], [216, 90], [200, 84], [292, 78], [286, 104], [262, 128], [272, 114], [318, 110], [330, 78], [310, 48], [338, 54], [226, 72], [246, 112]], '#f4b6c2', '#e98fa6'));
layers['over-ha'] = svg(
  lg('lp', [[0, '#3f8a68'], [1, '#1e5140']]),
  [[66, 476, 30], [150, 506, 36], [108, 548, 26], [262, 538, 30], [206, 476, 20], [322, 504, 24]].map(([x, y, r]) => ell(x, y, r, r * 0.34, 'url(#lp)') + line(`M${x} ${y}L${x + r * 0.8} ${n(y - r * 0.12)}`, '#1b4537', 1.2)).join('')
  + [[150, 478], [262, 516], [70, 452]].map(([x, y]) => line(`M${x} ${y + 26}L${x} ${y + 6}`, '#2a5f4c', 2) + [-38, -19, 19, 38, 0].map((a) => path('M0 0C-7 -6 -6 -17 0 -24C6 -17 7 -6 0 0Z', a === 0 ? '#fbd9de' : '#ee9fb0', `transform="translate(${x} ${y + 6}) rotate(${a})"`)).join('')).join(''),
);
const mapleColors = ['#c8502a', '#dc8b2e', '#a93a24'];
layers['over-thu'] = svg('', branch + [[262, 92, 1.2, 10], [240, 84, 1, 40], [216, 92, 1.1, 80], [200, 80, 0.9, 120], [292, 76, 1.2, 200], [286, 108, 1.1, 250], [262, 132, 1, 300], [316, 112, 1.2, 20], [332, 76, 1, 60], [310, 46, 1.1, 100], [338, 50, 0.9, 140], [80, 500, 0.8, 30], [150, 540, 0.9, 70], [262, 488, 0.8, 200], [310, 530, 0.7, 120]].map(([x, y, s, rot], i) => maple(x, y, s, mapleColors[i % 3], rot)).join(''));
layers['over-dong'] = svg(
  mistDef('m', '#e7eef2', 0.7),
  branch + line('M264 88Q226 96 200 82M302 52Q294 94 258 134M332 36Q338 74 322 108', '#e6edf0', 1.4, 'opacity=".8"') + mistBand('m', 356, 62) + mistBand('m', 470, 46, 0.7)
  + (() => { const r = rng(5); let o = ''; for (let i = 0; i < 46; i++) o += `<circle cx="${n(r() * 360)}" cy="${n(r() * 560)}" r="${n(0.8 + r() * 1.3)}" fill="#f4f8fa" opacity="${n(0.4 + r() * 0.5)}"/>`; return o; })(),
);
layers['over-moon'] = svg(
  rg('h', [[0.3, '#fff1c9', 0.5], [1, '#fff1c9', 0]]) + rg('d', [[0, '#fffbe9'], [0.8, '#f6e6ba'], [1, '#e9d39b']]),
  ell(262, 112, 112, 112, 'url(#h)') + ell(262, 112, 44, 44, 'url(#d)') + ell(248, 100, 9, 7, '#e0cb97', 'opacity=".5"') + ell(276, 122, 12, 9, '#e0cb97', 'opacity=".45"') + ell(258, 132, 6, 5, '#e0cb97', 'opacity=".4"'),
);
const strip = (x) => rect(x, 332, 28, 196, '#b5281e', `stroke="${C.gold}" stroke-width="1.4"`) + [362, 402, 442, 482].map((y) => path(`M${x + 14} ${y - 12}l10 12l-10 12l-10 -12Z`, C.gold, 'opacity=".9"')).join('');
layers['over-tet'] = svg(
  rg('g', [[0, '#ff6a3a', 0.42], [1, '#ff6a3a', 0]]),
  strip(30) + strip(302) + lantern(92, 348, 14, '#c82d1f', 'g', 34) + lantern(268, 348, 14, '#c82d1f', 'g', 34),
);

/* ===== Tĩnh thất (màn hình chính) và đồ vật trên án thư ===== */
/* Khung thấp hơn ảnh hành trình; màn hình neo đáy nên án thư luôn ở đúng chỗ, trên máy thấp thì mất phần đỉnh tường. */
layers.room = svg(
  lg('wl', [[0, '#2a1a14'], [0.6, '#4a2d1e'], [1, '#22140f']]) + lg('desk', [[0, '#7a4f35'], [0.3, '#54321f'], [1, '#2e1b12']])
  + lg('sky', [[0, '#1c2c50'], [0.6, '#50658a'], [1, '#e3bb8a']]) + rg('moon', [[0, '#fff5d6', 0.95], [0.3, '#ffe6ad', 0.6], [1, '#ffe6ad', 0]])
  + rg('rim', [[0, '#ffd488', 0.5], [1, '#ffd488', 0]])
  + rg('f', [[0, '#fff7d8', 1], [0.5, '#ffc05c', 0.85], [1, '#ff9d3a', 0]]) + lg('b', [[0, '#a5833f'], [1, '#4c3a1e']])
  + '<clipPath id="w"><circle cx="180" cy="104" r="66"/></clipPath>',
  rect(0, 0, 360, 490, 'url(#wl)') + `<g transform="translate(0 -96)">${shelf(61, 8, 80)}${shelf(67, 272, 80)}</g>`
  + `<g transform="translate(0 42)"><g clip-path="url(#w)">${rect(110, 34, 140, 140, 'url(#sky)')}${ell(208, 76, 36, 36, 'url(#moon)')}${ridge(83, 150, 22, 180, '#2c3b55')}`
  + [[136, 1], [160, 0], [222, 1]].map(([x, b]) => line(`M${x} 180Q${x + 5} 110 ${x - 2} 34`, C.pine, 3.6) + [60, 88, 116, 142].map((y, i) => path(`M${x} ${y}q${b ? 20 : -20} ${-7 + i} ${b ? 34 : -34} 7q${b ? -20 : 20} ${-2 + i} ${b ? -34 : 34} -7Z`, C.pine)).join('')).join('')
  + `</g><circle cx="180" cy="104" r="66" fill="none" stroke="${C.wood}" stroke-width="9"/><circle cx="180" cy="104" r="71" fill="none" stroke="${C.gold}" stroke-width="1.4"/>`
  + line('M180 38V170M114 104H246M133 57Q180 104 227 57M133 151Q180 104 227 151', C.wood, 2.1) + '</g>'
  + ell(180, 216, 96, 96, 'url(#rim)')
  + path('M14 300H346L374 500H-14Z', 'url(#desk)') + rect(10, 298, 340, 3, C.gold, 'opacity=".75"')
  + `<g transform="translate(60 -160)">${path('M274 460Q294 448 314 460L308 472H280Z', 'url(#b)')}${rect(290, 424, 8, 36, 'url(#b)')}${path('M274 424Q294 436 314 424L308 414H280Z', 'url(#b)')}${rect(291, 402, 6, 12, '#e8ddc1')}${ell(294, 386, 16, 26, 'url(#f)')}${ell(294, 392, 3, 9, '#fff9e2')}</g>`,
).replace('0 0 360 640', '0 0 360 490').replace('xMidYMid', 'xMidYMax');
const obj = (defs, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 72">${defs ? `<defs>${defs}</defs>` : ''}${body}</svg>`;
const shadow = (cx, cy, rx) => ell(cx, cy, rx, rx * 0.2, '#000', 'opacity=".4"');
layers['obj-laso'] = obj(
  lg('p', [[0, '#f1e6c9'], [1, '#cdbb93']]),
  shadow(48, 62, 38) + path('M16 12L80 8L86 60L10 64Z', 'url(#p)', `stroke="${C.gold}" stroke-width="1"`)
  + line('M32 11L28 63M48 10L48 62M64 9L68 61M14 25L82 21M12 38L84 34M11 51L85 47', C.red, 0.9, 'opacity=".7"')
  + path('M32 24L64 22L66 47L30 49Z', '#e6d5ae') + line('M38 30H58M38 36H58M38 42H52', C.red, 1, 'opacity=".6"'),
);
layers['obj-thetre'] = obj(
  lg('b', [[0, '#d9c078'], [1, '#8f7a3a']], 0, 1),
  shadow(48, 64, 34) + [[-24, 24], [-8, 40], [8, 56], [24, 72]].map(([a, x]) => `<g transform="rotate(${a / 3} ${x} 62)">${rect(x - 6, 8, 12, 54, 'url(#b)', 'rx="2"')}${rect(x - 6, 14, 12, 1.4, '#6b5a2a')}${rect(x - 6, 54, 12, 1.4, '#6b5a2a')}${line(`M${x} 22V48`, C.red, 1.6, 'stroke-dasharray="3 4"')}</g>`).join(''),
);
const coin = (x, y) => ell(x, y, 12, 11, '#b88f3e', `stroke="#6e5420" stroke-width="1.2"`) + ell(x, y, 8.6, 7.8, 'none', `stroke="#6e5420" stroke-width=".8"`) + rect(x - 3, y - 3, 6, 6, '#3a2318');
layers['obj-xu'] = obj(
  lg('t', [[0, '#7c6a42'], [1, '#3b2f1c']]),
  shadow(48, 64, 40) + path('M12 44C14 18 46 10 62 22C72 30 74 42 74 50C60 58 26 58 12 44Z', 'url(#t)', 'stroke="#27200f" stroke-width="1"')
  + line('M30 22L24 48M46 17L44 54M60 22L62 52M18 34L68 36', '#27200f', 1, 'opacity=".7"')
  + coin(44, 56) + coin(66, 52) + coin(78, 62),
);
layers['obj-laban'] = obj(
  lg('w', [[0, '#8a5a35'], [1, '#42281a']]) + lg('f', [[0, '#efe2c2'], [1, '#c2ad82']]),
  shadow(48, 64, 34) + ell(48, 36, 34, 30, 'url(#w)', `stroke="${C.gold}" stroke-width="1.2"`) + ell(48, 36, 25, 22, 'url(#f)', 'stroke="#6e5420" stroke-width=".8"')
  + line('M48 15V21M48 51V57M24 36H30M66 36H72M31 21L35 25M65 21L61 25M31 51L35 47M65 51L61 47', '#5a3b22', 1.3)
  + path('M48 22L52 36L48 50L44 36Z', C.red) + path('M48 36L52 36L48 50L44 36Z', '#23304a') + ell(48, 36, 2.2, 2, C.gold),
);
layers['obj-sach'] = obj(
  lg('c', [[0, '#3f5478'], [1, '#232f4a']]),
  shadow(48, 64, 38) + path('M14 16L78 10L84 54L18 60Z', '#d9ccae') + path('M12 12L76 6L82 50L16 56Z', 'url(#c)', `stroke="${C.gold}" stroke-width=".8"`)
  + line('M22 12L26 55M16 22L26 21M18 34L27 33M18 46L28 45', C.goldHi, 1) + path('M44 18L66 16L68 28L46 30Z', '#e8dcc0'),
);
layers['obj-so'] = obj(
  lg('c', [[0, C.redHi], [1, '#5c1a15']]) + lg('p', [[0, '#f3e8cc'], [1, '#d3c29c']]),
  shadow(48, 64, 40) + path('M8 14L48 18L88 12V58L48 64L8 60Z', 'url(#c)') + path('M12 12L48 16V60L12 56Z', 'url(#p)') + path('M84 10L48 16V60L84 54Z', 'url(#p)')
  + line('M18 22L42 24M18 30L42 32M18 38L42 40M54 24L78 20M54 32L78 28M54 40L78 36', '#8c7d62', 1, 'opacity=".6"') + rect(47, 16, 2, 44, C.gold) + path('M62 16V38L66 34L70 38V14Z', C.red),
);

layers['obj-chitay'] = obj(
  lg('s', [[0, '#e9c9a0'], [1, '#b98b62']]) + rg('f', [[0, '#fff7d8', 1], [0.5, '#ffc05c', 0.85], [1, '#ff9d3a', 0]]) + lg('b', [[0, '#a5833f'], [1, '#4c3a1e']]),
  shadow(44, 64, 38) + ell(66, 28, 22, 22, 'url(#f)', 'opacity=".55"')
  // bàn tay ngửa: lòng bàn tay, năm ngón, ba nét chỉ
  + path('M14 56C10 44 12 30 20 26L24 34L26 16C27 12 32 12 32 16L33 30L36 10C37 6 42 6 42 10L42 30L46 14C47 10 52 11 51 15L49 34L55 24C57 21 61 23 59 27L54 42C52 52 46 60 36 62C26 63 17 61 14 56Z', 'url(#s)', 'stroke="#6b4a2a" stroke-width="1"')
  + line('M24 38C30 40 38 42 46 40M22 46C28 50 36 54 42 56M32 34C32 42 34 52 36 60', '#8a4a2a', 1.1, 'opacity=".75"')
  // đèn dầu bên phải
  + path('M62 56Q74 48 86 56L82 66H66Z', 'url(#b)') + rect(72, 40, 4, 16, 'url(#b)') + ell(74, 34, 6, 9, 'url(#f)') + ell(74, 36, 1.6, 4, '#fff9e2'),
);

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
let total = 0;
for (const [name, body] of Object.entries(layers)) { writeFileSync(`${OUT}/${name}.svg`, body); total += body.length; }
console.log(`${Object.keys(layers).length} file, ${Math.round(total / 1024)} KB`);
