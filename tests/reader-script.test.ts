/* Kịch bản Thầy đọc (ARCHITECTURE.md mục 12.6–12.8; các điều kiện a–e của Phase 6.5). */
import { describe, it, expect } from 'vitest';
import { batTrachReading, castContext, castHexagram, profileSummary } from '../src/core';
import { NO_SPEECH_TERMS, hasNoSpeech } from '../src/content/noSpeech';
import { CULTURE_LINE, DONG_LINES, LEADS, TOOL_LINES, allLines, fill } from '../src/content/reader/templates';
import { sectionsSpeech, speechOf } from '../src/content/speech';
import { batTrachTongKet } from '../src/content/battrach/tongket';
import { batTuTongKet } from '../src/content/battu/tongket';
import { lucHaoTongKet } from '../src/content/luchao/tongket';
import { tuViTongKet } from '../src/content/tuvi/tongket';
import { buildScript, xungHo, type Cue, type Who } from '../src/features/reader/script';

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
    for (const t of Object.values(TOOL_LINES)) {
      expect(t.open).toHaveLength(3);
      expect(t.close).toHaveLength(3);
      for (const l of [...t.open, ...t.close]) expect(l).toContain(CULTURE_LINE);
      expect(t.cells.length).toBeGreaterThanOrEqual(2);
      expect(t.sections.length).toBeGreaterThanOrEqual(2);
    }
    for (const l of Object.values(LEADS)) expect(l.length).toBeGreaterThanOrEqual(2);
    for (const k of ['gate', 'corridor', 'intro', 'name', 'gender', 'date', 'hour'] as const) expect(DONG_LINES[k].length).toBeGreaterThan(0);
  });

  it('mẫu câu không dính từ cấm đọc, không còn biến chưa thay, không quá dài', () => {
    const vars = { goi: 'con', cuaAi: 'của con', ten: 'Lan', cung: 'Hợi', sao: ', có Tử Vi', nhatChu: 'Quý', hao: 3, huong: 'Đông Nam', sao2: '' };
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
  it('chưa có hồ sơ', () => { expect(xungHo(null, 'tu-dong', YEAR)).toEqual({ goi: 'bạn', third: false, name: '' }); });
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
