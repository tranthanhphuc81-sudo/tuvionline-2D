/* Người đọc ở Tĩnh thất: một bộ khung, nhiều nhân vật (danh sách và tên ở src/content/reader/personas.ts).
   Màu áo đặt tên `robe`, `robeHi`, `robeFold` để app đổi màu lúc chạy (Character.tsx), không phải sinh mỗi màu một file.
   Thứ tự trong một nhóm Lottie: phần tử đầu nằm trên cùng. Giữ đúng tinh thần build-characters.mjs: mắt nhắm hiền, không cử động miệng. */

export function personaArt(h) {
  const { fixed, fill, stroke, tr, curve, pen, dot, layer, sleeve, tilt, breathe } = h;
  const named = (paint, nm) => ({ ...paint, nm });
  const ROBE = ['#2f3556', '#454c78', '#232845'];
  const group = (pts, paint) => ({ ty: 'gr', it: [curve(pts), paint, tr()] });
  const bar = (x, y, w, hgt, c) => ({ ty: 'gr', it: [{ ty: 'rc', p: fixed([x, y]), s: fixed([w, hgt]), r: fixed(hgt / 2) }, fill(c), tr()] });

  function headParts(o) {
    const { skin, hair } = o;
    const eyes = [pen([[89, 80], [93, 83], [97, 80]], '#6a4f3c', 1.8), pen([[107, 80], [111, 83], [115, 80]], '#6a4f3c', 1.8)];
    const brows = o.brow ? [pen([[86, 72], [93, 69], [98, 72]], o.brow, o.browW ?? 2.6), pen([[106, 72], [111, 69], [118, 72]], o.brow, o.browW ?? 2.6)] : [];
    const mouth = o.smile ? [pen([[97, 96], [102, 98.5], [107, 96]], '#a8604c', 1.5)] : [];
    const cheeks = o.blush ? [dot(85, 90, 10, 6, '#eda692', 45), dot(119, 90, 10, 6, '#eda692', 45)] : [];
    const lines = o.wrinkle ? [pen([[80, 84], [83, 87]], '#b48a6a', 1), pen([[124, 84], [121, 87]], '#b48a6a', 1), pen([[92, 64], [112, 64]], '#c9a07e', 0.9, 70)] : [];
    let beard = [];
    if (o.beard === 'long') beard = [
      group([[84, 92], [91, 90], [102, 92], [113, 90], [120, 92], [118, 116], [111, 140], [102, 160], [93, 140], [86, 116]], fill(o.beardC)),
      pen([[94, 104], [97, 128]], '#c8c2b4', 1.2), pen([[110, 104], [107, 128]], '#c8c2b4', 1.2)];
    if (o.beard === 'short') beard = [pen([[92, 94], [102, 92], [112, 94]], o.beardC, 2.4),
      group([[86, 92], [94, 94], [102, 96], [110, 94], [118, 92], [116, 104], [102, 114], [88, 104]], fill(o.beardC))];
    if (o.beard === 'goatee') beard = [pen([[90, 93], [97, 92]], o.beardC, 2), pen([[107, 92], [114, 93]], o.beardC, 2),
      group([[96, 98], [102, 99], [108, 98], [106, 124], [102, 134], [98, 124]], fill(o.beardC))];
    const faceShape = o.hairStyle === 'bald'
      ? [[78, 80], [80, 58], [102, 46], [124, 58], [126, 80], [122, 100], [102, 108], [82, 100]]
      : [[78, 80], [84, 60], [102, 54], [120, 60], [126, 80], [122, 100], [102, 108], [82, 100]];
    const face = group(faceShape, fill(skin));
    let top = [], back = [];
    switch (o.hairStyle) {
      case 'topknot': // tóc búi trên đỉnh, có dải buộc
        top = [bar(102, 37, 30, 3, o.trim), group([[92, 46], [94, 32], [102, 28], [110, 32], [112, 46], [102, 49]], fill(hair)),
          group([[76, 76], [84, 52], [102, 46], [120, 52], [128, 76], [120, 62], [102, 58], [84, 62]], fill(hair))];
        break;
      case 'bald': // đầu cạo, chỉ có ánh sáng trên đỉnh
        top = [dot(96, 60, 14, 7, '#ffffff', 25)];
        break;
      case 'khan': // khăn đóng
        top = [pen([[80, 60], [124, 60]], '#3b3f4a', 1.4, 80), pen([[80, 54], [124, 54]], '#3b3f4a', 1.4, 80),
          group([[74, 70], [76, 52], [102, 42], [128, 52], [130, 70], [120, 64], [102, 62], [84, 64]], fill('#1f2229')),
          group([[76, 76], [80, 64], [86, 70], [84, 80]], fill(hair)), group([[128, 76], [124, 64], [118, 70], [120, 80]], fill(hair))];
        break;
      case 'daoHat': // mũ đạo sĩ có thanh trâm ngang
        top = [bar(102, 30, 40, 3, o.trim), group([[90, 46], [92, 26], [102, 22], [112, 26], [114, 46]], fill('#26211f')),
          group([[76, 76], [84, 52], [102, 46], [120, 52], [128, 76], [120, 62], [102, 58], [84, 62]], fill(hair))];
        break;
      case 'bunLow': // tóc nữ búi sau gáy, trâm cài
        top = [pen([[118, 52], [134, 40]], o.trim, 2.2), dot(134, 40, 5, 5, o.trim),
          group([[74, 84], [78, 54], [102, 44], [126, 54], [130, 84], [122, 66], [104, 58], [86, 62], [80, 74]], fill(hair))];
        back = [dot(124, 62, 30, 26, hair)];
        break;
      case 'bunWhite': // bà cụ: tóc bạc búi tó
        top = [pen([[86, 54], [102, 50], [118, 54]], '#b9b3a6', 1, 70),
          group([[74, 82], [78, 54], [102, 44], [126, 54], [130, 82], [122, 64], [102, 58], [82, 64]], fill(hair))];
        back = [dot(102, 44, 30, 22, hair)];
        break;
      case 'nunHood': // sư cô: khăn trùm đầu cùng màu áo
        top = [group([[70, 104], [70, 66], [80, 46], [102, 38], [124, 46], [134, 66], [134, 104], [124, 80], [124, 62], [102, 52], [80, 62], [80, 80]], named(fill(ROBE[1]), 'robeHi'))];
        break;
      case 'long': // tóc dài thả, có mái
        top = [group([[76, 74], [82, 52], [102, 44], [122, 52], [128, 74], [118, 60], [106, 64], [96, 58], [86, 64]], fill(hair))];
        back = [group([[70, 70], [74, 46], [102, 36], [130, 46], [134, 70], [138, 132], [124, 142], [126, 96], [78, 96], [80, 142], [66, 132]], fill(hair))];
        break;
    }
    return [...eyes, ...mouth, ...cheeks, ...brows, ...lines, ...beard, ...top, face, ...back];
  }

  function master(o) {
    const robeHi = () => named(fill(ROBE[1]), 'robeHi');
    const fold = (pts) => ({ ty: 'gr', it: [curve(pts, false), named(stroke(ROBE[2], 2), 'robeFold'), tr()] });
    const beads = o.beads ? Array.from({ length: 9 }, (_, i) => dot(86 + i * 4, 128 + Math.sin((i / 8) * Math.PI) * 14, 5, 5, '#6b3f22')) : [];
    const collar = o.collar === 'cross'
      ? [pen([[84, 112], [104, 140]], o.trim, 2.4), pen([[120, 112], [100, 140]], o.trim, 2.4)]
      : [pen([[86, 112], [100, 136], [118, 112]], o.trim, 2.6)];
    const body = o.slim
      ? [[86, 110], [118, 110], [140, 126], [156, 172], [164, 226], [40, 226], [48, 172], [64, 126]]
      : [[84, 108], [120, 108], [146, 124], [164, 170], [172, 226], [32, 226], [40, 170], [58, 124]];
    return [
      layer(1, 'tay áo phải', { p: sleeve, a: fixed([0, 0, 0]) }, [
        group([[150, 150], [172, 176], [176, 212], [150, 220], [128, 206], [130, 170]], robeHi()),
        dot(146, 216, 20, 13, o.skin),
      ], 3),
      layer(2, 'đầu', { p: fixed([100, 112, 0]), a: fixed([100, 112, 0]), r: tilt }, headParts(o), 3),
      layer(3, 'thân', { p: fixed([100, 220, 0]), a: fixed([100, 220, 0]), s: breathe }, [
        ...beads,
        ...collar,
        pen([[102, 136], [102, 220]], o.trim, 1.6, 70),
        fold([[66, 170], [70, 220]]), fold([[136, 160], [132, 220]]),
        group(body, named(fill(ROBE[0]), 'robe')),
        group([[50, 150], [30, 180], [28, 214], [54, 222], [74, 204], [72, 168]], robeHi()),
        dot(56, 216, 20, 13, o.skin),
        dot(100, 104, 26, 14, o.shade),
      ]),
    ];
  }

  const SKIN = { old: ['#e3bf9a', '#c79f7c'], mid: ['#e6c19c', '#c9a17e'], young: ['#efcaa6', '#d2a985'] };
  const GOLD = '#d7b571';
  /** Mỗi nhân vật: tên file → tham số vẽ. 'thay' giữ tên cũ làm mặc định. */
  const ART = {
    thay: { skin: SKIN.old[0], shade: SKIN.old[1], hair: '#d8d3c6', hairStyle: 'topknot', brow: '#ece7dc', browW: 3.2, beard: 'long', beardC: '#ece7dc', trim: GOLD, wrinkle: true },
    'thay-trung': { skin: SKIN.mid[0], shade: SKIN.mid[1], hair: '#8a857c', hairStyle: 'topknot', brow: '#4a4038', beard: 'short', beardC: '#6f6a62', trim: GOLD },
    'thay-tre': { skin: SKIN.young[0], shade: SKIN.young[1], hair: '#2a1f1c', hairStyle: 'topknot', brow: '#2a1f1c', trim: '#efe4c6', smile: true },
    'ong-do': { skin: SKIN.old[0], shade: SKIN.old[1], hair: '#d8d3c6', hairStyle: 'khan', brow: '#ece7dc', browW: 3, beard: 'goatee', beardC: '#ece7dc', trim: GOLD, wrinkle: true, collar: 'cross' },
    'dao-si': { skin: SKIN.mid[0], shade: SKIN.mid[1], hair: '#2c2623', hairStyle: 'daoHat', brow: '#2c2623', beard: 'long', beardC: '#3a3330', trim: GOLD, collar: 'cross' },
    su: { skin: SKIN.mid[0], shade: SKIN.mid[1], hair: '#000', hairStyle: 'bald', brow: '#5a4a3e', browW: 2, trim: '#8d561c', beads: true, collar: 'cross', smile: true },
    'co-do': { skin: SKIN.mid[0], shade: SKIN.mid[1], hair: '#2a1f1c', hairStyle: 'bunLow', brow: '#3a2a22', browW: 1.8, trim: GOLD, slim: true, smile: true, blush: true },
    'ba-cu': { skin: SKIN.old[0], shade: SKIN.old[1], hair: '#dcd7cc', hairStyle: 'bunWhite', brow: '#cfc9bd', browW: 2, trim: GOLD, slim: true, wrinkle: true, smile: true },
    'su-co': { skin: SKIN.young[0], shade: SKIN.young[1], hair: '#000', hairStyle: 'nunHood', brow: '#5a4a3e', browW: 1.6, trim: '#cfd5dd', slim: true, beads: true, smile: true },
    'co-tre': { skin: SKIN.young[0], shade: SKIN.young[1], hair: '#231915', hairStyle: 'long', brow: '#2a1f1c', browW: 1.6, trim: '#efe4c6', slim: true, smile: true, blush: true },
  };
  return Object.entries(ART).map(([id, o]) => [id, master(o)]);
}
