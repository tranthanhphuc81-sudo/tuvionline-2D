/* Hỏi chuyện Thầy (ARCHITECTURE 16.3): bảy câu hỏi, câu trả lời chỉ ghép kết quả đã có. */
import { describe, it, expect } from 'vitest';
import { dayInfo, profileSummary, tongHopOf, tuoiChi, viecVerdict } from '../src/core';
import { analyze, elementOfTenGod, toNguHanhChart } from '../src/core/nguhanh';
import { ASK_QUESTIONS, askAnswer } from '../src/content/ask';
import { BANNED_TERMS, COLOR_SOURCE_NOTE, hasBannedTerm } from '../src/content/nguhanh/vocab';
import { DAY_TASKS, TASK_LOOKAHEAD, TASK_VERDICT_LINES, TASK_VIEC, calendarLine, taskVerdict } from '../src/content/askDay';
import { THAN_VI, TRUC_VI } from '../src/content/xemngay';
import { ASK_LINES, CULTURE_LINE } from '../src/content/reader/templates';
import { TODAY_NOTE } from '../src/content/today';

const profile = (i: number) => ({
  id: 'p' + i, name: 'An', gender: (i % 2 ? 'M' : 'F') as 'M' | 'F', calendar: 'solar' as const,
  day: 1 + (i * 7) % 28, month: 1 + (i * 5) % 12, year: 1950 + (i * 3) % 60, leapMonth: false, hourIdx: i % 12, lateTy: false, createdAt: 't', updatedAt: 't',
});
const ctxs = Array.from({ length: 24 }, (_, i) => profileSummary(profile(i))).flatMap((r) => (r.ok ? [{ tongHop: tongHopOf(r.birth), nguHanh: analyze(toNguHanhChart(r.summary.battu.chart)), now: new Date(2026, 10, 16) }] : []));

describe('câu trả lời', () => {
  it('mọi câu hỏi, mọi lá số: có nội dung, câu cuối là lời nhắc văn hoá, không có câu rỗng', () => {
    expect(ctxs.length).toBeGreaterThan(20);
    for (const c of ctxs) for (const q of ASK_QUESTIONS) {
      const a = askAnswer(q.id, c);
      expect(a.length, q.id).toBeGreaterThanOrEqual(2);
      expect(a[a.length - 1]).toBe(CULTURE_LINE);
      for (const t of a) expect(t.trim().length, q.id).toBeGreaterThan(5);
      for (const t of a) expect(t, q.id).not.toMatch(/<\/?[a-z]/);
    }
  });
  it('mỗi câu lấy đúng nguồn: màu hướng kèm ghi chú ba cách tính, nghề từ Tổng hợp, ngày năm kèm "không phải lời báo trước"', () => {
    const c = ctxs[0];
    expect(askAnswer('mau-huong', c)).toContain(COLOR_SOURCE_NOTE);
    expect(askAnswer('nghe', c)[0]).toMatch(/^Nghề nghiệp/);
    expect(askAnswer('hom-nay', c)).toContain(TODAY_NOTE);
    expect(askAnswer('nam-nay', c).join(' ')).toContain('không phải lời báo trước');
    expect(askAnswer('nam-nay', c)[0]).toMatch(/^Năm 2026 Bính Ngọ/);
    expect(askAnswer('nam-thuan', c)[0]).toMatch(/12 năm tới/);
    expect(askAnswer('menh', c)[0]).toContain('Nạp Âm');
  });
  it('lời mới của Thầy không có từ cấm, mỗi loại ≥ 2 biến thể', () => {
    const mine = [...Object.values(ASK_LINES).flat(), ...ASK_QUESTIONS.map((q) => q.label)].join(' ').toLowerCase();
    for (const w of BANNED_TERMS) expect(mine, w).not.toContain(w.toLowerCase());
    for (const k of Object.keys(ASK_LINES) as (keyof typeof ASK_LINES)[]) expect(ASK_LINES[k].length).toBeGreaterThanOrEqual(2);
  });
});

describe('Việc hôm nay (ARCHITECTURE 16.3.1)', () => {
  const days = Array.from({ length: 30 }, (_, k) => new Date(2026, 10, 1 + k));
  it('mỗi việc lấy đúng hành của nhóm Thập Thần, câu đầu là trụ ngày, có lời dặn và câu "không phải lời báo trước"', () => {
    for (const c of ctxs) for (const t of DAY_TASKS) {
      const a = askAnswer(t.id, c);
      const e = elementOfTenGod(c.nguHanh.dayMaster.dayMaster, t.group);
      expect(a[0]).toMatch(/^Hôm nay ngày /);
      expect(a[1]).toContain(`${t.topic} ứng với hành ${e}`);
      expect(a).toContain(t.tip);
      expect(a).toContain(TODAY_NOTE);
      expect(a).toContain(TASK_VERDICT_LINES[taskVerdict(c.nguHanh, t.group, c.now)]);
    }
  });
  it('ngày chưa thuận thì gợi ý ngày thuận gần nhất trong 14 ngày, và ngày đó chấm đúng là thuận', () => {
    let suggested = 0;
    for (const c of ctxs) for (const now of days) for (const t of DAY_TASKS) {
      const a = askAnswer(t.id, { ...c, now });
      const v = taskVerdict(c.nguHanh, t.group, now);
      const line = a.find((x) => x.startsWith('Nếu muốn chọn ngày') || x.startsWith('Hai tuần tới'));
      if (v === 'thuan') { expect(line).toBeUndefined(); continue; }
      expect(line).toBeTruthy();
      const m = line!.match(/ (\d{1,2})\/(\d{1,2}) \(ngày [^,]+, (mùng \d+|rằm|\d+) tháng \d+( nhuận)? âm lịch\)\.$/);
      if (!m) continue;
      suggested++;
      const k = Array.from({ length: TASK_LOOKAHEAD }, (_, i) => new Date(now.getFullYear(), now.getMonth(), now.getDate() + i + 1))
        .find((d) => d.getDate() === +m[1] && d.getMonth() + 1 === +m[2])!;
      expect(k).toBeTruthy();
      expect(taskVerdict(c.nguHanh, t.group, k)).toBe('thuan');
      for (let d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1); d < k; d.setDate(d.getDate() + 1)) expect(taskVerdict(c.nguHanh, t.group, d)).not.toBe('thuan');
    }
    expect(suggested).toBeGreaterThan(100);
  });
  it('ba mức đều xuất hiện; câu mới không có từ cấm', () => {
    const seen = new Set(ctxs.flatMap((c) => days.flatMap((d) => DAY_TASKS.map((t) => taskVerdict(c.nguHanh, t.group, d)))));
    expect([...seen].sort()).toEqual(['binh', 'giu', 'thuan']);
    const mine = [...Object.values(TASK_VERDICT_LINES), ...DAY_TASKS.flatMap((t) => [t.label, t.topic, t.tip])];
    for (const t of mine) expect(hasBannedTerm(t), t).toBe(false);
  });
});

describe('Việc hôm nay: thêm một câu theo lịch truyền thống (ARCHITECTURE 16.3.1, 17)', () => {
  const days = Array.from({ length: 30 }, (_, k) => new Date(2026, 10, 1 + k));
  const isCal = (x: string) => x.startsWith('Theo lịch truyền thống');
  it('mỗi việc có đúng một câu, sau mức chấm, trước lời dặn; nêu đúng thần và trực của ngày', () => {
    for (const c of ctxs.slice(0, 6)) for (const now of days) for (const t of DAY_TASKS) {
      const a = askAnswer(t.id, { ...c, now });
      expect(a.filter(isCal), t.id).toHaveLength(1);
      const i = a.findIndex(isCal);
      expect(i).toBeGreaterThan(a.indexOf(TASK_VERDICT_LINES[taskVerdict(c.nguHanh, t.group, now)]));
      expect(i).toBeLessThan(a.indexOf(t.tip));
      const d = dayInfo(now.getDate(), now.getMonth() + 1, now.getFullYear());
      expect(a[i]).toContain(`ngày ${d.hoangDao ? 'Hoàng đạo' : 'Hắc đạo'} (${THAN_VI[d.than]}), trực ${TRUC_VI[d.truc].name}`);
    }
  });
  it('hợp / kỵ / không nghiêng theo TRUC_VIEC đúng như màn Xem ngày; học thi chỉ nêu thần và trực', () => {
    const seen = new Set<string>();
    for (const now of days) for (const t of DAY_TASKS) {
      const line = calendarLine(t.id, now);
      const viec = TASK_VIEC[t.id];
      if (!viec) { expect(line).not.toMatch(/lịch xưa (coi|kỵ|không nghiêng)/); continue; }
      const v = viecVerdict(dayInfo(now.getDate(), now.getMonth() + 1, now.getFullYear()), viec.id);
      seen.add(v);
      if (v === 'hop') expect(line).toContain(`lịch xưa coi ngày này hợp cho việc ${viec.phrase}`);
      if (v === 'ky') expect(line).toContain(`lịch xưa kỵ trực này cho việc ${viec.phrase}`);
      if (v === 'trung') expect(line).toContain('lịch xưa không nghiêng hẳn về bên nào cho việc này');
    }
    expect([...seen].sort()).toEqual(['hop', 'ky', 'trung']);
  });
  it('biết tuổi: ngày xung tuổi thì nói xung thay cho hợp / kỵ; không biết tuổi thì không nhắc', () => {
    const tuat = tuoiChi(1994);
    const now = new Date(2026, 10, 26); // Giáp Thìn, xung Tuất
    for (const t of DAY_TASKS) {
      expect(calendarLine(t.id, now, tuat)).toContain('xung tuổi Tuất của bạn, nên lịch xưa khuyên việc lớn chọn ngày khác');
      expect(calendarLine(t.id, now, tuat)).not.toMatch(/lịch xưa (coi|kỵ trực|không nghiêng)/);
      expect(calendarLine(t.id, now)).not.toContain('xung tuổi');
      expect(calendarLine(t.id, now, tuoiChi(1990))).not.toContain('xung tuổi');
    }
    const c = ctxs[0];
    expect(askAnswer('tai-san', { ...c, now, birthChi: tuat }).find(isCal)).toContain('xung tuổi Tuất');
  });
  it('câu mới không có từ cấm, ở mọi ngày của một năm, có và không có tuổi', () => {
    for (let k = 0; k < 365; k++) {
      const now = new Date(2026, 0, 1 + k);
      for (const t of DAY_TASKS) for (const b of [undefined, tuoiChi(1994)]) {
        const line = calendarLine(t.id, now, b);
        expect(hasBannedTerm(line), line).toBe(false);
      }
    }
  });
});
