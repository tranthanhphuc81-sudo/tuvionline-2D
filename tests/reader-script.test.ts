/* Kịch bản Thầy đọc (ARCHITECTURE.md mục 12.6–12.8; các điều kiện a–e của Phase 6.5). */
import { describe, it, expect } from 'vitest';
import { analyzePalm, batTrachReading, castContext, castHexagram, profileSummary } from '../src/core';
import { PALM_TTS_FORBIDDEN, getReading, palmMetas, palmView, type PalmView } from '../src/content/palm/index';
import { PALM_QUESTIONS } from '../src/content/palm/questions';
import { palmScriptInput } from '../src/features/palm/script';
import { NO_SPEECH_TERMS, hasNoSpeech } from '../src/content/noSpeech';
import { CULTURE_LINE, DONG_LINES, LEADS, TOOL_LINES, allLines, fill } from '../src/content/reader/templates';
import { sectionsSpeech, speechOf } from '../src/content/speech';
import { batTrachTongKet } from '../src/content/battrach/tongket';
import { batTuTongKet } from '../src/content/battu/tongket';
import { lucHaoTongKet } from '../src/content/luchao/tongket';
import { tuViTongKet } from '../src/content/tuvi/tongket';
import { buildPalmScript, buildScript, laBanLead, xungHo, type Cue, type Who } from '../src/features/reader/script';

const YEAR = 2026;
const who: Who = { goi: 'con', third: false, name: 'An' };
const profile = (year: number, gender: 'M' | 'F' = 'M') => ({ calendar: 'solar' as const, day: 15, month: 6, year, leapMonth: false, hourIdx: 6, lateTy: false, name: 'An', gender });
const squash = (s: string) => s.replace(/\s+/g, '');

function summaryOf(year: number, gender: 'M' | 'F') {
  const r = profileSummary(profile(year, gender));
  if (!r.ok) throw new Error('hồ sơ mẫu sai');
  return r;
}

function scripts(): Cue[][] {
  const out: Cue[][] = [];
  for (const year of [1948, 1968, 1975, 1988, 1996, 2003]) {
    for (const gender of ['M', 'F'] as const) {
      const b = summaryOf(year, gender);
      out.push(buildScript('tuvi', who, { cells: [['Cục', 'Mộc Tam Cục']], sections: tuViTongKet(b.summary.tuvi.chart, YEAR) }));
      out.push(buildScript('battu', who, { sections: batTuTongKet(b.summary.battu.chart, YEAR) }));
      out.push(buildScript('battrach', who, { sections: batTrachTongKet(batTrachReading(b.birth.solar, gender)) }));
    }
  }
  return out;
}
const all = scripts();
const SOURCES = (() => {
  const b = summaryOf(1996, 'M');
  return [tuViTongKet(b.summary.tuvi.chart, YEAR), batTrachTongKet(batTrachReading(b.birth.solar, 'M'))];
})();

describe('kịch bản đọc', () => {
  it('(a) không cue nào dài quá 180 ký tự', () => {
    for (const s of all) for (const c of s) expect(c.text.length).toBeLessThanOrEqual(180);
  });

  it('(b) đoạn luận giải xuất hiện nguyên văn trong phụ đề', () => {
    for (const sections of SOURCES) {
      const caption = squash(buildScript('tuvi', who, { sections }).map((c) => (c.caption ?? '').replace(/\(Phần này .*?\)/g, '')).join(' '));
      expect(caption).toContain(squash(sectionsSpeech(sections)).replace(/\(Phần này .*?\)/g, ''));
    }
  });

  it('(c) không cue tiếng nào chứa từ cấm; câu bị lọc vẫn có phụ đề', () => {
    let silent = 0;
    for (const s of all) {
      for (const c of s) {
        expect(hasNoSpeech(c.text)).toBe(false);
        if (!c.text) { silent++; expect(c.caption).toContain('xem chữ trên màn hình'); }
      }
    }
    expect(silent).toBeGreaterThan(0);
  });

  it('(d) câu mở và câu kết luôn có lời nhắc văn hoá', () => {
    for (const s of all) {
      expect(s[0].caption).toContain(CULTURE_LINE);
      expect(s[s.length - 1].caption).toContain(CULTURE_LINE);
    }
  });

  it('mỗi công cụ có 3 câu mở, 3 câu kết đều có lời nhắc, ít nhất 2 lời dẫn', () => {
    for (const [tool, t] of Object.entries(TOOL_LINES)) {
      expect(t.open).toHaveLength(3);
      expect(t.close).toHaveLength(3);
      for (const l of [...t.open, ...t.close]) expect(l).toContain(CULTURE_LINE);
      expect(t.cells.length).toBeGreaterThanOrEqual(2);
      if (tool !== 'laban') expect(t.sections.length).toBeGreaterThanOrEqual(2);
    }
    for (const l of Object.values(LEADS)) expect(l.length).toBeGreaterThanOrEqual(2);
    for (const k of ['gate', 'corridor', 'intro', 'name', 'gender', 'date', 'hour'] as const) expect(DONG_LINES[k].length).toBeGreaterThan(0);
  });

  it('mẫu câu không dính từ cấm đọc, không còn biến chưa thay, không quá dài', () => {
    const vars = { goi: 'con', cuaAi: 'của con', ten: 'Lan', cung: 'Hợi', sao: ', có Tử Vi', nhatChu: 'Quý', hao: 3, huong: 'Đông Nam', sao2: '', duong: 'Sinh đạo' };
    for (const l of allLines()) {
      const s = fill(l, vars);
      expect(hasNoSpeech(s)).toBe(false);
      expect(s).not.toMatch(/[{}]/);
      expect(s.length).toBeLessThanOrEqual(180);
    }
  });

  it('{goi} đầu câu được viết hoa', () => {
    expect(fill('{goi} xem đây.', { goi: 'con' })).toBe('Con xem đây.');
    expect(fill('Thầy chào {goi}. {goi} ngồi đi.', { goi: 'chị' })).toBe('Thầy chào chị. Chị ngồi đi.');
  });

  it('biến thể nào cũng dựng được, kể cả người khác', () => {
    for (const seed of [0, 1, 2]) {
      const s = buildScript('tonghop', { goi: 'bạn', third: true, name: 'Lan' }, { sections: [] }, seed);
      expect(s.at(-1)?.gesture).toBe('nod');
      expect(s.map((c) => c.caption).join(' ')).not.toContain('{');
    }
  });

  it('id cue không trùng', () => {
    for (const s of all) expect(new Set(s.map((c) => c.id)).size).toBe(s.length);
  });

  it('hồ sơ người khác: thầy nói ngôi thứ ba', () => {
    for (const seed of [0, 1, 2]) {
      const [open] = buildScript('tuvi', { goi: 'bạn', third: true, name: 'Lan' }, { sections: [] }, seed);
      expect(open.caption).toContain('của Lan');
    }
  });

  it('Lục Hào dựng được kịch bản, câu mở không gắn với người', () => {
    const r = castHexagram([7, 8, 7, 8, 7, 8]);
    const ctx = castContext(5, 11, 2026);
    const s = buildScript('luchao', who, { sections: lucHaoTongKet(r, ctx, 'the') });
    expect(s[0].caption).toContain(CULTURE_LINE);
  });

  it('mẫu câu không có lời khuyên cúng giải hạn hay mua vật phẩm', () => {
    const text = allLines().join(' ').toLowerCase();
    for (const w of ['cúng', 'giải hạn', 'vật phẩm', 'mua', 'phải làm', 'chắc chắn', 'nhất định', 'đại hoạ', 'xui']) expect(text).not.toContain(w);
  });
});

describe('xưng hô', () => {
  const p = (year: number, gender: 'M' | 'F', relation?: 'self' | 'child') => ({ name: 'An', gender, year, relation });
  it('(e) đúng cho 6 hồ sơ mẫu theo tuổi và giới', () => {
    const cases: [number, 'M' | 'F', string][] = [[2000, 'M', 'con'], [1987, 'F', 'con'], [1986, 'M', 'anh'], [1972, 'F', 'chị'], [1971, 'M', 'chú'], [1950, 'F', 'cô']];
    for (const [y, g, goi] of cases) expect(xungHo(p(y, g), 'tu-dong', YEAR).goi).toBe(goi);
  });
  it('chưa sinh vẫn là con; cài đặt ghi đè được', () => {
    expect(xungHo(p(2030, 'M'), 'tu-dong', YEAR).goi).toBe('con');
    expect(xungHo(p(1950, 'F'), 'ban', YEAR).goi).toBe('bạn');
  });
  it('hồ sơ người thân: không gọi hồ sơ đó là con', () => {
    const w = xungHo(p(2010, 'M', 'child'), 'tu-dong', YEAR);
    expect(w).toMatchObject({ third: true, goi: 'bạn' });
    expect(xungHo(p(2010, 'M', 'self'), 'tu-dong', YEAR)).toMatchObject({ third: false, goi: 'con' });
  });
  it('chưa có hồ sơ', () => { expect(xungHo(null, 'tu-dong', YEAR)).toEqual({ goi: 'bạn', third: false, name: '', ta: 'thầy' }); });
  it('người đọc tự xưng theo nhân vật; người đọc trẻ gọi người xem là "bạn"', () => {
    expect(xungHo(p(2010, 'M', 'self'), 'tu-dong', YEAR, { ta: 'cô', elder: true })).toMatchObject({ goi: 'con', ta: 'cô' });
    expect(xungHo(p(2010, 'M', 'self'), 'tu-dong', YEAR, { ta: 'chị', elder: false })).toMatchObject({ goi: 'bạn', ta: 'chị' });
    expect(xungHo(p(2010, 'M', 'self'), 'anh', YEAR, { ta: 'chị', elder: false })).toMatchObject({ goi: 'anh' });
  });
  it('mẫu câu đổi tiếng tự xưng, viết hoa đầu câu và trong ngoặc', () => {
    expect(fill('{ta} chào {goi}. Bấm "{Ta} đọc" nhé.', { goi: 'con', ta: 'cô' })).toBe('Cô chào con. Bấm "Cô đọc" nhé.');
    expect(fill('{Ta} đọc', { goi: 'con' })).toBe('Thầy đọc');
    const s = buildScript('tonghop', { goi: 'con', third: false, name: 'An', ta: 'bà' }, { sections: [] }, 0);
    expect(s.map((c) => c.caption).join(' ')).not.toMatch(/thầy/i);
  });
});

describe('từ cấm đọc', () => {
  it('khớp nguyên từ, không phân biệt hoa thường', () => {
    expect(hasNoSpeech('Đề phòng Tai Nạn.')).toBe(true);
    expect(hasNoSpeech('Cẩn thận kiện tụng.')).toBe(true);
    expect(hasNoSpeech('Tốt cho sức khoẻ.')).toBe(false);
    expect(hasNoSpeech('Tang Đố Mộc, Tử Tôn, Tù.')).toBe(false);
  });
  it('mọi từ trong danh sách đều được bắt', () => {
    for (const t of NO_SPEECH_TERMS) expect(hasNoSpeech('Câu có ' + t + ' ở giữa.')).toBe(true);
  });
  it('nút Đọc kết quả cũng bỏ câu dính từ cấm', () => {
    expect(speechOf('Đầu năm thuận. Đề phòng tai nạn. Cuối năm tốt.')).toBe('Đầu năm thuận. Cuối năm tốt.');
  });
});

describe('Kịch bản La Bàn', () => {
  const who = { goi: 'con', third: false, name: '' };
  const cells = [['Hướng gần nhất', 'Bắc'], ['Quẻ Hậu Thiên', 'Khảm']] as const;
  const cues = buildScript('laban', who, { cells, leads: [laBanLead('Bắc')], prose: ['Hướng Bắc ứng với sao Sinh Khí.'], sections: [] }, 0);

  it('mở và kết có lời nhắc văn hoá, không có câu dẫn phần tổng kết', () => {
    expect(cues[0].caption).toContain(CULTURE_LINE);
    expect(cues.at(-1)!.caption).toContain(CULTURE_LINE);
    expect(cues.some((c) => c.gesture === 'turnPage')).toBe(false);
  });

  it('tô sáng đúng hướng khi thầy chỉ', () => {
    expect(cues.find((c) => c.focus)?.focus).toEqual({ huong: 'Bắc' });
  });

  it('câu dính từ cấm đọc thì chỉ hiện chữ', () => {
    const s = buildScript('laban', who, { prose: ['Hướng này dễ gặp tai nạn.'], sections: [] }, 0);
    expect(s.find((c) => c.caption?.includes('tai nạn'))?.text).toBe('');
  });
});

/* ===== Chỉ tay (Phase 3B.6): các điều kiện (a)–(e) ===== */
describe('Kịch bản Thầy đọc chỉ tay', () => {
  // vài bộ câu trả lời khác nhau để phủ nhiều câu luận: bộ thứ k chọn lựa chọn thứ k của mỗi câu
  function views(): PalmView[] {
    const extra = palmView(analyzePalm({ dominant: 'right', method: 'dominant', current: { answers: { Q02: 'H01', Q14: 'T01', Q17: 'SD02', Q20: 'TD16', 'Q21-dai': 'TD05', Q23: 'TAM02', Q28: 'HN09' } } }, palmMetas()));
    return [extra, ...[0, 1, 2, 3].map((k) => {
      const answers: Record<string, string | string[]> = {};
      for (const q of PALM_QUESTIONS) {
        const o = q.options[k % q.options.length];
        if (o) answers[q.id] = q.multi ? [o.value] : o.value;
      }
      return palmView(analyzePalm({ dominant: 'right', method: 'dominant', current: { answers } }, palmMetas()));
    })];
  }
  const scriptsOf = () => views().map((v) => ({ v, cues: buildPalmScript(who, palmScriptInput(v), 0) }));
  const forbidden = [...NO_SPEECH_TERMS, ...PALM_TTS_FORBIDDEN];
  const hasForbidden = (t: string) => forbidden.some((w) => new RegExp('(?<![\p{L}\p{N}])' + w.replace(/[.*+?^${}()|[]\]/g, '\$&') + '(?![\p{L}\p{N}])', 'iu').test(t.normalize('NFC')));

  it('(a) mọi cue chỉ tay dài tối đa 180 ký tự', () => {
    for (const { cues } of scriptsOf()) {
      expect(cues.length).toBeGreaterThan(5);
      for (const c of cues) expect(c.text.length, c.text).toBeLessThanOrEqual(180);
    }
  });

  it('(b) không cue nào được đọc thành lời lại chứa từ cấm đọc', () => {
    for (const { cues } of scriptsOf()) for (const c of cues) if (c.text) expect(hasForbidden(c.text), c.text).toBe(false);
  });

  it('(c) câu luận tts=false không sinh cue đọc, chỉ hiện chữ kèm lời báo xem trên màn hình', () => {
    let quiet = 0;
    for (const { v, cues } of scriptsOf()) {
      for (const r of v.sections.flatMap((x) => x.items).filter((x) => !x.tts)) {
        quiet++;
        const hit = cues.filter((c) => !!c.caption?.includes(r.text));
        expect(hit.length, r.id).toBeGreaterThan(0);
        for (const c of hit) { expect(c.text, r.id).toBe(''); expect(c.caption).toContain('xem chữ trên màn hình'); }
      }
    }
    expect(quiet).toBeGreaterThan(0);
  });

  it('(d) câu mở và câu kết luôn có lời nhắc: đường chỉ đổi theo cách sống, văn hoá, xem lại sau 6–12 tháng', () => {
    for (const seed of [0, 1, 2, 3, 4, 5]) {
      for (const w of [who, { goi: 'bạn', third: true, name: 'Lan' }]) {
        const cues = buildPalmScript(w, palmScriptInput(views()[0]), seed);
        expect(cues[0].caption).toContain(CULTURE_LINE);
        expect(cues[0].caption).toMatch(/[Đđ]ường chỉ đổi theo cách mình sống/);
        expect(cues.at(-1)!.caption).toContain(CULTURE_LINE);
      }
    }
    // cả ba câu kết đều nhắc tay đổi theo cách sống và xem lại sau sáu tháng đến một năm
    for (const i of [0, 1, 2]) {
      const close = buildPalmScript(who, palmScriptInput(views()[0]), i).at(-1)!.caption!;
      expect(close, 'câu kết ' + i).toMatch(/Đường chỉ đổi theo cách mình sống|đường chỉ đổi theo cách mình sống|tay cũng đổi theo/);
      expect(close, 'câu kết ' + i).toMatch(/[Ss]áu tháng/);
    }
  });

  it('lời dẫn từng mục: mỗi mục có nội dung đều được dẫn bằng mẫu câu riêng, mỗi loại ≥ 2 biến thể', () => {
    for (const k of ['chitayTongQuan', 'chitayNgon', 'chitayBaDuong', 'chitayDuongPhu', 'chitayGoDau', 'chitayDuong'] as const) expect(LEADS[k].length, k).toBeGreaterThanOrEqual(2);
    for (const { v, cues } of scriptsOf()) {
      const text = cues.map((c) => c.caption ?? '').join(' ');
      for (const sec of v.sections.filter((x) => x.items.length && x.key !== 'duong-chinh')) {
        // không đọc tiêu đề trơ trọi: câu dẫn của mục khác với tiêu đề
        const leads = { 'tong-quan': LEADS.chitayTongQuan, ngon: LEADS.chitayNgon, 'duong-phu': LEADS.chitayDuongPhu, 'go-dau': LEADS.chitayGoDau }[sec.key as 'ngon'];
        if (!leads) continue;
        const heads = leads.map((l) => fill(l, { goi: 'con', cuaAi: 'của con', ta: 'thầy' }).slice(0, 24));
        expect(heads.some((h) => text.includes(h)), sec.key).toBe(true);
      }
      expect(cues.some((c) => /các đường chính/i.test(c.caption ?? ''))).toBe(true);
    }
  });

  it('(e) mỗi cue của câu luận có đường chính, gò hay dấu thì có focus.palm tương ứng', () => {
    let checked = 0;
    for (const { v, cues } of scriptsOf()) {
      for (const r of v.sections.flatMap((x) => x.items)) {
        const hit = cues.filter((c) => !!c.caption?.includes(r.text.slice(0, 40)));
        const main = ['sinh', 'tri', 'tam', 'dinhmang'].includes(r.line ?? '');
        if (!main && !r.mount && !r.mark) continue;
        // câu luận có thể xuất hiện cả ở phần tóm tắt theo chủ đề (không tô) lẫn ở phần đường, gò (có tô); phần tô phải đúng
        expect(hit.some((c) => !!c.focus?.palm), r.id).toBe(true);
        for (const c of hit.filter((x) => !!x.focus?.palm)) {
          checked++;
          const p = c.focus!.palm;
          if (r.mount) expect(p!.zones).toContain(r.mount);
          if (r.mark) expect(p!.marks).toContain(r.mark);
          if (main) expect(p!.lines).toContain(r.line === 'dinhmang' ? 'dinh' : r.line);
        }
      }
    }
    expect(checked).toBeGreaterThan(5);
  });

  it('cue của đường chính vẫn giữ focus.line để tô đường như trước', () => {
    const { cues } = scriptsOf()[0];
    expect(cues.some((c) => c.focus?.line === 'sinh')).toBe(true);
    expect(getReading).toBeTruthy();
  });
});
