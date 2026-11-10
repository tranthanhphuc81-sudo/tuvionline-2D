/* Xem chỉ tay: dữ liệu câu chữ, bộ câu hỏi, phép đo từ nét và luận giải (PROMPT-KIT-CHI-TAY 3B.2, mục (a)–(i)). */
import { describe, expect, it } from 'vitest';
import { analyzePalm, diffHands, measureHand, measureLines, measuresToAnswers, printReading, TOPIC_MAX, type FingerPrint, type PalmInput, type PalmMeta, type PalmPt } from '../src/core';
import { NEUTRAL_VALUES, PALM_QUESTIONS, mountAnswer } from '../src/content/palm/questions';
import { PALM_READINGS, PALM_TTS_FORBIDDEN, getReading, palmMetas, palmView, topicLine } from '../src/content/palm';
import handsJson from './fixtures/palm/hands.json';

const hands = handsJson as unknown as { name: string; input: PalmInput }[];
const metas = palmMetas();
const ids = new Set(PALM_READINGS.map((r) => r.id));

describe('Dữ liệu câu chữ và câu hỏi', () => {
  it('(a) mọi lựa chọn trong bộ câu hỏi trỏ tới mã có trong dữ liệu, trừ mã trung tính', () => {
    for (const q of PALM_QUESTIONS) for (const op of q.options) {
      if (NEUTRAL_VALUES.has(op.value)) continue;
      expect(ids.has(op.value), `${q.id} → ${op.value}`).toBe(true);
    }
    for (const m of ['kim', 'moc', 'tho', 'thaiduong', 'thuy', 'thaiam', 'hoaduong', 'hoaam']) {
      const id = mountAnswer(m, 'noi');
      expect(id && ids.has(id)).toBe(true);
    }
  });

  it('(b) không câu nào quá 180 ký tự; câu Thầy đọc không chứa từ cấm đọc', () => {
    const forbidden = new RegExp(`(?<![\\p{L}\\p{N}])(?:${PALM_TTS_FORBIDDEN.join('|')})(?![\\p{L}\\p{N}])`, 'iu');
    for (const r of PALM_READINGS) {
      expect(r.text.length, r.id).toBeLessThanOrEqual(180);
      if (r.tts) expect(forbidden.test(r.text), r.id).toBe(false);
    }
  });

  it('(c) không mã nào trùng; mọi câu có nguồn sách, trừ TT03', () => {
    expect(ids.size).toBe(PALM_READINGS.length);
    for (const r of PALM_READINGS) if (r.id !== 'TT03') expect(r.sources.length, r.id).toBeGreaterThan(0);
  });

  it('(g) câu lưu ý không chứa con số tuổi', () => {
    for (const r of PALM_READINGS) if (r.tone === '!') expect(/\d/.test(r.text), r.id).toBe(false);
  });

  it('câu hỏi nào cũng có mã riêng; câu do máy đo có đủ lựa chọn cho mọi kết quả đo', () => {
    expect(new Set(PALM_QUESTIONS.map((q) => q.id)).size).toBe(PALM_QUESTIONS.length);
    const measured = new Map(PALM_QUESTIONS.map((q) => [q.id, new Set(q.options.map((o) => o.value))]));
    const all = { landmarks: HAND, lines: { sinh: SINH, tri: TRI, tam: TAM, dinh: DINH }, breaks: { sinh: 1, tri: 1, dinh: 1 }, minor: 0.2 };
    for (const m of [...measureHand(HAND), ...measureLines(all), ...measureLines({ ...all, breaks: {}, strength: { sinh: 0.3 }, minor: 0 })]) {
      expect(measured.has(m.q), m.q).toBe(true);
      if (m.id) expect(measured.get(m.q)!.has(m.id), `${m.q} → ${m.id}`).toBe(true);
    }
  });
});

describe('(d) Vân tay', () => {
  const kinds = (loops: number[]): FingerPrint[] => [0, 1, 2, 3, 4].map((i) => (loops.includes(i) ? 'loop' : 'whorl'));
  const SETS = [[0], [1], [2], [3], [4], [1, 2, 3], [1, 2, 4], [0, 2, 4], [0, 2, 3], [0, 1, 4], [0, 1, 3], [1, 3, 4], [0, 3, 4], [2, 3, 4], [0, 1, 2]];

  it('30 tổ hợp trả đúng V01–V30', () => {
    SETS.forEach((set, i) => {
      expect(printReading(kinds(set))).toBe(`V${String(i + 1).padStart(2, '0')}`);
      const whorls = [0, 1, 2, 3, 4].filter((f) => !set.includes(f));
      // Đổi vai: ngón trong `set` là vân xoáy, còn lại móng thú
      expect(printReading([0, 1, 2, 3, 4].map((f) => (set.includes(f) ? 'whorl' : 'loop')))).toBe(`V${String(i + 16).padStart(2, '0')}`);
      expect(whorls.length).toBe(5 - set.length);
    });
  });

  it('có vân cung, toàn một loại hoặc thiếu ngón thì rơi về P01–P03 hoặc không tra', () => {
    expect(printReading(['arch', 'loop', 'loop', 'whorl', 'loop'])).toBe('P03');
    expect(printReading(['loop', 'loop', 'loop', 'loop', 'loop'])).toBe('P01');
    expect(printReading(['whorl', 'whorl', 'whorl', 'whorl', 'whorl'])).toBe('P02');
    expect(printReading(['loop', null, 'loop', 'loop', 'loop'])).toBeNull();
    expect(printReading(undefined)).toBeNull();
  });

  it('mã chưa đối chiếu xong (V19) không vào kết quả', () => {
    const r = analyzePalm({ dominant: 'right', method: 'dominant', current: { answers: {}, prints: ['loop', 'loop', 'loop', 'whorl', 'loop'] } }, metas);
    expect(printReading(['loop', 'loop', 'loop', 'whorl', 'loop'])).toBe('V19');
    expect(r.sections.flatMap((s) => s.ids)).not.toContain('V19');
  });
});

describe('Luận giải', () => {
  const meta = (id: string, tone: '+' | '=' | '!', weight: 1 | 2 | 3 = 2): PalmMeta => ({ id, group: 'hand', topics: ['tc'], tone, weight });
  const one = (catalog: PalmMeta[], picks: string[]) => analyzePalm({ dominant: 'right', method: 'dominant', current: { answers: { x: picks } } }, catalog).byTopic.tc!;

  it('(e) một dấu hiệu là "có xu hướng", từ hai dấu hiệu cùng chiều là "rõ"', () => {
    const cat = [meta('A', '+'), meta('B', '+'), meta('C', '!'), meta('D', '!'), meta('E', '=')];
    expect(one(cat, ['A']).confidence).toBe('xu-huong');
    expect(one(cat, ['A', 'C']).confidence).toBe('xu-huong');
    expect(one(cat, ['A', 'E']).confidence).toBe('xu-huong');
    expect(one(cat, ['A', 'B']).confidence).toBe('ro');
    expect(one(cat, ['C', 'D']).confidence).toBe('ro');
    expect(topicLine('Thực tế, ngăn nắp.', 'xu-huong')).toBe('Có xu hướng thực tế, ngăn nắp.');
  });

  it('(f) chủ đề nào có câu thuận hoặc trung tính thì phần tổng kết có ít nhất một câu như thế, tối đa 3 câu', () => {
    const cat = [meta('A', '!', 3), meta('B', '!', 3), meta('C', '!', 3), meta('D', '=', 1)];
    const t = one(cat, ['A', 'B', 'C', 'D']);
    expect(t.ids).toHaveLength(TOPIC_MAX);
    expect(t.ids).toContain('D');
    for (const h of hands) {
      const res = analyzePalm(h.input, metas);
      const all = res.sections.flatMap((s) => s.ids);
      for (const [topic, sum] of Object.entries(res.byTopic)) {
        expect(sum!.ids.length).toBeLessThanOrEqual(TOPIC_MAX);
        const calmExists = all.some((id) => { const r = getReading(id)!; return r.topics.includes(topic as never) && r.tone !== '!'; });
        if (calmExists) expect(sum!.ids.some((id) => getReading(id)!.tone !== '!'), `${h.name} / ${topic}`).toBe(true);
      }
    }
  });

  it('(h) cùng đầu vào luôn cùng kết quả, thứ tự câu trả lời không ảnh hưởng', () => {
    const input = hands[0].input;
    const reversed: PalmInput = { ...input, current: { answers: Object.fromEntries(Object.entries(input.current.answers).reverse()) } };
    expect(analyzePalm(input, metas)).toEqual(analyzePalm(input, metas));
    expect(analyzePalm(reversed, metas)).toEqual(analyzePalm(input, metas));
  });

  it('mã trung tính, "Không rõ" và mã lạ không sinh câu luận', () => {
    const r = analyzePalm({ dominant: 'right', method: 'dominant', current: { answers: { a: 'vua', b: null, c: 'XYZ', d: 'can-doi' } } }, metas);
    expect(r.sections).toEqual([]);
    expect(r.byTopic).toEqual({});
  });

  it('xếp đúng mục: đường chính, đường phụ, gò và dấu', () => {
    const r = analyzePalm(hands[3].input, metas);
    const at = Object.fromEntries(r.sections.map((s) => [s.key, s.ids]));
    expect(at['duong-chinh']).toContain('SD09');
    expect(at['go-dau']).toContain('G-moc.star');
    expect(at['ngon']).toContain('V16');
    // Ô ma trận không có dữ liệu (gò Khảm) thì bỏ qua, không bịa câu
    expect(r.sections.flatMap((s) => s.ids).some((id) => id.startsWith('G-kham'))).toBe(false);
  });

  it('so sánh hai tay: chung, đang phát triển, tiềm năng', () => {
    const r = analyzePalm(hands[3].input, metas);
    expect(r.compare!.steady).toEqual(expect.arrayContaining(['H02', 'TD03']));
    expect(r.compare!.latent).toEqual(expect.arrayContaining(['SD02']));
    for (const id of r.compare!.growing) expect(getReading(id)!.tone).toBe('+');
    expect(analyzePalm(hands[0].input, metas).compare).toBeUndefined();
  });

  it('(i) 5 bàn tay mẫu cho ra kết quả không đổi', () => {
    for (const h of hands) {
      const res = analyzePalm(h.input, metas);
      const view = palmView(res);
      expect(view.opening).toMatch(/tham khảo/);
      expect(view.closing).toMatch(/6–12 tháng/);
      expect({ name: h.name, res, topics: view.topics.map((t) => [t.topic, t.confidence, t.lines]) }).toMatchSnapshot();
    }
  });
});

/* Bàn tay giả trong khung xem: cổ tay ở dưới, ngón cái bên trái. Toạ độ 0…1. */
const P = (x: number, y: number): PalmPt => ({ x, y });
const HAND: PalmPt[] = [
  P(0.5, 0.95), P(0.35, 0.85), P(0.25, 0.72), P(0.17, 0.62), P(0.1, 0.52),
  P(0.3, 0.45), P(0.28, 0.32), P(0.27, 0.24), P(0.26, 0.16),
  P(0.45, 0.42), P(0.45, 0.28), P(0.45, 0.19), P(0.45, 0.1),
  P(0.58, 0.44), P(0.6, 0.31), P(0.61, 0.23), P(0.62, 0.15),
  P(0.7, 0.5), P(0.73, 0.4), P(0.75, 0.33), P(0.77, 0.26),
];
const line = (...pts: [number, number][]) => pts.map(([x, y]) => P(x, y));
const SINH = line([0.27, 0.52], [0.36, 0.6], [0.45, 0.7], [0.44, 0.82], [0.42, 0.92]);
const TRI = line([0.27, 0.52], [0.4, 0.53], [0.55, 0.55], [0.68, 0.56]);
const TAM = line([0.78, 0.52], [0.6, 0.48], [0.45, 0.47], [0.38, 0.46]);
const DINH = line([0.47, 0.5], [0.48, 0.7], [0.5, 0.92]);
const measure = (lines: Parameters<typeof measureLines>[0]['lines']) => measuresToAnswers(measureLines({ landmarks: HAND, lines }));

describe('Đo từ nét đã xác nhận', () => {
  it('Sinh đạo: cong rộng, vừa, ôm sát theo đường cổ tay – ngón giữa', () => {
    expect(measure({ sinh: SINH }).Q17).toBe('vua');
    expect(measure({ sinh: line([0.27, 0.52], [0.48, 0.7], [0.42, 0.92]) }).Q17).toBe('SD02');
    expect(measure({ sinh: line([0.27, 0.52], [0.3, 0.7], [0.33, 0.92]) }).Q17).toBe('SD03');
  });

  it('đầu Sinh đạo và Trí đạo: dính hay tách', () => {
    expect(measure({ sinh: SINH, tri: TRI }).Q20).toBe('TD15');
    expect(measure({ sinh: SINH, tri: line([0.33, 0.47], [0.5, 0.5], [0.68, 0.56]) }).Q20).toBe('TD16');
  });

  it('Trí đạo: hướng và độ dài theo đường ảo, vẽ chiều nào cũng như nhau', () => {
    const a = measure({ tri: TRI });
    expect([a['Q21-huong'], a['Q21-dai']]).toEqual(['TD03', 'TD05']);
    expect(measure({ tri: [...TRI].reverse() })).toEqual(a);
    expect(measure({ tri: line([0.28, 0.53], [0.68, 0.53]) })['Q21-huong']).toBe('TD02');
    expect(measure({ tri: line([0.28, 0.53], [0.45, 0.62], [0.6, 0.75]) })['Q21-huong']).toBe('TD04');
    expect(measure({ tri: line([0.28, 0.53], [0.55, 0.55]) })['Q21-dai']).toBe('TD06');
    expect(measure({ tri: line([0.28, 0.53], [0.42, 0.54]) })['Q21-dai']).toBe('TD07');
  });

  it('Tâm đạo: nơi dừng phía ngón trỏ', () => {
    expect(measure({ tam: TAM }).Q23).toBe('TAM01');
    expect(measure({ tam: line([0.78, 0.52], [0.5, 0.47], [0.2, 0.47]) }).Q23).toBe('TAM03');
    expect(measure({ tam: line([0.78, 0.52], [0.6, 0.48], [0.52, 0.46]) }).Q23).toBe('TAM04');
    expect(measure({ tam: line([0.78, 0.52], [0.5, 0.45], [0.33, 0.4]) }).Q23).toBe('TAM02');
  });

  it('Định mạng: nơi bắt đầu', () => {
    expect(measure({ sinh: SINH, dinh: line([0.47, 0.5], [0.44, 0.82]) }).Q25).toBe('DM03');
    expect(measure({ dinh: DINH }).Q25).toBe('DM02');
    expect(measure({ dinh: line([0.47, 0.4], [0.5, 0.6]) }).Q25).toBe('DM07');
    expect(measure({ dinh: line([0.47, 0.45], [0.45, 0.79]) }).Q25).toBe('DM06');
    expect(measure({ dinh: line([0.6, 0.45], [0.7, 0.79]) }).Q25).toBe('DM04');
    expect(measure({ dinh: line([0.4, 0.45], [0.25, 0.79]) }).Q25).toBe('DM05');
  });

  it('đường vẽ thành nhiều đoạn rời thì điền sẵn "Đứt" cho Sinh đạo, Trí đạo, Định mạng', () => {
    const a = measure({ sinh: SINH, tri: TRI, tam: TAM, dinh: DINH });
    for (const q of ['Q18', 'Q22', 'Q26']) expect(a[q]).toBeUndefined();
    const cut = measuresToAnswers(measureLines({ landmarks: HAND, lines: { sinh: SINH, tri: TRI, tam: TAM, dinh: DINH }, breaks: { sinh: 1, tri: 2, tam: 1, dinh: 1 } }));
    expect([cut.Q18, cut.Q22, cut.Q26]).toEqual(['SD06', 'TD19', 'DM09']);
    // không có đường thì không điền; số chỗ đứt 0 thì không điền
    expect(cut.Q24).toBe('TAM06'); // Tâm đạo đứt chưa có câu riêng, ở đây chỉ là "gần như thẳng"
    const none = measuresToAnswers(measureLines({ landmarks: HAND, lines: { sinh: SINH }, breaks: { sinh: 0, tri: 1 } }));
    expect([none.Q18, none.Q22]).toEqual([undefined, undefined]);
  });

  it('độ đậm rãnh Sinh đạo: rõ, mờ, hoặc để người dùng chọn; đứt thì ưu tiên "Đứt"', () => {
    const q18 = (strength: number, breaks = 0) => measuresToAnswers(measureLines({ landmarks: HAND, lines: { sinh: SINH }, strength: { sinh: strength }, breaks: { sinh: breaks } })).Q18;
    expect(q18(1.8)).toBe('SD01');
    expect(q18(0.4)).toBe('SD04');
    expect(q18(1)).toBeUndefined();
    expect(q18(1.8, 1)).toBe('SD06');
  });

  it('độ cong: Trí đạo uốn lượn, Tâm đạo thẳng, Định mạng thẳng dài, lên gò Thổ hay hơi cong', () => {
    const wavy = line([0.28, 0.53], [0.33, 0.5], [0.38, 0.56], [0.43, 0.5], [0.48, 0.56], [0.53, 0.5], [0.58, 0.56], [0.63, 0.5], [0.68, 0.55]);
    expect(measure({ tri: wavy }).Q22).toBe('TD11');
    expect(measure({ tri: TRI }).Q22).toBeUndefined();
    expect(measure({ tam: line([0.78, 0.5], [0.6, 0.48], [0.4, 0.46]) }).Q24).toBe('TAM06');
    expect(measure({ tam: line([0.78, 0.52], [0.6, 0.42], [0.4, 0.5]) }).Q24).toBeUndefined();
    // Định mạng: tính từ cổ tay (0) lên hàng gốc ngón (1) theo trục cổ tay → gốc ngón giữa
    const up = (h: number, dx = 0) => P(HAND[0].x + (HAND[9].x - HAND[0].x) * h + dx, HAND[0].y + (HAND[9].y - HAND[0].y) * h);
    expect(measure({ dinh: [up(0.05), up(0.5), up(0.95)] }).Q26).toBe('DM01');
    expect(measure({ dinh: [up(0.4), up(0.7), up(0.95)] }).Q26).toBe('DM12');
    expect(measure({ dinh: [up(0.1), up(0.4, 0.06), up(0.7)] }).Q26).toBe('DM11');
    expect(measure({ dinh: [up(0.1), up(0.4), up(0.7)] }).Q26).toBeUndefined();
  });

  it('số chỉ nhỏ: ít, vừa, nhiều; không đo thì không điền', () => {
    const q32 = (minor?: number) => measuresToAnswers(measureLines({ landmarks: HAND, lines: {}, minor })).Q32;
    expect([q32(0.02), q32(0.08), q32(0.3), q32()]).toEqual(['C06', 'vua', 'C07', undefined]);
  });

  it('Q22 chọn nhiều: vừa đứt vừa uốn lượn thì gộp hai mã', () => {
    const wavy = line([0.28, 0.53], [0.33, 0.5], [0.38, 0.56], [0.43, 0.5], [0.48, 0.56], [0.53, 0.5], [0.58, 0.56], [0.63, 0.5], [0.68, 0.55]);
    expect(measuresToAnswers(measureLines({ landmarks: HAND, lines: { tri: wavy }, breaks: { tri: 1 } })).Q22).toEqual(['TD19', 'TD11']);
  });

  it('ngón cái dài, trung bình, ngắn theo đốt gốc ngón trỏ', () => {
    const q08 = (k: number) => {
      // Dời đầu ngón cái dọc trục bàn tay để chỗ "dựng thẳng" tới đúng tỉ lệ k trên đốt gốc ngón trỏ
      const base = measureHand(HAND).find((m) => m.q === 'Q08')!.value!;
      const palm = Math.hypot(HAND[9].x - HAND[0].x, HAND[9].y - HAND[0].y);
      const seg = ((HAND[6].x - HAND[0].x) * (HAND[9].x - HAND[0].x) + (HAND[6].y - HAND[0].y) * (HAND[9].y - HAND[0].y)) / palm ** 2
        - ((HAND[5].x - HAND[0].x) * (HAND[9].x - HAND[0].x) + (HAND[5].y - HAND[0].y) * (HAND[9].y - HAND[0].y)) / palm ** 2;
      const extra = (k - base) * seg * palm;
      const d = { x: HAND[4].x - HAND[3].x, y: HAND[4].y - HAND[3].y }, l = Math.hypot(d.x, d.y);
      const hand = HAND.map((p, i) => (i === 4 ? P(p.x + (d.x / l) * extra, p.y + (d.y / l) * extra) : p));
      return measureHand(hand).find((m) => m.q === 'Q08')!.id;
    };
    expect([q08(1), q08(0.4), q08(-0.2)]).toEqual(['F01', 'trung-binh', 'F02']);
  });

  it('nét thiếu thì không đoán; khớp tay đủ thì đo đủ 5 câu', () => {
    const none = measure({});
    for (const q of ['Q17', 'Q20', 'Q21-huong', 'Q21-dai', 'Q23', 'Q25']) expect(none[q]).toBeNull();
    expect(measureLines({ landmarks: HAND.slice(0, 10), lines: { sinh: SINH } })).toEqual([]);
    expect(measureHand(HAND).map((m) => m.q)).toEqual(['Q04', 'Q09', 'Q10', 'Q11', 'Q12', 'Q08']);
    expect(measureHand(HAND).every((m) => m.id !== null)).toBe(true);
  });

  it('đổi tỉ lệ hoặc dịch toàn bộ bàn tay không đổi kết quả', () => {
    const k = (pts: PalmPt[]) => pts.map((p) => P(p.x * 512 + 30, p.y * 512 - 12));
    const big = measureLines({ landmarks: k(HAND), lines: { sinh: k(SINH), tri: k(TRI), tam: k(TAM), dinh: k(DINH) } }).map((m) => m.id);
    const small = measureLines({ landmarks: HAND, lines: { sinh: SINH, tri: TRI, tam: TAM, dinh: DINH } }).map((m) => m.id);
    expect(big).toEqual(small);
    expect(measureHand(k(HAND)).map((m) => m.id)).toEqual(measureHand(HAND).map((m) => m.id));
  });
});

describe('So hai lần xem cùng một tay', () => {
  it('đặc điểm mới có và không còn thấy, theo thứ tự dữ liệu; câu "Không rõ" và mã trung tính không tính', () => {
    const metas = palmMetas();
    const older = { answers: { Q02: 'H01', Q17: 'SD02', Q20: 'TD16', Q09: null } };
    const newer = { answers: { Q02: 'H01', Q17: 'vua', Q20: 'TD15', Q23: 'TAM02' } };
    const d = diffHands(newer, older, metas);
    expect(d.removed).toEqual(['SD02', 'TD16'].filter((id) => metas.some((m) => m.id === id)));
    expect(d.added).toContain('TD15');
    expect(d.added).toContain('TAM02');
    expect(d.added).not.toContain('H01');
    expect(diffHands(older, older, metas)).toEqual({ added: [], removed: [] });
  });
});
