/* Chạy trang legacy (public/legacy/lyso-toolkit.html) trong jsdom để so câu chữ với src/content (ARCHITECTURE.md mục 7.1).
   Ngày "hôm nay" của trang được cố định để phần "Giai đoạn hiện tại" và lưu niên năm nay so được. */
import { JSDOM, VirtualConsole } from 'jsdom';
import { readFileSync } from 'node:fs';

export const FIXED_NOW = new Date('2026-06-15T09:00:00+07:00');

export function loadLegacy(now = FIXED_NOW): { doc: Document; errors: string[] } {
  const html = readFileSync('public/legacy/lyso-toolkit.html', 'utf8');
  const errors: string[] = [];
  const vc = new VirtualConsole();
  vc.on('jsdomError', (e) => errors.push(String(e.message)));
  const dom = new JSDOM(html, {
    runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc, url: 'http://localhost/',
    beforeParse(win) {
      const Real = win.Date;
      const fixed = now.getTime();
      class FixedDate extends Real {
        constructor(...a: unknown[]) {
          if (a.length === 0) super(fixed);
          else super(...(a as [number]));
        }
        static now() { return fixed; }
      }
      (win as unknown as { Date: DateConstructor }).Date = FixedDate as unknown as DateConstructor;
    },
  });
  return { doc: dom.window.document, errors };
}

/** So sánh bỏ qua mọi khoảng trắng (textContent của legacy dính liền các khối). */
export const squash = (s: string) => s.replace(/[\s ]+/g, '');

/** Vị trí khác nhau đầu tiên, kèm ngữ cảnh — để thông báo lỗi dễ đọc. */
export function firstDiff(a: string, b: string): string | null {
  if (a === b) return null;
  let i = 0;
  while (i < a.length && a[i] === b[i]) i++;
  return `tại ký tự ${i}:\n  legacy : …${a.slice(Math.max(0, i - 60), i + 60)}…\n  app    : …${b.slice(Math.max(0, i - 60), i + 60)}…`;
}

export interface TvInput { gender: 'M' | 'F'; calendar: 'solar' | 'lunar'; day: number; month: number; year: number; leapMonth: boolean; hourIdx: number; lateTy: boolean }

/** Điền form ngày sinh của một tab legacy (tiền tố 'tv' = Tử Vi, 'bt' = Bát Tự) và bấm nút lập lá số. */
export function submitBirthForm(doc: Document, prefix: 'tv' | 'bt', p: TvInput): void {
  const $ = (s: string) => doc.querySelector(s) as HTMLElement;
  ($(`#${prefix}-genderSeg button[data-val="${p.gender}"]`)).click();
  ($(`#${prefix}-calSeg button[data-val="${p.calendar}"]`)).click();
  if (p.calendar === 'lunar') ($(`#${prefix}-leapSeg button[data-val="${p.leapMonth ? 1 : 0}"]`)).click();
  ($(`#${prefix}-dd`) as HTMLInputElement).value = String(p.day);
  ($(`#${prefix}-mm`) as HTMLInputElement).value = String(p.month);
  ($(`#${prefix}-yy`) as HTMLInputElement).value = String(p.year);
  ($(`#${prefix}-gio`) as HTMLSelectElement).value = String(p.hourIdx);
  ($(`#${prefix}-lateTy`) as HTMLInputElement).checked = p.lateTy;
  const ev = new (doc.defaultView as unknown as typeof globalThis).Event('submit', { cancelable: true });
  $(`#${prefix}-form`).dispatchEvent(ev);
}
export const submitTuVi = (doc: Document, p: TvInput) => submitBirthForm(doc, 'tv', p);

/** 50 hồ sơ mẫu dùng chung cho các test đối chiếu: ca đặc biệt + 40 ca rải đều. */
export function sampleProfiles(): [string, TvInput][] {
  const base: TvInput = { gender: 'M', calendar: 'solar', day: 15, month: 6, year: 1996, leapMonth: false, hourIdx: 6, lateTy: false };
  const cases: [string, TvInput][] = [
    ['mặc định 15/6/1996 Ngọ', base],
    ['Chương 10: Nam, 12/7/1979 âm, giờ Thìn', { ...base, calendar: 'lunar', day: 12, month: 7, year: 1979, hourIdx: 4 }],
    ['Nữ, âm lịch tháng nhuận 1/2/2023', { ...base, gender: 'F', calendar: 'lunar', day: 1, month: 2, year: 2023, leapMonth: true, hourIdx: 0 }],
    ['trước 1968: 2/2/1965', { ...base, day: 2, month: 2, year: 1965, hourIdx: 9 }],
    ['trước Tết: Nữ 20/1/1990', { ...base, gender: 'F', day: 20, month: 1, year: 1990, hourIdx: 3 }],
    ['Tý muộn qua năm: 31/12/1999', { ...base, day: 31, month: 12, year: 1999, hourIdx: 0, lateTy: true }],
    ['người lớn tuổi 1940', { ...base, gender: 'F', day: 8, month: 3, year: 1940, hourIdx: 11 }],
    ['trẻ nhỏ 2024', { ...base, day: 10, month: 2, year: 2024, hourIdx: 2 }],
    ['sinh năm sau năm nay (2027)', { ...base, day: 1, month: 3, year: 2027, hourIdx: 5 }],
    ['Nữ 1988 giờ Hợi', { ...base, gender: 'F', day: 29, month: 2, year: 1988, hourIdx: 11 }],
    ['Bát Tự ví dụ vàng 6/2/2021 Ngọ', { ...base, day: 6, month: 2, year: 2021, hourIdx: 6 }],
    ['giữa Lập Xuân và Tết: 4/2/2024 Hợi', { ...base, day: 4, month: 2, year: 2024, hourIdx: 11 }],
  ];
  for (let i = 0; i < 40; i++) {
    const year = 1930 + ((i * 37) % 95), month = 1 + ((i * 5) % 12), day = 1 + ((i * 11) % 28);
    cases.push([`rải ${i}: ${day}/${month}/${year}`, { ...base, gender: i % 2 ? 'F' : 'M', calendar: i % 3 === 0 ? 'lunar' : 'solar', day, month, year, hourIdx: (i * 7) % 12, lateTy: i % 12 === 0 }]);
  }
  return cases;
}

export function lookupYear(doc: Document, year: number): void {
  (doc.querySelector('#tv-lookupYear') as HTMLInputElement).value = String(year);
  (doc.querySelector('#tv-lookupBtn') as HTMLElement).click();
}

export const text = (doc: Document, id: string) => doc.getElementById(id)?.textContent ?? '';

/** Điền form Lục Hào của legacy ở chế độ "Nhập tay" và bấm "Luận Quẻ". */
export function submitLucHao(doc: Document, date: [number, number, number], tosses: readonly number[], key: string): void {
  const $ = (s: string) => doc.querySelector(s) as HTMLElement;
  ($('#kd-dd') as HTMLInputElement).value = String(date[0]);
  ($('#kd-mm') as HTMLInputElement).value = String(date[1]);
  ($('#kd-yy') as HTMLInputElement).value = String(date[2]);
  ($('#kd-methodSeg [data-val="manual"]')).click();
  tosses.forEach((v, i) => { ($(`#kd-manualHaoGrid [data-hao="${i}"]`) as HTMLSelectElement).value = String(v); });
  ($('#kd-dungThanSel') as HTMLSelectElement).value = key;
  const ev = new (doc.defaultView as unknown as typeof globalThis).Event('submit', { cancelable: true });
  $('#kd-form').dispatchEvent(ev);
}
