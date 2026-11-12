/* Câu chữ mục ngũ hành (Phase 3C.3): mọi mã của engine đều có câu, không từ cấm, thẻ không đọc, lời nhắc ở đầu và cuối,
   24 lá số golden dựng câu không lỗi. */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { batTuChart, batTuReading } from '../src/core';
import { analyze, resolveWithFeedback, toNguHanhChart, verificationQuestions, type Msg, type NguHanhAnalysis } from '../src/core/nguhanh';
import * as NH from '../src/content/nguhanh';
import { hasNoSpeech } from '../src/content/noSpeech';
import { sectionPlainText, toPlainText, type Section } from '../src/content/rich';

const dir = dirname(fileURLToPath(import.meta.url));
const golden = JSON.parse(readFileSync(join(dir, 'fixtures', 'nguhanh-golden.json'), 'utf8')) as { cases: Array<{ no: number; input: Record<string, unknown> }> };

function sample(n: number, seed = 20261114) {
  let s = seed; const rnd = () => (s = (s * 1103515245 + 12345) % 2147483648) / 2147483648;
  return Array.from({ length: n }, () => {
    const yy = 1950 + Math.floor(rnd() * 60), mm = 1 + Math.floor(rnd() * 12), dd = 1 + Math.floor(rnd() * 28), h = Math.floor(rnd() * 12);
    return batTuChart({ gender: rnd() < 0.5 ? 'M' : 'F', dd, mm, yy, hourIdx: h } as never);
  });
}
/** mọi Msg lồng trong một cấu trúc */
function collectMsgs(v: unknown, out: Msg[] = []): Msg[] {
  if (Array.isArray(v)) v.forEach((x) => collectMsgs(x, out));
  else if (v && typeof v === 'object') {
    const o = v as Record<string, unknown>;
    if (typeof o.code === 'string') out.push(o as Msg);
    Object.values(o).forEach((x) => collectMsgs(x, out));
  }
  return out;
}
const sectionsText = (ss: Section[]) => ss.map((x) => sectionPlainText(x)).join('\n');
const BAD = /undefined|\[object|NaN|null/;

const charts = sample(3000);
const analyses: NguHanhAnalysis[] = charts.map((c) => analyze(toNguHanhChart(c)));
// thêm các phân xử để có đủ mã resolve.*
const resolved: NguHanhAnalysis[] = [];
for (const a of analyses) {
  if (a.readings.length < 2) continue;
  const qs = verificationQuestions(a, { nowYear: 2026, minAge: 18, maxYears: 3, maxDaiVan: 2 });
  for (const n of [0, 2, 5]) {
    const answers = qs.slice(0, n).map((q) => ({ target: q.target, outcome: 'tot' as const }));
    resolved.push(resolveWithFeedback(a, answers).analysis);
  }
}

describe('Mọi mã của engine đều có câu', () => {
  it('3000 lá số và các phân xử: không mã nào ra chuỗi rỗng hay "undefined"', () => {
    const seen = new Set<string>();
    for (const a of [...analyses, ...resolved]) {
      const ctx = NH.renderCtxOf(a);
      for (const m of collectMsgs([a.score.trace, a.readings, a.follow, a.resolution])) {
        seen.add(m.code);
        const t = NH.msgText(m, ctx);
        expect(t, m.code).not.toBe('');
        expect(t, m.code).not.toMatch(BAD);
      }
    }
    // các mã đã gặp trong mẫu (kiểm tra mẫu đủ rộng)
    for (const code of ['trace.raw', 'trace.final', 'trace.season', 'trace.triad', 'trace.halfTriad', 'trace.sixCombo', 'trace.clash', 'trace.stemCombo',
      'secondary.dieuHau', 'secondary.thongQuan', 'reason.followHead', 'reason.chuyenVuong', 'reason.followMixed', 'reason.followSingle', 'reason.dieuHauFirst',
      'reason.trungHoa', 'reason.vuong.an', 'reason.vuong.quanSat', 'reason.vuong.thucThuong', 'reason.nhuoc.tai', 'reason.nhuoc.quanSat', 'reason.nhuoc.thucThuong',
      'root.none', 'root.weak', 'root.real', 'exposed.none', 'exposed.list', 'dominant.tong', 'dominant.chuyenVuong', 'momentum.deLenh', 'momentum.lenhSinh',
      'direction.single', 'direction.selfLed', 'follow.summary', 'reading.follow', 'reading.normal', 'resolve.insufficient']) {
      expect(seen.has(code), `mẫu không có mã ${code}`).toBe(true);
    }
    // mã khác có thể hiếm; nếu gặp thì đã được kiểm ở vòng trên. Mã hiếm kiểm trực tiếp:
    const rare: Msg[] = [
      { code: 'momentum.triad', p: { element: 'Hoả' } }, { code: 'momentum.halfTriad', p: { element: 'Thuỷ' } },
      { code: 'direction.mixed', p: { top: 'Tai', topValue: 3, second: 'QuanSat', secondValue: 2.5 } }, { code: 'direction.anLed' },
      // quy tắc biến thể ARCHITECTURE 14.14
      { code: 'reason.trungHoaSide', p: { ratio: 0.47, side: 'nhuoc' } }, { code: 'reason.trungHoaSide', p: { ratio: 0.52, side: 'vuong' } },
      { code: 'reason.vuong.thauCan', p: { group: 'QuanSat', element: 'Hoả', stems: 2 } },
      { code: 'reason.nhuoc.thucThuongKiep', p: { thucThuong: 4.7, an: 0.3, element: 'Thổ' } },
      { code: 'resolve.decided', p: { reading: 'thong-thuong', wins: 4, total: 4, weight: 0.9 } }, { code: 'resolve.undecided', p: { reading: 'thuan-the', wins: 2, total: 3, weight: 0.6 } },
    ];
    for (const m of rare) { const t = NH.msgText(m); expect(t, m.code).not.toBe(''); expect(t, m.code).not.toMatch(BAD); }
  });
  it('nhãn, tên cách, nhãn năm, nhãn trả lời đều có chữ', () => {
    for (const v of [...Object.values(NH.TYPE_VI), ...Object.values(NH.GRADE_VI), ...Object.values(NH.STRENGTH_VI), ...Object.values(NH.METHOD_VI),
      ...Object.values(NH.TEN_GOD_VI), ...Object.values(NH.FAVOR_LABEL), ...Object.values(NH.FAVOR_HINT), ...Object.values(NH.OUTCOME_LABEL)]) {
      expect(v.trim().length).toBeGreaterThan(0);
      expect(v).not.toMatch(BAD);
    }
    for (const f of ['rat-tot', 'tot', 'binh', 'xau', 'rat-xau'] as const) expect(NH.timingLabel(f).hint.length).toBeGreaterThan(0);
  });
});

describe('Từ cấm (ARCHITECTURE 14.8)', () => {
  it('danh sách (i) KHÔNG HIỆN: không câu nào của từ vựng, bảng thực hành, mã engine hay báo cáo chứa từ cấm', () => {
    const fixed: string[] = [
      ...Object.values(NH.TYPE_VI), ...Object.values(NH.GRADE_VI), ...Object.values(NH.METHOD_VI), ...Object.values(NH.FAVOR_LABEL), ...Object.values(NH.FAVOR_HINT),
      NH.INTRO_NOTE, NH.CLOSING_NOTE, NH.COLOR_SOURCE_NOTE, NH.DISCLAIMER, NH.VERIFICATION_INTRO, NH.VERIFICATION_NOT_ENOUGH, NH.LEGACY_TIMING_NOTE,
      ...Object.values(NH.CHECK_STATUS ? { a: NH.CHECK_STATUS(1), b: NH.CHECK_STATUS(0.5), c: NH.CHECK_STATUS(0) } : {}),
      ...Object.values(NH.ELEMENT_PRACTICAL).flatMap((e) => [e.quality, ...e.habits, ...e.work, e.excessSigns, e.excessFix]),
      ...Object.values(NH.TEN_GOD_PRACTICAL).flatMap((t) => [t.asUseful, t.asHarmful, ...t.actions]),
    ];
    for (const t of fixed) expect(NH.hasBannedTerm(t), t).toBe(false);
    // chính hàm kiểm phải bắt được từ cấm
    for (const w of ['cúng giải hạn', 'đeo để chiêu tài', 'dự đoán đúng', 'chắc chắn', 'vật phẩm']) expect(NH.hasBannedTerm(w), w).toBe(true);
    expect(NH.hasBannedTerm('mùa xuân đến sớm')).toBe(false);
    for (const a of analyses.slice(0, 600)) {
      const legacy = batTuReading(charts[analyses.indexOf(a)], 2026);
      const text = sectionsText(NH.practicalReport(a, { nowYear: 2026, legacy }));
      expect(NH.hasBannedTerm(text), text.slice(0, 120)).toBe(false);
      if (a.readings.length > 1) expect(NH.hasBannedTerm(sectionsText(NH.practicalReport(a, { nowYear: 2026, legacy, readingId: a.readings[1].id })))).toBe(false);
    }
    for (const a of resolved) for (const m of collectMsgs([a.resolution])) expect(NH.hasBannedTerm(NH.msgText(m, NH.renderCtxOf(a)))).toBe(false);
  });

  it('danh sách (ii) KHÔNG ĐỌC: khối chứa từ trong NO_SPEECH_TERMS phải gắn thẻ no-speech; khối bảng, phần trăm, vết tính đều gắn thẻ', () => {
    let tagged = 0;
    for (const a of analyses.slice(0, 600)) {
      for (const s of NH.practicalReport(a, { nowYear: 2026 })) {
        for (const b of s.blocks) {
          const text = sectionPlainText({ ...s, title: '', blocks: [b] }, false);
          if (hasNoSpeech(text)) expect(b.tags, `${b.id}: ${text.slice(0, 80)}`).toContain('no-speech');
          if (b.tags?.includes('no-speech')) tagged++;
          if (['table', 'bars'].includes(b.kind)) expect(b.tags).toContain('no-speech');
        }
      }
    }
    expect(tagged).toBeGreaterThan(0);
  });
});

describe('Lời nhắc văn hoá và cấu trúc báo cáo', () => {
  it('mở đầu có lời nhắc, kết thúc có câu "Số là tham khảo" và giải thích nguồn màu hướng', () => {
    for (const a of analyses.slice(0, 300)) {
      const ss = NH.practicalReport(a, { nowYear: 2026 });
      expect(sectionPlainText(ss[0])).toContain(NH.INTRO_NOTE);
      const last = sectionPlainText(ss[ss.length - 1]);
      expect(last).toContain('Số là tham khảo, đức năng thắng số.');
      expect(last).toContain('Mệnh Quái');
      const all = sectionsText(ss);
      expect(all).not.toMatch(BAD);
      expect(all).not.toMatch(/hướng (Đông|Tây|Nam|Bắc)|màu (xanh|đỏ|vàng|trắng|đen)/i); // 14.3: không nêu màu, hướng
    }
  });
  it('lá số có cách luận khác thì có mục "Cách luận khác", thẻ kiểm chứng đọc được, trọng số hiện bằng chữ', () => {
    const multi = analyses.find((a) => a.readings.length > 1)!;
    const ss = NH.practicalReport(multi, { nowYear: 2026 });
    expect(ss.some((x) => x.id === 'nguhanh.alt')).toBe(true);
    expect(ss.some((x) => x.id === 'nguhanh.pattern')).toBe(true);
    expect(NH.weightPhrase(0.9)).toBe('nghiêng rõ về');
    expect(NH.weightPhrase(0.65)).toBe('nghiêng nhẹ về');
    expect(NH.weightPhrase(0.5)).toMatch(/ngang nhau/);
    const qs = verificationQuestions(multi, { nowYear: 2026, minAge: 18, maxYears: 3, maxDaiVan: 2 });
    for (const q of qs) {
      const t = NH.verificationPrompt(q, multi);
      expect(t).toMatch(/tuổi/);
      expect(t).not.toMatch(BAD);
      if (q.target.kind === 'nam') expect(t).toMatch(/Lập Xuân/);
    }
    expect(NH.resolutionText(resolveWithFeedback(multi, []).analysis.resolution!, multi)).toMatch(/Chưa đủ dữ liệu/);
  });
  it('câu Tóm lại: cách luận thuận thế nói "thuận theo", không nói "cần bổ sung" hành đang mạnh', () => {
    const a = analyze(toNguHanhChart(batTuChart({ gender: 'M', dd: 11, mm: 3, yy: 1985, hourIdx: 0 } as never)));
    expect(a.readings.map((r) => r.id)).toEqual(['thuan-the', 'thong-thuong']);
    const head = (id?: 'thuan-the' | 'thong-thuong') => sectionPlainText(NH.practicalReport(a, { nowYear: 2026, readingId: id }).find((x) => x.id === 'nguhanh.headline')!);
    expect(head('thuan-the')).toMatch(/Hành nên thuận theo: Mộc/);
    expect(head('thuan-the')).not.toMatch(/cần bổ sung/);
    expect(head('thong-thuong')).toMatch(/Hành cần bổ sung: Hoả/);
  });
  it('lá số thường không có mục cách cục đặc biệt hay cách luận khác', () => {
    const plain = analyses.find((a) => !a.follow)!;
    const ids = NH.practicalReport(plain, { nowYear: 2026 }).map((x) => x.id);
    expect(ids).not.toContain('nguhanh.pattern');
    expect(ids).not.toContain('nguhanh.alt');
  });
  it('dòng đối chiếu: ngược thì có lý do và lời khuyên nhờ người luận; trùng thì chỉ một câu', () => {
    let nguoc = 0, trung = 0;
    for (let i = 0; i < 400; i++) {
      const a = analyses[i], legacy = batTuReading(charts[i], 2026);
      const ss = NH.practicalReport(a, { nowYear: 2026, legacy });
      const intro = sectionPlainText(ss[0]);
      const cmpText = intro.replace(NH.INTRO_NOTE, '').trim();
      expect(cmpText.length).toBeGreaterThan(0);
      if (/gần như ngược nhau/.test(cmpText)) { nguoc++; expect(cmpText).toMatch(/nhờ người luận/); expect(cmpText).toMatch(/Gợi ý sơ bộ|Khi tính đủ|Lá số sinh mùa|cách cục đặc biệt|Hai cách cùng thấy/); }
      if (/trùng với gợi ý sơ bộ/.test(cmpText)) { trung++; expect(cmpText.length).toBeLessThan(160); }
    }
    expect(nguoc).toBeGreaterThan(20);
    expect(trung).toBeGreaterThan(20);
  });
});

describe('24 lá số golden', () => {
  it('dựng câu không lỗi, có đủ các mục cơ bản', () => {
    expect(golden.cases).toHaveLength(24);
    for (const c of golden.cases) {
      const ch = batTuChart(c.input as never);
      const a = analyze(toNguHanhChart(ch));
      const legacy = batTuReading(ch, 2026);
      const ss = NH.practicalReport(a, { nowYear: 2026, legacy });
      const text = sectionsText(ss);
      expect(text, `lá số ${c.no}`).not.toMatch(BAD);
      expect(NH.hasBannedTerm(text)).toBe(false);
      expect(ss.map((x) => x.id)).toEqual(expect.arrayContaining(['nguhanh.intro', 'nguhanh.headline', 'nguhanh.why', 'nguhanh.strategy', 'nguhanh.timing', 'nguhanh.closing']));
      expect(toPlainText(ss[1].blocks[0].kind === 'p' ? ss[1].blocks[0].rich : [])).toContain(a.usefulGod.dung);
    }
  });
});

describe('Hình 5 nút minh hoạ (ARCHITECTURE 14.11)', () => {
  it('vẽ đủ 5 nút, 10 cạnh, đúng 2 cạnh tô đậm trỏ vào Dụng thần, lời chú không dính từ cấm', async () => {
    const { cycleBlock, hasBannedTerm } = await import('../src/content/nguhanh');
    const { toPlainText } = await import('../src/content/rich');
    const shares = { Mộc: 0.1, Hoả: 0.2, Thổ: 0.3, Kim: 0.25, Thuỷ: 0.15 } as never;
    for (const dung of ['Mộc', 'Hoả', 'Thổ', 'Kim', 'Thuỷ'] as const) {
      const b = cycleBlock(shares, dung, {}) as never as { nodes: { label: string; focus?: boolean }[]; edges: { from: number; to: number; kind: string; active: boolean }[]; caption: never };
      expect(b.nodes).toHaveLength(5);
      expect(b.edges).toHaveLength(10);
      expect(b.nodes.filter((n) => n.focus).map((n) => n.label)).toEqual([dung]);
      const i = b.nodes.findIndex((n) => n.focus);
      const act = b.edges.filter((e) => e.active);
      expect(act.map((e) => e.kind).sort()).toEqual(['khac', 'sinh']);
      for (const e of act) expect(e.to).toBe(i);
      expect(hasBannedTerm(toPlainText(b.caption))).toBe(false);
    }
  });
});

describe('Màu 5 nút minh hoạ', () => {
  it('mỗi hành một màu riêng, chữ đủ tương phản (≥ 4,5) trên nền', async () => {
    const { cycleBlock } = await import('../src/content/nguhanh');
    const b = cycleBlock({ Mộc: 0.2, Hoả: 0.2, Thổ: 0.2, Kim: 0.2, Thuỷ: 0.2 } as never, 'Mộc', {}) as never as { nodes: { fill: string; ink: string }[] };
    const lum = (h: string) => { const c = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
    expect(new Set(b.nodes.map((n) => n.fill)).size).toBe(5);
    for (const n of b.nodes) {
      const [x, y] = [lum(n.fill), lum(n.ink)].sort((p, q) => q - p);
      expect((x + 0.05) / (y + 0.05), n.fill).toBeGreaterThanOrEqual(4.5);
    }
  });
});
